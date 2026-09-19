/* =========================================================
   अधिकृत फी पावती — मजकूर, HTML (प्रिंट करण्यायोग्य) व WhatsApp लिंक
   ========================================================= */

export type ReceiptStudent = {
  id: string;
  roll?: number | string | undefined;
  name?: string | undefined;
  standard?: string | undefined;
  parent?: string | undefined;
  phone?: string | undefined;
  fees?: { total?: number; paid?: number; due?: number } | null;
};

export type ReceiptInput = {
  no: string;
  date: string;
  amount: number;
  mode: string;
  school: string;
};

const ONES = [
  "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
  "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस",
];
const TENS = ["", "", "वीस", "तीस", "चाळीस", "पन्नास", "साठ", "सत्तर", "ऐंशी", "नव्वद"];

function two(n: number): string {
  if (n < 20) return ONES[n] ?? "";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${TENS[t]} ${ONES[o]}` : `${TENS[t]}`;
}

function three(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]}शे` : "", r ? two(r) : ""].filter(Boolean).join(" ");
}

/** ५०००  ->  "पाच हजार रुपये फक्त." */
export function amountInWordsMr(amount: number): string {
  let n = Math.max(0, Math.round(amount));
  if (!n) return "शून्य रुपये फक्त.";
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000); n %= 10_000_000;
  const lakh = Math.floor(n / 100_000); n %= 100_000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(`${three(crore)} कोटी`);
  if (lakh) parts.push(`${three(lakh)} लाख`);
  if (thousand) parts.push(`${three(thousand)} हजार`);
  if (n) parts.push(three(n));
  return `${parts.join(" ").replace(/\s+/g, " ").trim()} रुपये फक्त.`;
}

/** पावती क्रमांक — SBG-<वर्ष><महिना><दिवस>-<वेळ> (कधीच पुनरावृत्ती होत नाही) */
export function receiptNo(): string {
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, "0");
  return `SBG-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
}

export function receiptFigures(s: ReceiptStudent, amount: number) {
  const total = Number(s.fees?.total ?? 0);
  const paidBefore = Math.max(0, Number(s.fees?.paid ?? 0) - amount);
  const paidNow = Number(amount) || 0;
  const paidTotal = paidBefore + paidNow;
  const balance = Math.max(0, total - paidTotal);
  return { total, paidBefore, paidNow, paidTotal, balance };
}

const inr = (n: number) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Telegram संदेशासाठी (HTML parse_mode) */
export function receiptText(s: ReceiptStudent, r: ReceiptInput): string {
  const f = receiptFigures(s, r.amount);
  return [
    `🚩 <b>${esc(r.school)}</b>`,
    "वारकरी शिक्षण संस्था • व्यवस्थापक: अंकुश महाराज कदम",
    "",
    "<b>अधिकृत फी पावती</b>",
    `पावती क्र: <b>${esc(r.no)}</b>   दिनांक: ${esc(r.date)}`,
    "———————————————",
    `विद्यार्थी: <b>${esc(s.name)}</b> (रोल ${esc(s.roll ?? "-")})${s.standard ? ` • इयत्ता ${esc(s.standard)}` : ""}`,
    s.parent ? `पालक: ${esc(s.parent)}${s.phone ? ` • ${esc(s.phone)}` : ""}` : "",
    "———————————————",
    `१. वार्षिक एकूण फी: ${inr(f.total)}`,
    `२. मागील भरलेली फी: ${inr(f.paidBefore)}`,
    `३. चालू भरलेली रक्कम: <b>${inr(f.paidNow)}</b>`,
    `४. एकूण जमा फी: ${inr(f.paidTotal)}`,
    `५. उर्वरित बाकी फी: <b>${inr(f.balance)}</b>`,
    "———————————————",
    `पेमेंट प्रकार: ${esc(r.mode)}`,
    `रक्कम अक्षरी: ${esc(amountInWordsMr(f.paidNow))}`,
    "",
    "अधिकृत स्वाक्षरी — अंकुश कदम (व्यवस्थापक) 🙏",
  ]
    .filter(Boolean)
    .join("\n");
}

/** WhatsApp साठी साधा मजकूर */
export function receiptPlain(s: ReceiptStudent, r: ReceiptInput): string {
  return receiptText(s, r)
    .replace(/<\/?b>/g, "*")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function waLink(phone: string | undefined, text: string): string {
  const digits = String(phone ?? "").replace(/\D/g, "").slice(-10);
  const base = digits.length === 10 ? `https://wa.me/91${digits}?text=` : "https://wa.me/?text=";
  return base + encodeURIComponent(text);
}

/** प्रिंट करण्यायोग्य पावती (Telegram document म्हणून पाठवली जाते) */
export function receiptHtml(s: ReceiptStudent, r: ReceiptInput): string {
  const f = receiptFigures(s, r.amount);
  const row = (k: string, v: string, strong = false) =>
    `<tr><td>${esc(k)}</td><td class="${strong ? "strong" : ""}">${esc(v)}</td></tr>`;
  return `<!DOCTYPE html><html lang="mr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(r.no)}</title>
<style>
body{font-family:'Nirmala UI','Noto Sans Devanagari',Arial,sans-serif;background:#f4f6fb;padding:24px;color:#16233d}
.box{max-width:720px;margin:auto;background:#fff;border:2px solid #1B3A6B;border-radius:16px;padding:28px}
h1{margin:0;text-align:center;color:#1B3A6B;font-size:1.35rem}
h2{margin:2px 0 4px;text-align:center;font-size:.95rem;font-weight:500;color:#44557a}
h3{margin:18px 0 6px;text-align:center;font-size:1.05rem;letter-spacing:.5px}
table{width:100%;border-collapse:collapse}
td{padding:9px 6px;border-bottom:1px solid #eef1f7;font-size:.95rem}
td:last-child{text-align:right}
.strong{font-weight:700;color:#1B3A6B}
.sign{margin-top:34px;display:flex;justify-content:space-between;font-size:.85rem;color:#5a6a8a}
@media print{body{background:#fff;padding:0}.box{border:none}}
</style></head><body><div class="box">
<h1>🚩 ${esc(r.school)}</h1>
<h2>वारकरी शिक्षण संस्था • व्यवस्थापक: अंकुश महाराज कदम</h2>
<h3>अधिकृत फी पावती</h3>
<table>
${row("पावती क्रमांक", r.no, true)}
${row("दिनांक", r.date)}
${row("विद्यार्थ्याचे नाव", `${s.name ?? ""} (रोल ${s.roll ?? "-"})`)}
${row("इयत्ता", String(s.standard ?? "—"))}
${row("पालकांचे नाव", String(s.parent ?? "—"))}
${row("पालक फोन", String(s.phone ?? "—"))}
${row("१. वार्षिक एकूण फी", inr(f.total))}
${row("२. मागील भरलेली फी", inr(f.paidBefore))}
${row("३. चालू भरलेली रक्कम", inr(f.paidNow), true)}
${row("४. एकूण जमा फी", inr(f.paidTotal))}
${row("५. उर्वरित बाकी फी", inr(f.balance), true)}
${row("पेमेंट प्रकार", r.mode)}
${row("रक्कम अक्षरी", amountInWordsMr(f.paidNow))}
</table>
<div class="sign"><span>पालक स्वाक्षरी</span><span>अंकुश कदम — अधिकृत स्वाक्षरी (व्यवस्थापक)</span></div>
</div></body></html>`;
}
