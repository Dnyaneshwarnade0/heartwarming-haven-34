/* =========================================================
   Telegram — full button-driven menu.
   Every screen is reachable with taps only; typing is optional.
   ========================================================= */
import { admin, sendMessage, tg, TG_PERMISSIONS, DEFAULT_SUB_PERMS } from "./telegram.server";
import { edit } from "./telegram-attendance.server";

export type Btn = { text: string; callback_data: string };
export type Keyboard = { inline_keyboard: Btn[][] };

export const GREETING = "🙏 <b>राम कृष्ण हरी, अंकुश महाराज!</b>";

export const MENU_TEXT = `${GREETING}\n\nखाली पर्याय निवडा — काहीही टाइप करायची गरज नाही.`;

export type TgRole = "admin" | "sub";
export type TgPerm =
  | "attendance"
  | "students"
  | "fees"
  | "complaints"
  | "exams"
  | "tasks"
  | "reports"
  | "alerts"
  | "backup"
  | "users"
  | "admissions";

export function mainMenu(role: TgRole = "admin", perms?: Set<TgPerm>): Keyboard {
  const p = role === "admin" ? new Set<TgPerm>(TG_PERMISSIONS) : (perms ?? new Set<TgPerm>(DEFAULT_SUB_PERMS));
  const rows: Btn[][] = [];

  if (p.has("attendance")) rows.push([{ text: "1️⃣ हजेरी घ्या", callback_data: "m:att" }]);

  const row2: Btn[] = [];
  if (p.has("students")) row2.push({ text: "2️⃣ विद्यार्थी माहिती", callback_data: "m:stu" });
  if (p.has("students")) row2.push({ text: "3️⃣ मागील इतिहास", callback_data: "m:hist" });
  if (row2.length) rows.push(row2);

  const row3: Btn[] = [];
  if (p.has("complaints")) row3.push({ text: "4️⃣ तक्रार नोंदवा", callback_data: "m:comp" });
  if (p.has("reports")) row3.push({ text: "5️⃣ आदर्श विद्यार्थी", callback_data: "m:star" });
  if (row3.length) rows.push(row3);

  const row4: Btn[] = [];
  if (p.has("backup")) row4.push({ text: "6️⃣ आजची बॅकअप", callback_data: "m:backup" });
  if (p.has("fees")) row4.push({ text: "7️⃣ फी व्यवहार", callback_data: "m:fee" });
  if (row4.length) rows.push(row4);

  const row5: Btn[] = [];
  if (p.has("alerts")) row5.push({ text: "8️⃣ सूचना पाठवा", callback_data: "m:alert" });
  if (p.has("exams")) row5.push({ text: "9️⃣ परीक्षा गुण", callback_data: "m:exam" });
  if (row5.length) rows.push(row5);

  const rowWm: Btn[] = [];
  if (p.has("exams")) rowWm.push({ text: "📊 साप्ताहिक गुण", callback_data: "m:wmarks" });
  if (rowWm.length) rows.push(rowWm);

  const row6: Btn[] = [];
  if (p.has("tasks")) row6.push({ text: "🔟 दैनंदिन सेवा", callback_data: "m:task" });
  if (p.has("admissions")) row6.push({ text: "🎓 नवीन प्रवेश", callback_data: "m:adm" });
  if (row6.length) rows.push(row6);

  const row7: Btn[] = [];
  if (p.has("fees")) row7.push({ text: "🧾 फी पावती", callback_data: "m:rcpt" });
  if (p.has("exams")) row7.push({ text: "📝 मूल्यांकन", callback_data: "m:eval" });
  if (row7.length) rows.push(row7);

  const row8: Btn[] = [];
  if (p.has("students")) row8.push({ text: "🏠 रजा / गावी गेला", callback_data: "m:leave" });
  if (p.has("students")) row8.push({ text: "📚 विषय बदला", callback_data: "m:subj" });
  if (row8.length) rows.push(row8);

  if (role === "admin") rows.push([{ text: "✏️ बदल करा", callback_data: "m:edit" }]);
  if (role === "admin") rows.push([{ text: "👥 सब-ॲडमिन तयार करा", callback_data: "m:users" }]);
  rows.push([{ text: "👤 माझी भूमिका", callback_data: "m:role" }]);

  return { inline_keyboard: rows };
}

