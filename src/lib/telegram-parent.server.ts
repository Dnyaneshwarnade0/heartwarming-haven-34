import { admin, sendMessage, optionsKeyboard } from "./telegram.server";

export type SnapStudent = {
  id: string;
  roll?: number | string;
  name?: string;
  standard?: string;
  phone?: string;
  parent?: string;
  parentCode?: string;
  fees?: { total?: number; paid?: number; due?: number } | null;
  attendance?: Record<string, number | null>;
  today?: Record<string, string>;
  onLeave?: boolean;
  leaves?: Array<{ from?: string; to?: string; reason?: string }>;
};

export type Snap = {
  school?: string;
  today?: string;
  totalStudents?: number;
  starStudentsThisWeek?: string[];
  students?: SnapStudent[];
};

export const SESSIONS = ["morning", "evening", "school"] as const;
export const SESSION_MR: Record<string, string> = {
  morning: "सकाळ",
  evening: "संध्याकाळ",
  school: "शाळा",
};

export type ParentLink = {
  chat_id: number;
  org_id: string;
  student_id: string;
  student_name: string | null;
  parent_code: string;
};

export const PARENT_HELP = `<b>पालक बॉट — मदत</b>

/hajeri — माझ्या पाल्याची हजेरी
/fees — फी माहिती
/report — या आठवड्याचा सारांश
/mahiti — पूर्ण माहिती कार्ड
/unlink — जोडणी काढा

किंवा नुसतं प्रश्न लिहा — AI उत्तर देईल.`;

export async function parentLinksFor(chatId: number): Promise<ParentLink[]> {
  const { data } = await admin()
    .from("parent_links")
    .select("chat_id, org_id, student_id, student_name, parent_code")
    .eq("chat_id", chatId);
  return (data as ParentLink[] | null) ?? [];
}

export async function snapshotFor(orgId: string): Promise<Snap | null> {
  const { data } = await admin()
    .from("org_snapshots")
    .select("data")
    .eq("org_id", orgId)
    .maybeSingle();
  return (data?.data as Snap) ?? null;
}

/** Parent codes look like ABCD-041-7K. The first block is the org link-code prefix. */
export async function findByParentCode(code: string) {
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,8}-[0-9]{1,4}-[A-Z0-9]{1,4}$/.test(clean)) return null;
  const prefix = clean.split("-")[0]!;
  const { data: orgs } = await admin()
    .from("organizations")
    .select("id, name, link_code")
    .ilike("link_code", `${prefix}%`);
  for (const org of orgs ?? []) {
    const snap = await snapshotFor(org.id as string);
    const student = (snap?.students ?? []).find(
      (s) => (s.parentCode ?? "").toUpperCase() === clean,
    );
    if (student) return { org: org as { id: string; name: string }, student, snap: snap! };
  }
  return null;
}

export function studentIn(snap: Snap | null, studentId: string) {
  return (snap?.students ?? []).find((s) => s.id === studentId) ?? null;
}

const pct = (v: unknown) => (typeof v === "number" ? `${v}%` : "—");

