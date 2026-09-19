import { admin, isManager, MANAGER_PERMS, roleFor, sendMessage, sendPhoto, optionsKeyboard, type TgPerm, type TgRole } from "./telegram.server";
import {
  clearState,
  edit,
  getState,
  parseRolls,
  pickKeyboard,
  pickText,
  queueAttendance,
  savedText,
  sessionMenu,
  setState,
  startKeyboard,
  SESSION_MR as ATT_SESSION_MR,
  type AttStudent,
} from "./telegram-attendance.server";

import {
  PARENT_HELP,
  findByParentCode,
  parentAttendanceText,
  parentCardText,
  parentFeesText,
  parentKeyboard,
  parentLinksFor,
  parentReportText,
  
  studentIn,
  type ParentLink,
} from "./telegram-parent.server";


type Snap = {
  school?: string;
  today?: string;
  totalStudents?: number;
  starStudentsThisWeek?: string[];
  students?: Array<{
    id: string;
    roll?: number | string;
    name?: string;
    standard?: string;
    phone?: string;
    parent?: string;
    emergencyContact?: string;
    fees?: { total?: number; paid?: number; due?: number } | null;
    attendance?: Record<string, number | null>;
    today?: Record<string, string>;
    subjects?: Record<string, unknown>;
    lastAbsent?: Array<{ date?: string; sessions?: string[] }>;
    medical?: {
      bloodGroup?: string;
      allergies?: string;
      illness?: string;
      doctorNotes?: string;
    } | null;
    complaints?: Array<{ date?: string; type?: string; action?: string; severity?: string }>;
    remarks?: Array<{ date?: string; text?: string; author?: string; homework?: boolean }>;
    exams?: Array<{
      name?: string;
      subject?: string;
      date?: string;
      marks?: number;
      max?: number;
      remark?: string;
    }>;
    documents?: Array<{ name?: string; status?: string }>;
    feeLedger?: Array<{ date?: string; amount?: number; mode?: string; receipt?: string }>;
    evaluation?: { date?: string; checklist?: Record<string, string>; photos?: string[] } | null;
    leaves?: Array<{ id?: string; from?: string; to?: string; reason?: string; note?: string }>;
    subjectList?: Array<{ k: string; mr?: string; en?: string }> | null;
    onLeave?: boolean;
    weeklyMarks?: Array<{ week?: number; marks?: number; max?: number }>;
    weeklyGrade?: string;
    blacklisted?: boolean;
    subjectMarks?: Record<string, number>;
  }>;
  /** दैनंदिन सेवा — { "2026-08-19": { kakada: true } } */
  seva?: Record<string, Record<string, boolean>>;
};


const SESSIONS = ["morning", "evening", "school"] as const;
const SESSION_MR: Record<string, string> = {
  morning: "सकाळ",
  evening: "संध्याकाळ",
  school: "शाळा",
};

const HELP = `<b>गुरुकुल बॉट — मदत</b>

/link &lt;कोड&gt; — संस्था जोडा (कोड ॲपच्या Settings मध्ये)
/hajeri — आजची हजेरी
/gairhajar — आज कोण गैरहजर
/fees — फी बाकी
/student &lt;नाव किंवा रोल नं&gt; — विद्यार्थ्याचे कार्ड (किंवा नुसता रोल नंबर लिहा, उदा. <code>12</code>)
/report — आठवड्याचा सारांश
/unlink — जोडणी काढा

किंवा नुसतं प्रश्न लिहा — AI उत्तर देईल.`;

async function linkFor(chatId: number) {
  const db = admin();
  const { data } = await db
    .from("telegram_links")
    .select("org_id, role")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data as { org_id: string; role: string } | null;
}

async function snapshotFor(orgId: string): Promise<Snap | null> {
  const db = admin();
  const { data } = await db
    .from("org_snapshots")
    .select("data, updated_at")
    .eq("org_id", orgId)
    .maybeSingle();
  return (data?.data as Snap) ?? null;
}

/**
 * Write a change straight into the shared snapshot so Telegram shows it
 * immediately, without waiting for the app to sync back.
 */
async function patchSnapshotStudent(
  orgId: string,
  studentId: string,
  fn: (s: NonNullable<Snap["students"]>[number]) => void,
) {
  const db = admin();
  const { data } = await db.from("org_snapshots").select("data").eq("org_id", orgId).maybeSingle();
  const snap = (data?.data as Snap) ?? null;
  const stu = snap?.students?.find((x) => String(x.id) === String(studentId));
  if (!snap || !stu) return;
  fn(stu);
  const { error } = await db.from("org_snapshots").update({ data: snap }).eq("org_id", orgId);
  if (error) console.error("snapshot patch failed", error.message);
}

/** Patch the whole snapshot (seva, new admissions, receipt counter …). */
async function patchSnapshot(orgId: string, fn: (s: Snap) => void) {
  const db = admin();
  const { data } = await db.from("org_snapshots").select("data").eq("org_id", orgId).maybeSingle();
  const snap = (data?.data as Snap) ?? ({ students: [] } as Snap);
  fn(snap);
  const { error } = await db
    .from("org_snapshots")
    .upsert({ org_id: orgId, data: snap, updated_at: new Date().toISOString() }, { onConflict: "org_id" });
  if (error) console.error("snapshot patch failed", error.message);
}


function isBlacklist(c?: { type?: string }) {
  return String(c?.type ?? "").includes("काळी यादी");
}

function roleLabel(role: TgRole) {
  return role === "admin" ? "ॲडमिन" : "सब-मॅनेजर";
}

function adminOnly(role: TgRole) {
  return role !== "admin" ? "हे फक्त ॲडमिनसाठी आहे." : null;
}

function needPerm(perms: Set<TgPerm>, key: TgPerm) {
  return perms.has(key) ? null : "तुम्हाला ही परवानगी नाही.";
}

function menuFor(role: TgRole, perms: Set<TgPerm>) {
  return { main: mainMenu(role, perms), edit: editMenu(role, perms) };
}

/** Role-aware main menu for this chat (admin / sub-manager / manager). */
async function roleMenu(chatId: number) {
  const { role, perms } = await roleFor(chatId);
  return mainMenu(role, perms);
}



function noData() {
  return "अजून ॲपमधून माहिती आलेली नाही.\n\nएकदा संगणकावर/मोबाईलवर ॲप उघडा — माहिती आपोआप इथे सिंक होईल.";
}

function nameOf(s: NonNullable<Snap["students"]>[number]) {
  return `${s.roll ?? "-"}. ${s.name ?? "-"}`;
}

/* ---------------- commands ---------------- */

async function cmdLink(chatId: number, code: string, username?: string) {
  if (!code) return sendMessage(chatId, "वापर: <code>/link ABC12345</code>\nकोड ॲडमिनकडून घ्या.");
  const db = admin();
  const c = code.trim().toUpperCase();

  // 1) Per-role invite codes (admin / manager).
  let org: { id: string; name: string } | null = null;
  let linkRole: "admin" | "manager" | null = null;
  const { data: inv } = await db
    .from("telegram_invites")
    .select("org_id, role, active")
    .eq("code", c)
    .maybeSingle();
  if (inv?.active) {
    linkRole = inv.role === "manager" ? "manager" : "admin";
    const { data: o } = await db
      .from("organizations")
      .select("id, name")
      .eq("id", inv.org_id)
      .maybeSingle();
    org = o;
  }

  // 2) Fallback: organization's master link code (always admin).
  if (!org) {
    const { data: o } = await db
      .from("organizations")
      .select("id, name")
      .eq("link_code", c)
      .maybeSingle();
    if (o) {
      org = o;
      linkRole = "admin";
    }
  }

  if (!org || !linkRole) {
    return sendMessage(chatId, "❌ कोड चुकीचा आहे किंवा बंद केला गेला आहे. ॲडमिनकडून नवीन कोड घ्या.");
  }

  const dbRole = linkRole === "admin" ? "admin" : "staff";
  const perms = linkRole === "manager" ? MANAGER_PERMS : null;
  await db.from("telegram_links").upsert(
    { chat_id: chatId, org_id: org.id, role: dbRole, permissions: perms, username: username ?? null },
    { onConflict: "chat_id" },
  );

  const roleText = linkRole === "admin" ? "ॲडमिन (पूर्ण परवानगी)" : "मॅनेजर (फक्त हजेरी)";
  const note =
    linkRole === "manager"
      ? "\n\nतुम्ही फक्त <b>हजेरी घेऊ शकता</b>. विद्यार्थी माहिती, फी, बदल — हे फक्त ॲडमिन करू शकतात."
      : "\n\nआता खालील मेनू वापरा.";
  return sendMessage(
    chatId,
    `✅ जोडणी झाली: <b>${org.name}</b>\n\nतुमची भूमिका: <b>${roleText}</b>${note}`,
    mainMenu(linkRole === "admin" ? "admin" : "sub", linkRole === "manager" ? new Set(MANAGER_PERMS) : undefined),
  );
}


function attendanceText(snap: Snap) {
  const list = snap.students ?? [];
  if (!list.length) return noData();
  const lines: string[] = [`<b>📋 हजेरी — ${snap.today ?? ""}</b>`];
  for (const key of SESSIONS) {
    let p = 0, a = 0, n = 0;
    for (const s of list) {
      const v = s.today?.[key];
      if (v === "present") p++;
      else if (v === "absent") a++;
      else n++;
    }
    lines.push(`${SESSION_MR[key]}: उपस्थित ${p} • गैरहजर ${a}${n ? ` • नोंद नाही ${n}` : ""}`);
  }
  lines.push(`\nएकूण विद्यार्थी: ${list.length}`);
  return lines.join("\n");
}

function absentText(snap: Snap) {
  const list = snap.students ?? [];
  if (!list.length) return noData();
  const out: string[] = [`<b>🔴 आज गैरहजर — ${snap.today ?? ""}</b>`];
  let any = false;
  for (const key of SESSIONS) {
    const abs = list.filter((s) => s.today?.[key] === "absent");
    if (!abs.length) continue;
    any = true;
    out.push(`\n<b>${SESSION_MR[key]}</b> (${abs.length})`);
    out.push(abs.slice(0, 40).map(nameOf).join("\n"));
  }
  if (!any) out.push("\nकोणीही गैरहजर नाही. 🎉");
  return out.join("\n");
}

function feesText(snap: Snap) {
  const list = (snap.students ?? []).filter((s) => (s.fees?.due ?? 0) > 0);
  const totalDue = list.reduce((sum, s) => sum + (s.fees?.due ?? 0), 0);
  if (!snap.students?.length) return noData();
  if (!list.length) return "✅ कोणाचीही फी बाकी नाही.";
  const rows = list
    .sort((a, b) => (b.fees?.due ?? 0) - (a.fees?.due ?? 0))
    .slice(0, 25)
    .map((s) => `${nameOf(s)} — ₹${s.fees?.due}`);
  return `<b>💰 फी बाकी</b>\nएकूण बाकी: ₹${totalDue} (${list.length} विद्यार्थी)\n\n${rows.join("\n")}`;
}

type Stu = NonNullable<Snap["students"]>[number];

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function findStudents(snap: Snap, q: string) {
  const needle = q.trim().toLowerCase();
  return (snap.students ?? []).filter(
    (s) => String(s.roll) === needle || (s.name ?? "").toLowerCase().includes(needle),
  );
}

/**
 * साप्ताहिक गुण — ॲपमधून weeklyMarks आले नसतील तर
 * exams मधील "साप्ताहिक परीक्षा N" नोंदींमधून तयार करा.
 */
function weeklyOf(s: Stu): Array<{ week?: number; marks?: number; max?: number }> {
  const wm = s.weeklyMarks ?? [];
  if (wm.length) return wm;
  const out: Array<{ week: number; marks: number; max: number }> = [];
  for (const e of s.exams ?? []) {
    const m = /साप्ताहिक\s*परीक्षा\s*(\d+)/.exec(String(e.name ?? ""));
    if (!m) continue;
    out.push({ week: Number(m[1]), marks: Number(e.marks ?? 0), max: Number(e.max ?? 100) });
  }
  return out.sort((a, b) => a.week - b.week);
}

