import { createFileRoute } from "@tanstack/react-router";
import { admin, botToken, safeEqual, tg, webhookSecret } from "@/lib/telegram.server";
import { handleCallback, handlePhoto, handleText } from "@/lib/telegram-bot.server";

type TgMessage = {
  chat?: { id?: number };
  from?: { username?: string };
  text?: string;
  caption?: string;
  photo?: Array<{ file_id?: string; file_size?: number }>;
};

type TgUpdate = {
  update_id?: number;
  message?: TgMessage;
  edited_message?: TgMessage;
  callback_query?: {
    id?: string;
    data?: string;
    from?: { username?: string };
    message?: { chat?: { id?: number }; message_id?: number };
  };
};

/** Postgres unique-violation. Anything else is a real infrastructure failure. */
const UNIQUE_VIOLATION = "23505";

function reason(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown };
    const msg = typeof e.message === "string" ? e.message : String(err);
    return typeof e.code === "string" ? `${e.code}: ${msg}` : msg;
  }
  return String(err);
}

type Ctx = { updateId: number | null; chatId: number | null; type: string };

/**
 * Failed updates are recorded in public.telegram_failed_updates (service-role
 * only) and mirrored to server logs. Never throws: audit failure must not mask
 * the original error.
 */
async function audit(ctx: Ctx, stage: string, err: unknown) {
  const detail = reason(err);
  console.error("telegram webhook failure", {
    update_id: ctx.updateId,
    chat_id: ctx.chatId,
    type: ctx.type,
    stage,
    error: detail,
  });
  try {
    await admin().from("telegram_failed_updates").insert({
      update_id: ctx.updateId,
      chat_id: ctx.chatId,
      update_type: ctx.type,
      stage,
      error_reason: detail.slice(0, 2000),
    });
  } catch (auditErr) {
    console.error("telegram webhook audit insert failed", reason(auditErr));
  }
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let expected: string;
        try {
          expected = webhookSecret(botToken());
        } catch {
          return new Response("Not configured", { status: 500 });
        }
        const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(got, expected)) return new Response("Unauthorized", { status: 401 });

        let update: TgUpdate;
        try {
          update = (await request.json()) as TgUpdate;
        } catch {
          // Malformed body will never parse: retrying is pointless.
          return Response.json({ ok: true, ignored: true });
        }

        const updateId = typeof update.update_id === "number" ? update.update_id : null;
        const msg = update.message ?? update.edited_message;
        const ctx: Ctx = {
          updateId,
          chatId: update.callback_query?.message?.chat?.id ?? msg?.chat?.id ?? null,
          type: update.callback_query ? "callback_query" : msg?.photo?.length ? "photo" : "message",
        };

        // Idempotency check BEFORE processing (read-only): skip work already done.
        if (updateId !== null) {
          const { data, error } = await admin()
            .from("telegram_updates")
            .select("update_id")
            .eq("update_id", updateId)
            .maybeSingle();
          if (error) {
            await audit(ctx, "duplicate_check", error);
            return new Response("Storage unavailable", { status: 503 });
          }
          if (data) return Response.json({ ok: true, duplicate: true });
        }

        // 1) Process the update. Any failure => 5xx so Telegram retries.
        try {
          if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message?.chat?.id;
            await tg("answerCallbackQuery", { callback_query_id: cb.id });
            if (chatId) {
              await handleCallback(chatId, cb.message?.message_id, cb.data ?? "", cb.from?.username);
            }
          } else if (msg?.chat?.id && msg.photo?.length) {
            const best = msg.photo[msg.photo.length - 1];
            if (best?.file_id) {
              await handlePhoto(msg.chat.id, best.file_id, new URL(request.url).origin);
            }
          } else if (msg?.chat?.id && msg.text) {
            await handleText(msg.chat.id, msg.text, msg.from?.username);
          } else {
            return Response.json({ ok: true, ignored: true });
          }
        } catch (err) {
          await audit(ctx, "handler", err);
          return new Response("Processing failed", { status: 500 });
        }

        // 2) Only now mark as processed. Idempotent: a concurrent/retried insert
        // that hits the unique constraint is a success, not an error.
        if (updateId !== null) {
          const { error } = await admin()
            .from("telegram_updates")
            .insert({ update_id: updateId });
          if (error && error.code !== UNIQUE_VIOLATION) {
            await audit(ctx, "record_processed", error);
            return new Response("Storage unavailable", { status: 503 });
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