export function homeRow(back?: string): Btn[] {
  const row: Btn[] = [];
  if (back) row.push({ text: "↩️ मागे", callback_data: back });
  row.push({ text: "🏠 मुख्य मेनू", callback_data: "m:menu" });
  return row;
}

/* ---------------- student picker ---------------- */

const PAGE = 10;

export type PickStudent = { roll?: number | string | undefined; name?: string | undefined };

/** Roll-number grid. `flow` decides what happens after a pick. */
export function studentPicker(students: PickStudent[], flow: string, page: number): Keyboard {
  const pages = Math.max(1, Math.ceil(students.length / PAGE));
  const p = Math.min(Math.max(page, 0), pages - 1);
  const slice = students.slice(p * PAGE, p * PAGE + PAGE);
  const rows: Btn[][] = [];
  for (let i = 0; i < slice.length; i += 2) {
    rows.push(
      slice.slice(i, i + 2).map((s) => ({
        text: `${s.roll}. ${String(s.name ?? "").slice(0, 14)}`,
        callback_data: `s:${flow}:${Number(s.roll ?? 0)}`,
      })),
    );
  }
  const nav: Btn[] = [];
  if (p > 0) nav.push({ text: "◀️", callback_data: `p:${flow}:${p - 1}` });
  nav.push({ text: `${p + 1}/${pages}`, callback_data: "att:noop" });
  if (p < pages - 1) nav.push({ text: "▶️", callback_data: `p:${flow}:${p + 1}` });
  rows.push(nav);
  rows.push(homeRow());
  return { inline_keyboard: rows };
}

export function pickerText(title: string) {
  return `<b>${title}</b>\n\nरोल नंबर दाबा, किंवा नाव / रोल नंबर लिहून पाठवा.`;
}

/* ---------------- complaint ---------------- */

export const BLACKLIST_LABEL = "⛔ काळी यादी (Blacklist)";

export const COMPLAINT_TYPES: Array<[string, string]> = [
  ["ushira", "⏰ उशिरा उठणे"],
  ["shivi", "🤬 शिवी देणे"],
  ["shala", "🏫 शाळेत मस्ती"],
  ["bus", "🚌 बसमध्ये दंगा"],
  ["ghrupath", "📕 गृहपाठ न करणे"],
  ["swadhyay", "📝 स्वाध्याय न नोंदवणे"],
  ["ulat", "🗣️ उलट बोलणे"],
  ["trass", "😠 इतरांना त्रास देणे"],
  ["shist", "📏 शिस्तभंग"],
  ["abhyas", "📚 अभ्यास न करणे"],
  ["seva", "🧹 सेवेत टाळाटाळ"],
  ["hostel", "🏠 वसतिगृह नियमभंग"],
  ["mobile", "📱 मोबाईलचा गैरवापर"],
  ["itar", "➖ इतर"],
  ["kali", BLACKLIST_LABEL],
];

export const SEVERITY: Array<[string, string]> = [
  ["low", "सौम्य"],
  ["mid", "मध्यम"],
  ["high", "गंभीर"],
];

/** प्रकारानुसार उप-पर्याय (sub-options). */
export const COMPLAINT_SUBNOTES: Record<string, string[]> = {
  ushira: ["काकड आरतीला उशीर", "सकाळी उठलाच नाही", "वारंवार उशीर"],
  shivi: ["मित्राला शिवी दिली", "मोठ्यांना उद्धट बोलला", "वारंवार अपशब्द"],
  shala: ["वर्गात गोंधळ", "शाळेत गैरहजर", "शिक्षकांची तक्रार"],
  bus: ["बसमध्ये भांडण", "बसमध्ये आरडाओरडा", "बस चुकवली"],
  ghrupath: ["गृहपाठ अपूर्ण", "वही आणली नाही", "सतत गृहपाठ टाळतो"],
  swadhyay: ["स्वाध्याय लिहिला नाही", "पाठांतर झाले नाही", "वही हरवली"],
  ulat: ["शिक्षकांना उलट उत्तर", "सूचना ऐकत नाही", "हट्ट करतो"],
  trass: ["लहान मुलांना त्रास", "भांडण केले", "वस्तू लपवल्या"],
  shist: ["रांगेत उभा राहिला नाही", "गणवेश नीट नाही", "वेळापत्रक पाळले नाही"],
  abhyas: ["अभ्यासिकेत झोपला", "पाठांतर टाळले", "गुण घसरले"],
  seva: ["स्वच्छता सेवा टाळली", "भोजन सेवा टाळली", "हरिपाठाला गैरहजर"],
  hostel: ["परवानगीशिवाय बाहेर", "खोली अस्वच्छ", "रात्री उशिरा जागरण"],
  mobile: ["मोबाईल वापरला", "इतरांचा मोबाईल घेतला"],
  itar: ["इतर कारण"],
  kali: ["गंभीर गैरवर्तन", "वारंवार तक्रारी", "पालकांना बोलावले"],
};

