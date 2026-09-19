import { createHash, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function botToken(): string {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

/** Secret token registered with setWebhook and sent back by Telegram on every call. */
export function webhookSecret(token: string): string {
  return createHash("sha256").update(`telegram-webhook:${token}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function admin(): SupabaseClient {
  return createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/* ---------------- Role helpers for Telegram users ---------------- */

export type TgRole = "admin" | "sub";

export const TG_PERMISSIONS = [
  "attendance",
  "students",
  "fees",
  "complaints",
  "exams",
  "tasks",
  "reports",
  "alerts",
  "backup",
  "users",
  "admissions",
] as const;

export type TgPerm = (typeof TG_PERMISSIONS)[number];

export const DEFAULT_SUB_PERMS: TgPerm[] = [
  "attendance",
  "students",
  "fees",
  "complaints",
  "exams",
  "tasks",
  "reports",
];

/** Manager = attendance-only. Can submit attendance, nothing else. */
export const MANAGER_PERMS: TgPerm[] = ["attendance"];

export function isManager(role: TgRole, perms: Set<TgPerm>): boolean {
  return role !== "admin" && perms.size === 1 && perms.has("attendance");
}

function dbToRole(db: string): TgRole {
  return db === "admin" || db === "owner" ? "admin" : "sub";
}

/** Read the stored role and permissions for a chat. Defaults to sub-manager for safety. */
export async function roleFor(chatId: number): Promise<{
  role: TgRole;
  perms: Set<TgPerm>;
}> {
  const db = admin();
  const { data } = await db
    .from("telegram_links")
    .select("role, permissions")
    .eq("chat_id", chatId)
    .maybeSingle();
  const role = dbToRole(data?.role ?? "staff");
  const stored = data?.permissions as TgPerm[] | null;
  const perms: Set<TgPerm> =
    role === "admin"
      ? new Set(TG_PERMISSIONS)
      : new Set(Array.isArray(stored) && stored.length ? stored : DEFAULT_SUB_PERMS);
  return { role, perms };
}

/** Update the stored role and permissions for a chat. */
export async function setRole(
  chatId: number,
  role: TgRole,
  perms?: TgPerm[],
) {
  const db = admin();
  const dbRole = role === "admin" ? "admin" : "staff";
  await db
    .from("telegram_links")
    .update({ role: dbRole, permissions: perms ?? null })
    .eq("chat_id", chatId);
}


type Keyboard = { inline_keyboard: { text: string; callback_data: string }[][] };

export async function tg(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("telegram api error", method, res.status, (await res.text()).slice(0, 400));
  }
  return res;
}

export async function sendMessage(chatId: number, text: string, keyboard?: Keyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text: text.slice(0, 3900),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

/** Buttons the user can tap instead of typing. */
export function optionsKeyboard(options: string[]): Keyboard | undefined {
  const clean = options.filter((o) => typeof o === "string" && o.trim()).slice(0, 4);
  if (clean.length === 0) return undefined;
  return {
    inline_keyboard: clean.map((o) => [
      { text: o.slice(0, 60), callback_data: `ask:${o.slice(0, 55)}` },
    ]),
  };
}

/** Send a student photo (best effort — silently skipped if Telegram can't fetch it). */
export async function sendPhoto(chatId: number, url: string, caption?: string) {
  if (!url || !/^https?:\/\//.test(url)) return;
  try {
    await tg("sendPhoto", {
      chat_id: chatId,
      photo: url,
      ...(caption ? { caption: caption.slice(0, 900), parse_mode: "HTML" } : {}),
    });
  } catch (err) {
    console.error("sendPhoto failed", err);
  }
}