export function parentAttendanceText(snap: Snap, s: SnapStudent) {
  const today = SESSIONS.map((k) => {
    const v = s.today?.[k];
    const mark = v === "present" ? "✅ उपस्थित" : v === "absent" ? "🔴 गैरहजर" : "— नोंद नाही";
    return `${SESSION_MR[k]}: ${mark}`;
  }).join("\n");
  const a = s.attendance ?? {};
  return [
    `<b>📋 ${s.name} — हजेरी</b>`,
    snap.today ? `दिनांक: ${snap.today}` : "",
    "",
    today,
    "",
    `<b>एकूण टक्केवारी</b>`,
    `सकाळ ${pct(a["morningPct"])} • संध्याकाळ ${pct(a["eveningPct"])} • शाळा ${pct(a["schoolPct"])}`,
    `सरासरी: ${pct(a["overallPct"])}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function parentFeesText(s: SnapStudent) {
  if (!s.fees) return `${s.name} — फीची नोंद अजून नाही.`;
  const due = s.fees.due ?? 0;
  return [
    `<b>💰 ${s.name} — फी</b>`,
    `एकूण: ₹${s.fees.total ?? 0}`,
    `भरले: ₹${s.fees.paid ?? 0}`,
    due > 0 ? `<b>बाकी: ₹${due}</b>` : "✅ फी पूर्ण भरली आहे. धन्यवाद!",
  ].join("\n");
}

export function parentReportText(snap: Snap, s: SnapStudent) {
  const a = s.attendance ?? {};
  const star = (snap.starStudentsThisWeek ?? []).includes(s.id);
  const due = s.fees?.due ?? 0;
  return [
    `<b>📊 ${s.name} — साप्ताहिक अहवाल</b>`,
    s.standard ? `इयत्ता: ${s.standard}` : "",
    "",
    `हजेरी: ${pct(a["overallPct"])}`,
    `सकाळ ${pct(a["morningPct"])} • संध्याकाळ ${pct(a["eveningPct"])} • शाळा ${pct(a["schoolPct"])}`,
    due > 0 ? `फी बाकी: ₹${due}` : "फी: पूर्ण भरली ✅",
    star ? "\n⭐ या आठवड्यातील आदर्श विद्यार्थी! अभिनंदन 🎉" : "",
    Number(a["overallPct"] ?? 100) < 60
      ? "\n⚠️ हजेरी कमी आहे. कृपया नियमित पाठवा."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function parentCardText(snap: Snap, s: SnapStudent) {
  return [
    parentAttendanceText(snap, s),
    "",
    parentFeesText(s),
    s.parent ? `\nपालक: ${s.parent}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const parentKeyboard = () =>
  optionsKeyboard(["आजची हजेरी", "फी किती बाकी?", "आठवड्याचा अहवाल"]);

/* ---------------- outgoing notifications ---------------- */

async function alreadySent(orgId: string, key: string, chatId: number) {
  const { error } = await admin()
    .from("sent_notifications")
    .insert({ org_id: orgId, dedupe_key: key, chat_id: chatId });
  return Boolean(error); // unique violation = already sent
}

/** Sends one message per linked parent, skipping duplicates. */
export async function notifyParents(
  orgId: string,
  build: (s: SnapStudent) => { text: string; key: string } | null,
  snap: Snap,
) {
  const { data } = await admin()
    .from("parent_links")
    .select("chat_id, student_id")
    .eq("org_id", orgId);
  const links = (data as { chat_id: number; student_id: string }[] | null) ?? [];
  let sent = 0;
  for (const link of links) {
    const s = studentIn(snap, link.student_id);
    if (!s) continue;
    const msg = build(s);
    if (!msg) continue;
    if (await alreadySent(orgId, msg.key, link.chat_id)) continue;
    await sendMessage(link.chat_id, msg.text, parentKeyboard());
    sent++;
    await new Promise((r) => setTimeout(r, 60)); // stay under Telegram rate limits
  }
  return sent;
}

export function absentAlert(snap: Snap, s: SnapStudent) {
  const day = snap.today ?? new Date().toISOString().slice(0, 10);
  // रजेवर असलेल्या विद्यार्थ्याला गैरहजेरीची सूचना पाठवायची नाही.
  const onLeave =
    s.onLeave === true ||
    (s.leaves ?? []).some((l) => String(l.from ?? "") <= day && day <= String(l.to ?? l.from ?? ""));
  if (onLeave) return null;
  const absent = SESSIONS.filter((k) => s.today?.[k] === "absent");
  if (!absent.length) return null;
  const which = absent.map((k) => SESSION_MR[k]).join(" व ");
  return {
    key: `absent:${day}:${absent.join(",")}:${s.id}`,
    text:
      `🔔 <b>${snap.school ?? "गुरुकुल"}</b>\n\n` +
      `आपला पाल्य <b>${s.name}</b> आज (${day}) <b>${which}</b> सत्रात गैरहजर होता.\n\n` +
      `काही अडचण असल्यास कृपया कळवा. 🙏`,
  };
}

export function feeReminder(snap: Snap, s: SnapStudent) {
  const due = s.fees?.due ?? 0;
  if (due <= 0) return null;
  const day = snap.today ?? new Date().toISOString().slice(0, 10);
  return {
    key: `fees:${day}:${s.id}`,
    text:
      `💰 <b>${snap.school ?? "गुरुकुल"}</b> — फी स्मरणपत्र\n\n` +
      `<b>${s.name}</b> यांची फी बाकी: <b>₹${due}</b>\n` +
      `(एकूण ₹${s.fees?.total ?? 0} पैकी ₹${s.fees?.paid ?? 0} भरले)\n\n` +
      `कृपया सोयीनुसार भरावी. धन्यवाद 🙏`,
  };
}

export function weeklyReport(snap: Snap, s: SnapStudent) {
  const day = snap.today ?? new Date().toISOString().slice(0, 10);
  return { key: `weekly:${day}:${s.id}`, text: parentReportText(snap, s) };
}