export const COMPLAINT_NOTES = ["वर्गात गोंधळ केला", "गृहपाठ केला नाही", "उशिरा आला", "इतर विद्यार्थ्याशी भांडण"];

export function complaintTypeKb(extra: string[] = []): Keyboard {
  const rows: Btn[][] = [];
  const normal = COMPLAINT_TYPES.filter(([k]) => k !== "kali");
  for (let i = 0; i < normal.length; i += 2) {
    rows.push(normal.slice(i, i + 2).map(([k, v]) => ({ text: v, callback_data: `c:type:${k}` })));
  }
  extra.slice(0, 8).forEach((label, i) => {
    rows.push([{ text: `🔸 ${label}`, callback_data: `c:xtype:${i}` }]);
  });
  rows.push([{ text: "➕ नवीन प्रकार लिहा", callback_data: "c:type:custom" }]);
  rows.push([{ text: BLACKLIST_LABEL, callback_data: "c:type:kali" }]);
  rows.push(homeRow("m:comp"));
  return { inline_keyboard: rows };
}

export function severityKb(): Keyboard {
  return {
    inline_keyboard: [SEVERITY.map(([k, v]) => ({ text: v, callback_data: `c:sev:${k}` })), homeRow("m:comp")],
  };
}

export function complaintNoteKb(typeKey?: string): Keyboard {
  const notes = (typeKey && COMPLAINT_SUBNOTES[typeKey]) || COMPLAINT_NOTES;
  return {
    inline_keyboard: [
      ...notes.map((n, i) => [{ text: n, callback_data: `c:note:${i}` }]),
      [{ text: "✍️ स्वतः लिहा", callback_data: "c:note:own" }],
      homeRow("m:comp"),
    ],
  };
}

/* ---------------- fee ---------------- */

export const FEE_AMOUNTS = [500, 1000, 1500, 2000, 3000, 5000];

export function feeAmountKb(): Keyboard {
  const rows: Btn[][] = [];
  for (let i = 0; i < FEE_AMOUNTS.length; i += 3) {
    rows.push(FEE_AMOUNTS.slice(i, i + 3).map((a) => ({ text: `₹${a}`, callback_data: `f:amt:${a}` })));
  }
  rows.push([{ text: "✍️ दुसरी रक्कम लिहा", callback_data: "f:other" }]);
  rows.push(homeRow("m:fee"));
  return { inline_keyboard: rows };
}

export function feeModeKb(): Keyboard {
  return {
    inline_keyboard: [
      [
        { text: "💵 रोख", callback_data: "f:mode:रोख" },
        { text: "📱 UPI", callback_data: "f:mode:UPI" },
        { text: "🏦 बँक", callback_data: "f:mode:बँक" },
      ],
      homeRow("m:fee"),
    ],
  };
}

export function confirmKb(yes: string, no = "m:menu"): Keyboard {
  return {
    inline_keyboard: [
      [
        { text: "✅ होय, जतन करा", callback_data: yes },
        { text: "✖️ नको", callback_data: no },
      ],
    ],
  };
}

/* ---------------- alert ---------------- */

export const ALERT_PRESETS = [
  "उद्या शाळेला सुट्टी आहे.",
  "उद्या पालक सभा आहे — कृपया उपस्थित रहा.",
  "फी भरण्याची शेवटची तारीख जवळ आली आहे.",
  "उद्या परीक्षा आहे — अभ्यासाची तयारी करा.",
];

export function alertTargetKb(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "👨‍👩‍👦 सर्व पालक", callback_data: "a:to:all" }],
      [{ text: "👦 एका विद्यार्थ्याचे पालक", callback_data: "a:to:one" }],
      homeRow(),
    ],
  };
}