/** Buttons under a student card — extra details only when the user asks. */
function studentKeyboard(s: Stu) {
  const id = s.id;
  // प्रत्येक ओळीत: डावे बटण = जतन केलेली माहिती पहा, उजवे ➕ बटण = नवीन नोंद जोडा.
  const rows: { text: string; callback_data: string }[][] = [
    [
      {
        text: `${(s.complaints ?? []).some(isBlacklist) ? "⛔" : "⚠️"} तक्रारी पहा (${s.complaints?.length ?? 0})`,
        callback_data: `stu:${id}:comp`,
      },
      { text: "➕ तक्रार नोंदवा", callback_data: `stu:${id}:add:comp` },
    ],
    [
      { text: s.medical ? "🩺 मेडिकल पहा ✅" : "🩺 मेडिकल पहा", callback_data: `stu:${id}:med` },
      { text: "➕ मेडिकल नोंदवा", callback_data: `stu:${id}:add:med` },
    ],
    [
      { text: "💰 फी इतिहास पहा", callback_data: `stu:${id}:fee` },
      { text: "➕ फी भरणा नोंदवा", callback_data: `stu:${id}:add:fee` },
    ],
    [
      { text: "📚 निकाल / गुण पहा", callback_data: `stu:${id}:exam` },
      { text: "➕ गुण भरा", callback_data: `stu:${id}:add:exam` },
    ],
    [
      { text: "📝 शिक्षक नोंदी पहा", callback_data: `stu:${id}:rem` },
      { text: "➕ नोंद नोंदवा", callback_data: `stu:${id}:add:rem` },
    ],
    [
      { text: "📄 कागदपत्रे पहा", callback_data: `stu:${id}:doc` },
      { text: "➕ कागदपत्र नोंदवा", callback_data: `stu:${id}:add:doc` },
    ],
    [
      { text: "📅 हजेरी तपशील पहा", callback_data: `stu:${id}:att` },
      { text: "🏠 रजा नोंदवा", callback_data: `stu:${id}:add:leave` },
    ],
    [
      { text: "📊 साप्ताहिक गुण पहा", callback_data: `stu:${id}:wmarks` },
    ],
    [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
  ];
  return { inline_keyboard: rows };
}

/** Short, day-to-day card. */
function studentCard(s: Stu) {
  const att = s.attendance ?? {};
  const pct = (v: unknown) => (typeof v === "number" ? `${v}%` : "—");
  const t = s.today ?? {};
  const mark = (v?: string) => (v === "present" ? "✅" : v === "absent" ? "❌" : v === "leave" ? "🏠" : "—");
  const flags: string[] = [];
  const comps = s.complaints ?? [];
  const blk = comps.filter(isBlacklist);
  if (comps.length) flags.push(`${comps.length} तक्रारी`);
  if (s.medical) flags.push("मेडिकल नोंद आहे");

  // Weekly marks summary (last 3 weeks)
  const wm = weeklyOf(s);
  const wg = (s as Record<string, unknown>)["weeklyGrade"] as string | undefined;
  let weeklyLine = "";
  if (wm && wm.length) {
    const last3 = wm.slice(-3);
    weeklyLine = `\n<b>📊 साप्ताहिक गुण</b> (शेवटचे ${last3.length})\n` +
      last3.map(w => `  आ.${w.week ?? "?"}: ${w.marks ?? 0}/${w.max ?? 100}`).join(" • ") +
      (wg ? ` — श्रेणी: <b>${esc(wg)}</b>` : "");
  }

  // Adarsh (star student) + blacklist flags come from the app snapshot
  const isBlk = blk.length > 0 || !!(s as Record<string, unknown>)["blacklisted"];
  const isStar = !!(s as Record<string, unknown>)["adarsh"];

  return [
    `<b>👦 ${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})`,
    s.standard ? `इयत्ता: ${esc(s.standard)}` : "",
    s.parent ? `पालक: ${esc(s.parent)}${s.phone ? ` • ${esc(s.phone)}` : ""}` : s.phone ? `फोन: ${esc(s.phone)}` : "",
    "",
    `<b>आजची हजेरी</b> — सकाळ ${mark(t["morning"])} • संध्याकाळ ${mark(t["evening"])} • शाळा ${mark(t["school"])}`,
    `<b>एकूण हजेरी</b> — ${pct(att["overallPct"])} (सकाळ ${pct(att["morningPct"])} • संध्याकाळ ${pct(att["eveningPct"])} • शाळा ${pct(att["schoolPct"])})`,
    "",
    s.fees
      ? `<b>फी</b> — एकूण ₹${s.fees.total ?? 0} • भरले ₹${s.fees.paid ?? 0} • बाकी ₹${s.fees.due ?? 0}`
      : "फी नोंद नाही",
    weeklyLine,
    isStar ? `\n⭐ <b>आदर्श विद्यार्थी</b> (या आठवड्यात)` : "",
    isBlk ? `\n⛔ <b>काळी यादी मध्ये आहे</b>${blk.length ? ` (${blk.length}) — ${esc(blk[blk.length - 1]?.date ?? "")}` : ""}` : "",
    comps.length
      ? `\n<b>शेवटची तक्रार</b> — ${esc(comps[comps.length - 1]?.date ?? "")} ${esc(comps[comps.length - 1]?.type ?? "")}${
          comps[comps.length - 1]?.action ? `\n   ${esc(comps[comps.length - 1]?.action)}` : ""
        }`
      : "",
    flags.length ? `\n⚠️ ${flags.join(" • ")}` : "",
    "\n👇 माहिती <b>पहा</b> किंवा ➕ बटणाने नवीन <b>नोंद करा</b>.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** One extra section, sent only on button tap. */
function studentSection(s: Stu, section: string) {
  const head = `<b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})\n`;
  if (section === "comp") {
    const list = s.complaints ?? [];
    if (!list.length) return `${head}\n✅ कोणतीही तक्रार नोंदलेली नाही.`;
    const blkList = list.filter(isBlacklist);
    return (
      `${head}${blkList.length ? `\n⛔ <b>काळी यादी मध्ये आहे</b> (${blkList.length})\n` : ""}` +
      `\n<b>⚠️ तक्रारी / शिस्त</b>\n\n` +
      list
        .map(
          (c) =>
            `${isBlacklist(c) ? "⛔" : "•"} ${esc(c.date)} — <b>${esc(c.type)}</b>${
              c.severity ? ` (${esc(c.severity)})` : ""
            }${c.action ? `\n   ${esc(c.action)}` : ""}`,
        )
        .join("\n")
    );
  }

  if (section === "med") {
    const m = s.medical;
    if (!m) return `${head}\n🩺 मेडिकल नोंद नाही.`;
    return [
      `${head}`,
      "<b>🩺 मेडिकल माहिती</b>",
      m.bloodGroup ? `रक्तगट: ${esc(m.bloodGroup)}` : "",
      m.allergies ? `ॲलर्जी: ${esc(m.allergies)}` : "",
      m.illness ? `आजार: ${esc(m.illness)}` : "",
      m.doctorNotes ? `डॉक्टर नोंद: ${esc(m.doctorNotes)}` : "",
      s.emergencyContact ? `\n☎️ आपत्कालीन क्रमांक: ${esc(s.emergencyContact)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (section === "fee") {
    const led = s.feeLedger ?? [];
    const top = s.fees
      ? `एकूण ₹${s.fees.total ?? 0} • भरले ₹${s.fees.paid ?? 0} • बाकी ₹${s.fees.due ?? 0}`
      : "फी नोंद नाही";
    if (!led.length) return `${head}\n<b>💰 फी</b>\n${top}\n\nपावतीची नोंद नाही.`;
    return (
      `${head}\n<b>💰 फी</b>\n${top}\n\n<b>शेवटच्या पावत्या</b>\n` +
      led
        .map((p) => `• ${esc(p.date || "तारीख नाही")} — ₹${p.amount ?? 0} (${esc(p.mode || "-")})${p.receipt ? ` • ${esc(p.receipt)}` : ""}`)
        .join("\n")
    );
  }
  if (section === "exam") {
    const ex = s.exams ?? [];
    const subj = Object.entries(s.subjects ?? {}).filter(([, v]) => String(v ?? "").trim());
    const parts = [`${head}`, "<b>📚 निकाल व गुण</b>"];
    if (ex.length) {
      parts.push(
        ex
          .map((e) => {
            const p = e.max ? ` (${Math.round(((e.marks ?? 0) / e.max) * 100)}%)` : "";
            return `• ${esc(e.date)} ${esc(e.name)}${e.subject ? ` — ${esc(e.subject)}` : ""}: <b>${e.marks ?? "-"}/${e.max ?? "-"}</b>${p}${e.remark ? `\n   ${esc(e.remark)}` : ""}`;
          })
          .join("\n"),
      );
    }
    if (subj.length) {
      parts.push("\n<b>विषयनिहाय गुण</b>");
      parts.push(subj.map(([k, v]) => `• ${esc(k)}: ${esc(v)}`).join("\n"));
    }
    if (!ex.length && !subj.length) parts.push("\nअजून निकाल नोंदलेला नाही.");
    return parts.join("\n");
  }
  if (section === "rem") {
    const list = s.remarks ?? [];
    if (!list.length) return `${head}\n📝 शिक्षकांची नोंद नाही.`;
    return (
      `${head}\n<b>📝 शिक्षक नोंदी</b>\n\n` +
      list
        .map((r) => `• ${esc(r.date)} — ${esc(r.text)}${r.author ? `\n   — ${esc(r.author)}` : ""}${r.homework ? " • गृहपाठ ✅" : ""}`)
        .join("\n")
    );
  }
  if (section === "doc") {
    const list = s.documents ?? [];
    if (!list.length) return `${head}\n📄 कागदपत्रांची नोंद नाही.`;
    return (
      `${head}\n<b>📄 कागदपत्रे</b>\n\n` +
      list
        .map((d) => `${/verif|submit|received|मिळ/i.test(String(d.status)) ? "✅" : "⏳"} ${esc(d.name)} — ${esc(d.status || "बाकी")}`)
        .join("\n")
    );
  }
  if (section === "att") {
    const att = s.attendance ?? {};
    const pct = (v: unknown) => (typeof v === "number" ? `${v}%` : "—");
    const la = s.lastAbsent ?? [];
    return [
      `${head}`,
      "<b>📅 हजेरी तपशील</b>",
      `सकाळ ${pct(att["morningPct"])} • संध्याकाळ ${pct(att["eveningPct"])} • शाळा ${pct(att["schoolPct"])}`,
      `एकूण: ${pct(att["overallPct"])}`,
      la.length
        ? `\n<b>शेवटचे गैरहजर दिवस</b>\n${la
            .map((d) => `• ${esc(d.date)} — ${(d.sessions ?? []).map((k) => SESSION_MR[k] ?? k).join(", ")}`)
            .join("\n")}`
        : "\n✅ अलीकडे गैरहजेरी नाही.",
    ].join("\n");
  }
  if (section === "wmarks") {
    const wm = weeklyOf(s);
    const wg = s.weeklyGrade ?? "";
    if (!wm.length) return `${head}\n📊 साप्ताहिक गुणांची नोंद नाही.`;
    const avg = Math.round(wm.reduce((acc, w) => acc + (w.marks ?? 0), 0) / wm.length);
    const maxVal = wm[0]?.max ?? 100;
    const avgPct = maxVal ? Math.round((avg / maxVal) * 100) : 0;
    return [
      `${head}`,
      `<b>📊 साप्ताहिक गुण</b>${wg ? ` — श्रेणी: <b>${esc(wg)}</b>` : ""}`,
      `सरासरी: <b>${avg}/${maxVal}</b> (${avgPct}%)\n`,
      ...wm.map(w => {
        const p = w.max ? Math.round(((w.marks ?? 0) / w.max) * 100) : 0;
        const bar = p >= 75 ? "🟢" : p >= 50 ? "🟡" : "🔴";
        return `${bar} आठवडा ${w.week ?? "?"}: <b>${w.marks ?? 0}/${w.max ?? 100}</b> (${p}%)`;
      }),
    ].join("\n");
  }
  return `${head}\nमाहिती उपलब्ध नाही.`;
}

/** Long text -> multiple Telegram messages; keyboard only on the last one. */
async function sendLong(chatId: number, text: string, keyboard?: ReturnType<typeof studentKeyboard>) {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 3500) {
    let cut = rest.lastIndexOf("\n", 3500);
    if (cut < 1000) cut = 3500;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  chunks.push(rest);
  for (let i = 0; i < chunks.length; i++) {
    await sendMessage(chatId, chunks[i]!, i === chunks.length - 1 ? keyboard : undefined);
  }
  return undefined;
}

/** Send the short card (or a picker when the query is ambiguous). */
async function sendStudent(chatId: number, snap: Snap | null, q: string) {
  if (!snap || !(snap.students ?? []).length) return sendMessage(chatId, noData());
  if (!q.trim()) return sendMessage(chatId, "वापर: <code>/student राम</code> किंवा <code>/student 12</code>");
  const matches = findStudents(snap, q);
  if (!matches.length) return sendMessage(chatId, `❌ "${esc(q)}" या नावाचा विद्यार्थी सापडला नाही.`);
  if (matches.length > 1) {
    return sendMessage(chatId, "एकापेक्षा जास्त जुळले — निवडा:", {
      inline_keyboard: matches
        .slice(0, 8)
        .map((s) => [{ text: nameOf(s).slice(0, 60), callback_data: `stu:${s.id}:card` }]),
    });
  }
  const s = matches[0]!;
  await sendPhoto(chatId, String((s as Record<string, unknown>)["photo"] ?? ""), nameOf(s));
  return sendLong(chatId, studentCard(s), studentKeyboard(s));
}



function reportText(snap: Snap) {
  const list = snap.students ?? [];
  if (!list.length) return noData();
  const withPct = list
    .map((s) => ({ s, p: Number(s.attendance?.["overallPct"] ?? -1) }))
    .filter((x) => x.p >= 0);
  const avg = withPct.length
    ? Math.round(withPct.reduce((a, b) => a + b.p, 0) / withPct.length)
    : 0;
  const low = withPct.filter((x) => x.p < 60).sort((a, b) => a.p - b.p).slice(0, 10);
  const due = list.reduce((sum, s) => sum + (s.fees?.due ?? 0), 0);
  const stars = (snap.starStudentsThisWeek ?? [])
    .map((id) => list.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => s!.name);
  return [
    `<b>📊 सारांश — ${snap.school ?? ""}</b>`,
    `विद्यार्थी: ${list.length}`,
    `सरासरी हजेरी: ${avg}%`,
    `एकूण फी बाकी: ₹${due}`,
    stars.length ? `\n⭐ आदर्श विद्यार्थी: ${stars.join(", ")}` : "",
    low.length
      ? `\n<b>⚠️ कमी हजेरी (60% खाली)</b>\n${low.map((x) => `${nameOf(x.s)} — ${x.p}%`).join("\n")}`
      : "\n✅ सर्वांची हजेरी ठीक आहे.",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---------------- AI free text ---------------- */

const AI_BUDGET = 90_000;

/**
 * Build the AI payload. NEVER slice the JSON string (that produced broken JSON
 * and made the model say "गुण उपलब्ध नाहीत"): instead drop the heaviest fields
 * step by step until the whole snapshot fits, keeping marks/exams intact.
 */
function snapForAi(snap: Snap | null): string {
  if (!snap) return "{}";
  const full = JSON.stringify(snap);
  if (full.length <= AI_BUDGET) return full;

  type Stage = (s: NonNullable<Snap["students"]>[number]) => Record<string, unknown>;
  const compact: Stage = (s) => ({
    id: s.id,
    roll: s.roll,
    name: s.name,
    standard: s.standard,
    phone: s.phone,
    parent: s.parent,
    fees: s.fees ?? null,
    attendance: s.attendance ?? {},
    today: s.today ?? {},
    onLeave: s.onLeave ?? false,
    blacklisted: s.blacklisted ?? false,
    medical: s.medical ?? null,
    subjectMarks: s.subjectMarks ?? {},
    weeklyGrade: s.weeklyGrade ?? "",
    weeklyMarks: s.weeklyMarks ?? [],
    // गुण = सर्व परीक्षा (साप्ताहिक परीक्षा 1..9 सुद्धा) — कधीही कापायचे नाहीत
    exams: (s.exams ?? []).map((e) => ({
      name: e.name,
      subject: e.subject,
      date: e.date,
      marks: e.marks,
      max: e.max,
    })),
    complaints: (s.complaints ?? []).map((c) => ({ date: c.date, type: c.type, action: c.action })),
    remarks: (s.remarks ?? []).slice(0, 3).map((r) => ({ date: r.date, text: r.text })),
    lastAbsent: (s.lastAbsent ?? []).slice(0, 5),
  });

  const build = (stage: Stage) =>
    JSON.stringify({
      school: snap.school,
      today: snap.today,
      totalStudents: snap.totalStudents,
      starStudentsThisWeek: snap.starStudentsThisWeek,
      students: (snap.students ?? []).map(stage),
    });

  let out = build(compact);
  if (out.length <= AI_BUDGET) return out;

  // still large: drop remarks + complaint text, keep every exam mark
  out = build((s) => {
    const c = compact(s);
    c["remarks"] = [];
    c["complaints"] = (s.complaints ?? []).length;
    c["lastAbsent"] = (s.lastAbsent ?? []).slice(0, 2);
    return c;
  });
  if (out.length <= AI_BUDGET) return out;

  // last resort: marks + core identity only
  return build((s) => ({
    id: s.id,
    roll: s.roll,
    name: s.name,
    standard: s.standard,
    fees: s.fees ?? null,
    attendance: s.attendance ?? {},
    exams: (s.exams ?? []).map((e) => ({ n: e.name, m: e.marks, x: e.max, d: e.date })),
    subjectMarks: s.subjectMarks ?? {},
  }));
}


async function aiReply(chatId: number, text: string, snap: Snap | null) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return sendMessage(chatId, "AI सध्या उपलब्ध नाही.");
  const system = `You are "स्वप्निल बॉट" (also called गुरुकुल सहाय्यक), the Telegram assistant of शांतीब्रह्म गुरुकुलम, a Marathi school management app.
- Your name is स्वप्निल बॉट. Your developer and boss is स्वप्नील (Swapnil). The head of the gurukul is अंकुश महाराज कदम. When he greets (hi / hii / hello / नमस्कार / राम कृष्ण हरी), reply exactly: "राम कृष्ण हरी, अंकुश महाराज! मी कशा प्रकारे तुमची मदत करू शकतो?" and nothing else.
- ALWAYS reply in simple Marathi (Devanagari). Use English only if the user clearly writes in English.
- Keep it short — this is a chat message. Plain text, no markdown headings.
- Answer ONLY from the JSON snapshot given. If data is truly missing for that student, say so plainly.

MARKS (गुण) — very important:
- Each student's "exams" array holds every test. Weekly tests are named "साप्ताहिक परीक्षा 1" … "साप्ताहिक परीक्षा 9" with marks out of max (100). "subjectMarks" holds per-subject marks, "weeklyGrade" the grade.
- So weekly/exam marks DO exist. Never say "परीक्षेचे / साप्ताहिक गुण उपलब्ध नाहीत" when the student's exams array has entries. Only say data is missing if that student's exams array is empty.
- When asked about गुण, list week-wise marks and the average, and mention कोणती परीक्षा / कोणता आठवडा.

ROLL NUMBERS:
- If the user sends a plain number, treat it as a रोल नंबर and answer about that student.
- If no student in the snapshot has that roll number, say clearly: "हा रोल नंबर जुळत नाही" and tell the valid roll range. Never invent a student.
- Never guess between two students with similar names — ask which one.

CONVERSATION STYLE:
- Do NOT show menus or option buttons by default. Only when the user greets, says he wants to talk, or when you must ask a clarifying question.
- If the user's purpose is clear, answer exactly that specific thing — no extra menu.
- If anything is unclear (which student, which session, which date, which month, which exam), ask ONE short cross-question and put the possible answers in the options block. Use questions to find out what the user wants.
- If it is still unclear after your cross-question, say: "हे मला समजले नाही — स्वप्निल सरांना विचारावे लागेल."
- Attendance is per session: morning (सकाळ), evening (संध्याकाळ), school (शाळा).
- Each student also has: medical, complaints (शिस्त/तक्रारी), remarks (शिक्षक नोंदी), exams + subjectMarks (गुण), feeLedger (पावत्या), lastAbsent, fees. Use them when asked.
- Do NOT change any data; on Telegram you can only read and report. If asked to change something, tell the user to do it in the app or via the menu buttons.
- ONLY when you are asking a clarifying question (or greeting), end the reply with:
\`\`\`options
["...","...","..."]
\`\`\`
with up to 3 short tappable answers (under 5 words each). Otherwise add no options block at all.`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: system },
        { role: "system", content: `APP DATA SNAPSHOT:\n${snapForAi(snap)}` },
        { role: "user", content: text.slice(0, 4000) },
      ],
    }),
  });
  if (res.status === 429) return sendMessage(chatId, "थोडं थांबा — जास्त विनंत्या झाल्या आहेत.");
  if (!res.ok) {
    console.error("ai error", res.status, (await res.text()).slice(0, 300));
    return sendMessage(chatId, "उत्तर मिळालं नाही. पुन्हा प्रयत्न करा.");
  }
  const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  let content = payload.choices?.[0]?.message?.content ?? "";
  let options: string[] = [];
  const m = content.match(/```options\s*([\s\S]*?)```/);
  if (m) {
    content = content.replace(m[0], "").trim();
    try {
      const parsed: unknown = JSON.parse(m[1]!.trim());
      if (Array.isArray(parsed)) options = parsed.filter((x): x is string => typeof x === "string");
    } catch { /* ignore */ }
  }
  const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sendMessage(chatId, escaped || "…", optionsKeyboard(options));
}

