/* =========================================================
   Telegram attendance — simple, button-first UX.
   No commands to remember: menu -> session -> absent -> save.
   ========================================================= */
import { admin, sendMessage, tg } from "./telegram.server";

export type Btn = { text: string; callback_data: string };
export type Keyboard = { inline_keyboard: Btn[][] };

export const SESSION_MR: Record<string, string> = {
  morning: "सकाळ",
  evening: "संध्याकाळ",
  school: "शाळा",
};

export type AttStudent = { id: string; roll?: number | string | undefined; name?: string | undefined };

export type BotState = {
  mode?: "att_rolls" | "flow" | null;
  session?: string;
  absent?: number[];
  page?: number;
  /** Multi-step menu flow (fee / complaint / exam / alert / edit …) */
  flow?: string;
  step?: string;
  data?: Record<string, unknown>;
};


/* ---------------- state ---------------- */

export async function getState(chatId: number): Promise<BotState> {
  const { data } = await admin()
    .from("bot_sessions")
    .select("state")
    .eq("chat_id", chatId)
    .maybeSingle();
  return ((data?.state as BotState) ?? {}) as BotState;
}

export async function setState(chatId: number, state: BotState) {
  await admin()
    .from("bot_sessions")
    .upsert(
      { chat_id: chatId, state, updated_at: new Date().toISOString() },
      { onConflict: "chat_id" },
    );
}

export async function clearState(chatId: number) {
  await admin().from("bot_sessions").delete().eq("chat_id", chatId);
}

/* ---------------- keyboards ---------------- */

export function mainMenu(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "📋 हजेरी घ्या", callback_data: "m:att" }],
      [
        { text: "🔴 आज गैरहजर", callback_data: "m:absent" },
        { text: "💰 फी बाकी", callback_data: "m:fees" },
      ],
      [{ text: "📊 आजचा आढावा", callback_data: "m:today" }],
    ],
  };
}

export function sessionMenu(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "🌅 सकाळ", callback_data: "att:s:morning" }],
      [{ text: "🌇 संध्याकाळ", callback_data: "att:s:evening" }],
      [{ text: "🏫 शाळा", callback_data: "att:s:school" }],
      [{ text: "↩️ मागे", callback_data: "m:menu" }],
    ],
  };
}

const PAGE = 12;

export function pickKeyboard(
  students: AttStudent[],
  session: string,
  absent: number[],
  page: number,
): Keyboard {
  const pages = Math.max(1, Math.ceil(students.length / PAGE));
  const p = Math.min(Math.max(page, 0), pages - 1);
  const slice = students.slice(p * PAGE, p * PAGE + PAGE);
  const rows: Btn[][] = [];
  for (let i = 0; i < slice.length; i += 2) {
    rows.push(
      slice.slice(i, i + 2).map((s) => {
        const roll = Number(s.roll ?? 0);
        const on = absent.includes(roll);
        return {
          text: `${on ? "❌" : "✅"} ${roll}. ${(s.name ?? "").slice(0, 12)}`,
          callback_data: `att:t:${session}:${roll}:${p}`,
        };
      }),
    );
  }
  const nav: Btn[] = [];
  if (p > 0) nav.push({ text: "◀️", callback_data: `att:p:${session}:${p - 1}` });
  nav.push({ text: `${p + 1}/${pages}`, callback_data: "att:noop" });
  if (p < pages - 1) nav.push({ text: "▶️", callback_data: `att:p:${session}:${p + 1}` });
  rows.push(nav);
  rows.push([
    { text: "💾 जतन करा", callback_data: `att:save:${session}` },
    { text: "✖️ रद्द", callback_data: "att:cancel" },
  ]);
  return { inline_keyboard: rows };
}

export function pickText(session: string, students: AttStudent[], absent: number[]) {
  const names = students
    .filter((s) => absent.includes(Number(s.roll ?? 0)))
    .map((s) => `${s.roll}. ${s.name}`);
  return [
    `<b>📋 ${SESSION_MR[session] ?? session} हजेरी</b>`,
    "गैरहजर विद्यार्थ्यावर टॅप करा (✅ = हजर, ❌ = गैरहजर).",
    "",
    names.length ? `<b>गैरहजर (${names.length}):</b>\n${names.join("\n")}` : "सध्या सर्व हजर आहेत.",
    "",
    `झाल्यावर <b>💾 जतन करा</b> दाबा.`,
  ].join("\n");
}

export function startKeyboard(session: string): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "👍 सर्व हजर आहेत", callback_data: `att:all:${session}` }],
      [{ text: "📝 यादीतून निवडा", callback_data: `att:p:${session}:0` }],
      [{ text: "↩️ मागे", callback_data: "m:att" }],
    ],
  };
}

/* ---------------- edit helpers ---------------- */

export async function edit(
  chatId: number,
  messageId: number | undefined,
  text: string,
  keyboard?: Keyboard,
) {
  if (!messageId) return sendMessage(chatId, text, keyboard);
  return tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: text.slice(0, 3900),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

/* ---------------- saving ---------------- */

/**
 * Attendance recorded on Telegram is queued here. The app pulls it on its next
 * sync and merges it into the real records, so the app stays the source of truth.
 */
export async function queueAttendance(
  orgId: string,
  chatId: number,
  session: string,
  absent: number[],
) {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await admin().from("bot_attendance").insert({
    org_id: orgId,
    date: today,
    session,
    absent_rolls: absent,
    chat_id: chatId,
  });
  if (error) console.error("bot_attendance insert failed", error.message);
  return !error;
}

export function savedText(session: string, students: AttStudent[], absent: number[]) {
  const names = students
    .filter((s) => absent.includes(Number(s.roll ?? 0)))
    .map((s) => `${s.roll}. ${s.name}`);
  const present = students.length - names.length;
  return [
    `✅ <b>${SESSION_MR[session] ?? session} हजेरी जतन झाली.</b>`,
    "",
    `हजर: <b>${present}</b> • गैरहजर: <b>${names.length}</b>`,
    names.length ? `\n${names.join("\n")}` : "",
    "\nॲप उघडल्यावर ही नोंद आपोआप दिसेल.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Parse "4 9 12" / "4,9,12" into roll numbers. */
export function parseRolls(text: string): number[] {
  return Array.from(
    new Set(
      (text.match(/\d+/g) ?? [])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0 && n < 10_000),
    ),
  ).sort((a, b) => a - b);
}
