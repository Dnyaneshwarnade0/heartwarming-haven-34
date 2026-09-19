import { createFileRoute } from "@tanstack/react-router";
import { admin } from "@/lib/telegram.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * The app pulls attendance that staff recorded from Telegram and merges it into
 * its own records.  Two-phase protocol:
 *   1. POST { code } → returns pending items & actions (NOT marked applied yet)
 *   2. POST { code, ackItems:[...ids], ackActions:[...ids] } → marks those as applied
 * This prevents data loss when the client fails between fetch and local save.
 */
export const Route = createFileRoute("/api/public/telegram/pull")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: { code?: string; ackItems?: string[]; ackActions?: string[] };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400, headers: CORS });
        }
        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        if (!/^[A-Z0-9]{6,16}$/.test(code)) {
          return Response.json({ error: "invalid_code" }, { status: 400, headers: CORS });
        }

        const db = admin();
        const { data: org } = await db
          .from("organizations")
          .select("id")
          .eq("link_code", code)
          .maybeSingle();
        if (!org) return Response.json({ error: "unknown_code" }, { status: 404, headers: CORS });

        // Phase 2: Acknowledge previously received items after client has saved them
        const ackItemIds = Array.isArray(body.ackItems)
          ? body.ackItems.filter((id): id is string => typeof id === "string" && id.length > 0)
          : [];
        const ackActionIds = Array.isArray(body.ackActions)
          ? body.ackActions.filter((id): id is string => typeof id === "string" && id.length > 0)
          : [];

        if (ackItemIds.length || ackActionIds.length) {
          if (ackItemIds.length) {
            await db
              .from("bot_attendance")
              .update({ applied: true })
              .eq("org_id", org.id)
              .in("id", ackItemIds);
          }
          if (ackActionIds.length) {
            await db
              .from("bot_actions")
              .update({ applied: true })
              .eq("org_id", org.id)
              .in("id", ackActionIds);
          }
          return Response.json({ ok: true, acked: true }, { headers: CORS });
        }

        // Phase 1: Return pending items WITHOUT marking them applied yet
        const { data: rows, error } = await db
          .from("bot_attendance")
          .select("id, date, session, absent_rolls")
          .eq("org_id", org.id)
          .eq("applied", false)
          .order("created_at", { ascending: true })
          .limit(50);
        if (error) {
          console.error("bot_attendance read failed", error.message);
          return Response.json({ error: "read_failed" }, { status: 500, headers: CORS });
        }

        const { data: actRows } = await db
          .from("bot_actions")
          .select("id, kind, payload")
          .eq("org_id", org.id)
          .eq("applied", false)
          .order("created_at", { ascending: true })
          .limit(50);

        return Response.json(
          { ok: true, items: rows ?? [], actions: actRows ?? [] },
          { headers: CORS },
        );
      },
    },
  },
});