/* ---------------- parent mode ---------------- */

async function cmdParentLink(chatId: number, code: string, username?: string) {
  const found = await findByParentCode(code);
  if (!found) {
    return sendMessage(
      chatId,
      "❌ कोड चुकीचा आहे.\n\nपालक कोड शाळेकडून मिळेल (उदा. <code>3FAE-041-7K</code>).",
    );
  }
  await admin().from("parent_links").upsert(
    {
      chat_id: chatId,
      org_id: found.org.id,
      student_id: found.student.id,
      student_name: found.student.name ?? null,
      parent_code: code.trim().toUpperCase(),
      username: username ?? null,
    },
    { onConflict: "chat_id,student_id" },
  );
  return sendMessage(
    chatId,
    `✅ जोडणी झाली!\n\nपाल्य: <b>${found.student.name}</b>\nशाळा: ${found.org.name}\n\nआता तुम्हाला गैरहजेरी, फी व अहवालाच्या सूचना इथे मिळतील.`,
    parentKeyboard(),
  );
}

async function handleParent(chatId: number, cmd: string, raw: string, links: ParentLink[]) {
  const snap = await snapshotFor(links[0]!.org_id);
  const kids = links
    .map((l) => ({ l, s: studentIn(snap, l.student_id) }))
    .filter((x) => x.s) as { l: ParentLink; s: NonNullable<ReturnType<typeof studentIn>> }[];

  if (cmd === "/unlink") {
    await admin().from("parent_links").delete().eq("chat_id", chatId);
    return sendMessage(chatId, "जोडणी काढली. पुन्हा जोडण्यासाठी पालक कोड पाठवा.");
  }
  if (!snap || !kids.length) return sendMessage(chatId, noData());

  const each = (fn: (s: (typeof kids)[number]["s"]) => string) =>
    kids.map((k) => fn(k.s)).join("\n\n———\n\n");

  if (cmd === "/hajeri" || cmd === "/attendance")
    return sendMessage(chatId, each((s) => parentAttendanceText(snap, s)), parentKeyboard());
  if (cmd === "/fees" || cmd === "/fee")
    return sendMessage(chatId, each((s) => parentFeesText(s)), parentKeyboard());
  if (cmd === "/report" || cmd === "/saransh")
    return sendMessage(chatId, each((s) => parentReportText(snap, s)), parentKeyboard());
  if (cmd === "/mahiti" || cmd === "/card")
    return sendMessage(chatId, each((s) => parentCardText(snap, s)), parentKeyboard());
  if (cmd === "/help" || cmd === "/madat") return sendMessage(chatId, PARENT_HELP);
  if (cmd.startsWith("/")) return sendMessage(chatId, `हा आदेश माहीत नाही.\n\n${PARENT_HELP}`);

  // Free text: AI answers using ONLY this parent's children.
  const scoped: Snap = { ...snap, students: kids.map((k) => k.s) };
  return aiReply(chatId, raw, scoped);
}

/* ---------------- full button menu ---------------- */

import {
  ALERT_PRESETS,
  COMPLAINT_NOTES,
  COMPLAINT_SUBNOTES,
  COMPLAINT_TYPES,
  GREETING,
  MENU_TEXT,
  SEVERITY,
  alertMsgKb,
  alertTargetKb,
  complaintNoteKb,
  complaintTypeKb,
  confirmKb,
  editMenu,
  feeAmountKb,
  feeModeKb,
  homeRow,
  mainMenu,
  marksKb,
  pickerText,
  queueAction,
  sendDocument,
  severityKb,
  studentPicker,
  ADM_LONG,
  ADM_SHORT,
  EVAL_QUESTIONS,
  SEVA_TASKS,
  admissionPhotoKb,
  admissionStepKb,
  admissionTypeKb,
  evalAnswerKb,
  evalDoneKb,
  sevaKb,
  LEAVE_REASONS,
  SUBJECT_CATALOG,
  leaveDaysKb,
  leaveHomeKb,
  leaveReasonKb,
  subjectPickKb,
  type Btn,
  subAdminKb,
  permLabel,
} from "./telegram-menu.server";

import {
  receiptHtml,
  receiptNo,
  receiptPlain,
  receiptText,
  waLink,
  type ReceiptStudent,
} from "./telegram-receipt.server";


function rosterOf(snap: Snap | null): AttStudent[] {
  return (snap?.students ?? [])
    .map((s) => ({ id: s.id, roll: s.roll, name: s.name }))
    .sort((a, b) => Number(a.roll ?? 0) - Number(b.roll ?? 0));
}

function sortedStudents(snap: Snap | null): Stu[] {
  return (snap?.students ?? []).slice().sort((a, b) => Number(a.roll ?? 0) - Number(b.roll ?? 0));
}

function byRoll(snap: Snap | null, roll: number): Stu | undefined {
  return (snap?.students ?? []).find((s) => Number(s.roll ?? -1) === roll);
}

const today10 = () => new Date().toISOString().slice(0, 10);

const FLOW_TITLE: Record<string, string> = {
  stu: "2️⃣ विद्यार्थी माहिती",
  hist: "3️⃣ मागील इतिहास",
  comp: "4️⃣ तक्रार / घटना नोंदवा",
  star: "5️⃣ आदर्श विद्यार्थी",
  fee: "7️⃣ फी व्यवहार",
  alert: "8️⃣ सूचना पाठवा",
  efee: "✏️ फी नोंद काढा",
  ecomp: "✏️ तक्रार काढा",
  rcpt: "🧾 फी पावती द्या",
  eval: "📝 मूल्यांकन करा",
  leave: "🏠 रजा / गावी गेला",
  subj: "📚 विषय बदला",
};

/* ---------------- रजा + विषय helpers ---------------- */

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function leaveList(s: Stu) {
  return (s.leaves ?? []).slice().sort((a, b) => String(b.from ?? "").localeCompare(String(a.from ?? "")));
}

function leaveText(s: Stu) {
  const rows = leaveList(s);
  const today = today10();
  const cur = rows.find((l) => String(l.from ?? "") <= today && today <= String(l.to ?? l.from ?? ""));
  return [
    `<b>🏠 रजा — ${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})`,
    "",
    cur ? `सध्या रजेवर आहे — ${esc(cur.from)} → ${esc(cur.to ?? cur.from)} (${esc(cur.reason ?? "")})` : "सध्या रजेवर नाही.",
    "",
    rows.length ? "<b>नोंदी</b>\n" + rows.slice(0, 6).map((l) => `• ${esc(l.from)} → ${esc(l.to ?? l.from)} — ${esc(l.reason ?? "")}`).join("\n") : "अद्याप रजा नोंद नाही.",
    "",
    "रजेच्या दिवसांची हजेरी मोजली जाणार नाही आणि पालकांना गैरहजेरीची सूचना जाणार नाही.",
  ].join("\n");
}

function subjectLabel(k: string) {
  return SUBJECT_CATALOG.find(([c]) => c === k)?.[1] ?? k.replace(/_/g, " ");
}

/** Catalog मध्ये नसलेले (स्वतः लिहिलेले) विषय. */
function extraSubjectsOf(s: Stu, d?: Record<string, unknown>): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  (s.subjectList ?? []).forEach((x) => {
    const k = String(x.k);
    if (!SUBJECT_CATALOG.some(([c]) => c === k)) out.push([k, String(x.mr || x.en || k)]);
  });
  ((d?.["extras"] ?? []) as Array<[string, string]>).forEach((e) => {
    if (!out.some(([k]) => k === e[0])) out.push(e);
  });
  return out;
}

function pickedSubjects(s: Stu): string[] {
  const list = s.subjectList;
  if (Array.isArray(list) && list.length) return list.map((x) => String(x.k));
  const keys = Object.keys(s.subjects ?? {});
  return keys.length ? keys : ["Kirtan", "Gayan", "Pakhawaj", "Bhagwat"];
}

function subjectText(s: Stu, picked: string[]) {
  return [
    `<b>📚 विषय — ${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})`,
    "",
    picked.length ? picked.map((k) => `✅ ${esc(subjectLabel(k))}`).join("\n") : "अद्याप विषय निवडलेले नाहीत.",
    "",
    "विषय निवडा / काढा आणि 💾 जतन करा दाबा.",
  ].join("\n");
}

/** दैनंदिन सेवा — आजची यादी + बाकी कामांचा सारांश. */
function sevaText(snap: Snap | null, done: Record<string, boolean>) {
  const pend = SEVA_TASKS.filter(([k]) => !done[k]).length;
  const t = tasksText(snap);
  const extra = typeof t === "string" ? "" : `\n\n<b>बाकी कामे</b>\n${t.text.split("\n").slice(1).join("\n")}`;
  return (
    `<b>🔟 दैनंदिन सेवा — ${esc(today10())}</b>\n` +
    `पूर्ण: ${SEVA_TASKS.length - pend}/${SEVA_TASKS.length}\n\n` +
    "सेवा झाली की बटण दाबा, शेवटी 💾 जतन करा." +
    extra
  );
}


async function startPicker(
  chatId: number,
  messageId: number | undefined,
  snap: Snap | null,
  flow: string,
) {
  const list = sortedStudents(snap);
  if (!list.length) return edit(chatId, messageId, noData(), mainMenu());
  await setState(chatId, { mode: "flow", flow, step: "pick", data: {} });
  return edit(
    chatId,
    messageId,
    pickerText(FLOW_TITLE[flow] ?? "विद्यार्थी निवडा"),
    studentPicker(list, flow, 0),
  );
}

/* ---------------- history ---------------- */

function historyText(s: Stu) {
  const out: string[] = [`<b>🕘 मागील इतिहास — ${esc(s.name)} (रोल ${esc(s.roll ?? "-")})</b>`];
  const la = s.lastAbsent ?? [];
  out.push(
    la.length
      ? `\n<b>गैरहजर दिवस</b>\n${la
          .map((d) => `• ${esc(d.date)} — ${(d.sessions ?? []).map((k) => SESSION_MR[k] ?? k).join(", ")}`)
          .join("\n")}`
      : "\n✅ अलीकडे गैरहजेरी नाही.",
  );
  const led = s.feeLedger ?? [];
  out.push(
    led.length
      ? `\n<b>फी नोंदी</b>\n${led
          .map((p) => `• ${esc(p.date || "-")} — ₹${p.amount ?? 0} (${esc(p.mode || "-")})`)
          .join("\n")}`
      : "\n💰 फी नोंद नाही.",
  );
  const comp = s.complaints ?? [];
  out.push(
    comp.length
      ? `\n<b>तक्रारी</b>\n${comp
          .map(
            (c) =>
              `${isBlacklist(c) ? "⛔" : "•"} ${esc(c.date)} — ${esc(c.type)}${
                c.severity ? ` (${esc(c.severity)})` : ""
              } ${esc(c.action ?? "")}`,
          )
          .join("\n")}`

      : "\n✅ तक्रार नाही.",
  );
  const ex = s.exams ?? [];
  out.push(
    ex.length
      ? `\n<b>परीक्षा</b>\n${ex
          .map((e) => `• ${esc(e.date)} ${esc(e.name)} — ${e.marks ?? "-"}/${e.max ?? "-"}`)
          .join("\n")}`
      : "\n📚 परीक्षा नोंद नाही.",
  );
  return out.join("\n");
}

