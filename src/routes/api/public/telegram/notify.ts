import { createFileRoute } from "@tanstack/react-router";
import { admin } from "@/lib/telegram.server";
import {
  absentAlert,
  feeReminder,
  notifyParents,
  snapshotFor,
  weeklyReport,
  type Snap,
  type SnapStudent,
} from "@/lib/telegram-parent.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Kind = "absent" | "fees" | "weekly";

/**
 * The app asks the server to push parent notifications for the latest synced
 * snapshot. The organization link code is the shared secret.
 */
export const Route = createFileRoute("/api/public/telegram/notify")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: { code?: string; kind?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400, headers: CORS });
        }

        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        const kind = body.kind as Kind;
        if (!/^[A-Z0-9]{6,16}$/.test(code)) {
          return Response.json({ error: "invalid_code" }, { status: 400, headers: CORS });
        }
        if (!["absent", "fees", "weekly"].includes(kind)) {
          return Response.json({ error: "invalid_kind" }, { status: 400, headers: CORS });
        }

        const { data: org } = await admin()
          .from("organizations")
          .select("id")
          .eq("link_code", code)
          .maybeSingle();
        if (!org) return Response.json({ error: "unknown_code" }, { status: 404, headers: CORS });

        const snap = (await snapshotFor(org.id as string)) as Snap | null;
        if (!snap) return Response.json({ error: "no_snapshot" }, { status: 404, headers: CORS });

        const build = (s: SnapStudent) =>
          kind === "absent"
            ? absentAlert(snap, s)
            : kind === "fees"
              ? feeReminder(snap, s)
              : weeklyReport(snap, s);

        try {
          const sent = await notifyParents(org.id as string, build, snap);
          return Response.json({ ok: true, sent }, { headers: CORS });
        } catch (err) {
          console.error("notify failed", err);
          return Response.json({ error: "send_failed" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});
