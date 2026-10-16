import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import fs from "node:fs";
import path from "node:path";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Cloud & Local Disk storage for the browser app's data (students, exams, settings).
 * When Supabase is not connected, persists state permanently to data/app_state.json.
 */
export const Route = createFileRoute("/api/public/app/state")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        let body: { code?: string; action?: string; data?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400, headers: cors });
        }

        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        if (!/^[A-Z0-9]{6,16}$/.test(code)) {
          return Response.json({ error: "invalid_code" }, { status: 400, headers: cors });
        }

        // Local persistent file fallback when Supabase is not configured
        if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
          const localFilePath = path.resolve(process.cwd(), "data", "app_state.json");
          try {
            if (body.action === "save") {
              if (!body.data || typeof body.data !== "object") {
                return Response.json({ error: "invalid_data" }, { status: 400, headers: cors });
              }
              const dataDir = path.dirname(localFilePath);
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const updatedAt = new Date().toISOString();
              fs.writeFileSync(localFilePath, JSON.stringify({ data: body.data, updated_at: updatedAt }, null, 2), "utf8");
              return Response.json({ ok: true, updated_at: updatedAt, local: true }, { headers: cors });
            }
            // Load state
            if (fs.existsSync(localFilePath)) {
              const fileContent = JSON.parse(fs.readFileSync(localFilePath, "utf8"));
              return Response.json(
                { ok: true, data: fileContent.data ?? null, updated_at: fileContent.updated_at ?? null, local: true },
                { headers: cors }
              );
            }
            return Response.json({ ok: true, data: null, updated_at: null, local: true }, { headers: cors });
          } catch (localErr) {
            console.error("Local app_state storage error:", localErr);
            return Response.json({ ok: false, local: true }, { status: 200, headers: cors });
          }
        }

        const db = supabaseAdmin;
        const { data: org } = await db
          .from("organizations")
          .select("id")
          .eq("link_code", code)
          .maybeSingle();
        if (!org) return Response.json({ error: "unknown_code" }, { status: 404, headers: cors });

        if (body.action === "save") {
          if (!body.data || typeof body.data !== "object") {
            return Response.json({ error: "invalid_data" }, { status: 400, headers: cors });
          }
          if (JSON.stringify(body.data).length > 4_000_000) {
            return Response.json({ error: "too_large" }, { status: 413, headers: cors });
          }
          const updatedAt = new Date().toISOString();
          const { error } = await db
            .from("app_state")
            .upsert({ org_id: org.id, data: body.data as never, updated_at: updatedAt }, { onConflict: "org_id" });
          if (error) {
            console.error("app_state save failed", error.message);
            return Response.json({ error: "save_failed" }, { status: 500, headers: cors });
          }
          return Response.json({ ok: true, updated_at: updatedAt }, { headers: cors });
        }

        const { data: row, error } = await db
          .from("app_state")
          .select("data, updated_at")
          .eq("org_id", org.id)
          .maybeSingle();
        if (error) {
          console.error("app_state load failed", error.message);
          return Response.json({ error: "load_failed" }, { status: 500, headers: cors });
        }
        return Response.json(
          { ok: true, data: row?.data ?? null, updated_at: row?.updated_at ?? null },
          { headers: cors },
        );
      },
    },
  },
});
