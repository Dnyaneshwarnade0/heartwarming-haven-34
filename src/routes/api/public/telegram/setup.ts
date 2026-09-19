import { createFileRoute } from "@tanstack/react-router";
import { admin, botToken, tg, webhookSecret } from "@/lib/telegram.server";

/**
 * One-time bot wiring: registers this deployment's webhook URL with Telegram.
 * Authorised by the organisation link code (the same shared secret the app and
 * bot already use), so no extra credential has to travel through the browser.
 */
export const Route = createFileRoute("/api/public/telegram/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
        if (!/^[A-Z0-9]{6,16}$/.test(code)) {
          return Response.json({ error: "invalid_code" }, { status: 400 });
        }

        const { data: org } = await admin()
          .from("organizations")
          .select("id")
          .eq("link_code", code)
          .maybeSingle();
        if (!org) return Response.json({ error: "unknown_code" }, { status: 404 });

        const base = url.searchParams.get("base")?.replace(/\/+$/, "") || url.origin;
        const setRes = await tg("setWebhook", {
          url: `${base}/api/public/telegram/webhook`,
          secret_token: webhookSecret(botToken()),
          allowed_updates: ["message", "edited_message", "callback_query"],
        });
        const infoRes = await tg("getWebhookInfo", {});
        return Response.json({
          ok: setRes.ok,
          setWebhook: await setRes.json().catch(() => null),
          info: await infoRes.json().catch(() => null),
        });
      },
    },
  },
});
