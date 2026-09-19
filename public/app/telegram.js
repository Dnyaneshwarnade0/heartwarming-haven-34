/* =========================================================
   TELEGRAM BOT  —  link code + auto data sync
   ========================================================= */
(function () {
  "use strict";

  const MR = () => (typeof currentLanguage !== "undefined" ? currentLanguage : "mr") !== "en";
  const t = (mr, en) => (MR() ? mr : en);
  const CKEY = "vss_tg_code";
  /* वेबवर नेहमी same-origin वापरा (CORS/redirect टाळण्यासाठी) */
  const BACKEND = (function () {
    const p = typeof window !== "undefined" && window.location ? window.location.protocol : "";
    return p === "http:" || p === "https:" ? "" : "https://admin.shantibrahmagurukulam.com";
  })();
  const SYNC_URL = BACKEND + "/api/public/telegram/sync";
  const NOTIFY_URL = BACKEND + "/api/public/telegram/notify";
  const PULL_URL = BACKEND + "/api/public/telegram/pull";
  const DEFAULT_CODE = "444A1C6D";
  const OLD_CODES = ["3FAEFB67"];
  try {
    if (OLD_CODES.indexOf(String(localStorage.getItem(CKEY) || "").trim().toUpperCase()) >= 0) {
      localStorage.setItem(CKEY, DEFAULT_CODE);
    }
  } catch (_) {}

  const getCode = () => (localStorage.getItem(CKEY) || DEFAULT_CODE).trim().toUpperCase();
  const setCode = (c) =>
    localStorage.setItem(
      CKEY,
      String(c || "")
        .trim()
        .toUpperCase(),
    );

  const students = () =>
    typeof studentsDatabase !== "undefined" && Array.isArray(studentsDatabase) ? studentsDatabase : [];
  const nameOf = (s) =>
    typeof getStudentName === "function"
      ? getStudentName(s)
      : s && typeof s.name === "object"
        ? s.name.mr
        : s && s.name;
  const SESSIONS = ["morning", "evening", "school"];

  function sessionStats(s) {
    const daily = s.dailyAttendance || {};
    const out = { morning: { p: 0, t: 0 }, evening: { p: 0, t: 0 }, school: { p: 0, t: 0 } };
    Object.keys(daily).forEach((d) => {
      SESSIONS.forEach((k) => {
        const v = (daily[d] || {})[k];
        if (Object.prototype.hasOwnProperty.call(daily[d] || {}, k) && v !== "leave") {
          out[k].t++;
          if (v) out[k].p++;
        }
      });
    });
    const pct = (o) => (o.t ? Math.round((o.p / o.t) * 100) : null);
    const tt = out.morning.t + out.evening.t + out.school.t;
    const pp = out.morning.p + out.evening.p + out.school.p;
    return {
      morningPct: pct(out.morning),
      eveningPct: pct(out.evening),
      schoolPct: pct(out.school),
      overallPct: tt ? Math.round((pp / tt) * 100) : null,
    };
  }

  /* पालक कोड — संस्थेचा कोड + रोल नं + विद्यार्थ्याचा छोटा हॅश */
  function parentCode(s) {
    const base = String(s.id || s.rollNo || "");
    let h = 0;
    for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
    const tail = h.toString(36).toUpperCase().slice(-2).padStart(2, "0");
    const roll = String(s.rollNo || 0).padStart(3, "0");
    return getCode().slice(0, 4) + "-" + roll + "-" + tail;
  }

  function loadExams() {
    try {
      return JSON.parse(localStorage.getItem("vss_exams") || "[]");
    } catch (_) {
      return [];
    }
  }

  function examsFor(all, s) {
    const out = [];
    all.forEach((ex) => {
      const e = (ex.entries || {})[s.id];
      if (!e) return;
      if (e.marks === "" || e.marks === null || e.marks === undefined) return;
      out.push({
        name: ex.name || "",
        subject: ex.subject || "",
        date: ex.date || "",
        marks: Number(e.marks),
        max: Number(ex.max) || 0,
        remark: e.remark || "",
      });
    });
    return out.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);
  }

  function lastAbsent(s) {
    const daily = s.dailyAttendance || {};
    const out = [];
    Object.keys(daily)
      .sort()
      .reverse()
      .forEach((d) => {
        if (out.length >= 5) return;
        const rec = daily[d] || {};
        const abs = SESSIONS.filter(
          (k) => Object.prototype.hasOwnProperty.call(rec, k) && !rec[k] && rec[k] !== "leave",
        );
        if (abs.length) out.push({ date: d, sessions: abs });
      });
    return out;
  }

  const onLeave = (s, iso) =>
    (s.leaves || []).some((l) => String(l.from || "") <= iso && iso <= String(l.to || l.from || ""));

  function snapshot() {
    const today = new Date().toISOString().slice(0, 10);
    let adarsh = [];
    try {
      adarsh = JSON.parse(localStorage.getItem("vss_adarsh_week") || "[]");
    } catch (_) {}
    const exams = loadExams();
    let seva = {};
    try {
      seva = JSON.parse(localStorage.getItem("vss_seva") || "{}");
    } catch (_) {}
    return {
      school: "शांतीब्रह्म गुरुकुलम",
      today,
      seva,
      totalStudents: students().length,
      starStudentsThisWeek: adarsh,
      students: students().map((s) => {
        const todayRec = (s.dailyAttendance || {})[today] || {};
        const fees = s.fees
          ? {
              total: s.fees.total || 0,
              paid: s.fees.paid || 0,
              due: (s.fees.total || 0) - (s.fees.paid || 0),
            }
          : null;
        const med = s.medical || {};
        return {
          id: s.id,
          roll: s.rollNo,
          name: nameOf(s),
          standard: s.standard,
          photo: s.photo && /^\//.test(s.photo) ? location.origin + s.photo : "",
          phone: s.phone,
          parent: s.parentName,
          fees,
          emergencyContact: s.emergencyContact || "",
          parentCode: parentCode(s),
          attendance: sessionStats(s),
          lastAbsent: lastAbsent(s),
          medical:
            med.bloodGroup || med.allergies || med.illness || med.doctorNotes
              ? {
                  bloodGroup: med.bloodGroup || "",
                  allergies: med.allergies || "",
                  illness: med.illness || "",
                  doctorNotes: String(med.doctorNotes || ""),
                }
              : null,
          complaints: (s.complaints || [])
            .slice()
            .reverse()
            .map((c) => ({
              date: c.date || "",
              type: c.type || "",
              action: String(c.action || ""),
            })),
          remarks: (s.remarks || [])
            .slice()
            .reverse()
            .map((r) => ({
              date: r.date || "",
              text: String(r.text || ""),
              author: r.author || "",
              homework: !!r.homework,
            })),
          subjects: s.subjects || {},
          subjectMarks: s.subjectMarks || {},
          subjectList: Array.isArray(s.subjectList) ? s.subjectList : null,
          dailyAttendance: s.dailyAttendance || {},
          address: s.address || "",
          blacklisted: !!s.blacklisted,
          leaves: s.leaves || [],
          onLeave: onLeave(s, today),
          exams: examsFor(exams, s),
          weeklyMarks: Array.isArray(s.weeklyMarks) ? s.weeklyMarks : [],
          adarsh: adarsh.indexOf(s.id) >= 0,
          documents: (s.documents || []).map((d) => ({ name: d.name || "", status: d.status || "" })),
          feeLedger: ((s.fees && s.fees.ledger) || [])
            .slice()
            .reverse()
            .map((p) => ({
              date: p.date || "",
              amount: p.amount || 0,
              mode: p.mode || "",
              receipt: p.receipt || "",
            })),
          weeklyGrade: s.weeklyGrade || "",
          today: SESSIONS.reduce((acc, k) => {
            acc[k] =
              todayRec[k] === "leave"
                ? "leave"
                : Object.prototype.hasOwnProperty.call(todayRec, k)
                  ? todayRec[k]
                    ? "present"
                    : "absent"
                  : "no-record";
            return acc;
          }, {}),
        };
      }),
    };
  }

  let syncing = false;
  async function sync(showStatus) {
    const code = getCode();
    if (!code || syncing) return;
    syncing = true;
    setStatus(t("सिंक होत आहे…", "Syncing…"), showStatus);
    try {
      const res = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, data: snapshot() }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        localStorage.setItem("vss_tg_last_sync", new Date().toISOString());
        setStatus(t("✅ अपडेट झाले — ", "✅ Synced — ") + new Date().toLocaleTimeString(), showStatus);
        if (localStorage.getItem("vss_tg_auto_absent") === "1") notify("absent", false);
      } else if (res.status === 404) {
        setStatus(t("❌ कोड चुकीचा आहे.", "❌ Invalid code."), true);
      } else {
        setStatus(t("❌ सिंक अयशस्वी.", "❌ Sync failed."), showStatus);
      }
    } catch (_) {
      setStatus(t("❌ इंटरनेट नाही.", "❌ No connection."), showStatus);
    }
    syncing = false;
    pull();
  }

  /* ---------- Telegram वरून घेतलेली हजेरी ॲपमध्ये आणा ---------- */
  async function pull() {
    try {
      const res = await fetch(PULL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: getCode() }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) return;
      const items = Array.isArray(out.items) ? out.items : [];
      const actions = Array.isArray(out.actions) ? out.actions : [];
      if (!items.length && !actions.length) return;
      /* नोंदी ॲपमध्ये जतन झाल्यावरच "applied" म्हणून कळवायचे —
         त्यामुळे कोणतीही Telegram नोंद हरवत नाही. */
      const ack = () =>
        fetch(PULL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: getCode(),
            ackItems: items.map((i) => i.id).filter(Boolean),
            ackActions: actions.map((a) => a.id).filter(Boolean),
          }),
        }).catch(() => {});

      const list = students();
      let changed = 0;
      items.forEach((it) => {
        const date = String(it.date || "").slice(0, 10);
        const session = String(it.session || "");
        if (!date || SESSIONS.indexOf(session) < 0) return;
        const absent = (it.absent_rolls || []).map(Number);
        list.forEach((s) => {
          s.dailyAttendance = s.dailyAttendance || {};
          s.dailyAttendance[date] = s.dailyAttendance[date] || {};
          if (onLeave(s, date)) {
            s.dailyAttendance[date][session] = "leave";
            changed++;
            return;
          }
          s.dailyAttendance[date][session] = absent.indexOf(Number(s.rollNo)) < 0;
          changed++;
        });
      });
      changed += applyActions(list, actions);
      if (!changed) {
        await ack();
        return;
      }
      localStorage.setItem("vss_students", JSON.stringify(list));
      await ack();
      /* लगेच क्लाऊडवर पाठवा — दुसऱ्या डिव्हाइसवरही दिसेल */
      try {
        if (window.vssCloud && typeof window.vssCloud.save === "function") window.vssCloud.save();
      } catch (_) {}
      setStatus(t("📥 Telegram वरील नोंदी आल्या.", "📥 Records received from Telegram."), true);
      try {
        if (typeof renderDashboardMetrics === "function") renderDashboardMetrics();
      } catch (_) {}
      try {
        if (typeof renderDashboard === "function") renderDashboard();
      } catch (_) {}
      try {
        if (typeof renderStudentsList === "function") renderStudentsList();
      } catch (_) {}

      // Phase 2 ack: now that data is saved, tell server to mark items as applied
      const ackItemIds = items.map((r) => String(r.id)).filter(Boolean);
      const ackActionIds = actions.map((r) => String(r.id)).filter(Boolean);
      if (ackItemIds.length || ackActionIds.length) {
        fetch(PULL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: getCode(), ackItems: ackItemIds, ackActions: ackActionIds }),
        }).catch(() => {});
      }
    } catch (_) {
      /* ignore */
    }
  }

  /* ---------- Telegram वरून केलेले बदल (फी, तक्रार, आदर्श, परीक्षा) ---------- */
  function applyActions(list, actions) {
    let n = 0;
    const find = (a) =>
      list.find((s) => String(s.id) === String(a.payload && a.payload.studentId)) ||
      list.find((s) => Number(s.rollNo) === Number(a.payload && a.payload.roll));
    actions.forEach((a) => {
      const p = a.payload || {};
      const kind = String(a.kind || "");
      if (kind === "star") {
        const s = find(a);
        if (!s) return;
        let week = [];
        try {
          week = JSON.parse(localStorage.getItem("vss_adarsh_week") || "[]");
        } catch (_) {}
        if (week.indexOf(s.id) < 0) week.push(s.id);
        localStorage.setItem("vss_adarsh_week", JSON.stringify(week));
        n++;
        return;
      }
      if (kind === "seva") {
        let seva = {};
        try {
          seva = JSON.parse(localStorage.getItem("vss_seva") || "{}");
        } catch (_) {}
        seva[String(p.date || new Date().toISOString().slice(0, 10))] = p.done || {};
        localStorage.setItem("vss_seva", JSON.stringify(seva));
        n++;
        return;
      }
      if (kind === "admission") {
        if (list.some((x) => String(x.id) === String(p.id))) return;
        list.push({
          id: String(p.id || "tg-" + Date.now()),
          name: { en: String(p.name || ""), mr: String(p.name || "") },
          rollNo: Number(p.roll) || list.length + 1,
          standard: String(p.standard || ""),
          section: "",
          phone: String(p.phone || ""),
          parentName: String(p.parent || ""),
          address: String(p.village || ""),
          emergencyContact: String(p.phone || ""),
          dob: String(p.dob || ""),
          photo: String(p.photo || ""),
          attendance: [],
          sessionAttendance: {},
          dailyAttendance: {},
          subjects: {},
          examHistory: [],
          remarks: [],
          complaints: [],
          medical: { bloodGroup: String(p.blood || ""), allergies: "", illness: "", doctorNotes: "" },
          fees: { total: Number(p.feesTotal) || 0, paid: 0, ledger: [] },
          documents: [],
        });
        n++;
        return;
      }
      if (kind === "evaluation") {
        const st = find(a);
        if (!st) return;
        let exams = [];
        try {
          exams = JSON.parse(localStorage.getItem("vss_exams") || "[]");
        } catch (_) {}
        const date = String(p.date || new Date().toISOString().slice(0, 10));
        let ex = exams.filter((e) => e.kind === "eval" && e.date === date).pop();
        if (!ex) {
          ex = {
            id: "ev" + Date.now(),
            kind: "eval",
            name: "मूल्यांकन",
            subject: "",
            date: date,
            max: 0,
            savedAt: new Date().toISOString(),
            entries: {},
          };
          exams.push(ex);
        }
        ex.entries = ex.entries || {};
        const entry = ex.entries[st.id] || { attended: true, marks: "", remark: "", checklist: {}, photoCount: 0 };
        entry.checklist = Object.assign({}, entry.checklist, p.checklist || {});
        const photos = Array.isArray(p.photos) ? p.photos : [];
        entry.photoCount = (entry.photoCount || 0) + photos.length;
        entry.telegramPhotos = (entry.telegramPhotos || []).concat(photos);
        ex.entries[st.id] = entry;
        localStorage.setItem("vss_exams", JSON.stringify(exams));
        st.remarks = st.remarks || [];
        st.remarks.push({
          date: date,
          text:
            "मूल्यांकन — " +
            Object.keys(p.checklist || {})
              .map((k) => k + ": " + p.checklist[k])
              .join(", "),
          author: "Telegram",
          homework: false,
        });
        n++;
        return;
      }
      if (kind === "exam") {
        let exams = [];
        try {
          exams = JSON.parse(localStorage.getItem("vss_exams") || "[]");
        } catch (_) {}
        const entries = {};
        (p.entries || []).forEach((e) => {
          const s = list.find((x) => Number(x.rollNo) === Number(e.roll));
          if (s) entries[s.id] = { marks: Number(e.marks), remark: "" };
        });
        exams.push({
          id: "tg" + Date.now(),
          name: p.name || "परीक्षा",
          subject: p.subject || "",
          date: p.date || new Date().toISOString().slice(0, 10),
          max: Number(p.max) || 100,
          savedAt: new Date().toISOString(),
          entries,
        });
        localStorage.setItem("vss_exams", JSON.stringify(exams));
        n++;
        return;
      }
      const s = find(a);
      if (!s) return;
      if (kind === "fee") {
        s.fees = s.fees || { total: 0, paid: 0, ledger: [] };
        s.fees.ledger = s.fees.ledger || [];
        s.fees.ledger.push({
          date: p.date || new Date().toISOString().slice(0, 10),
          amount: Number(p.amount) || 0,
          mode: p.mode || "रोख",
          receipt: "TG-" + Date.now().toString().slice(-6),
        });
        s.fees.paid = (Number(s.fees.paid) || 0) + (Number(p.amount) || 0);
        n++;
      } else if (kind === "complaint") {
        s.complaints = s.complaints || [];
        s.complaints.push({
          date: p.date || new Date().toISOString().slice(0, 10),
          type: p.type || "इतर",
          severity: p.severity || "",
          action: p.text || "",
        });
        n++;
      } else if (kind === "fee_delete") {
        const led = (s.fees && s.fees.ledger) || [];
        const i = led.findIndex((r) => String(r.date) === String(p.date) && Number(r.amount) === Number(p.amount));
        if (i >= 0) {
          s.fees.paid = Math.max(0, (Number(s.fees.paid) || 0) - (Number(led[i].amount) || 0));
          led.splice(i, 1);
          n++;
        }
      } else if (kind === "leave") {
        s.leaves = s.leaves || [];
        s.leaves.push({
          id: "tg" + Date.now(),
          from: String(p.from || ""),
          to: String(p.to || p.from || ""),
          reason: String(p.reason || "गावी"),
          note: String(p.note || ""),
          at: new Date().toISOString(),
        });
        s.dailyAttendance = s.dailyAttendance || {};
        Object.keys(s.dailyAttendance).forEach((d) => {
          if (d < String(p.from || "") || d > String(p.to || p.from || "")) return;
          Object.keys(s.dailyAttendance[d] || {}).forEach((k) => {
            s.dailyAttendance[d][k] = "leave";
          });
        });
        n++;
      } else if (kind === "leave_cancel") {
        const lv = s.leaves || [];
        const i = lv.findIndex((l) => String(l.from) === String(p.from));
        if (i >= 0) {
          lv.splice(i, 1);
          n++;
        }
      } else if (kind === "subjects") {
        if (Array.isArray(p.subjects) && p.subjects.length) {
          s.subjectList = p.subjects;
          n++;
        }
      } else if (kind === "complaint_delete") {
        const cs = s.complaints || [];
        const i = cs.findIndex((c) => String(c.date) === String(p.date) && String(c.type) === String(p.type));
        if (i >= 0) {
          cs.splice(i, 1);
          n++;
        }
      } else if (kind === "medical") {
        s.medical = s.medical || { bloodGroup: "", allergies: "", illness: "", doctorNotes: "" };
        const line = (p.date ? String(p.date) + " — " : "") + String(p.text || "");
        s.medical.doctorNotes = s.medical.doctorNotes ? s.medical.doctorNotes + "\n" + line : line;
        n++;
      } else if (kind === "remark") {
        s.remarks = s.remarks || [];
        s.remarks.push({
          date: p.date || new Date().toISOString().slice(0, 10),
          text: String(p.text || ""),
          author: "Telegram",
          homework: false,
        });
        n++;
      } else if (kind === "document") {
        s.documents = s.documents || [];
        if (!s.documents.some((d) => String(d.name) === String(p.name))) {
          s.documents.push({ name: String(p.name || "कागदपत्र"), status: String(p.status || "मिळाले") });
          n++;
        }
      }
    });
    return n;
  }

  /* ---------- पालकांना सूचना ---------- */
  async function notify(kind, show) {
    try {
      const res = await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: getCode(), kind }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        if (show !== false) setStatus(t("📤 पाठवले — ", "📤 Sent — ") + (out.sent || 0) + t(" पालक", " parents"), true);
        return out.sent || 0;
      }
      if (show !== false) setStatus(t("❌ पाठवता आले नाही.", "❌ Could not send."), true);
    } catch (_) {
      if (show !== false) setStatus(t("❌ इंटरनेट नाही.", "❌ No connection."), true);
    }
    return 0;
  }

  function setStatus(msg, show) {
    const el = document.getElementById("tg-sync-status");
    if (el && show !== false) el.textContent = msg;
  }

  /* ---------- पालक कोड यादी ---------- */
  function showParentCodes() {
    const rows = students()
      .map(
        (s) => `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eef2f7">${s.rollNo}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eef2f7">${nameOf(s) || ""}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eef2f7;font-weight:700;color:#1B3A6B;letter-spacing:1px">${parentCode(s)}</td>
          </tr>`,
      )
      .join("");
    const w = document.createElement("div");
    w.style.cssText =
      "position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
    w.innerHTML = `<div style="background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:82vh;display:flex;flex-direction:column;overflow:hidden">
            <div style="padding:16px 18px;background:#1B3A6B;color:#fff;display:flex;justify-content:space-between;align-items:center">
              <b>${t("पालक कोड", "Parent codes")}</b>
              <button id="pc-x" style="background:transparent;border:0;color:#fff;font-size:1.3rem;cursor:pointer">&times;</button>
            </div>
            <p style="margin:12px 18px 0;color:#64748b;font-size:.86rem">${t("प्रत्येक पालकाला त्याचा कोड द्या. टेलिग्राममध्ये बॉटला <b>/link कोड</b> पाठवल्यावर त्यांना फक्त त्यांच्या पाल्याची माहिती व सूचना मिळतील.", "Give each parent their code. Sending <b>/link CODE</b> to the bot links them to their own child only.")}</p>
            <div style="overflow:auto;padding:12px 18px 18px">
              <table style="width:100%;border-collapse:collapse;font-size:.9rem"><tbody>${rows}</tbody></table>
            </div>
            <div style="padding:12px 18px;border-top:1px solid #eef2f7;text-align:right">
              <button id="pc-copy" style="background:#2563EB;color:#fff;border:0;padding:10px 16px;border-radius:10px;font-weight:600;cursor:pointer">${t("सर्व कॉपी करा", "Copy all")}</button>
            </div>
          </div>`;
    document.body.appendChild(w);
    const close = () => w.remove();
    w.querySelector("#pc-x").addEventListener("click", close);
    w.addEventListener("click", (e) => {
      if (e.target === w) close();
    });
    w.querySelector("#pc-copy").addEventListener("click", () => {
      const txt = students()
        .map((s) => `${s.rollNo}\t${nameOf(s)}\t${parentCode(s)}`)
        .join("\n");
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });
  }

  /* ---------- Settings card ---------- */
  function buildCard() {
    const host = document.getElementById("panel-admin-profile");
    if (!host || document.getElementById("tg-card")) return;
    const card = document.createElement("div");
    card.id = "tg-card";
    card.className = "card";
    card.style.cssText =
      "margin-top:18px;padding:18px;border-radius:14px;background:#fff;box-shadow:0 2px 10px rgba(27,58,107,.08)";
    card.innerHTML = `
          <h3 style="margin:0 0 4px;display:flex;align-items:center;gap:8px;color:#1B3A6B">
            <i class="fa-brands fa-telegram" style="color:#229ED9"></i>
            <span id="tg-title"></span>
          </h3>
          <p id="tg-help" style="margin:0 0 12px;color:#64748b;font-size:.9rem;line-height:1.5"></p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
            <input id="tg-code" type="text" value="${getCode()}"
              style="flex:1;min-width:150px;padding:10px 12px;border:1px solid #d5dceb;border-radius:10px;font-size:1.05rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:#1B3A6B">
            <button id="tg-copy" class="btn" style="background:#eef2fb;color:#1B3A6B;border:0;padding:10px 14px;border-radius:10px;font-weight:600">
              <i class="fa-regular fa-copy"></i> <span id="tg-copy-l"></span>
            </button>
            <button id="tg-sync" class="btn" style="background:#2563EB;color:#fff;border:0;padding:10px 16px;border-radius:10px;font-weight:600">
              <i class="fa-solid fa-rotate"></i> <span id="tg-sync-l"></span>
            </button>
          </div>
          <div id="tg-sync-status" style="margin-top:10px;font-size:.85rem;color:#475569"></div>
          <ol id="tg-steps" style="margin:14px 0 0;padding-left:20px;color:#475569;font-size:.88rem;line-height:1.7"></ol>
          <div style="margin-top:16px;padding-top:14px;border-top:1px dashed #dbe3f0">
            <h4 style="margin:0 0 8px;color:#1B3A6B;font-size:.98rem">${t("पालक सूचना", "Parent notifications")}</h4>
            <p style="margin:0 0 10px;color:#64748b;font-size:.86rem;line-height:1.5">${t("पालकांना त्यांचा कोड द्या. जोडणी झाल्यावर गैरहजेरी, फी व अहवाल टेलिग्रामवर आपोआप जातील.", "Share each parent code. Once linked, absence, fee and report alerts go out automatically.")}</p>
            <label style="display:flex;gap:8px;align-items:center;font-size:.9rem;color:#334155;margin-bottom:10px;cursor:pointer">
              <input id="tg-auto" type="checkbox" style="width:18px;height:18px">
              <span>${t("हजेरी सेव्ह केल्यावर गैरहजेरीची सूचना आपोआप पाठवा", "Auto-send absence alerts after saving attendance")}</span>
            </label>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <button id="tg-codes" style="background:#eef2fb;color:#1B3A6B;border:0;padding:9px 13px;border-radius:10px;font-weight:600;cursor:pointer"><i class="fa-solid fa-list"></i> ${t("पालक कोड यादी", "Parent codes")}</button>
              <button id="tg-n-absent" style="background:#fee2e2;color:#b91c1c;border:0;padding:9px 13px;border-radius:10px;font-weight:600;cursor:pointer">${t("गैरहजेरी सूचना", "Absence alerts")}</button>
              <button id="tg-n-fees" style="background:#fef3c7;color:#a16207;border:0;padding:9px 13px;border-radius:10px;font-weight:600;cursor:pointer">${t("फी स्मरण", "Fee reminders")}</button>
              <button id="tg-n-weekly" style="background:#dcfce7;color:#15803d;border:0;padding:9px 13px;border-radius:10px;font-weight:600;cursor:pointer">${t("साप्ताहिक अहवाल", "Weekly report")}</button>
            </div>
          </div>`;
    host.appendChild(card);

    card.querySelector("#tg-code").addEventListener("change", (e) => {
      setCode(e.target.value);
      sync(true);
    });
    card.querySelector("#tg-copy").addEventListener("click", () => {
      const code = getCode();
      (navigator.clipboard ? navigator.clipboard.writeText("/link " + code) : Promise.reject())
        .then(() => setStatus(t("कॉपी झाले: /link ", "Copied: /link ") + code, true))
        .catch(() => setStatus("/link " + code, true));
    });
    card.querySelector("#tg-sync").addEventListener("click", () => sync(true));
    card.querySelector("#tg-codes").addEventListener("click", showParentCodes);
    const auto = card.querySelector("#tg-auto");
    auto.checked = localStorage.getItem("vss_tg_auto_absent") === "1";
    auto.addEventListener("change", () => localStorage.setItem("vss_tg_auto_absent", auto.checked ? "1" : "0"));
    [
      ["#tg-n-absent", "absent"],
      ["#tg-n-fees", "fees"],
      ["#tg-n-weekly", "weekly"],
    ].forEach(([sel, kind]) => {
      card.querySelector(sel).addEventListener("click", async () => {
        setStatus(t("पाठवत आहे…", "Sending…"), true);
        await sync(false);
        notify(kind, true);
      });
    });
    applyLabels();

    const last = localStorage.getItem("vss_tg_last_sync");
    if (last) setStatus(t("शेवटचे अपडेट: ", "Last sync: ") + new Date(last).toLocaleString(), true);
  }

  function applyLabels() {
    const set = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    set("tg-title", t("टेलिग्राम बॉट", "Telegram Bot"));
    set("tg-copy-l", t("कॉपी", "Copy"));
    set("tg-sync-l", t("आता सिंक करा", "Sync now"));
    set(
      "tg-help",
      t(
        "टेलिग्रामवरून हजेरी, फी आणि विद्यार्थ्यांची माहिती विचारा. खालील कोड बॉटला पाठवा.",
        "Ask attendance, fees and student info right from Telegram. Send the code below to the bot.",
      ),
    );
    const steps = document.getElementById("tg-steps");
    if (steps) {
      const items = MR()
        ? [
            "टेलिग्राममध्ये तुमचा बॉट उघडा आणि <b>/start</b> पाठवा.",
            "नंतर <b>/link " + getCode() + "</b> पाठवा.",
            "झालं! आता <b>/hajeri</b>, <b>/fees</b> किंवा नुसता प्रश्न विचारा.",
          ]
        : [
            "Open your bot in Telegram and send <b>/start</b>.",
            "Then send <b>/link " + getCode() + "</b>.",
            "Done! Now try <b>/hajeri</b>, <b>/fees</b> or just ask a question.",
          ];
      steps.innerHTML = items.map((i) => "<li>" + i + "</li>").join("");
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    buildCard();
    sync(false);
    setInterval(() => sync(false), 60000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) sync(false);
    });
    const menu = document.getElementById("menu-settings") || document.body;
    menu.addEventListener("click", () => setTimeout(buildCard, 120));
    document.addEventListener("click", (e) => {
      if (e.target.closest('[data-act="settings"], [data-act="profile"]')) setTimeout(buildCard, 150);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 400));
  else setTimeout(boot, 400);

  window.vssTelegramSync = () => sync(true);
  window.vssTelegramNotify = (kind) => sync(false).then(() => notify(kind || "absent", true));
  window.vssParentCode = parentCode;
  window.vssTelegramLabels = applyLabels;
})();