export function alertMsgKb(): Keyboard {
  return {
    inline_keyboard: [
      ...ALERT_PRESETS.map((m, i) => [{ text: m.slice(0, 40), callback_data: `a:msg:${i}` }]),
      [{ text: "✍️ स्वतःचा संदेश लिहा", callback_data: "a:own" }],
      homeRow("m:alert"),
    ],
  };
}

/* ---------------- exam ---------------- */

export function marksKb(max: number, roll: number): Keyboard {
  const steps = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1].map((f) => Math.round(max * f));
  const uniq = Array.from(new Set(steps));
  const rows: Btn[][] = [];
  for (let i = 0; i < uniq.length; i += 4) {
    rows.push(uniq.slice(i, i + 4).map((m) => ({ text: String(m), callback_data: `x:m:${m}` })));
  }
  rows.push([
    { text: "✍️ गुण लिहा", callback_data: "x:type" },
    { text: "⏭️ वगळा", callback_data: `x:skip:${roll}` },
  ]);
  rows.push([
    { text: "💾 इथेच जतन करा", callback_data: "x:save" },
    { text: "🏠 मुख्य मेनू", callback_data: "m:menu" },
  ]);
  return { inline_keyboard: rows };
}

/* ---------------- admission ---------------- */

/** छोटा फॉर्म — कमीत कमी माहिती; मोठा फॉर्म — संपूर्ण माहिती. */
export const ADM_SHORT: Array<[string, string]> = [
  ["name", "विद्यार्थ्याचे पूर्ण नाव"],
  ["standard", "इयत्ता"],
  ["parent", "पालकाचे नाव"],
  ["phone", "पालक मोबाईल नंबर"],
];

export const ADM_LONG: Array<[string, string]> = [
  ...ADM_SHORT,
  ["village", "गाव / पत्ता"],
  ["dob", "जन्मतारीख (उदा. 01-06-2012)"],
  ["blood", "रक्तगट (माहित नसल्यास — लिहा)"],
  ["fees", "वार्षिक फी (फक्त आकडा)"],
];

export function admissionTypeKb(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "⚡ छोटा फॉर्म (४ प्रश्न)", callback_data: "d:form:short" }],
      [{ text: "📋 मोठा फॉर्म (संपूर्ण माहिती)", callback_data: "d:form:long" }],
      homeRow(),
    ],
  };
}

export function admissionStepKb(canSkip: boolean): Keyboard {
  const rows: Btn[][] = [];
  if (canSkip) rows.push([{ text: "⏭️ वगळा", callback_data: "d:skip" }]);
  rows.push([{ text: "✖️ प्रवेश रद्द करा", callback_data: "m:menu" }]);
  return { inline_keyboard: rows };
}

export function admissionPhotoKb(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "📷 फोटो नंतर टाकतो — जतन करा", callback_data: "d:save" }],
      [{ text: "✖️ रद्द करा", callback_data: "m:menu" }],
    ],
  };
}

/* ---------------- evaluation (मूल्यांकन) ---------------- */

/** app मधील exam.js checklist शी जुळणारे प्रश्न. */
export const EVAL_QUESTIONS: Array<[string, string]> = [
  ["study", "अभ्यास करतो का?"],
  ["behave", "वागणूक चांगली आहे का?"],
  ["parentAttn", "पालकांचे लक्ष आहे का?"],
  ["company", "संगत चांगली आहे का?"],
  ["seva", "सेवा करतो का?"],
  ["events", "कार्यक्रमात सहभाग घेतो का?"],
  ["feePaid", "फी भरली आहे का?"],
];

export function evalAnswerKb(index: number): Keyboard {
  return {
    inline_keyboard: [
      [
        { text: "✅ होय", callback_data: `v:a:${index}:yes` },
        { text: "❌ नाही", callback_data: `v:a:${index}:no` },
        { text: "➖ इतर", callback_data: `v:a:${index}:other` },
      ],
      homeRow(),
    ],
  };
}

export function evalDoneKb(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: "📷 उत्तरपत्रिकेचा फोटो पाठवा", callback_data: "v:photo" }],
      [{ text: "💾 जतन करा", callback_data: "v:save" }],
      homeRow(),
    ],
  };
}

/* ---------------- दैनंदिन सेवा ---------------- */

