import { createFileRoute } from "@tanstack/react-router";
import { botToken } from "@/lib/telegram.server";

/**
 * Telegram मध्ये पाठवलेला फोटो ॲपला दाखवण्यासाठी प्रॉक्सी.
 * बॉट टोकन कधीही ब्राउझरला जात नाही — फक्त file_id दिला जातो.
 */
export const Route = createFileRoute("/api/public/telegram/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id") ?? "";
        if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) {
          return new Response("Bad request", { status: 400 });
        }
        let token: string;
        try {
          token = botToken();
        } catch {
          return new Response("Not configured", { status: 500 });
        }

        const infoRes = await fetch(
          `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(id)}`,
        );
        const info = (await infoRes.json().catch(() => null)) as
          | { ok?: boolean; result?: { file_path?: string } }
          | null;
        const path = info?.result?.file_path;
        if (!info?.ok || !path) return new Response("Not found", { status: 404 });

        const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${path}`);
        if (!fileRes.ok) return new Response("Not found", { status: 404 });

        return new Response(fileRes.body, {
          headers: {
            "Content-Type": fileRes.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