/* ---------------- today's tasks ---------------- */

function tasksText(snap: Snap | null) {
  if (!snap) return noData();
  const list = snap.students ?? [];
  const lines: string[] = [`<b>🔟 आजची कामे — ${esc(snap.today ?? today10())}</b>`];
  const pending: Btn[][] = [];
  for (const key of SESSIONS) {
    const noRec = list.filter((s) => (s.today?.[key] ?? "no-record") === "no-record").length;
    if (noRec) {
      lines.push(`• ${SESSION_MR[key]} हजेरी बाकी (${noRec} विद्यार्थी)`);
      pending.push([{ text: `📋 ${SESSION_MR[key]} हजेरी घ्या`, callback_data: `att:s:${key}` }]);
    }
  }
  const dueList = list.filter((s) => (s.fees?.due ?? 0) > 0);
  if (dueList.length) {
    lines.push(`• फी बाकी — ${dueList.length} विद्यार्थी (₹${dueList.reduce((a, b) => a + (b.fees?.due ?? 0), 0)})`);
    pending.push([{ text: "💰 फी नोंद करा", callback_data: "m:fee" }]);
  }
  const absentToday = list.filter((s) => SESSIONS.some((k) => s.today?.[k] === "absent"));
  if (absentToday.length) {
    lines.push(`• आज गैरहजर — ${absentToday.length}`);
    pending.push([{ text: "📤 पालकांना सूचना पाठवा", callback_data: "m:alert" }]);
  }
  const lowAtt = list.filter((s) => Number(s.attendance?.["overallPct"] ?? 100) < 60);
  if (lowAtt.length) lines.push(`• कमी हजेरी (60% खाली) — ${lowAtt.length}`);
  if (lines.length === 1) lines.push("\n✅ आजची सर्व कामे पूर्ण झाली आहेत!");
  pending.push(homeRow());
  return { text: lines.join("\n"), kb: { inline_keyboard: pending } };
}

/* ---------------- backup ---------------- */

function backupCsv(snap: Snap) {
  const rows = [
    ["रोल", "नाव", "इयत्ता", "सकाळ", "संध्याकाळ", "शाळा", "हजेरी%", "फी एकूण", "भरले", "बाकी", "तक्रारी"].join(","),
  ];
  for (const s of sortedStudents(snap)) {
    const t = s.today ?? {};
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    rows.push(
      [
        s.roll ?? "",
        q(s.name),
        q(s.standard),
        t["morning"] ?? "",
        t["evening"] ?? "",
        t["school"] ?? "",
        s.attendance?.["overallPct"] ?? "",
        s.fees?.total ?? 0,
        s.fees?.paid ?? 0,
        s.fees?.due ?? 0,
        s.complaints?.length ?? 0,
      ].join(","),
    );
  }
  return "\uFEFF" + rows.join("\n");
}

/* ---------------- alerts ---------------- */

async function sendAlert(orgId: string, message: string, studentId?: string) {
  const db = admin();
  let q = db.from("parent_links").select("chat_id, student_id, student_name").eq("org_id", orgId);
  if (studentId) q = q.eq("student_id", studentId);
  const { data } = await q;
  const rows = (data ?? []) as Array<{ chat_id: number; student_name?: string }>;
  let sent = 0;
  for (const r of rows) {
    await sendMessage(r.chat_id, `📢 <b>शाळेची सूचना</b>\n\n${esc(message)}`);
    sent++;
  }
  return sent;
}

/* ---------------- sub-admin invite codes ---------------- */

const SUB_PERMS_ALL: TgPerm[] = [
  "attendance",
  "students",
  "complaints",
  "fees",
  "exams",
  "tasks",
  "reports",
  "alerts",
  "backup",
  "admissions",
];

function newInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "SB";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function permsText(perms: TgPerm[]) {
  return perms.length ? perms.map((p) => permLabel(p)).join("\n") : "— काहीच निवडलेले नाही —";
}

const SUB_ADMIN_TEXT = `<b>👥 सब-ॲडमिन तयार करा</b>

खाली परवानग्या निवडा (टॅप करून ✅ करा).
नंतर <b>🔑 कोड तयार करा</b> दाबा — एक कोड मिळेल.
तो कोड ज्याला द्याल, त्याला फक्त <b>निवडलेल्या</b> गोष्टी करता येतील.`;

async function subAdminList(chatId: number, messageId: number | undefined, orgId: string) {
  const { data } = await admin()
    .from("telegram_invites")
    .select("code, role, permissions, active, used_at")
    .eq("org_id", orgId)
    .eq("role", "sub")
    .order("created_at", { ascending: false })
    .limit(15);
  const rows = (data ?? []) as Array<{
    code: string;
    permissions: TgPerm[] | null;
    active: boolean;
    used_at: string | null;
  }>;
  const body = rows.length
    ? rows
        .map(
          (r) =>
            `<code>${r.code}</code> — ${(r.permissions ?? []).map((p) => permLabel(p)).join(", ") || "—"}` +
            `${r.active ? "" : " (बंद)"}${r.used_at ? " ✔ वापरला" : ""}`,
        )
        .join("\n\n")
    : "अजून एकही सब-ॲडमिन कोड तयार केलेला नाही.";
  return edit(chatId, messageId, `<b>📄 सब-ॲडमिन कोड</b>\n\n${body}`, {
    inline_keyboard: [[{ text: "↩️ मागे", callback_data: "m:users" }], homeRow()],
  });
}

/* ---------------- callback router ---------------- */