export const SEVA_TASKS: Array<[string, string]> = [
  ["kakada", "काकडा आरती"],
  ["pathantar", "पाठांतर तपासणी"],
  ["abhyas", "अभ्यासिका"],
  ["bhojan", "भोजन व्यवस्था"],
  ["haripath", "हरिपाठ"],
  ["safai", "स्वच्छता सेवा"],
  ["shejarti", "शेजारती"],
];

export function sevaKb(done: Record<string, boolean>): Keyboard {
  const rows: Btn[][] = SEVA_TASKS.map(([k, v]) => [
    { text: `${done[k] ? "✅" : "⬜"} ${v}`, callback_data: `t:tog:${k}` },
  ]);
  rows.push([{ text: "💾 जतन करा", callback_data: "t:save" }]);
  rows.push(homeRow());
  return { inline_keyboard: rows };
}

/* ---------------- sub-admin (permission picker) ---------------- */

export const PERM_LABELS: Array<[TgPerm, string]> = [
  ["attendance", "📋 हजेरी"],
  ["students", "👦 विद्यार्थी माहिती"],
  ["complaints", "⚠️ तक्रारी"],
  ["fees", "💰 फी"],
  ["exams", "📚 परीक्षा गुण"],
  ["tasks", "🔟 दैनंदिन सेवा"],
  ["reports", "📊 अहवाल"],
  ["alerts", "📢 सूचना पाठवा"],
  ["backup", "💾 बॅकअप"],
  ["admissions", "🎓 नवीन प्रवेश"],
];

export function permLabel(k: TgPerm) {
  return PERM_LABELS.find(([p]) => p === k)?.[1] ?? k;
}

/** Toggle-list of permissions; tap to tick, then generate the code. */
export function subAdminKb(picked: Set<TgPerm>): Keyboard {
  const rows: Btn[][] = PERM_LABELS.map(([k, label]) => [
    { text: `${picked.has(k) ? "✅" : "⬜"} ${label}`, callback_data: `u:t:${k}` },
  ]);
  rows.push([{ text: "🔑 कोड तयार करा", callback_data: "u:gen" }]);
  rows.push([{ text: "📄 माझे कोड पहा", callback_data: "u:list" }]);
  rows.push(homeRow());
  return { inline_keyboard: rows };
}

/* ---------------- edit menu (admin only) ---------------- */

export function editMenu(role: TgRole = "admin", perms?: Set<TgPerm>): Keyboard | undefined {
  const p = role === "admin" ? new Set<TgPerm>(TG_PERMISSIONS) : (perms ?? new Set<TgPerm>(DEFAULT_SUB_PERMS));
  if (role !== "admin") return undefined;
  const rows: Btn[][] = [
    [{ text: "📋 हजेरी पुन्हा घ्या", callback_data: "m:att" }],
    [{ text: "💰 फी नोंद काढा", callback_data: "e:fee" }],
    [{ text: "⚠️ तक्रार काढा", callback_data: "e:comp" }],
    [{ text: "➕ नवीन तक्रार नोंदवा", callback_data: "m:comp" }],
    [{ text: "📚 परीक्षा गुण पुन्हा भरा", callback_data: "m:exam" }],
    [{ text: "📝 मूल्यांकन पुन्हा भरा", callback_data: "m:eval" }],
    [{ text: "🎓 नवीन प्रवेश", callback_data: "m:adm" }],
    [{ text: "🧾 फी पावती काढा", callback_data: "m:rcpt" }],
    [{ text: "🔟 दैनंदिन सेवा बदला", callback_data: "m:task" }],
    [{ text: "⭐ आदर्श विद्यार्थी बदला", callback_data: "m:star" }],
    [{ text: "🏠 रजा नोंदवा / रद्द करा", callback_data: "m:leave" }],
    [{ text: "📚 विद्यार्थ्याचे विषय बदला", callback_data: "m:subj" }],
    homeRow(),
  ];
  return { inline_keyboard: rows };
}

/* ---------------- रजा (leave) ---------------- */

export const LEAVE_REASONS: Array<[string, string]> = [
  ["गावी", "🏠 गावी गेला"],
  ["आजारी", "🤒 आजारी आहे"],
  ["कार्यक्रम", "🎪 कार्यक्रम / दिंडी"],
  ["इतर", "➖ इतर कारण"],
];

