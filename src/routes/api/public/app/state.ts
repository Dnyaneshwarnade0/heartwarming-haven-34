import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const Body = z.object({
  code: z.string().trim().min(4).max(64).regex(/^[A-Za-z0-9_-]+$/),
  action: z.enum(["load", "save", "auth"]),
  data: z.record(z.string(), z.string().max(20_000_000)).optional(),
  base: z.string().nullable().optional(),
  token: z.string().max(500).optional(),
  username: z.string().max(60).optional(),
  password: z.string().max(100).optional(),
});

// Accounts allowed to write data (same as the app login screen)
const ACCOUNTS: Record<string, string[]> = {
  ankush: ["Ankush@1232", "ankush@1232", "admin", "ankush"],
  admin: ["Ankush@1232", "ankush@1232", "admin", "ankush"],
  swapnil: ["Swapnil@1232", "swapnil@1232"],
};
const TOKEN_DAYS = 365;

const LIST_KEYS = ["vss_students", "vss_exams"];
const len = (v: unknown) => {
  try {
    const a = JSON.parse(String(v ?? "null"));
    return Array.isArray(a) ? a.length : -1;
  } catch {
    return -1;
  }
};

const LOCAL_STORAGE_FILE = path.resolve(process.cwd(), ".local-app-state.json");

async function readLocalState(code: string) {
  try {
    const raw = await fs.readFile(LOCAL_STORAGE_FILE, "utf-8");
    const json = JSON.parse(raw);
    return json[code] ?? null;
  } catch {
    return null;
  }
}

async function writeLocalState(code: string, data: Record<string, string>, updated_at: string) {
  try {
    let json: Record<string, any> = {};
    try {
      json = JSON.parse(await fs.readFile(LOCAL_STORAGE_FILE, "utf-8"));
    } catch {
      json = {};
    }
    json[code] = { data, updated_at };
    await fs.writeFile(LOCAL_STORAGE_FILE, JSON.stringify(json, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local state:", err);
  }
}

async function hmac(msg: string) {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "local_dev_secret_key_1234567890_vss";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function makeToken(code: string, user: string) {
  const exp = Date.now() + TOKEN_DAYS * 86400_000;
  const msg = `${code}.${user}.${exp}`;
  return `${user}.${exp}.${await hmac(msg)}`;
}
async function checkToken(code: string, token?: string) {
  if (!token) return false;
  const [user, exp, sig] = token.split(".");
  if (!user || !exp || !sig || Number(exp) < Date.now()) return false;
  return (await hmac(`${code}.${user}.${exp}`)) === sig;
}

export const Route = createFileRoute("/api/public/app/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
        }
        const code = parsed.code.toUpperCase();

        if (parsed.action === "auth") {
          const u = (parsed.username ?? "").trim().toLowerCase();
          const p = (parsed.password ?? "").trim();
          const accountPasswords = ACCOUNTS[u] || [];
          const matches = accountPasswords.includes(p) || accountPasswords.map(x => x.toLowerCase()).includes(p.toLowerCase());
          if (!matches) {
            return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
          }
          return Response.json({ ok: true, token: await makeToken(code, u) });
        }

        const hasSupabase = Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);

        let row: { data?: any; updated_at?: string } | null = null;

        if (hasSupabase) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data, error } = await supabaseAdmin
              .from("app_state")
              .select("data, updated_at")
              .eq("code", code)
              .maybeSingle();
            if (!error && data) {
              row = data;
            }
          } catch (e) {
            console.warn("Supabase fetch failed, falling back to local file:", e);
          }
        }

        if (!row) {
          row = await readLocalState(code);
        }

        const current = row?.updated_at ? new Date(row.updated_at).toISOString() : null;

        if (parsed.action === "load") {
          return Response.json({ ok: true, data: row?.data ?? null, updated_at: current });
        }

        // save: must be logged in
        if (!(await checkToken(code, parsed.token))) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }
        // Stale device protection: refuse if someone else saved after this device last loaded
        if (row && current && parsed.base !== current) {
          return Response.json(
            { ok: false, error: "conflict", data: row.data, updated_at: current },
            { status: 409 },
          );
        }

        const existing = (row?.data ?? {}) as Record<string, string>;
        const incoming = parsed.data ?? {};
        const merged: Record<string, string> = { ...existing, ...incoming };
        for (const k of LIST_KEYS) {
          if (len(incoming[k]) === 0 && len(existing[k]) > 0) merged[k] = existing[k] as string;
        }
        const updated_at = new Date().toISOString();

        if (hasSupabase) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { error: upErr } = await supabaseAdmin
              .from("app_state")
              .upsert({ code, data: merged, updated_at });
            if (!upErr) {
              return Response.json({ ok: true, updated_at });
            }
            console.error("Supabase upsert error:", upErr);
          } catch (e) {
            console.warn("Supabase upsert failed, saving locally:", e);
          }
        }

        await writeLocalState(code, merged, updated_at);
        return Response.json({ ok: true, updated_at });
      },
    },
  },
});