export async function handleCallback(
  chatId: number,
  messageId: number | undefined,
  data: string,
  username?: string,
) {
  if (data.startsWith("ask:")) return handleText(chatId, data.slice(4), username);
  if (data === "att:noop") return undefined;

  const link = await linkFor(chatId);
  if (!link) return sendMessage(chatId, "आधी जोडणी करा: <code>/link ABC12345</code>");
  const snap = await snapshotFor(link.org_id);
  const roster = rosterOf(snap);
  const list = sortedStudents(snap);

  const { role, perms } = await roleFor(chatId);
  const mgr = isManager(role, perms);

  if (data === "m:role") {
    const txt =
      role === "admin"
        ? "👤 तुमची भूमिका: <b>ॲडमिन</b> — सर्व परवानग्या आहेत."
        : mgr
          ? "👤 तुमची भूमिका: <b>मॅनेजर</b> — फक्त हजेरी घेऊ शकता. माहिती पाहणे / बदल करणे बंद आहे."
          : "👤 तुमची भूमिका: <b>सब-मॅनेजर</b> — मर्यादित परवानग्या.";
    return edit(chatId, messageId, txt, { inline_keyboard: [homeRow()] });
  }

  // Manager = attendance-only. Block every other action.
  if (mgr) {
    const okCb = data === "m:menu" || data === "m:att" || data === "m:role" || data.startsWith("att:");
    if (!okCb) {
      return edit(
        chatId,
        messageId,
        "⛔ तुम्हाला फक्त <b>हजेरी घेण्याची</b> परवानगी आहे.\nइतर कामांसाठी ॲडमिनशी संपर्क करा.",
        mainMenu(role, perms),
      );
    }
  }

  /* ---- main menu ---- */
  if (data === "m:menu") {
    await clearState(chatId);
    return edit(chatId, messageId, MENU_TEXT, mainMenu(role, perms));
  }
  if (data === "m:att") {
    if (!roster.length) return edit(chatId, messageId, noData(), mainMenu());
    return edit(chatId, messageId, "कोणत्या वेळेची हजेरी घ्यायची?", sessionMenu());
  }
  if (data === "m:stu") return startPicker(chatId, messageId, snap, "stu");
  if (data === "m:hist") return startPicker(chatId, messageId, snap, "hist");
  if (data === "m:comp") return startPicker(chatId, messageId, snap, "comp");
  if (data === "m:star") return startPicker(chatId, messageId, snap, "star");
  if (data === "m:fee") return startPicker(chatId, messageId, snap, "fee");
  if (data === "m:wmarks") return startPicker(chatId, messageId, snap, "wmarks");
  if (data === "e:fee") return startPicker(chatId, messageId, snap, "efee");
  if (data === "e:comp") return startPicker(chatId, messageId, snap, "ecomp");
  if (data === "m:edit") {
    if (role !== "admin")
      return edit(chatId, messageId, "⛔ बदल करण्याची परवानगी फक्त ॲडमिनला आहे.", mainMenu(role, perms));
    return edit(chatId, messageId, "<b>✏️ काय बदलायचे आहे?</b>", editMenu(role, perms));
  }
  if (data === "m:users" || data.startsWith("u:")) {
    if (role !== "admin")
      return edit(chatId, messageId, "⛔ सब-ॲडमिन तयार करणे फक्त ॲडमिनसाठी आहे.", mainMenu(role, perms));

    if (data === "m:users") {
      await setState(chatId, { mode: "flow", flow: "subadm", step: "perm", data: { perms: [] } });
      return edit(chatId, messageId, SUB_ADMIN_TEXT, subAdminKb(new Set()));
    }

    const st = await getState(chatId);
    const d = (st.data ?? {}) as Record<string, unknown>;
    const picked = new Set<TgPerm>(Array.isArray(d["perms"]) ? (d["perms"] as TgPerm[]) : []);

    if (data === "u:list") return subAdminList(chatId, messageId, link.org_id);

    if (data.startsWith("u:t:")) {
      const key = data.slice(4) as TgPerm;
      if (!SUB_PERMS_ALL.includes(key)) return undefined;
      if (picked.has(key)) picked.delete(key);
      else picked.add(key);
      await setState(chatId, {
        mode: "flow",
        flow: "subadm",
        step: "perm",
        data: { perms: [...picked] },
      });
      return edit(
        chatId,
        messageId,
        `${SUB_ADMIN_TEXT}\n\n<b>निवडलेल्या परवानग्या:</b>\n${permsText([...picked])}`,
        subAdminKb(picked),
      );
    }

    if (data === "u:gen") {
      const list2 = [...picked];
      if (!list2.length)
        return edit(
          chatId,
          messageId,
          `${SUB_ADMIN_TEXT}\n\n❗ आधी किमान एक परवानगी निवडा.`,
          subAdminKb(picked),
        );
      const code = newInviteCode();
      const { error } = await admin().from("telegram_invites").insert({
        code,
        org_id: link.org_id,
        role: "sub",
        permissions: list2,
        created_by: chatId,
        active: true,
      });
      if (error) {
        console.error("invite insert failed", error.message);
        return edit(chatId, messageId, "कोड तयार करता आला नाही. पुन्हा प्रयत्न करा.", subAdminKb(picked));
      }
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        [
          "<b>🔑 सब-ॲडमिन कोड तयार झाला!</b>",
          "",
          `कोड: <code>${code}</code>`,
          "",
          "<b>परवानग्या:</b>",
          permsText(list2),
          "",
          "हा कोड ज्याला द्यायचा त्याला पाठवा. त्याने बॉटमध्ये फक्त कोड लिहून पाठवावा,",
          `किंवा ही लिंक उघडावी:\nhttps://t.me/Varkari_bot?start=${code}`,
        ].join("\n"),
        { inline_keyboard: [[{ text: "➕ आणखी एक कोड", callback_data: "m:users" }], homeRow()] },
      );
    }
    return undefined;
  }

  if (data === "m:rcpt") return startPicker(chatId, messageId, snap, "rcpt");
  if (data === "m:eval") return startPicker(chatId, messageId, snap, "eval");
  if (data === "m:leave") return startPicker(chatId, messageId, snap, "leave");
  if (data === "m:subj") return startPicker(chatId, messageId, snap, "subj");
  if (data === "m:adm") {
    await clearState(chatId);
    return edit(
      chatId,
      messageId,
      "<b>🎓 नवीन प्रवेश</b>\n\nकोणता फॉर्म भरायचा?",
      admissionTypeKb(),
    );
  }
  if (data === "m:task") {
    const done = (snap?.seva ?? {})[today10()] ?? {};
    await setState(chatId, { mode: "flow", flow: "seva", step: "tog", data: { done } });
    return edit(chatId, messageId, sevaText(snap, done), sevaKb(done));
  }

  if (data === "m:backup") {
    if (!snap) return edit(chatId, messageId, noData(), mainMenu());
    await edit(chatId, messageId, "बॅकअप तयार होत आहे…", mainMenu());
    await sendDocument(
      chatId,
      `backup-${today10()}.csv`,
      backupCsv(snap),
      `💾 <b>आजची बॅकअप — ${esc(snap.today ?? today10())}</b>\nविद्यार्थी: ${(snap.students ?? []).length}`,
    );
    return sendMessage(chatId, attendanceText(snap), mainMenu());
  }
  if (data === "m:alert") {
    await setState(chatId, { mode: "flow", flow: "alert", step: "to", data: {} });
    return edit(chatId, messageId, "<b>8️⃣ सूचना कोणाला पाठवायची?</b>", alertTargetKb());
  }
  if (data === "m:exam") {
    await setState(chatId, { mode: "flow", flow: "exam", step: "meta", data: {} });
    return edit(
      chatId,
      messageId,
      "<b>9️⃣ परीक्षा गुण भरा</b>\n\nपरीक्षेचे नाव, विषय आणि एकूण गुण एका ओळीत लिहा —\nउदा. <code>घटक चाचणी, गणित, 25</code>",
      { inline_keyboard: [homeRow()] },
    );
  }

  const parts = data.split(":");
  const state = await getState(chatId);
  const fdata = (state.data ?? {}) as Record<string, unknown>;

  /* ---- picker paging / selection ---- */
  if (parts[0] === "p") {
    const flow = parts[1] ?? "stu";
    return edit(
      chatId,
      messageId,
      pickerText(FLOW_TITLE[flow] ?? "विद्यार्थी निवडा"),
      studentPicker(list, flow, Number(parts[2] ?? 0)),
    );
  }

  if (parts[0] === "s") {
    const flow = parts[1] ?? "stu";
    const roll = Number(parts[2] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "विद्यार्थी सापडला नाही.", mainMenu());
    return afterStudentPick(chatId, messageId, link.org_id, flow, s);
  }

  /* ---- student detail sections ---- */
  if (parts[0] === "stu") {
    const stu = (snap?.students ?? []).find((x) => x.id === parts[1]);
    if (!stu) return sendMessage(chatId, noData());
    const section = parts[2] ?? "card";
    if (section === "add") {
      // ➕ बटण — त्या विद्यार्थ्यासाठी थेट नोंद-फ्लो सुरू करा.
      return studentAdd(chatId, messageId, link.org_id, parts[3] ?? "", stu);
    }
    if (section === "card") {
      await sendPhoto(chatId, String((stu as Record<string, unknown>)["photo"] ?? ""), nameOf(stu));
    }
    if (section === "hist") {
      await sendPhoto(chatId, String((stu as Record<string, unknown>)["photo"] ?? ""), nameOf(stu));
      return sendLong(chatId, historyText(stu), studentKeyboard(stu));
    }
    const body = section === "card" ? studentCard(stu) : studentSection(stu, section);
    return sendLong(chatId, body, studentKeyboard(stu));
  }

  /* ---- complaint flow ---- */
  if (parts[0] === "c") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    if (parts[1] === "type") {
      if (parts[2] === "custom") {
        await setState(chatId, { ...state, step: "ctype", data: fdata });
        return edit(chatId, messageId, `<b>${esc(s.name)}</b> — तक्रारीचा नवीन प्रकार लिहून पाठवा.`, {
          inline_keyboard: [homeRow("m:comp")],
        });
      }
      fdata["typeKey"] = parts[2] ?? "itar";
      fdata["type"] = COMPLAINT_TYPES.find(([k]) => k === parts[2])?.[1] ?? "इतर";
      await setState(chatId, { ...state, step: "sev", data: fdata });
      return edit(chatId, messageId, `<b>${esc(s.name)}</b> — किती गंभीर आहे?`, severityKb());
    }
    if (parts[1] === "sev") {
      fdata["sev"] = SEVERITY.find(([k]) => k === parts[2])?.[1] ?? "सौम्य";
      await setState(chatId, { ...state, step: "note", data: fdata });
      return edit(
        chatId,
        messageId,
        `<b>${esc(s.name)}</b> — काय घडले? बटण दाबा किंवा स्वतः लिहून पाठवा.`,
        complaintNoteKb(String(fdata["typeKey"] ?? "")),
      );
    }
    if (parts[1] === "note") {
      if (parts[2] === "own") {
        await setState(chatId, { ...state, step: "note", data: fdata });
        return edit(chatId, messageId, `<b>${esc(s.name)}</b> — तपशील लिहून पाठवा.`, {
          inline_keyboard: [homeRow("m:comp")],
        });
      }
      const notes = COMPLAINT_SUBNOTES[String(fdata["typeKey"] ?? "")] ?? COMPLAINT_NOTES;
      fdata["note"] = notes[Number(parts[2] ?? 0)] ?? "";
      await setState(chatId, { ...state, step: "ok", data: fdata });
      return edit(chatId, messageId, complaintSummary(s, fdata), confirmKb("c:ok"));
    }
    if (parts[1] === "ok") {
      const entry = {
        type: String(fdata["type"] ?? "इतर"),
        severity: String(fdata["sev"] ?? ""),
        action: String(fdata["note"] ?? ""),
        date: today10(),
      };
      const ok = await queueAction(link.org_id, chatId, "complaint", {
        roll,
        studentId: s.id,
        type: entry.type,
        severity: entry.severity,
        text: entry.action,
        date: entry.date,
      });
      if (ok) {
        await patchSnapshotStudent(link.org_id, s.id, (stu) => {
          stu.complaints = [...(stu.complaints ?? []), entry];
        });
      }
      await clearState(chatId);
      const isBlk = entry.type.includes("काळी यादी");
      return edit(
        chatId,
        messageId,
        ok
          ? `${isBlk ? "⛔" : "✅"} ${isBlk ? "काळ्या यादीत नोंद झाली" : "तक्रार नोंदली"} — <b>${esc(s.name)}</b>\n` +
            `${esc(entry.date)} • ${esc(entry.type)}${entry.severity ? ` (${esc(entry.severity)})` : ""}` +
            `${entry.action ? `\n${esc(entry.action)}` : ""}\n\nही नोंद आता विद्यार्थ्याच्या माहितीत व ॲपमध्ये दिसेल.`
          : "❌ जतन झाले नाही.",
        {
          inline_keyboard: [
            [{ text: "👦 विद्यार्थ्याची माहिती", callback_data: `stu:${s.id}:card` }],
            [{ text: "⚠️ तक्रारी पहा", callback_data: `stu:${s.id}:comp` }],
            [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
          ],
        },
      );
    }

  }

  /* ---- star student ---- */
  if (parts[0] === "st" && parts[1] === "ok") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    const ok = await queueAction(link.org_id, chatId, "star", { roll, studentId: s.id });
    await clearState(chatId);
    return edit(
      chatId,
      messageId,
      ok ? `⭐ <b>${esc(s.name)}</b> आदर्श विद्यार्थी म्हणून नोंदवले.` : "❌ जतन झाले नाही.",
      mainMenu(),
    );
  }

  /* ---- fee flow ---- */
  if (parts[0] === "f") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    if (parts[1] === "amt") {
      fdata["amount"] = Number(parts[2] ?? 0);
      await setState(chatId, { ...state, step: "mode", data: fdata });
      return edit(chatId, messageId, `₹${fdata["amount"]} — कोणत्या पद्धतीने?`, feeModeKb());
    }
    if (parts[1] === "other") {
      await setState(chatId, { ...state, step: "amount", data: fdata });
      return edit(chatId, messageId, "रक्कम आकड्यात लिहून पाठवा — उदा. <code>750</code>", {
        inline_keyboard: [homeRow("m:fee")],
      });
    }
    if (parts[1] === "mode") {
      fdata["mode"] = parts[2] ?? "रोख";
      await setState(chatId, { ...state, step: "ok", data: fdata });
      return edit(chatId, messageId, feeSummary(s, fdata), confirmKb("f:ok"));
    }
    if (parts[1] === "ok") {
      const ok = await queueAction(link.org_id, chatId, "fee", {
        roll,
        studentId: s.id,
        amount: Number(fdata["amount"] ?? 0),
        mode: String(fdata["mode"] ?? "रोख"),
        date: today10(),
      });
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        ok
          ? `✅ पावती नोंदली\n\n<b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})\nरक्कम: ₹${fdata["amount"]} • ${esc(fdata["mode"])}\nतारीख: ${today10()}`
          : "❌ जतन झाले नाही.",
        mainMenu(),
      );
    }
  }

  /* ---- alert flow ---- */
  if (parts[0] === "a") {
    if (parts[1] === "to") {
      if (parts[2] === "one") return startPicker(chatId, messageId, snap, "alert");
      await setState(chatId, { mode: "flow", flow: "alert", step: "msg", data: { to: "all" } });
      return edit(chatId, messageId, "कोणता संदेश पाठवायचा?", alertMsgKb());
    }
    if (parts[1] === "msg" || parts[1] === "own") {
      if (parts[1] === "own") {
        await setState(chatId, { ...state, step: "typemsg", data: fdata });
        return edit(chatId, messageId, "संदेश लिहून पाठवा.", { inline_keyboard: [homeRow("m:alert")] });
      }
      fdata["msg"] = ALERT_PRESETS[Number(parts[2] ?? 0)] ?? "";
      await setState(chatId, { ...state, step: "ok", data: fdata });
      return edit(chatId, messageId, alertSummary(fdata), confirmKb("a:ok"));
    }
    if (parts[1] === "ok") {
      const sid = fdata["studentId"] ? String(fdata["studentId"]) : undefined;
      const sent = await sendAlert(link.org_id, String(fdata["msg"] ?? ""), sid);
      await clearState(chatId);
      return edit(chatId, messageId, `📤 ${sent} पालकांना सूचना पाठवली.`, mainMenu());
    }
  }

  /* ---- exam flow ---- */
  if (parts[0] === "x") {
    if (parts[1] === "m" || parts[1] === "skip") {
      const marks = (fdata["marks"] ?? {}) as Record<string, number>;
      const idx = Number(fdata["idx"] ?? 0);
      const cur = list[idx];
      if (parts[1] === "m" && cur) marks[String(cur.roll)] = Number(parts[2] ?? 0);
      fdata["marks"] = marks;
      fdata["idx"] = idx + 1;
      await setState(chatId, { ...state, step: "marks", data: fdata });
      return examStep(chatId, messageId, list, fdata, link.org_id, false);
    }
    if (parts[1] === "type") {
      await setState(chatId, { ...state, step: "typemarks", data: fdata });
      return edit(chatId, messageId, "गुण आकड्यात लिहून पाठवा.", { inline_keyboard: [homeRow()] });
    }
    if (parts[1] === "save") {
      return examStep(chatId, messageId, list, fdata, link.org_id, true);
    }
  }

  /* ---- फी पावती ---- */
  if (parts[0] === "r") {
    const s = byRoll(snap, Number(fdata["roll"] ?? 0));
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    if (parts[1] === "led") {
      const row = (s.feeLedger ?? [])[Number(parts[2] ?? 0)];
      if (!row) return edit(chatId, messageId, "नोंद सापडली नाही.", mainMenu());
      await clearState(chatId);
      return sendReceipt(chatId, messageId, snap, s, Number(row.amount ?? 0), String(row.mode ?? "रोख"));
    }
    if (parts[1] === "new") {
      await setState(chatId, { ...state, step: "rcptamt", data: fdata });
      return edit(chatId, messageId, "पावतीची रक्कम आकड्यात लिहून पाठवा — उदा. <code>1500</code>", {
        inline_keyboard: [homeRow()],
      });
    }
  }

  /* ---- दैनंदिन सेवा ---- */

  if (parts[0] === "t") {
    const done = (fdata["done"] ?? {}) as Record<string, boolean>;
    if (parts[1] === "tog") {
      const key = parts[2] ?? "";
      done[key] = !done[key];
      fdata["done"] = done;
      await setState(chatId, { mode: "flow", flow: "seva", step: "tog", data: fdata });
      return edit(chatId, messageId, sevaText(snap, done), sevaKb(done));
    }
    if (parts[1] === "save") {
      const date = today10();
      const ok = await queueAction(link.org_id, chatId, "seva", { date, done });
      await patchSnapshot(link.org_id, (s) => {
        s.seva = { ...(s.seva ?? {}), [date]: done };
      });
      await clearState(chatId);
      const lines = SEVA_TASKS.map(([k, v]) => `${done[k] ? "✅" : "⬜"} ${v}`).join("\n");
      return edit(
        chatId,
        messageId,
        ok ? `💾 <b>आजची सेवा नोंदली</b> — ${esc(date)}\n\n${lines}` : "❌ जतन झाले नाही.",
        mainMenu(),
      );
    }
  }

  /* ---- नवीन प्रवेश ---- */
  if (parts[0] === "d") {
    if (parts[1] === "form") {
      const long = parts[2] === "long";
      await setState(chatId, {
        mode: "flow",
        flow: "adm",
        step: "field",
        data: { long, idx: 0, fields: {} },
      });
      return admissionStep(chatId, messageId, { long, idx: 0, fields: {} });
    }
    if (parts[1] === "skip") {
      const idx = Number(fdata["idx"] ?? 0) + 1;
      fdata["idx"] = idx;
      await setState(chatId, { ...state, step: "field", data: fdata });
      return admissionStep(chatId, messageId, fdata);
    }
    if (parts[1] === "save") {
      return saveAdmission(chatId, messageId, link.org_id, snap, fdata);
    }
  }

  /* ---- मूल्यांकन ---- */
  if (parts[0] === "v") {
    const s = byRoll(snap, Number(fdata["roll"] ?? 0));
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    const answers = (fdata["answers"] ?? {}) as Record<string, string>;
    if (parts[1] === "a") {
      const i = Number(parts[2] ?? 0);
      const key = EVAL_QUESTIONS[i]?.[0] ?? "";
      answers[key] = parts[3] === "yes" ? "होय" : parts[3] === "no" ? "नाही" : "इतर";
      fdata["answers"] = answers;
      fdata["idx"] = i + 1;
      await setState(chatId, { ...state, step: "q", data: fdata });
      return evalStep(chatId, messageId, s, fdata);
    }
    if (parts[1] === "photo") {
      await setState(chatId, { ...state, step: "photo", data: fdata });
      return edit(
        chatId,
        messageId,
        `📷 <b>${esc(s.name)}</b> — उत्तरपत्रिकेचा फोटो इथेच पाठवा.\nफोटो पाठवल्यावर 💾 जतन करा दाबा.`,
        evalDoneKb(),
      );
    }
    if (parts[1] === "save") {
      const photos = (fdata["photos"] ?? []) as string[];
      const date = today10();
      const ok = await queueAction(link.org_id, chatId, "evaluation", {
        roll: Number(s.roll ?? 0),
        studentId: s.id,
        date,
        checklist: answers,
        photos,
      });
      if (ok) {
        await patchSnapshotStudent(link.org_id, s.id, (stu) => {
          stu.evaluation = { date, checklist: answers, photos };
        });
      }
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        ok ? `${evalSummary(s, answers, photos.length)}\n\n✅ जतन झाले — ॲपमध्येही दिसेल.` : "❌ जतन झाले नाही.",
        {
          inline_keyboard: [
            [{ text: "👦 विद्यार्थ्याची माहिती", callback_data: `stu:${s.id}:card` }],
            [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
          ],
        },
      );
    }
  }

  /* ---- edit: delete a fee / complaint row ---- */

  if (parts[0] === "ed") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    const kind = parts[1] === "fee" ? "fee_delete" : "complaint_delete";
    const idx = Number(parts[2] ?? 0);
    const rowText =
      parts[1] === "fee"
        ? `₹${s.feeLedger?.[idx]?.amount ?? 0} (${esc(s.feeLedger?.[idx]?.date ?? "")})`
        : `${esc(s.complaints?.[idx]?.type ?? "")} (${esc(s.complaints?.[idx]?.date ?? "")})`;
    const ok = await queueAction(link.org_id, chatId, kind, {
      roll,
      studentId: s.id,
      date: parts[1] === "fee" ? s.feeLedger?.[idx]?.date : s.complaints?.[idx]?.date,
      amount: s.feeLedger?.[idx]?.amount,
      type: s.complaints?.[idx]?.type,
    });
    if (ok) {
      const delDate = parts[1] === "fee" ? s.feeLedger?.[idx]?.date : s.complaints?.[idx]?.date;
      const delType = s.complaints?.[idx]?.type;
      const delAmt = s.feeLedger?.[idx]?.amount;
      await patchSnapshotStudent(link.org_id, s.id, (stu) => {
        if (parts[1] === "fee") {
          const i = (stu.feeLedger ?? []).findIndex(
            (r) => String(r.date) === String(delDate) && Number(r.amount) === Number(delAmt),
          );
          if (i >= 0) stu.feeLedger?.splice(i, 1);
        } else {
          const i = (stu.complaints ?? []).findIndex(
            (c) => String(c.date) === String(delDate) && String(c.type) === String(delType),
          );
          if (i >= 0) stu.complaints?.splice(i, 1);
        }
      });
    }
    await clearState(chatId);
    return edit(
      chatId,
      messageId,
      ok ? `🗑️ काढले — ${esc(s.name)}: ${rowText}` : "❌ काढता आले नाही.",
      {
        inline_keyboard: [
          [{ text: "👦 विद्यार्थ्याची माहिती", callback_data: `stu:${s.id}:card` }],
          [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
        ],
      },
    );

  }

  /* ---- रजा (leave) ---- */
  if (parts[0] === "lv") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());

    if (parts[1] === "new") {
      await setState(chatId, { ...state, step: "days", data: fdata });
      return edit(chatId, messageId, `<b>${esc(s.name)}</b> — किती दिवसांची रजा?`, leaveDaysKb());
    }
    if (parts[1] === "typed") {
      await setState(chatId, { ...state, step: "lvdates", data: fdata });
      return edit(
        chatId,
        messageId,
        `<b>${esc(s.name)}</b> — तारखा लिहा — उदा. <code>2026-08-20 ते 2026-08-25</code>`,
        { inline_keyboard: [homeRow("m:leave")] },
      );
    }
    if (parts[1] === "d") {
      const from = today10();
      fdata["from"] = from;
      fdata["to"] = addDays(from, Number(parts[2] ?? 0));
      await setState(chatId, { ...state, step: "reason", data: fdata });
      return edit(
        chatId,
        messageId,
        `<b>${esc(s.name)}</b> — ${esc(fdata["from"])} → ${esc(fdata["to"])}\n\nकारण निवडा.`,
        leaveReasonKb(),
      );
    }
    if (parts[1] === "r") {
      const reason = LEAVE_REASONS.find(([k]) => k === parts[2])?.[0] ?? "गावी";
      const from = String(fdata["from"] ?? today10());
      const to = String(fdata["to"] ?? from);
      const ok = await queueAction(link.org_id, chatId, "leave", {
        roll, studentId: s.id, from, to, reason,
      });
      if (ok) {
        await patchSnapshotStudent(link.org_id, s.id, (stu) => {
          stu.leaves = [...(stu.leaves ?? []), { id: `tg${Date.now()}`, from, to, reason }];
          if (from <= today10() && today10() <= to) stu.onLeave = true;
        });
      }
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        ok
          ? `🏠 <b>रजा नोंदवली</b>\n\n${esc(s.name)} (रोल ${esc(s.roll ?? "-")})\n${esc(from)} → ${esc(to)} — ${esc(reason)}\n\nया दिवसांची हजेरी मोजली जाणार नाही.`
          : "❌ जतन करता आले नाही.",
        mainMenu(),
      );
    }
    if (parts[1] === "del") {
      const row = leaveList(s)[Number(parts[2] ?? 0)];
      if (!row) return edit(chatId, messageId, "नोंद सापडली नाही.", mainMenu());
      const ok = await queueAction(link.org_id, chatId, "leave_cancel", {
        roll, studentId: s.id, from: row.from, to: row.to,
      });
      if (ok) {
        await patchSnapshotStudent(link.org_id, s.id, (stu) => {
          stu.leaves = (stu.leaves ?? []).filter((l) => String(l.from) !== String(row.from));
          stu.onLeave = false;
        });
      }
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        ok ? `🗑️ रजा रद्द केली — ${esc(s.name)}: ${esc(row.from)} → ${esc(row.to ?? row.from)}` : "❌ काढता आले नाही.",
        mainMenu(),
      );
    }
    return undefined;
  }

  /* ---- विषय (subjects) ---- */
  if (parts[0] === "sb") {
    const roll = Number(fdata["roll"] ?? 0);
    const s = byRoll(snap, roll);
    if (!s) return edit(chatId, messageId, "पुन्हा सुरू करा.", mainMenu());
    const picked = ((fdata["picked"] ?? pickedSubjects(s)) as string[]).slice();

    if (parts[1] === "t") {
      const k = parts[2] ?? "";
      const i = picked.indexOf(k);
      if (i >= 0) picked.splice(i, 1);
      else picked.push(k);
      fdata["picked"] = picked;
      await setState(chatId, { ...state, step: "pickSub", data: fdata });
      return edit(chatId, messageId, subjectText(s, picked), subjectPickKb(picked, extraSubjectsOf(s, fdata)));
    }
    if (parts[1] === "new") {
      await setState(chatId, { ...state, step: "sbnew", data: fdata });
      return edit(chatId, messageId, `<b>${esc(s.name)}</b> — नवीन विषयाचे नाव लिहून पाठवा.`, {
        inline_keyboard: [homeRow("m:subj")],
      });
    }
    if (parts[1] === "save") {
      if (!picked.length) return edit(chatId, messageId, "किमान एक विषय निवडा.", subjectPickKb(picked, extraSubjectsOf(s, fdata)));
      const subjects = picked.map((k) => ({ k, mr: subjectLabel(k), en: k }));
      const ok = await queueAction(link.org_id, chatId, "subjects", { roll, studentId: s.id, subjects });
      if (ok) {
        await patchSnapshotStudent(link.org_id, s.id, (stu) => {
          stu.subjectList = subjects;
        });
      }
      await clearState(chatId);
      return edit(
        chatId,
        messageId,
        ok
          ? `📚 <b>विषय जतन झाले</b>\n\n${esc(s.name)} (रोल ${esc(s.roll ?? "-")})\n${picked.map((k) => `• ${esc(subjectLabel(k))}`).join("\n")}`
          : "❌ जतन करता आले नाही.",
        mainMenu(),
      );
    }
    return undefined;
  }

  /* ---- attendance (existing) ---- */
  if (parts[0] !== "att") return undefined;

  const action = parts[1] ?? "";
  const session = parts[2] ?? "morning";

  if (action === "cancel") {
    await clearState(chatId);
    return edit(chatId, messageId, "रद्द केले.", mainMenu());
  }

  if (action === "s" || action === "s2") {
    const already = (snap?.students ?? []).some((st) => {
      const v = st.today?.[session];
      return v === "present" || v === "absent";
    });
    // Manager can submit fresh attendance only — never re-take/edit.
    if (already && mgr) {
      return edit(
        chatId,
        messageId,
        `⛔ <b>${ATT_SESSION_MR[session]} हजेरी आज आधीच घेतली आहे.</b>\n\nघेतलेली हजेरी बदलण्याची परवानगी फक्त ॲडमिनला आहे.`,
        mainMenu(role, perms),
      );
    }
    if (already && action === "s") {
      return edit(
        chatId,
        messageId,
        `⚠️ <b>${ATT_SESSION_MR[session]} हजेरी आज आधीच घेतली आहे.</b>\n\nपुन्हा घ्यायची / बदलायची आहे का?`,
        {
          inline_keyboard: [
            [{ text: "✅ होय, पुन्हा घ्या", callback_data: `att:s2:${session}` }],
            [{ text: "👀 आजची हजेरी पहा", callback_data: "m:backup" }],
            [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
          ],
        },
      );
    }
    await setState(chatId, { mode: "att_rolls", session, absent: [], page: 0 });
    return edit(
      chatId,
      messageId,
      `<b>${ATT_SESSION_MR[session]} हजेरी</b>\n\nसर्वजण हजर असतील तर पहिले बटण दाबा.\nनाहीतर गैरहजर रोल नंबर इथेच लिहून पाठवा — उदा. <code>4 9 12</code>\nकिंवा यादीतून निवडा.`,
      startKeyboard(session),
    );
  }

  const absent = new Set<number>(state.absent ?? []);

  if (action === "t") {
    const roll = Number(parts[3] ?? 0);
    const page = Number(parts[4] ?? 0);
    if (absent.has(roll)) absent.delete(roll);
    else absent.add(roll);
    const picked = Array.from(absent).sort((a, b) => a - b);
    await setState(chatId, { mode: "att_rolls", session, absent: picked, page });
    return edit(chatId, messageId, pickText(session, roster, picked), pickKeyboard(roster, session, picked, page));
  }

  if (action === "p") {
    const page = Number(parts[3] ?? 0);
    const picked = Array.from(absent).sort((a, b) => a - b);
    await setState(chatId, { mode: "att_rolls", session, absent: picked, page });
    return edit(chatId, messageId, pickText(session, roster, picked), pickKeyboard(roster, session, picked, page));
  }

  if (action === "all" || action === "save") {
    const picked = action === "all" ? [] : Array.from(absent).sort((a, b) => a - b);
    const ok = await queueAttendance(link.org_id, chatId, session, picked);
    await clearState(chatId);
    return edit(
      chatId,
      messageId,
      ok ? savedText(session, roster, picked) : "❌ जतन करता आले नाही. पुन्हा प्रयत्न करा.",
      mainMenu(),
    );
  }

  return undefined;
}