/** किती दिवसांची रजा — 0 म्हणजे फक्त आज. */
export const LEAVE_DAYS: Array<[number, string]> = [
  [0, "आज"],
  [1, "२ दिवस"],
  [2, "३ दिवस"],
  [6, "७ दिवस"],
  [14, "१५ दिवस"],
  [29, "३० दिवस"],
];

export function leaveDaysKb(): Keyboard {
  const rows: Btn[][] = [];
  for (let i = 0; i < LEAVE_DAYS.length; i += 3) {
    rows.push(
      LEAVE_DAYS.slice(i, i + 3).map(([d, label]) => ({
        text: label,
        callback_data: `lv:d:${d}`,
      })),
    );
  }
  rows.push([{ text: "✍️ तारखा लिहा", callback_data: "lv:typed" }]);
  rows.push(homeRow("m:leave"));
  return { inline_keyboard: rows };
}

export function leaveReasonKb(): Keyboard {
  const rows: Btn[][] = [];
  for (let i = 0; i < LEAVE_REASONS.length; i += 2) {
    rows.push(LEAVE_REASONS.slice(i, i + 2).map(([k, v]) => ({ text: v, callback_data: `lv:r:${k}` })));
  }
  rows.push(homeRow("m:leave"));
  return { inline_keyboard: rows };
}

export function leaveHomeKb(active: Array<{ from?: string; to?: string; reason?: string }>): Keyboard {
  const rows: Btn[][] = [[{ text: "➕ नवीन रजा नोंदवा", callback_data: "lv:new" }]];
  active.slice(0, 6).forEach((l, i) => {
    rows.push([
      {
        text: `🗑️ रजा रद्द — ${l.from ?? ""} → ${l.to ?? l.from ?? ""}`,
        callback_data: `lv:del:${i}`,
      },
    ]);
  });
  rows.push(homeRow());
  return { inline_keyboard: rows };
}

/* ---------------- विषय (subjects) ---------------- */

export const SUBJECT_CATALOG: Array<[string, string]> = [
  ["Kirtan", "कीर्तन"],
  ["Gayan", "गायन"],
  ["Pakhawaj", "पखवाज"],
  ["Bhagwat", "भागवत"],
  ["Harmonium", "हार्मोनियम"],
  ["Tabla", "तबला"],
  ["Sanskrit", "संस्कृत"],
  ["Pathantar", "पाठांतर"],
  ["Marathi", "मराठी"],
  ["Maths", "गणित"],
  ["English", "इंग्रजी"],
  ["Science", "विज्ञान"],
];

export function subjectPickKb(picked: string[], extra: Array<[string, string]> = []): Keyboard {
  const all = [...SUBJECT_CATALOG, ...extra.filter(([k]) => !SUBJECT_CATALOG.some(([c]) => c === k))];
  const rows: Btn[][] = [];
  for (let i = 0; i < all.length; i += 2) {
    rows.push(
      all.slice(i, i + 2).map(([k, v]) => ({
        text: `${picked.includes(k) ? "✅" : "⬜"} ${v}`,
        callback_data: `sb:t:${k}`,
      })),
    );
  }
  rows.push([{ text: "➕ नवीन विषय लिहा", callback_data: "sb:new" }]);
  rows.push([{ text: "💾 जतन करा", callback_data: "sb:save" }]);
  rows.push(homeRow());
  return { inline_keyboard: rows };
}

/* ---------------- action queue ---------------- */

export async function queueAction(orgId: string, chatId: number, kind: string, payload: Record<string, unknown>) {
  const { error } = await admin().from("bot_actions").insert({ org_id: orgId, chat_id: chatId, kind, payload });
  if (error) console.error("bot_actions insert failed", error.message);
  return !error;
}

/* ---------------- backup file ---------------- */

export async function sendDocument(
  chatId: number,
  filename: string,
  content: string,
  caption?: string,
  mime = "text/csv",
) {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("document", new Blob([content], { type: mime }), filename);

  if (caption) {
    form.append("caption", caption.slice(0, 900));
    form.append("parse_mode", "HTML");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.error("sendDocument failed", { chatId, filename, status: res.status, detail });
    throw new Error(`Telegram document delivery failed (${res.status})`);
  }
}

export { edit, sendMessage, tg };
