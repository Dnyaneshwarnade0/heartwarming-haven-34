import { createFileRoute } from "@tanstack/react-router";
import { admin } from "@/lib/telegram.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Cloud storage for the browser app's data (students, exams, settings).
 * The organization link code acts as the shared secret, same as /telegram/sync.
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

        const db = admin();
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
            .upsert({ org_id: org.id, data: body.data, updated_at: updatedAt }, { onConflict: "org_id" });
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