/* ---------------- flow helpers ---------------- */

function complaintSummary(s: Stu, d: Record<string, unknown>) {
  return [
    "<b>खात्री करा</b>",
    "",
    `विद्यार्थी: <b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})`,
    `प्रकार: ${esc(d["type"])} • तीव्रता: ${esc(d["sev"])}`,
    `नोंद: ${esc(d["note"])}`,
    `तारीख: ${today10()}`,
  ].join("\n");
}

function feeSummary(s: Stu, d: Record<string, unknown>) {
  return [
    "<b>खात्री करा</b>",
    "",
    `विद्यार्थी: <b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})`,
    `रक्कम: ₹${esc(d["amount"])} • ${esc(d["mode"])}`,
    `तारीख: ${today10()}`,
    s.fees ? `\nसध्या बाकी: ₹${s.fees.due ?? 0}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function alertSummary(d: Record<string, unknown>) {
  return [
    "<b>खात्री करा</b>",
    "",
    d["studentName"] ? `कोणाला: ${esc(d["studentName"])} चे पालक` : "कोणाला: सर्व पालक",
    `संदेश: ${esc(d["msg"])}`,
  ].join("\n");
}

async function afterStudentPick(
  chatId: number,
  messageId: number | undefined,
  orgId: string,
  flow: string,
  s: Stu,
) {
  const roll = Number(s.roll ?? 0);
  if (flow === "stu") {
    await clearState(chatId);
    await sendPhoto(chatId, String((s as Record<string, unknown>)["photo"] ?? ""), nameOf(s));
    const docs = s.documents?.length
      ? `\n\n<b>📄 कागदपत्रे</b>\n${s.documents
          .map((d) => `${/verif|submit|received|मिळ/i.test(String(d.status)) ? "✅" : "⏳"} ${esc(d.name)}`)
          .join("\n")}`
      : "\n\n📄 कागदपत्रांची नोंद नाही.";
    return sendLong(chatId, studentCard(s) + docs, studentKeyboard(s));
  }
  if (flow === "hist") {
    await clearState(chatId);
    await sendPhoto(chatId, String((s as Record<string, unknown>)["photo"] ?? ""), nameOf(s));
    return sendLong(chatId, historyText(s), studentKeyboard(s));
  }
  if (flow === "comp") {
    await setState(chatId, { mode: "flow", flow: "comp", step: "type", data: { roll } });
    return edit(chatId, messageId, `<b>${esc(s.name)}</b> — तक्रारीचा प्रकार निवडा.`, complaintTypeKb());
  }
  if (flow === "star") {
    await setState(chatId, { mode: "flow", flow: "star", step: "ok", data: { roll } });
    return edit(
      chatId,
      messageId,
      `⭐ <b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")}) यांना या आठवड्याचा आदर्श विद्यार्थी करायचे का?`,
      confirmKb("st:ok"),
    );
  }
  if (flow === "fee") {
    await setState(chatId, { mode: "flow", flow: "fee", step: "amt", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>${esc(s.name)}</b> — किती रक्कम मिळाली?${s.fees ? `\nसध्या बाकी: ₹${s.fees.due ?? 0}` : ""}`,
      feeAmountKb(),
    );
  }
  if (flow === "alert") {
    await setState(chatId, {
      mode: "flow",
      flow: "alert",
      step: "msg",
      data: { to: "one", studentId: s.id, studentName: s.name },
    });
    return edit(chatId, messageId, `<b>${esc(s.name)}</b> च्या पालकांना कोणता संदेश?`, alertMsgKb());
  }
  if (flow === "eval") {
    await setState(chatId, { mode: "flow", flow: "eval", step: "q", data: { roll, idx: 0, answers: {}, photos: [] } });
    return evalStep(chatId, messageId, s, { idx: 0, answers: {}, photos: [] });
  }
  if (flow === "leave") {
    await setState(chatId, { mode: "flow", flow: "leave", step: "home", data: { roll } });
    return edit(chatId, messageId, leaveText(s), leaveHomeKb(leaveList(s)));
  }
  if (flow === "subj") {
    const picked = pickedSubjects(s);
    await setState(chatId, { mode: "flow", flow: "subj", step: "pickSub", data: { roll, picked } });
    return edit(chatId, messageId, subjectText(s, picked), subjectPickKb(picked, extraSubjectsOf(s)));
  }
  if (flow === "rcpt") {
    const led = s.feeLedger ?? [];
    await setState(chatId, { mode: "flow", flow: "rcpt", step: "row", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>🧾 फी पावती — ${esc(s.name)}</b>\n\nकोणत्या भरणा नोंदीची पावती द्यायची?`,
      {
        inline_keyboard: [
          ...led.map((p, i) => [
            { text: `🧾 ₹${p.amount ?? 0} — ${p.date ?? ""} (${p.mode ?? ""})`, callback_data: `r:led:${i}` },
          ]),
          [{ text: "✍️ नवीन रक्कम लिहा", callback_data: "r:new" }],
          homeRow(),
        ],
      },
    );
  }
  if (flow === "efee") {

    const led = s.feeLedger ?? [];
    if (!led.length) return edit(chatId, messageId, "या विद्यार्थ्याची फी नोंद नाही.", mainMenu());
    await setState(chatId, { mode: "flow", flow: "efee", step: "row", data: { roll } });
    return edit(chatId, messageId, `<b>${esc(s.name)}</b> — कोणती नोंद काढायची?`, {
      inline_keyboard: [
        ...led.map((p, i) => [
          { text: `🗑️ ₹${p.amount ?? 0} — ${p.date ?? ""}`, callback_data: `ed:fee:${i}` },
        ]),
        homeRow("m:edit"),
      ],
    });
  }
  if (flow === "ecomp") {
    const comp = s.complaints ?? [];
    if (!comp.length) return edit(chatId, messageId, "या विद्यार्थ्याची तक्रार नाही.", mainMenu());
    await setState(chatId, { mode: "flow", flow: "ecomp", step: "row", data: { roll } });
    return edit(chatId, messageId, `<b>${esc(s.name)}</b> — कोणती तक्रार काढायची?`, {
      inline_keyboard: [
        ...comp.map((c, i) => [
          { text: `🗑️ ${String(c.type ?? "").slice(0, 20)} — ${c.date ?? ""}`, callback_data: `ed:comp:${i}` },
        ]),
        homeRow("m:edit"),
      ],
    });
  }
  if (flow === "wmarks") {
    await clearState(chatId);
    const text = studentSection(s, "wmarks");
    return sendLong(chatId, text, { inline_keyboard: [homeRow("m:wmarks")] });
  }
  return undefined;
}

