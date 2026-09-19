import { createFileRoute } from "@tanstack/react-router";
import { admin } from "@/lib/telegram.server";

/**
 * The browser app pushes its current data snapshot here so the Telegram bot can
 * answer questions. The organization link code acts as the shared secret.
 */
export const Route = createFileRoute("/api/public/telegram/sync")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        let body: { code?: string; data?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        if (!/^[A-Z0-9]{6,16}$/.test(code)) {
          return Response.json({ error: "invalid_code" }, { status: 400 });
        }
        if (!body.data || typeof body.data !== "object") {
          return Response.json({ error: "invalid_data" }, { status: 400 });
        }
        if (JSON.stringify(body.data).length > 500_000) {
          return Response.json({ error: "too_large" }, { status: 413 });
        }

        const db = admin();
        const { data: org } = await db
          .from("organizations")
          .select("id")
          .eq("link_code", code)
          .maybeSingle();
        if (!org) return Response.json({ error: "unknown_code" }, { status: 404 });

        const { error } = await db
          .from("org_snapshots")
          .upsert(
            { org_id: org.id, data: body.data, updated_at: new Date().toISOString() },
            { onConflict: "org_id" },
          );
        if (error) {
          console.error("snapshot upsert failed", error.message);
          return Response.json({ error: "save_failed" }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