/**
 * ➕ बटण — निवडलेल्या विद्यार्थ्यासाठी थेट "नोंद जोडा" फ्लो सुरू करते.
 * तक्रार/फी/रजा आधीच्या फ्लोत जातात; मेडिकल/नोंद/कागदपत्र/गुण साठी छोटे फ्लो खाली.
 */
async function studentAdd(
  chatId: number,
  messageId: number | undefined,
  orgId: string,
  what: string,
  s: Stu,
) {
  const roll = Number(s.roll ?? 0);
  if (what === "comp" || what === "fee" || what === "leave") {
    return afterStudentPick(chatId, messageId, orgId, what, s);
  }
  const home = { inline_keyboard: [homeRow("m:menu")] };
  if (what === "med") {
    await setState(chatId, { mode: "flow", flow: "med", step: "mednote", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>🩺 मेडिकल नोंद — ${esc(s.name)}</b>\n\nरक्तगट, आजार/ॲलर्जी, डॉक्टरांची नोंद — एका ओळीत लिहून पाठवा.\nउदा. <code>रक्तगट B+, दमा, डॉ. पाटील यांचा सल्ला</code>`,
      home,
    );
  }
  if (what === "rem") {
    await setState(chatId, { mode: "flow", flow: "rem", step: "remnote", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>📝 शिक्षक नोंद — ${esc(s.name)}</b>\n\nनोंद लिहून पाठवा.\nउदा. <code>आज स्वाध्याय वेळेत पूर्ण केला</code>`,
      home,
    );
  }
  if (what === "doc") {
    await setState(chatId, { mode: "flow", flow: "doc", step: "docname", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>📄 कागदपत्र नोंद — ${esc(s.name)}</b>\n\nमिळालेल्या कागदपत्राचे नाव लिहा.\nउदा. <code>आधार कार्ड</code>, <code>LC</code>, <code>जन्म दाखला</code>`,
      home,
    );
  }
  if (what === "exam") {
    await setState(chatId, { mode: "flow", flow: "onemark", step: "onemark", data: { roll } });
    return edit(
      chatId,
      messageId,
      `<b>📚 गुण भरा — ${esc(s.name)}</b>\n\nपरीक्षेचे नाव, विषय, गुण/एकूण एका ओळीत लिहा —\nउदा. <code>घटक चाचणी, गायन, 18/25</code>`,
      home,
    );
  }
  return edit(chatId, messageId, "पुन्हा निवडा.", mainMenu());
}

/* ---------------- नवीन प्रवेश ---------------- */

function admFields(d: Record<string, unknown>) {
  return d["long"] ? ADM_LONG : ADM_SHORT;
}

/** एका वेळी एकच प्रश्न विचारतो. */
async function admissionStep(
  chatId: number,
  messageId: number | undefined,
  d: Record<string, unknown>,
) {
  const fields = admFields(d);
  const idx = Number(d["idx"] ?? 0);
  const vals = (d["fields"] ?? {}) as Record<string, string>;
  if (idx >= fields.length) {
    const lines = fields.map(([k, q]) => `• ${q}: <b>${esc(vals[k] ?? "—")}</b>`).join("\n");
    return edit(
      chatId,
      messageId,
      `<b>🎓 नवीन प्रवेश — खात्री करा</b>\n\n${lines}\n\nविद्यार्थ्याचा फोटो आता पाठवू शकता (ऐच्छिक).`,
      admissionPhotoKb(),
    );
  }
  const [, q] = fields[idx]!;
  return edit(
    chatId,
    messageId,
    `<b>🎓 नवीन प्रवेश</b> (${idx + 1}/${fields.length})\n\n${esc(q)} — लिहून पाठवा.`,
    admissionStepKb(idx >= 4),
  );
}

async function saveAdmission(
  chatId: number,
  messageId: number | undefined,
  orgId: string,
  snap: Snap | null,
  d: Record<string, unknown>,
) {
  const vals = (d["fields"] ?? {}) as Record<string, string>;
  const name = String(vals["name"] ?? "").trim();
  if (!name) return edit(chatId, messageId, "नाव आवश्यक आहे. पुन्हा सुरू करा.", mainMenu());
  const rolls = (snap?.students ?? []).map((s) => Number(s.roll ?? 0));
  const roll = (rolls.length ? Math.max(...rolls) : 0) + 1;
  const id = `tg-${Date.now().toString(36)}`;
  const photo = String(d["photo"] ?? "");
  const feesTotal = Number(String(vals["fees"] ?? "").replace(/\D/g, "")) || 0;
  const ok = await queueAction(orgId, chatId, "admission", {
    id,
    roll,
    name,
    standard: vals["standard"] ?? "",
    parent: vals["parent"] ?? "",
    phone: vals["phone"] ?? "",
    village: vals["village"] ?? "",
    dob: vals["dob"] ?? "",
    blood: vals["blood"] ?? "",
    feesTotal,
    photo,
    date: today10(),
  });
  if (ok) {
    await patchSnapshot(orgId, (s) => {
      s.students = [
        ...(s.students ?? []),
        {
          id,
          roll,
          name,
          standard: vals["standard"] ?? "",
          parent: vals["parent"] ?? "",
          phone: vals["phone"] ?? "",
          fees: { total: feesTotal, paid: 0, due: feesTotal },
          ...(photo ? { photo } : {}),
        } as NonNullable<Snap["students"]>[number],
      ];
      s.totalStudents = (s.students ?? []).length;
    });
  }
  await clearState(chatId);
  return edit(
    chatId,
    messageId,
    ok
      ? `✅ <b>प्रवेश झाला</b>\n\n${esc(name)} — रोल नंबर <b>${roll}</b>\nइयत्ता: ${esc(vals["standard"] ?? "—")}\nपालक: ${esc(vals["parent"] ?? "—")} ${esc(vals["phone"] ?? "")}\n\nॲपमध्येही हा विद्यार्थी दिसेल.`
      : "❌ जतन झाले नाही.",
    {
      inline_keyboard: [
        [{ text: "👦 विद्यार्थ्याची माहिती", callback_data: `stu:${id}:card` }],
        [{ text: "🎓 आणखी प्रवेश", callback_data: "m:adm" }],
        [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
      ],
    },
  );
}

/* ---------------- मूल्यांकन ---------------- */

async function evalStep(
  chatId: number,
  messageId: number | undefined,
  s: Stu,
  d: Record<string, unknown>,
) {
  const idx = Number(d["idx"] ?? 0);
  const answers = (d["answers"] ?? {}) as Record<string, string>;
  if (idx >= EVAL_QUESTIONS.length) {
    const photos = (d["photos"] ?? []) as string[];
    return edit(chatId, messageId, evalSummary(s, answers, photos.length), evalDoneKb());
  }
  const [, q] = EVAL_QUESTIONS[idx]!;
  return edit(
    chatId,
    messageId,
    `<b>📝 मूल्यांकन — ${esc(s.name)}</b> (${idx + 1}/${EVAL_QUESTIONS.length})\n\n${esc(q)}`,
    evalAnswerKb(idx),
  );
}

function evalSummary(s: Stu, answers: Record<string, string>, photoCount: number) {
  const lines = EVAL_QUESTIONS.map(
    ([k, q]) => `${answers[k] === "होय" ? "✅" : answers[k] === "नाही" ? "❌" : "➖"} ${q} — ${answers[k] ?? "—"}`,
  ).join("\n");
  return [
    `<b>📝 मूल्यांकन — ${esc(s.name)} (रोल ${esc(s.roll ?? "-")})</b>`,
    `दिनांक: ${today10()}`,
    "",
    lines,
    photoCount ? `\n📷 उत्तरपत्रिका फोटो: ${photoCount}` : "\n📷 फोटो नाही",
  ].join("\n");
}

/* ---------------- फी पावती ---------------- */

async function sendReceipt(
  chatId: number,
  messageId: number | undefined,
  snap: Snap | null,
  s: Stu,
  amount: number,
  mode: string,
) {
  const input = {
    no: receiptNo(),
    date: today10(),
    amount,
    mode,
    school: snap?.school ?? "शांतीब्रह्म गुरुकुलम",
  };
  const rs: ReceiptStudent = {
    id: s.id,
    roll: s.roll,
    name: s.name,
    standard: s.standard,
    parent: s.parent,
    phone: s.phone,
    fees: s.fees ?? null,
  };
  const wa = waLink(s.phone, receiptPlain(rs, input));
  await edit(chatId, messageId, receiptText(rs, input), {
    inline_keyboard: [
      [{ text: "🏠 मुख्य मेनू", callback_data: "m:menu" }],
    ],
  });
  await sendDocument(
    chatId,
    `${input.no}.html`,
    receiptHtml(rs, input),
    "🧾 प्रिंट करण्यायोग्य पावती — उघडा आणि प्रिंट/PDF करा.",
    "text/html",
  );
  return sendMessage(
    chatId,
    `📲 <a href="${wa}">पालकांच्या WhatsApp वर पावती पाठवा</a>${s.phone ? ` (${esc(s.phone)})` : " — नंबर नाही, चॅट निवडा"}`,
    mainMenu(),
  );
}

/** Walk the roster one student at a time while entering exam marks. */

async function examStep(
  chatId: number,
  messageId: number | undefined,
  list: Stu[],
  d: Record<string, unknown>,
  orgId: string,
  forceSave: boolean,
) {
  const idx = Number(d["idx"] ?? 0);
  const marks = (d["marks"] ?? {}) as Record<string, number>;
  const max = Number(d["max"] ?? 100);
  if (forceSave || idx >= list.length) {
    const entries = Object.entries(marks).map(([roll, m]) => ({ roll: Number(roll), marks: m }));
    const ok = await queueAction(orgId, chatId, "exam", {
      name: String(d["name"] ?? "परीक्षा"),
      subject: String(d["subject"] ?? ""),
      max,
      date: today10(),
      entries,
    });
    await clearState(chatId);
    return edit(
      chatId,
      messageId,
      ok
        ? `✅ <b>${esc(d["name"])}</b> (${esc(d["subject"])}) — ${entries.length} विद्यार्थ्यांचे गुण जतन झाले.\nॲपमध्ये परीक्षा फोल्डरमध्ये दिसतील.`
        : "❌ जतन झाले नाही.",
      mainMenu(),
    );
  }
  const s = list[idx]!;
  const done = Object.keys(marks).length;
  return edit(
    chatId,
    messageId,
    [
      `<b>📚 ${esc(d["name"])} — ${esc(d["subject"])}</b> (एकूण ${max})`,
      `भरले: ${done}/${list.length}`,
      "",
      `<b>${esc(s.roll ?? "")}. ${esc(s.name)}</b> — किती गुण?`,
    ].join("\n"),
    marksKb(max, Number(s.roll ?? 0)),
  );
}

/* ---------------- entry ---------------- */

export async function handleText(chatId: number, text: string, username?: string) {
  const raw = text.trim();
  const [cmdRaw, ...rest] = raw.split(/\s+/);
  const cmd = (cmdRaw ?? "").toLowerCase().replace(/@.*$/, "");
  const arg = rest.join(" ");

  const parents = await parentLinksFor(chatId);
  const link = await linkFor(chatId);

  const isGreeting = /^(hi|hii|hello|hey|namaskar|नमस्कार|हाय|राम कृष्ण हरी)\b/i.test(raw);

  if (cmd === "/start" || (isGreeting && link)) {
    // Deep link: https://t.me/Varkari_bot?start=<code> — no typing needed.
    if (arg && cmd === "/start") {
      if (/-/.test(arg)) return cmdParentLink(chatId, arg, username);
      return cmdLink(chatId, arg, username);
    }
    if (link) {
      await clearState(chatId);
      // अंकुश महाराज (ॲडमिन) यांना नावाने अभिवादन
      if (isGreeting && cmd !== "/start" && link.role === "admin") {
        return sendMessage(
          chatId,
          "राम कृष्ण हरी, अंकुश महाराज! मी कशा प्रकारे तुमची मदत करू शकतो?",
          await roleMenu(chatId),
        );
      }
      return sendMessage(chatId, MENU_TEXT, await roleMenu(chatId));
    }
    if (parents.length)
      return sendMessage(chatId, `${GREETING}\n\nतुमचा पाल्य आधीच जोडलेला आहे.\n\n${PARENT_HELP}`, parentKeyboard());
    return sendMessage(
      chatId,
      `${GREETING}\n\nमी <b>गुरुकुल सहाय्यक</b>.\n\n<b>शिक्षक/मॅनेजर:</b> ॲडमिनकडून मिळालेली लिंक उघडा, किंवा कोड इथेच पाठवा (उदा. <code>SBMGR301</code>).\n\n<b>पालक:</b> शाळेकडून मिळालेला पालक कोड पाठवा —\n<code>/link 3FAE-041-7K</code>`,
    );
  }
  if (cmd === "/link") {
    if (/-/.test(arg)) return cmdParentLink(chatId, arg, username);
    if (arg) return cmdLink(chatId, arg, username);
    return sendMessage(chatId, "वापर:\nशिक्षक — <code>/link ABC12345</code>\nपालक — <code>/link 3FAE-041-7K</code>");
  }

  if (!link && parents.length) return handleParent(chatId, cmd, raw, parents);

  if (cmd === "/help" || cmd === "/madat" || cmd === "/menu")
    return sendMessage(chatId, link ? MENU_TEXT : HELP, link ? mainMenu() : undefined);

  if (!link) {
    // Bare code typed directly (no /link) still links the chat.
    if (/^[A-Za-z0-9-]{6,20}$/.test(raw)) {
      if (/-/.test(raw)) return cmdParentLink(chatId, raw, username);
      return cmdLink(chatId, raw, username);
    }
    return sendMessage(chatId, "आधी जोडणी करा:\nशिक्षक/मॅनेजर — ॲडमिनकडून मिळालेली लिंक उघडा किंवा कोड पाठवा\nपालक — <code>/link 3FAE-041-7K</code>");
  }

  if (cmd === "/unlink") {
    await clearState(chatId);
    await admin().from("telegram_links").delete().eq("chat_id", chatId);
    return sendMessage(chatId, "जोडणी काढली. पुन्हा जोडण्यासाठी /link वापरा.");
  }

  // Manager: attendance-only. Student data, fees, edits, AI — all blocked.
  {
    const { role, perms } = await roleFor(chatId);
    if (isManager(role, perms)) {
      if (cmd === "/hajeri" || cmd === "/attendance")
        return sendMessage(chatId, "कोणत्या वेळेची हजेरी घ्यायची?", sessionMenu());
      const st0 = await getState(chatId);
      if (st0.mode === "att_rolls" && !cmd.startsWith("/")) {
        const rolls = parseRolls(raw);
        const isNumeric = /^[\d\s,.–\u0966-\u096F]+$/.test(raw);
        if (isNumeric || rolls.length) {
          const snap0 = await snapshotFor(link.org_id);
          const session = st0.session ?? "morning";
          const picked = /^0+$/.test(raw.replace(/\D/g, "")) ? [] : rolls;
          const ok = await queueAttendance(link.org_id, chatId, session, picked);
          await clearState(chatId);
          return sendMessage(
            chatId,
            ok ? savedText(session, rosterOf(snap0), picked) : "❌ जतन करता आले नाही. पुन्हा प्रयत्न करा.",
            mainMenu(role, perms),
          );
        }
      }
      return sendMessage(
        chatId,
        "⛔ तुमच्याकडे फक्त <b>हजेरी घेण्याची</b> परवानगी आहे.\nविद्यार्थी माहिती, फी, बदल — हे फक्त ॲडमिन करू शकतात.",
        mainMenu(role, perms),
      );
    }
  }

  const snap = await snapshotFor(link.org_id);
  const kb = optionsKeyboard(["आजची हजेरी", "आज कोण गैरहजर?", "फी बाकी किती?", "आठवड्याचा सारांश"]);
  const state = await getState(chatId);

  // Mid-attendance: plain roll numbers finish the flow.
  if (state.mode === "att_rolls" && !cmd.startsWith("/")) {
    const rolls = parseRolls(raw);
    const isNumeric = /^[\d\s,.\u0966-\u096F]+$/.test(raw);
    if (isNumeric || rolls.length) {
      const session = state.session ?? "morning";
      const roster = rosterOf(snap);
      const picked = /^0+$/.test(raw.replace(/\D/g, "")) ? [] : rolls;
      const ok = await queueAttendance(link.org_id, chatId, session, picked);
      await clearState(chatId);
      return sendMessage(chatId, ok ? savedText(session, roster, picked) : "❌ जतन करता आले नाही.", mainMenu());
    }
  }

  // Typed answers inside a button flow.
  if (state.mode === "flow" && !cmd.startsWith("/")) {
    const done = await handleFlowText(chatId, link.org_id, raw, state, snap);
    if (done) return done;
  }

  if (cmd === "/hajeri" || cmd === "/attendance")
    return sendMessage(chatId, "कोणत्या वेळेची हजेरी घ्यायची?", sessionMenu());
  if (cmd === "/gairhajar" || cmd === "/absent") return sendMessage(chatId, snap ? absentText(snap) : noData(), kb);
  if (cmd === "/fees" || cmd === "/fee") return sendMessage(chatId, snap ? feesText(snap) : noData(), kb);
  if (cmd === "/student" || cmd === "/vidyarthi") return sendStudent(chatId, snap, arg);
  if (cmd === "/report" || cmd === "/saransh") return sendMessage(chatId, snap ? reportText(snap) : noData(), kb);
  if (cmd.startsWith("/")) return sendMessage(chatId, MENU_TEXT, mainMenu());

  if (isGreeting) return sendMessage(chatId, MENU_TEXT, mainMenu());

  // Plain roll number (or exact student name) -> student card.
  if (snap) {
    const trimmed = raw.trim();
    if (/^\d{1,4}$/.test(trimmed)) {
      const s = byRoll(snap, Number(trimmed));
      if (s) return sendStudent(chatId, snap, trimmed);
      const rolls = (snap.students ?? []).map((x) => Number(x.roll ?? 0)).filter((n) => n > 0);
      const lo = rolls.length ? Math.min(...rolls) : 0;
      const hi = rolls.length ? Math.max(...rolls) : 0;
      return sendMessage(
        chatId,
        `❌ रोल नंबर <b>${esc(trimmed)}</b> जुळत नाही.\nसध्याचे रोल नंबर ${lo} ते ${hi} आहेत. कृपया योग्य रोल नंबर लिहा किंवा विद्यार्थ्याचे नाव लिहा.`,
      );
    }
    if (trimmed.length >= 3 && findStudents(snap, trimmed).length) {
      return sendStudent(chatId, snap, trimmed);
    }
  }

  return aiReply(chatId, raw, snap);
}

/** Text typed while a button flow is waiting for a value. */
async function handleFlowText(
  chatId: number,
  orgId: string,
  raw: string,
  state: Awaited<ReturnType<typeof getState>>,
  snap: Snap | null,
) {
  const d = (state.data ?? {}) as Record<string, unknown>;
  const list = sortedStudents(snap);
  const step = state.step ?? "";

  if (step === "pick") {
    const matches = findStudents(snap ?? {}, raw);
    if (matches.length === 1) {
      return afterStudentPick(chatId, undefined, orgId, state.flow ?? "stu", matches[0]!);
    }
    if (matches.length > 1) {
      return sendMessage(chatId, "एकापेक्षा जास्त जुळले — निवडा:", {
        inline_keyboard: matches
          .slice(0, 8)
          .map((s) => [{ text: nameOf(s).slice(0, 60), callback_data: `s:${state.flow}:${Number(s.roll ?? 0)}` }]),
      });
    }
    return sendMessage(chatId, "विद्यार्थी सापडला नाही. पुन्हा नाव किंवा रोल नंबर लिहा.");
  }

  if (step === "amount") {
    const amt = Number((raw.match(/\d+/) ?? [])[0] ?? 0);
    if (!amt) return sendMessage(chatId, "रक्कम आकड्यात लिहा — उदा. 750");
    d["amount"] = amt;
    await setState(chatId, { ...state, step: "mode", data: d });
    return sendMessage(chatId, `₹${amt} — कोणत्या पद्धतीने?`, feeModeKb());
  }

  if (step === "ctype") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    d["type"] = raw.slice(0, 60);
    d["typeKey"] = "itar";
    await setState(chatId, { ...state, step: "sev", data: d });
    return sendMessage(chatId, `<b>${esc(s.name)}</b> — किती गंभीर आहे?`, severityKb());
  }

  if (step === "note") {
    d["note"] = raw.slice(0, 300);
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    await setState(chatId, { ...state, step: "ok", data: d });
    return sendMessage(chatId, complaintSummary(s, d), confirmKb("c:ok"));
  }

  if (step === "typemsg") {
    d["msg"] = raw.slice(0, 600);
    await setState(chatId, { ...state, step: "ok", data: d });
    return sendMessage(chatId, alertSummary(d), confirmKb("a:ok"));
  }

  if (step === "meta") {
    const bits = raw.split(/[,|]/).map((x) => x.trim());
    d["name"] = bits[0] || "परीक्षा";
    d["subject"] = bits[1] || "";
    d["max"] = Number((bits[2] ?? "").replace(/\D/g, "")) || 100;
    d["idx"] = 0;
    d["marks"] = {};
    await setState(chatId, { ...state, step: "marks", data: d });
    return examStep(chatId, undefined, list, d, orgId, false);
  }

  if (step === "field") {
    const fields = admFields(d);
    const idx = Number(d["idx"] ?? 0);
    const vals = (d["fields"] ?? {}) as Record<string, string>;
    const key = fields[idx]?.[0];
    if (key) vals[key] = raw.slice(0, 120);
    d["fields"] = vals;
    d["idx"] = idx + 1;
    await setState(chatId, { ...state, step: "field", data: d });
    return admissionStep(chatId, undefined, d);
  }

  if (step === "rcptamt") {
    const amt = Number((raw.match(/\d+/) ?? [])[0] ?? 0);
    if (!amt) return sendMessage(chatId, "रक्कम आकड्यात लिहा — उदा. 1500");
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    await clearState(chatId);
    return sendReceipt(chatId, undefined, snap, s, amt, "रोख");
  }

  if (step === "lvdates") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const dates = raw.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    if (!dates.length) return sendMessage(chatId, "तारखा असे लिहा — <code>2026-08-20 ते 2026-08-25</code>");
    d["from"] = dates[0];
    d["to"] = dates[1] ?? dates[0];
    await setState(chatId, { ...state, step: "reason", data: d });
    return sendMessage(chatId, `${esc(d["from"])} → ${esc(d["to"])}\n\nकारण निवडा.`, leaveReasonKb());
  }

  if (step === "sbnew") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const label = raw.trim().slice(0, 40);
    if (!label) return sendMessage(chatId, "विषयाचे नाव लिहा.");
    const key = label.replace(/\s+/g, "_");
    const picked = ((d["picked"] ?? pickedSubjects(s)) as string[]).slice();
    if (!picked.includes(key)) picked.push(key);
    const extras = ((d["extras"] ?? []) as Array<[string, string]>).slice();
    extras.push([key, label]);
    d["picked"] = picked;
    d["extras"] = extras;
    await setState(chatId, { ...state, step: "pickSub", data: d });
    return sendMessage(chatId, subjectText(s, picked), subjectPickKb(picked, extras));
  }

  if (step === "typemarks") {

    const m = Number((raw.match(/\d+/) ?? [])[0] ?? NaN);
    if (!Number.isFinite(m)) return sendMessage(chatId, "गुण आकड्यात लिहा.");
    const marks = (d["marks"] ?? {}) as Record<string, number>;
    const idx = Number(d["idx"] ?? 0);
    const cur = list[idx];
    if (cur) marks[String(cur.roll)] = m;
    d["marks"] = marks;
    d["idx"] = idx + 1;
    await setState(chatId, { ...state, step: "marks", data: d });
    return examStep(chatId, undefined, list, d, orgId, false);
  }

  /* ---- विद्यार्थी कार्डमधल्या ➕ बटणांचे छोटे फ्लो ---- */

  if (step === "mednote") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const text = raw.slice(0, 200);
    const date = today10();
    const patch = (stu: NonNullable<Snap["students"]>[number]) => {
      const prev = stu.medical ?? {};
      stu.medical = {
        ...prev,
        doctorNotes: prev.doctorNotes ? `${prev.doctorNotes}\n${date} — ${text}` : `${date} — ${text}`,
      };
    };
    const ok = await queueAction(orgId, chatId, "medical", {
      roll: Number(s.roll ?? 0),
      studentId: s.id,
      text,
      date,
    });
    await patchSnapshotStudent(orgId, s.id, patch);
    patch(s);
    await clearState(chatId);
    await sendMessage(chatId, ok ? `✅ ${esc(s.name)} यांची मेडिकल नोंद जतन झाली.` : "❌ जतन झाले नाही.");
    return afterStudentPick(chatId, undefined, orgId, "stu", s);
  }

  if (step === "remnote") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const text = raw.slice(0, 300);
    const date = today10();
    const patch = (stu: NonNullable<Snap["students"]>[number]) => {
      stu.remarks = [...(stu.remarks ?? []), { date, text, author: "Telegram", homework: false }];
    };
    const ok = await queueAction(orgId, chatId, "remark", {
      roll: Number(s.roll ?? 0),
      studentId: s.id,
      text,
      date,
    });
    await patchSnapshotStudent(orgId, s.id, patch);
    patch(s);
    await clearState(chatId);
    await sendMessage(chatId, ok ? `✅ ${esc(s.name)} — शिक्षक नोंद जतन झाली.` : "❌ जतन झाले नाही.");
    return afterStudentPick(chatId, undefined, orgId, "stu", s);
  }

  if (step === "docname") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const name = raw.trim().slice(0, 60);
    if (!name) return sendMessage(chatId, "कागदपत्राचे नाव लिहा.");
    const patch = (stu: NonNullable<Snap["students"]>[number]) => {
      stu.documents = [...(stu.documents ?? []), { name, status: "मिळाले" }];
    };
    const ok = await queueAction(orgId, chatId, "document", {
      roll: Number(s.roll ?? 0),
      studentId: s.id,
      name,
      status: "मिळाले",
      date: today10(),
    });
    await patchSnapshotStudent(orgId, s.id, patch);
    patch(s);
    await clearState(chatId);
    await sendMessage(chatId, ok ? `✅ ${esc(s.name)} — “${esc(name)}” कागदपत्र नोंदवले.` : "❌ जतन झाले नाही.");
    return afterStudentPick(chatId, undefined, orgId, "stu", s);
  }

  if (step === "onemark") {
    const s = byRoll(snap, Number(d["roll"] ?? 0));
    if (!s) return sendMessage(chatId, "पुन्हा सुरू करा.", mainMenu());
    const bits = raw.split(/[,|]/).map((x) => x.trim());
    const name = bits[0] || "परीक्षा";
    const second = bits[1] ?? "";
    const subject = second && !/\d/.test(second) ? second : "";
    const frac = raw.match(/(\d+)\s*\/\s*(\d+)/);
    const marks = frac ? Number(frac[1]) : Number((raw.match(/\d+/) ?? [])[0] ?? NaN);
    const max = frac ? Number(frac[2]) : Number((bits[2] ?? "").replace(/\D/g, "")) || 100;
    if (!Number.isFinite(marks)) {
      return sendMessage(chatId, "गुण समजले नाहीत. असे लिहा — <code>घटक चाचणी, गायन, 18/25</code>");
    }
    const date = today10();
    const patch = (stu: NonNullable<Snap["students"]>[number]) => {
      stu.exams = [
        ...(stu.exams ?? []),
        { name, subject, date, marks, max, remark: "" },
      ];
    };
    const ok = await queueAction(orgId, chatId, "exam", {
      name,
      subject,
      max,
      date,
      entries: [{ roll: Number(s.roll ?? 0), marks }],
    });
    await patchSnapshotStudent(orgId, s.id, patch);
    patch(s);
    await clearState(chatId);
    await sendMessage(
      chatId,
      ok ? `✅ ${esc(s.name)} — ${esc(name)} (${esc(subject) || "विषय"}) मध्ये ${marks}/${max} गुण जतन झाले.` : "❌ जतन झाले नाही.",
    );
    return afterStudentPick(chatId, undefined, orgId, "stu", s);
  }

  return undefined;
}

/* ---------------- फोटो (प्रवेश / उत्तरपत्रिका) ---------------- */

/** Telegram वर पाठवलेला फोटो चालू फ्लोला जोडतो. */
export async function handlePhoto(chatId: number, fileId: string, origin: string) {
  const link = await linkFor(chatId);
  if (!link) return undefined;
  const state = await getState(chatId);
  if (state.mode !== "flow") return undefined;
  const d = (state.data ?? {}) as Record<string, unknown>;
  const url = `${origin.replace(/\/$/, "")}/api/public/telegram/photo?id=${encodeURIComponent(fileId)}`;

  if (state.flow === "adm") {
    d["photo"] = url;
    await setState(chatId, { ...state, data: d });
    return sendMessage(chatId, "📷 फोटो जोडला. आता प्रवेश जतन करा.", {
      inline_keyboard: [
        [{ text: "💾 प्रवेश जतन करा", callback_data: "d:save" }],
        [{ text: "✖️ रद्द करा", callback_data: "m:menu" }],
      ],
    });
  }

  if (state.flow === "eval") {
    const photos = ((d["photos"] ?? []) as string[]).slice(0, 5);
    photos.push(url);
    d["photos"] = photos;
    await setState(chatId, { ...state, data: d });
    return sendMessage(chatId, `📷 ${photos.length} फोटो जोडले.`, evalDoneKb());
  }

  return undefined;
}
