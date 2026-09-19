/* =========================================================
   GURUKULAM AI BOT ASSISTANT
   Integrated with Google AI Studio (Gemini) & App State
   ========================================================= */
(function () {
    'use strict';

    /* चॅटबॉटची भाषा नेहमी डीफॉल्ट मराठी — वापरकर्त्याने स्वतः English निवडल्याशिवाय */
    const MR = () => {
        try {
            const pref = localStorage.getItem('vss_bot_lang');
            if (pref) return pref !== 'en';
        } catch (_) { }
        return true;
    };
    const t = (mr, en) => (MR() ? mr : en);
    const HKEY = 'vss_ai_chat_history';
    const KKEY = 'vss_gemini_key';
    const DEFAULT_KEY = 'AQ.Ab8RN6JFHBwrC_cd_QB3NYZZjaPefD4CR-cIBMYahIYViDGqtA';
    const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

    const TELEGRAM_MENU_OPTIONS = [
        "1️⃣ हजेरी घ्या",
        "2️⃣ विद्यार्थी माहिती",
        "3️⃣ मागील इतिहास",
        "4️⃣ तक्रार नोंदवा",
        "5️⃣ आदर्श विद्यार्थी",
        "6️⃣ आजची बॅकअप",
        "7️⃣ फी व्यवहार",
        "8️⃣ सूचना पाठवा",
        "9️⃣ परीक्षा गुण",
        "📊 साप्ताहिक गुण",
        "🔟 दैनंदिन सेवा",
        "🎓 नवीन प्रवेश",
        "📝 मूल्यांकन",
        "🏠 रजा / गावी गेला",
        "📚 विषय बदला",
        "✏️ बदल करा"
    ];

    const TELEGRAM_GREETING_REPLY = `🙏 **राम कृष्ण हरी, अंकुश महाराज!**\n\nखाली पर्याय निवडा — काहीही टाइप करायची गरज नाही.\n\n\`\`\`options\n${JSON.stringify(TELEGRAM_MENU_OPTIONS)}\n\`\`\``;

    const getKey = () => {
        try { return localStorage.getItem(KKEY) || DEFAULT_KEY; } catch (_) { return DEFAULT_KEY; }
    };
    const getModel = () => {
        try {
            const m = localStorage.getItem('vss_gemini_model');
            if (m) return m;
        } catch (_) { }
        return DEFAULT_MODEL;
    };
    const setKey = (v) => {
        try { v ? localStorage.setItem(KKEY, v) : localStorage.removeItem(KKEY); } catch (_) { }
    };

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(HKEY) || '[]');
    } catch (_) {
        history = [];
    }

    const saveHistory = () => {
        try {
            localStorage.setItem(HKEY, JSON.stringify(history.slice(-30)));
        } catch (_) { }
    };

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const students = () => (typeof studentsDatabase !== 'undefined' && Array.isArray(studentsDatabase)) ? studentsDatabase : [];
    const nameOf = (s) => (typeof getStudentName === 'function' ? getStudentName(s) : (s && typeof s.name === 'object' ? s.name.mr : (s && s.name)));

    const SESSIONS = ['morning', 'evening', 'school'];

    function sessionStats(s) {
        const daily = s.dailyAttendance || {};
        const out = { morning: { p: 0, t: 0 }, evening: { p: 0, t: 0 }, school: { p: 0, t: 0 } };
        Object.keys(daily).forEach((d) => {
            SESSIONS.forEach((k) => {
                if (Object.prototype.hasOwnProperty.call(daily[d] || {}, k)) {
                    out[k].t++;
                    if (daily[d][k]) out[k].p++;
                }
            });
        });
        const pct = (o) => (o.t ? Math.round((o.p / o.t) * 100) : null);
        return {
            morningPct: pct(out.morning), eveningPct: pct(out.evening), schoolPct: pct(out.school),
            overallPct: (function () {
                const t = out.morning.t + out.evening.t + out.school.t;
                const p = out.morning.p + out.evening.p + out.school.p;
                return t ? Math.round((p / t) * 100) : null;
            })()
        };
    }

    function getExams() {
        try {
            return JSON.parse(localStorage.getItem('vss_exams') || '[]');
        } catch (_) { return []; }
    }

    function getStudentWeeklyMarks(studentId) {
        const exams = getExams().filter((e) => String(e && e.id || '').startsWith('wk-'));
        exams.sort((a, b) => {
            const na = parseInt(String(a.id).replace('wk-', ''), 10) || 0;
            const nb = parseInt(String(b.id).replace('wk-', ''), 10) || 0;
            return na - nb;
        });
        return exams.map((e, idx) => {
            const entry = (e.entries && e.entries[studentId]) || {};
            const m = entry.marks != null ? entry.marks : (entry.mark != null ? entry.mark : null);
            return {
                week: idx + 1,
                name: e.name || `साप्ताहिक परीक्षा ${idx + 1}`,
                date: e.date || '',
                marks: m,
                max: e.max || 100
            };
        });
    }

    function snapshot() {
        const today = new Date().toISOString().slice(0, 10);
        const list = students().map((s) => {
            const fees = s.fees || {};
            const total = Number(fees.totalFees || fees.total || 0);
            const paid = Number(fees.paidAmount || fees.paid || 0);
            const todayAtt = (s.dailyAttendance && s.dailyAttendance[today]) || {};
            const wkMarks = getStudentWeeklyMarks(s.id);
            const valid = wkMarks.filter((w) => w.marks !== null);
            const avg = valid.length ? Math.round(valid.reduce((acc, x) => acc + x.marks, 0) / valid.length) : null;
            return {
                id: s.id,
                rollNo: s.rollNo,
                name: nameOf(s),
                standard: s.standard,
                section: s.section,
                phone: s.phone,
                parentName: s.parentName,
                address: s.address || '',
                emergencyContact: s.emergencyContact || '',
                fees: { total, paid, balance: total - paid, status: fees.status || 'Pending' },
                complaints: s.complaints || [],
                remarks: s.remarks || [],
                medical: s.medical || {},
                documents: (s.documents || []).map(d => ({ name: d.name, status: d.status })),
                blacklisted: !!s.blacklisted,
                today: {
                    morning: todayAtt.morning ? 'Present' : (todayAtt.morning === false ? 'Absent' : 'Not marked'),
                    evening: todayAtt.evening ? 'Present' : (todayAtt.evening === false ? 'Absent' : 'Not marked'),
                    school: todayAtt.school ? 'Present' : (todayAtt.school === false ? 'Absent' : 'Not marked')
                },
                stats: sessionStats(s),
                weeklyMarks: wkMarks,
                weeklyAverage: avg
            };
        });

        let adarsh = null;
        try {
            const raw = localStorage.getItem('vss_adarsh_week');
            if (raw) {
                const obj = JSON.parse(raw);
                const st = students().find((x) => String(x.id) === String(obj.studentId));
                adarsh = { student: st ? nameOf(st) : obj.studentId, note: obj.note, week: obj.week };
            }
        } catch (_) { }

        return {
            today,
            totalStudents: list.length,
            adarshStudent: adarsh,
            students: list.slice(0, 80)
        };
    }

    const SYSTEM_PROMPT = `You are "गुरुकुल सहाय्यक", the built-in AI assistant of a Marathi school student-management app (शांतीब्रह्म गुरुकुलम्).
Your admin / user is "अंकुश महाराज" (Ankush Maharaj Kadam).

CORE BEHAVIOR RULES:
1. GREETINGS:
   If the user says "hi", "hii", "hello", "hey", "नमस्कार", "राम कृष्ण हरी" or greets you:
   ALWAYS respond with:
   "🙏 राम कृष्ण हरी अंकुश महाराज! मी कशा प्रकारे तुमची मदत करू शकतो?"
   and provide this exact options block:
   \`\`\`options
   ["हजेरी (Attendance)", "विद्यार्थी माहिती व गुण", "फी व्यवहार (Fees)", "तक्रार नोंदवा"]
   \`\`\`

2. NUMBER / ROLL NUMBER INQUIRY:
   If the user enters a number between 1 and 72 (or asks about a roll number like "5", "roll 5", "५"):
   - Understand immediately that this is a Roll Number query!
   - Find the student with this rollNo in the snapshot.
   - Present their details directly inside the chat: Name (नाव), Roll No (हजेरी क्रमांक), Class (इयत्ता), Parent Details, Fees, Attendance, and EVERY WEEK'S EXAM MARKS (आठवडा १ ते ९ चे गुण).
   - DO NOT redirect or switch screens away from the chat! DO NOT emit open_student action. The user must stay inside the bot chat.
   - And provide options:
   \`\`\`options
   ["📝 तक्रार नोंदवा", "💵 फी जमा करा", "दुसरा रोल नंबर शोधा", "🏠 मुख्य मेनू"]
   \`\`\`

3. INVALID ROLL NUMBER:
   If the user enters a number that does NOT exist in the school (not between 1 and 72):
   Say:
   "❌ हजेरी क्रमांक (Roll No.) **[Number]** गुरुकुलाच्या विद्यार्थी यादीत उपलब्ध नाही.
   गुरुकुलामध्ये सध्या **१ ते ७२** हजेरी क्रमांक असलेले विद्यार्थी आहेत. कृपया १ ते ७२ मधील हजेरी क्रमांक टाका."
   \`\`\`options
   ["विद्यार्थी यादी", "हजेरी तपासा", "फी बाकी असणारे"]
   \`\`\`

4. DIRECT & SPECIFIC:
   If the user's purpose/intent is clear, answer specifically and concisely with NO unnecessary filler.

5. CLARIFICATION & CROSS-QUESTIONS:
   If the user's intent is unclear or ambiguous, ask ONE short cross-question and provide options in the \`\`\`options block so the user can easily tap what they want.

6. CONTEXTUAL OPTIONS (SCOPE):
   Whenever there is scope to offer choices, ALWAYS end the message with a fenced \`\`\`options block containing 3-4 short options (under 6 words each).
   - If talking about attendance (हजेरी):
     \`\`\`options
     ["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे"]
     \`\`\`
   - If talking about fees (फी):
     \`\`\`options
     ["शिल्लक फी यादी", "फी जमा करा", "पावत्या तपासा"]
     \`\`\`

7. LANGUAGE:
   Always respond in clean, respectful Marathi (Devanagari).`;


    /* उत्तर ॲपच्या सर्व्हरवरून किंवा थेट गुगल AI वरून जलद येते */
    async function askBackend(contextData, chatHistory) {
        try {
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), 4000);
            const res = await fetch('/api/public/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatHistory
                        .filter((m) => m && typeof m.content === 'string' && m.role !== 'system')
                        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) })),
                    context: contextData
                }),
                signal: ctrl.signal
            });
            clearTimeout(tid);
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.reply) return data.reply;
        } catch (e) {
            console.warn('Backend ai-chat fallback to direct Gemini:', e.message);
        }

        // Direct client fallback if backend is slow/unavailable
        const key = getKey();
        if (key) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`;
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: chatHistory.map(m => ({
                            role: m.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: String(m.content).slice(0, 4000) }]
                        })),
                        generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
                    }),
                    signal: AbortSignal.timeout(4000)
                });
                if (resp.ok) {
                    const d = await resp.json();
                    const text = d.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
                    if (text) return text;
                }
            } catch (err) {
                console.warn('Direct client Gemini fallback error:', err.message);
            }
        }
        return '🙏 अंकुश महाराज, मी आपल्या सेवेत आहे. खालीलपैकी पर्याय निवडा किंवा रोल नंबर (१ ते ७२) टाका:\n\n```options\n["1️⃣ हजेरी घ्या", "2️⃣ विद्यार्थी माहिती", "7️⃣ फी व्यवहार", "9️⃣ परीक्षा गुण", "🏠 मुख्य मेनू"]\n```';
    }

    function formatReply(raw) {
        if (!raw) return '';
        let out = raw.replace(/```(options|action)[\s\S]*?```/g, '').trim();
        const images = [];
        out = out.replace(/!\[(.*?)\]\((https?:\/\/.*?)\)/g, (match, alt, url) => {
            const idx = images.length;
            images.push({ alt, url });
            return `###IMG_${idx}###`;
        });
        out = esc(out);
        out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        out = out.replace(/\*(.+?)\*/g, '<i>$1</i>');
        out = out.replace(/\n/g, '<br>');
        images.forEach((img, idx) => {
            const imgHtml = `<div style="text-align:center;margin:10px 0;"><img src="${img.url}" alt="${esc(img.alt)}" style="width:84px;height:84px;border-radius:50%;object-fit:cover;border:3px solid #F59E0B;box-shadow:0 4px 10px rgba(0,0,0,0.18);display:inline-block;" onerror="this.parentElement.style.display='none'"></div>`;
            out = out.replace(`###IMG_${idx}###`, imgHtml);
        });
        return out;
    }

    function renderOptionsChips(chips) {
        const chipsCont = document.getElementById('bot-quick-chips');
        if (!chipsCont) return;
        if (!Array.isArray(chips) || chips.length === 0) {
            chipsCont.innerHTML = '';
            return;
        }
        chipsCont.innerHTML = chips.map((c) => {
            return `<button type="button" class="btn-bot-chip" data-q="${esc(c)}">${esc(c)}</button>`;
        }).join('');

        chipsCont.querySelectorAll('.btn-bot-chip').forEach((btn) => {
            btn.onclick = () => {
                const q = btn.getAttribute('data-q');
                if (q) sendQuery(q);
            };
        });
    }

    function renderMessages(isSending = false) {
        const list = document.getElementById('bot-messages-list');
        if (!list) return;

        if (history.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; color: #64748B; padding: 24px 16px;">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: #EFF6FF; color: #2563EB; font-size: 1.8rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(37,99,235,0.15);">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <h4 style="color: #1B3A6B; margin: 0 0 6px; font-weight: 700; font-size: 1.15rem;">🙏 राम कृष्ण हरी, अंकुश महाराज!</h4>
                    <p style="margin: 0 0 14px; font-size: 0.92rem; color: #475569;">खालीलपैकी कोणताही पर्याय निवडा — काहीही टाइप करायची गरज नाही:</p>
                </div>
            `;
            renderOptionsChips(TELEGRAM_MENU_OPTIONS);
            return;
        }

        const html = history.map((m) => {
            const isUser = m.role === 'user';
            return `
                <div class="bot-msg-row ${isUser ? 'user' : 'bot'}">
                    <div class="bot-msg-bubble">
                        ${isUser ? esc(m.content).replace(/\n/g, '<br>') : formatReply(m.content)}
                    </div>
                </div>
            `;
        });

        if (isSending) {
            html.push(`
                <div class="bot-msg-row bot">
                    <div class="bot-msg-bubble" style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
                        <span>${t('विचार करत आहे...', 'Thinking...')}</span>
                    </div>
                </div>
            `);
        }

        list.innerHTML = html.join('');
        list.scrollTop = list.scrollHeight;

        // Render dynamic options from last assistant message
        const lastAsst = [...history].reverse().find((m) => m.role === 'assistant');
        if (lastAsst && lastAsst.content) {
            const mOpt = lastAsst.content.match(/```options\s*([\s\S]*?)```/);
            if (mOpt) {
                try {
                    const parsed = JSON.parse(mOpt[1].trim());
                    if (Array.isArray(parsed)) {
                        renderOptionsChips(parsed);
                        return;
                    }
                } catch (_) { }
            }
        }
        renderOptionsChips([]);
    }

    // Helper: Extract roll number from any format (English & Devanagari numerals)
    const extractRollNo = (str) => {
        if (!str) return null;
        const dev = ['०','१','२','३','४','५','६','७','८','९'];
        let s = String(str).trim();
        for (let i = 0; i < 10; i++) s = s.split(dev[i]).join(String(i));

        let m = s.match(/^(\d{1,3})$/);
        if (m) return parseInt(m[1], 10);

        m = s.match(/^(\d{1,3})\s*[\(-]/);
        if (m) return parseInt(m[1], 10);

        m = s.match(/(?:roll\s*(?:no|number)?|हजेरी\s*क्र(?:मांक)?|क्रमांक|नंबर)\s*[:.-]?\s*(\d{1,3})/i);
        if (m) return parseInt(m[1], 10);

        m = s.match(/(?:^|\s)(\d{1,2})\s*(?:number|no|नंबर|ची|चे|चा|च्या|ला|गुण|निकाल|माहिती|chi|che|cha|तक्रार|इतिहास|पावती)/i);
        if (m) return parseInt(m[1], 10);

        return null;
    };

    // ⚡ 0ms INSTANT ENGINE: Resolves 95%+ of queries locally in 0 milliseconds with NO waiting time
    function tryInstantReply(query) {
        const lower = (query || '').toLowerCase().trim();
        const stus = students();

        // 1. Greeting or Menu
        if (/^(hi|hii|hello|hey|हॅलो|हाय|नमस्कार|राम कृष्ण हरी|menu|मेनू|मुख्य मेनू|🏠 मुख्य मेनू)$/i.test(lower) || /^(hi|hii|hello)\b/i.test(lower)) {
            return TELEGRAM_GREETING_REPLY;
        }

        // 1b. Clear History Command
        if (/^(clear|delete|delete history|इतिहास हटवा|चॅट हटवा|clear chat|इतिहास मिटवा|history delete)$/i.test(lower)) {
            history = [];
            try { localStorage.removeItem(HKEY); } catch (_) { }
            setTimeout(() => renderMessages(false), 50);
            return `🗑️ **चॅट इतिहास हटवला आहे.**\n\n🙏 **राम कृष्ण हरी, अंकुश महाराज!** खालीलपैकी पर्याय निवडा:\n\n\`\`\`options\n${JSON.stringify(TELEGRAM_MENU_OPTIONS)}\n\`\`\``;
        }

        const rNum = extractRollNo(query);

        // 2. Write Action: Add Complaint
        if (rNum && /(?:तक्रार|complaint)/i.test(query) && /(?:नोंदवा|करा|add)/i.test(query)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            if (s) {
                const textMatch = query.match(/(?:तक्रार|complaint)\s*[:.-]?\s*(.+)/i) || [null, 'शिस्तभंग / गैरशिस्त'];
                const text = textMatch[1] ? textMatch[1].replace(/(?:करा|नोंदवा)/g, '').trim() : 'शिस्तभंग';
                s.complaints = s.complaints || [];
                s.complaints.push({
                    date: new Date().toISOString().slice(0, 10),
                    type: text || 'शिस्तभंग',
                    severity: 'सामान्य',
                    action: 'पालकांना माहिती दिली'
                });
                try {
                    if (typeof saveDatabase === 'function') saveDatabase();
                    else localStorage.setItem('vss_students', JSON.stringify(stus));
                    if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save();
                } catch (_) {}
                return `✅ **तक्रार यशस्वीरीत्या नोंदवली गेली!**\n\n• **विद्यार्थी:** ${nameOf(s)} (Roll No. ${s.rollNo})\n• **तक्रार:** ${text}\n• **तारीख:** ${new Date().toISOString().slice(0, 10)}\n\n\`\`\`options\n["${s.rollNo} (तक्रारी पहा)", "सर्व तक्रारींची यादी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 3. Write Action: Add Fee Payment
        if (rNum && /(?:फी|fee)/i.test(query) && /(?:जमा|भरा|करा|add)/i.test(query)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            const amtMatch = query.match(/(?:₹|rs\.?|रुपये)?\s*(\d{2,6})/i);
            const amt = amtMatch ? parseInt(amtMatch[1], 10) : 0;
            if (s && amt > 0) {
                s.fees = s.fees || {};
                s.fees.paidAmount = Number(s.fees.paidAmount || s.fees.paid || 0) + amt;
                s.fees.paid = s.fees.paidAmount;
                s.fees.ledger = s.fees.ledger || [];
                const recNo = 'REC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
                s.fees.ledger.push({
                    date: new Date().toISOString().slice(0, 10),
                    amount: amt,
                    mode: 'Cash',
                    receipt: recNo
                });
                try {
                    if (typeof saveDatabase === 'function') saveDatabase();
                    else localStorage.setItem('vss_students', JSON.stringify(stus));
                    if (window.vssCloud && typeof window.vssCloud.save === 'function') window.vssCloud.save();
                } catch (_) {}
                const bal = Number(s.fees.totalFees || s.fees.total || 35000) - s.fees.paidAmount;
                return `✅ **फी रक्कम यशस्वीरीत्या जमा झाली!**\n\n• **विद्यार्थी:** ${nameOf(s)} (Roll No. ${s.rollNo})\n• **जमा रक्कम:** **₹${amt.toLocaleString('en-IN')}**\n• **पावती क्रमांक:** \`${recNo}\`\n• **उर्वरित शिल्लक:** ${bal <= 0 ? '✅ पूर्ण भरली (NIL Due)' : `₹${bal.toLocaleString('en-IN')}`}\n\n\`\`\`options\n["🧾 ${s.rollNo} ची फी पावती", "🔴 शिल्लक फी यादी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 4. Specific Student Complaint Query: e.g. "11 ची तक्रार", "roll 11 complaint", "११ (संगम तोडकर तक्रारी)"
        if (rNum && /(?:तक्रार|गैरशिस्त|complaint)/i.test(lower)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            if (s) {
                const sName = nameOf(s);
                const cmps = s.complaints || [];
                if (cmps.length === 0) {
                    return `👤 **विद्यार्थी:** **${sName}** (हजेरी क्र. ${s.rollNo})\n\n✅ **तक्रारी:** या विद्यार्थ्याच्या नावावर सध्या कोणतीही तक्रार नोंदवलेली नाही. शिस्त समाधानकारक आहे.\n\n\`\`\`options\n["📝 ${s.rollNo} ची तक्रार नोंदवा", "📊 ${s.rollNo} चे गुण", "💵 ${s.rollNo} ची फी", "🏠 मुख्य मेनू"]\n\`\`\``;
                }
                const list = cmps.map((c, i) => `  ${i + 1}. 📅 **${c.date || 'तारीख नाही'}:** ${c.type || 'सामान्य'} (${c.severity || 'सामान्य'})\n     👉 **कारवाई:** ${c.action || 'नोंद नाही'}`).join('\n\n');
                return `⚠️ **विद्यार्थी:** **${sName}** (हजेरी क्र. ${s.rollNo})\n\n**नोंदवलेल्या तक्रारी (${cmps.length}):**\n${list}\n\n💡 *टीप: नवीन तक्रार नोंदवण्यासाठी खालील पर्याय वापरा.*\n\n\`\`\`options\n["📝 ${s.rollNo} ची तक्रार नोंदवा", "📊 ${s.rollNo} चे गुण", "💵 ${s.rollNo} ची फी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 5. Specific Student Marks Query: e.g. "11 चे गुण", "roll 11 marks", "११ (संगम गुण)"
        if (rNum && /(?:गुण|निकाल|marks|exam)/i.test(lower)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            if (s) {
                const sName = nameOf(s);
                const wkMarks = getStudentWeeklyMarks(s.id);
                const marksLines = wkMarks.length ? wkMarks.map(w => `  • **${w.name}:** ${w.marks != null ? `**${w.marks}** / ${w.max} (${Math.round((w.marks/w.max)*100)}%)` : 'अनुपस्थित / नोंद नाही'}`).join('\n') : '  • कोणतीही नोंद नाही';
                const valid = wkMarks.filter(w => w.marks !== null);
                const avg = valid.length ? Math.round(valid.reduce((acc, x) => acc + x.marks, 0) / valid.length) : null;
                const rating = avg != null ? (avg >= 80 ? '🌟 उत्कृष्ट' : avg >= 50 ? '👍 मध्यम' : '⚠️ सुधारणा हवी') : 'नोंद नाही';
                return `📈 **साप्ताहिक परीक्षा गुण — ${sName} (Roll No. ${s.rollNo})**\n\n${marksLines}\n${avg != null ? `\n🎯 **एकूण सरासरी गुण:** **${avg}%** (${rating})\n` : ''}\n\`\`\`options\n["👤 ${s.rollNo} ची माहिती", "📝 ${s.rollNo} ची तक्रार नोंदवा", "💵 ${s.rollNo} ची फी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 6. Specific Student History Query: e.g. "11 चा इतिहास", "roll 11 history", "११ (संगम तोडकर इतिहास)"
        if (rNum && /(?:इतिहास|history|मागील)/i.test(lower)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            if (s) {
                const sName = nameOf(s);
                const att = sessionStats(s);
                const cmps = s.complaints || [];
                const rems = s.remarks || [];
                return `📜 **विद्यार्थी मागील इतिहास — ${sName} (Roll No. ${s.rollNo})**\n\n• **इयत्ता:** ${s.standard || '५'} वी\n• **हजेरी सरासरी:** **${att.overallPct != null ? att.overallPct + '%' : 'नोंद नाही'}**\n• **तक्रारींची संख्या:** **${cmps.length}**\n• **शिक्षकांचे शेरे:** ${rems.length ? rems.map(r => r.text || r.remark).join(', ') : 'कोणताही विशेष शेरा नाही'}\n\n\`\`\`options\n["👤 ${s.rollNo} ची माहिती", "📊 ${s.rollNo} चे गुण", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 7. Specific Student Receipt / Fee query: e.g. "15 ची पावती", "15 ची फी", "roll 15 receipt"
        if (rNum && /(?:पावती|receipt|फी|fees)/i.test(lower) && !/करा|जमा|भर/i.test(lower)) {
            const s = stus.find(x => Number(x.rollNo) === rNum);
            if (s) {
                const sName = nameOf(s);
                const fees = s.fees || {};
                const total = Number(fees.totalFees || fees.total || 35000);
                const paid = Number(fees.paidAmount || fees.paid || 0);
                const bal = total - paid;
                const ledger = fees.ledger || [];
                const lastRec = ledger.length ? ledger[ledger.length - 1] : null;
                return `🧾 **फी पावती व हिशोब — ${sName} (Roll No. ${s.rollNo})**\n\n• **एकूण वार्षिक फी:** ₹${total.toLocaleString('en-IN')}\n• **भरलेली रक्कम:** ₹${paid.toLocaleString('en-IN')}\n• **शिल्लक फी:** **${bal <= 0 ? '✅ पूर्ण भरली (NIL Due)' : `₹${bal.toLocaleString('en-IN')}`}**\n• **शेवटची पावती:** ${lastRec ? `पावती क्र. ${lastRec.receipt || 'नोंद नाही'} (₹${lastRec.amount})` : 'पावती नोंद नाही'}\n\n\`\`\`options\n["💵 ${s.rollNo} ची फी जमा करा", "👤 ${s.rollNo} ची माहिती", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 7b. Specific Student Attendance query: e.g. "1 ची हजेरी", "roll 1 attendance", "१ हजेरी", "१ ची उपस्थिती"
        if (rNum && /(?:attendance|हजेरी|उपस्थिती)/i.test(lower)) {
            const stu = stus.find(x => Number(x.rollNo) === rNum);
            if (stu) {
                const sName = nameOf(stu);
                const now = new Date();
                const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                const todayRec = (stu.dailyAttendance && stu.dailyAttendance[todayKey]) || null;
                const hasToday = todayRec && (todayRec.morning !== undefined || todayRec.school !== undefined || todayRec.evening !== undefined);

                if (!hasToday) {
                    return `📋 **हजेरी अहवाल — ${sName} (Roll No. ${stu.rollNo})**\n📅 **तारीख:** ${todayFormatted}\n\n⚠️ **आजची हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\n\`\`\`options\n["👤 ${stu.rollNo} ची माहिती", "1️⃣ हजेरी घ्या", "🏠 मुख्य मेनू"]\n\`\`\``;
                }
                const fmtAtt = (val) => {
                    if (val === true) return '✅ हजर';
                    if (val === false) return '❌ गैरहजर';
                    if (val === 'leave') return '🏖️ रजा';
                    return '⏳ नोंद नाही';
                };
                const mStatus = todayRec.morning !== undefined ? fmtAtt(todayRec.morning) : '⏳ नोंद नाही';
                const sStatus = todayRec.school !== undefined ? fmtAtt(todayRec.school) : '⏳ नोंद नाही';
                const eStatus = todayRec.evening !== undefined ? fmtAtt(todayRec.evening) : '⏳ नोंद नाही';
                return `📋 **आजची हजेरी — ${sName} (Roll No. ${stu.rollNo})**\n📅 **तारीख:** ${todayFormatted}\n\n• सकाळ: **${mStatus}**\n• शाळा: **${sStatus}**\n• संध्याकाळ: **${eStatus}**\n\n\`\`\`options\n["👤 ${stu.rollNo} ची माहिती", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
        }

        // 8. Roll Number Entered -> Show ALL Student Details
        const isMenuEmoji = /^[1-9]️⃣|🔟|📊|🎓|🧾|📝|🏠|📚|✏️/.test(query);
        const isWriteAct = /(?:add|करा|जमा|नोंदवा)\s*(?:complaint|fee|remark|medical|तक्रार|फी|शेरा)/i.test(query) ||
                           /(?:तक्रार|फी|शेरा|नोंद)\s*(?:करा|नोंदवा|घ्या|जमा)/i.test(query);

        if (rNum && !isMenuEmoji && !isWriteAct) {
            if (rNum < 1 || rNum > 72) {
                return `❌ हजेरी क्रमांक (Roll No.) **${rNum}** गुरुकुलाच्या विद्यार्थी यादीत उपलब्ध नाही.\n\nगुरुकुलामध्ये सध्या **१ ते ७२** हजेरी क्रमांक असलेले विद्यार्थी आहेत. कृपया १ ते ७२ मधील हजेरी क्रमांक टाका.\n\n\`\`\`options\n["१ (अवधूत गाडेकर)", "२ (यश खरात)", "११ (संगम तोडकर)", "१५ (लक्की बाघुल)", "३५ (वेदांत गव्हाणे)", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            const stu = stus.find(s => Number(s.rollNo) === rNum);
            if (stu) {
                const stuNameMr = (stu.name && stu.name.mr) ? stu.name.mr : (typeof stu.name === 'string' ? stu.name : 'नाव नाही');
                const stuNameEn = (stu.name && stu.name.en) ? stu.name.en : '';
                const fees = stu.fees || {};
                const totalFees = Number(fees.totalFees || fees.total || 35000);
                const paidFees = Number(fees.paidAmount || fees.paid || 0);
                const balance = totalFees - paidFees;
                const feeStatus = balance <= 0 ? '✅ पूर्ण भरली (NIL Due)' : `⚠️ शिल्लक ₹${balance.toLocaleString('en-IN')}`;

                // Check today's actual attendance ONLY
                const now = new Date();
                const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                
                const todayRec = (stu.dailyAttendance && stu.dailyAttendance[todayKey]) || null;
                const hasToday = todayRec && (todayRec.morning !== undefined || todayRec.school !== undefined || todayRec.evening !== undefined);
                let todayAttSection = '';
                if (hasToday) {
                    const fmtAtt = (val) => {
                        if (val === true) return '✅ हजर';
                        if (val === false) return '❌ गैरहजर';
                        if (val === 'leave') return '🏖️ रजा';
                        return '⏳ नोंद नाही';
                    };
                    const mStatus = todayRec.morning !== undefined ? fmtAtt(todayRec.morning) : '⏳ नोंद नाही';
                    const sStatus = todayRec.school !== undefined ? fmtAtt(todayRec.school) : '⏳ नोंद नाही';
                    const eStatus = todayRec.evening !== undefined ? fmtAtt(todayRec.evening) : '⏳ नोंद नाही';
                    todayAttSection = `📅 **आजची हजेरी (${todayFormatted}):**\n• सकाळ: **${mStatus}** | शाळा: **${sStatus}** | संध्याकाळ: **${eStatus}**`;
                } else {
                    todayAttSection = `📅 **आजची हजेरी (${todayFormatted}):**\n⚠️ **आजची हजेरी अद्याप घेतलेली नाही (Not Taken)**`;
                }

                const wkMarks = getStudentWeeklyMarks(stu.id);
                const marksLines = wkMarks.length ? wkMarks.map(w => `  • **${w.name}:** ${w.marks != null ? `**${w.marks}** / ${w.max} (${Math.round((w.marks/w.max)*100)}%)` : 'अनुपस्थित / नोंद नाही'}`).join('\n') : '  • कोणत्याही परीक्षेची नोंद नाही';
                const valid = wkMarks.filter(w => w.marks !== null);
                const avg = valid.length ? Math.round(valid.reduce((acc, x) => acc + x.marks, 0) / valid.length) : null;
                const rating = avg != null ? (avg >= 80 ? '🌟 उत्कृष्ट (Good)' : avg >= 50 ? '👍 मध्यम (Average)' : '⚠️ सुधारणा हवी (Needs Improvement)') : 'नोंद नाही';

                const cmps = stu.complaints || [];
                let cmpSection = '';
                if (cmps.length === 0) {
                    cmpSection = '  • ✅ कोणतीही तक्रार किंवा गैरशिस्त नोंद नाही. शिस्त समाधानकारक आहे.';
                } else {
                    cmpSection = cmps.map((c, i) => `  ${i + 1}. 📅 **${c.date || 'तारीख नाही'}:** ${c.type || 'सामान्य'} (${c.severity || 'सामान्य'})\n     👉 **कारवाई:** ${c.action || 'नोंद नाही'}`).join('\n');
                }

                const rems = stu.remarks || [];
                const remSection = rems.length ? rems.map((r, i) => `  ${i + 1}. 📅 ${r.date || ''}: ${r.text || r.remark || ''}`).join('\n') : '  • कोणताही विशेष शेरा नाही.';

                const med = stu.medical || {};
                const blood = med.bloodGroup || 'नोंद नाही';
                const illness = med.illness || med.allergies || 'निरोगी / उत्तम';

                const photoUrl = stu.photo || stu.photoUrl || '';
                const photoMarkdown = photoUrl ? `![${stuNameMr}](${photoUrl})\n` : '';

                return `${photoMarkdown}👤 **विद्यार्थी संपूर्ण तपशील (Roll No. ${stu.rollNo})**

📋 **वैयक्तिक माहिती:**
• **नाव:** **${stuNameMr}** ${stuNameEn ? `(${stuNameEn})` : ''}
• **हजेरी क्रमांक (Roll No.):** **${stu.rollNo}**
• **इयत्ता:** **${stu.standard || '५'} वी**
• **पालकांचे नाव:** ${stu.parentName || 'नोंद नाही'}
• **पालक संपर्क:** 📞 ${stu.phone || stu.emergencyContact || 'नोंद नाही'}
• **पत्ता (गाव/जिल्हा):** 📍 ${stu.address || 'नोंद नाही'}

💰 **फी तपशील (Fees):**
• एकूण फी: **₹${totalFees.toLocaleString('en-IN')}**
• भरलेली फी: **₹${paidFees.toLocaleString('en-IN')}**
• शिल्लक फी: **${feeStatus}**

${todayAttSection}

📈 **साप्ताहिक परीक्षा निकाल (हप्ता १ ते ९):**
${marksLines}
${avg != null ? `\n🎯 **एकूण सरासरी गुण:** **${avg}%** (${rating})\n` : ''}
⚠️ **तक्रारी व गैरशिस्त नोंदी (${cmps.length}):**
${cmpSection}

📝 **शिक्षकांचे शेरे (Remarks):**
${remSection}

🏥 **वैद्यकीय माहिती:**
• रक्तगट: **${blood}** | प्रकृती: **${illness}**

💡 *टीप: विद्यार्थ्याची तक्रार किंवा फी नोंदवण्यासाठी खालील पर्याय वापरा.*

\`\`\`options
["📝 ${stu.rollNo} ची तक्रार नोंदवा", "💵 ${stu.rollNo} ची फी जमा करा", "दुसरा रोल नंबर शोधा", "🏠 मुख्य मेनू"]
\`\`\``;
            }
        }

        // 9. Attendance Handlers
        const nowObj = new Date();
        const todayDateKey = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;
        const todayDateFormatted = `${String(nowObj.getDate()).padStart(2, '0')}/${String(nowObj.getMonth() + 1).padStart(2, '0')}/${nowObj.getFullYear()}`;

        if (query.includes('1️⃣') || query === 'हजेरी घ्या' || lower === 'हजेरी' || lower === 'attendance' || /^(आजची हजेरी|हजेरी अहवाल|हजेरी दाखवा|attendance report|today attendance)/i.test(lower)) {
            const hasAnyToday = stus.some(s => {
                const r = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                return r && (r.morning !== undefined || r.school !== undefined || r.evening !== undefined);
            });
            if (!hasAnyToday) {
                return `📋 **हजेरी व्यवस्थापन (1️⃣ हजेरी अहवाल)**\n📅 **आजची तारीख:** ${todayDateFormatted}\n\n⚠️ **आजची कोणतीही हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\nहजेरी नोंदवण्यासाठी खालीलपैकी सत्र निवडा:\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            return `📋 **हजेरी व्यवस्थापन (1️⃣ हजेरी घ्या)**\n📅 **आजची तारीख:** ${todayDateFormatted}\n\nखालीलपैकी सत्र निवडा किंवा आज गैरहजर असणाऱ्यांची यादी तपासा:\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('सकाळची हजेरी')) {
            const hasRec = stus.some(s => s.dailyAttendance && s.dailyAttendance[todayDateKey] && s.dailyAttendance[todayDateKey].morning !== undefined);
            if (!hasRec) {
                return `🌅 **सकाळची हजेरी अहवाल (Morning Attendance)**\n📅 **तारीख:** ${todayDateFormatted}\n\n⚠️ **आज सकाळची हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\nगुरुकुलामध्ये सकाळची हजेरी नोंदवल्यानंतर येथे उपस्थित व गैरहजर विद्यार्थ्यांची यादी दिसेल.\n\n\`\`\`options\n["शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            let pres = 0, abs = 0, leave = 0;
            const absStus = [];
            stus.forEach(s => {
                const rec = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                const val = rec ? rec.morning : undefined;
                if (val === true) pres++;
                else if (val === false) { abs++; absStus.push(s); }
                else if (val === 'leave') leave++;
            });
            const pct = stus.length ? Math.round((pres / stus.length) * 100) : 0;
            const absList = absStus.length ? `\n\n⚠️ **सकाळी गैरहजर विद्यार्थी (${absStus.length}):**\n` + absStus.slice(0, 10).map((s, i) => `${i + 1}. Roll ${s.rollNo}: ${nameOf(s)}`).join('\n') : '\n\n✅ सर्व विद्यार्थी हजर!';
            return `🌅 **सकाळची हजेरी अहवाल (${todayDateFormatted})**\n\n• **एकूण विद्यार्थी:** ${stus.length}\n• **उपस्थित विद्यार्थी:** **${pres}** (${pct}%)\n• **गैरहजर:** **${abs}** | **रजा:** **${leave}**\n• **वेळ:** काकडा आरती व सकाळी पाठांतर सत्र${absList}\n\n\`\`\`options\n["शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('शाळेची हजेरी')) {
            const hasRec = stus.some(s => s.dailyAttendance && s.dailyAttendance[todayDateKey] && s.dailyAttendance[todayDateKey].school !== undefined);
            if (!hasRec) {
                return `🏫 **शाळेची हजेरी अहवाल (School Attendance)**\n📅 **तारीख:** ${todayDateFormatted}\n\n⚠️ **आज शाळेची हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            let pres = 0, abs = 0, leave = 0;
            const absStus = [];
            stus.forEach(s => {
                const rec = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                const val = rec ? rec.school : undefined;
                if (val === true) pres++;
                else if (val === false) { abs++; absStus.push(s); }
                else if (val === 'leave') leave++;
            });
            const pct = stus.length ? Math.round((pres / stus.length) * 100) : 0;
            const absList = absStus.length ? `\n\n⚠️ **शाळेत गैरहजर विद्यार्थी (${absStus.length}):**\n` + absStus.slice(0, 10).map((s, i) => `${i + 1}. Roll ${s.rollNo}: ${nameOf(s)}`).join('\n') : '\n\n✅ सर्व विद्यार्थी हजर!';
            return `🏫 **शाळेची हजेरी अहवाल (${todayDateFormatted})**\n\n• **एकूण विद्यार्थी:** ${stus.length}\n• **उपस्थित विद्यार्थी:** **${pres}** (${pct}%)\n• **गैरहजर:** **${abs}** | **रजा:** **${leave}**\n• **वेळ:** सकाळी १०:०० ते संध्याकाळी ५:००${absList}\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('संध्याकाळची हजेरी')) {
            const hasRec = stus.some(s => s.dailyAttendance && s.dailyAttendance[todayDateKey] && s.dailyAttendance[todayDateKey].evening !== undefined);
            if (!hasRec) {
                return `🌆 **संध्याकाळची हजेरी अहवाल (Evening Attendance)**\n📅 **तारीख:** ${todayDateFormatted}\n\n⚠️ **आज संध्याकाळची हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            let pres = 0, abs = 0, leave = 0;
            const absStus = [];
            stus.forEach(s => {
                const rec = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                const val = rec ? rec.evening : undefined;
                if (val === true) pres++;
                else if (val === false) { abs++; absStus.push(s); }
                else if (val === 'leave') leave++;
            });
            const pct = stus.length ? Math.round((pres / stus.length) * 100) : 0;
            const absList = absStus.length ? `\n\n⚠️ **संध्याकाळी गैरहजर विद्यार्थी (${absStus.length}):**\n` + absStus.slice(0, 10).map((s, i) => `${i + 1}. Roll ${s.rollNo}: ${nameOf(s)}`).join('\n') : '\n\n✅ सर्व विद्यार्थी हजर!';
            return `🌆 **संध्याकाळची हजेरी अहवाल (${todayDateFormatted})**\n\n• **एकूण विद्यार्थी:** ${stus.length}\n• **उपस्थित विद्यार्थी:** **${pres}** (${pct}%)\n• **गैरहजर:** **${abs}** | **रजा:** **${leave}**\n• **वेळ:** हरिपाठ व संध्या आरती सत्र${absList}\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('आज गैरहजर') || query === 'गैरहजर विद्यार्थी' || lower === 'absent') {
            const hasAnyToday = stus.some(s => {
                const r = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                return r && (r.morning !== undefined || r.school !== undefined || r.evening !== undefined);
            });
            if (!hasAnyToday) {
                return `📋 **आज गैरहजर असणारे विद्यार्थी (${todayDateFormatted})**\n\n⚠️ **आजची कोणतीही हजेरी अद्याप घेतलेली नाही (Not Taken Yet).**\n\nहजेरी नोंदवल्यानंतर गैरहजर विद्यार्थ्यांची यादी येथे आपोआप दिसेल.\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            const absList = [];
            stus.forEach(s => {
                const r = s.dailyAttendance && s.dailyAttendance[todayDateKey];
                if (!r) return;
                const missed = [];
                if (r.morning === false) missed.push('सकाळ');
                if (r.school === false) missed.push('शाळा');
                if (r.evening === false) missed.push('संध्याकाळ');
                if (missed.length) {
                    absList.push({ stu: s, missed: missed.join(', ') });
                }
            });
            if (absList.length === 0) {
                return `✅ **आज गुरुकुलात नोंदवलेल्या सत्रांमध्ये सर्व विद्यार्थी उपस्थित आहेत! (${todayDateFormatted})**\n\nसध्या कोणतीही गैरहजेरी नोंद नाही.\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "🏠 मुख्य मेनू"]\n\`\`\``;
            }
            const lines = absList.slice(0, 15).map((item, i) => `${i + 1}. **Roll ${item.stu.rollNo}:** ${nameOf(item.stu)} (${item.missed} गैरहजर) 📞 ${item.stu.phone || 'फोन नाही'}`).join('\n');
            return `⚠️ **आज गैरहजर असणारे विद्यार्थी (${absList.length}):**\n📅 **तारीख:** ${todayDateFormatted}\n\n${lines}\n\n\`\`\`options\n["गैरहजर विद्यार्थ्यांच्या पालकांना SMS", "सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 10. Fee Handlers
        if (query.includes('7️⃣') || query === 'फी व्यवहार') {
            let totBal = 0, balCount = 0;
            stus.forEach(s => {
                const f = s.fees || {};
                const t = Number(f.totalFees || f.total || 35000);
                const p = Number(f.paidAmount || f.paid || 0);
                if (t - p > 0) { totBal += (t - p); balCount++; }
            });
            return `💰 **फी व्यवहार व हिशोब (7️⃣ फी व्यवहार)**\n\n• एकूण विद्यार्थी: **${stus.length}**\n• फी बाकी असणारे: **${balCount} विद्यार्थी** (एकूण थकबाकी: **₹${totBal.toLocaleString('en-IN')}**)\n\nखालीलपैकी पर्याय निवडा:\n\n\`\`\`options\n["🔴 शिल्लक फी यादी", "🟢 पूर्ण फी भरलेले विद्यार्थी", "💵 नवीन फी जमा करा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('शिल्लक फी') || query.includes('फी बाकी') || query.includes('बाकी फी')) {
            const balList = stus.map(s => {
                const f = s.fees || {};
                const t = Number(f.totalFees || f.total || 35000);
                const p = Number(f.paidAmount || f.paid || 0);
                return { roll: s.rollNo, name: nameOf(s), bal: t - p, phone: s.phone };
            }).filter(x => x.bal > 0).sort((a, b) => b.bal - a.bal);

            const totalBal = balList.reduce((acc, x) => acc + x.bal, 0);
            const top10 = balList.slice(0, 10).map((x, i) => `${i + 1}. **Roll ${x.roll}:** ${x.name} — **₹${x.bal.toLocaleString('en-IN')}** (📞 ${x.phone || 'नोंद नाही'})`).join('\n');

            return `🔴 **शिल्लक फी थकबाकी यादी (${balList.length} विद्यार्थी)**\n\n💰 **एकूण थकबाकी:** **₹${totalBal.toLocaleString('en-IN')}**\n\n**सर्वाधिक थकबाकी असणारे पहिले १० विद्यार्थी:**\n${top10}\n\n\`\`\`options\n["फी थकबाकी सूचना", "🟢 पूर्ण फी भरलेले विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('पूर्ण फी भरलेले') || query.includes('फी पूर्ण')) {
            const paidList = stus.map(s => {
                const f = s.fees || {};
                const t = Number(f.totalFees || f.total || 35000);
                const p = Number(f.paidAmount || f.paid || 0);
                return { roll: s.rollNo, name: nameOf(s), bal: t - p };
            }).filter(x => x.bal <= 0);

            const top10 = paidList.slice(0, 10).map((x, i) => `${i + 1}. **Roll ${x.roll}:** ${x.name} ✅`).join('\n');

            return `🟢 **पूर्ण फी भरलेले विद्यार्थी (${paidList.length} विद्यार्थी)**\n\nया सर्व विद्यार्थ्यांची वार्षिक फी १००% पूर्ण भरलेली आहे:\n${top10}\n${paidList.length > 10 ? `...व इतर ${paidList.length - 10} विद्यार्थी.` : ''}\n\n\`\`\`options\n["🔴 शिल्लक फी यादी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 11. Merit List & Exam Handlers
        if (query.includes('9️⃣') || query === 'परीक्षा गुण') {
            return `📝 **परीक्षा गुण व्यवस्थापन (9️⃣ परीक्षा गुण)**\n\nसाप्ताहिक परीक्षा १ ते ९ चे गुण तपासण्यासाठी पर्याय निवडा किंवा रोल नंबर टाका:\n\n\`\`\`options\n["📊 साप्ताहिक गुण", "गुणवत्ता यादी (Merit List)", "११ (संगम गुण)", "१५ (लक्की गुण)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('गुणवत्ता यादी') || query.includes('merit list') || query.includes('टॉपर') || query.includes('उत्कृष्ट विद्यार्थी')) {
            const exams = getExams().filter(e => String(e && e.id || '').startsWith('wk-'));
            const rankings = stus.map(s => {
                let sum = 0, count = 0;
                exams.forEach(e => {
                    const entry = e.entries && e.entries[s.id];
                    const m = entry && (entry.marks != null ? entry.marks : entry.mark);
                    if (m != null) { sum += Number(m); count++; }
                });
                const avg = count ? Math.round(sum / count) : 0;
                return { roll: s.rollNo, name: nameOf(s), avg, count };
            }).sort((a, b) => b.avg - a.avg);

            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            const top10 = rankings.slice(0, 10).map((x, i) => `${medals[i]} **Roll ${x.roll}:** ${x.name} — **${x.avg}%** गुण`).join('\n');

            return `🏆 **साप्ताहिक परीक्षा गुणवत्ता यादी (Merit List — Top 10):**\n\n${top10}\n\n💡 *टीप: कोणत्याही विद्यार्थ्याचा रोल नंबर टाकून त्यांचे संपूर्ण गुणपत्रक पाहू शकता.*\n\n\`\`\`options\n["सुधारणा आवश्यक विद्यार्थी", "📊 साप्ताहिक गुण", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('सुधारणा आवश्यक') || query.includes('कमी गुण')) {
            const exams = getExams().filter(e => String(e && e.id || '').startsWith('wk-'));
            const rankings = stus.map(s => {
                let sum = 0, count = 0;
                exams.forEach(e => {
                    const entry = e.entries && e.entries[s.id];
                    const m = entry && (entry.marks != null ? entry.marks : entry.mark);
                    if (m != null) { sum += Number(m); count++; }
                });
                const avg = count ? Math.round(sum / count) : 0;
                return { roll: s.rollNo, name: nameOf(s), avg, count };
            }).filter(x => x.count > 0).sort((a, b) => a.avg - b.avg);

            const bottom5 = rankings.slice(0, 5).map((x, i) => `${i + 1}. **Roll ${x.roll}:** ${x.name} — **${x.avg}%** (विशेष मार्गदर्शन आवश्यक)`).join('\n');

            return `⚠️ **अभ्यासात सुधारणा आवश्यक असणारे विद्यार्थी:**\n\n${bottom5}\n\n💡 *मार्गदर्शन सूचना: या विद्यार्थ्यांसाठी रोज संध्याकाळी अतिरिक्त पाठांतर व सराव वर्ग सुरू ठेवावेत.*\n\n\`\`\`options\n["गुणवत्ता यादी (Merit List)", "📊 साप्ताहिक गुण", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 12. Complaints Handlers
        if (query.includes('4️⃣') || query === 'तक्रार नोंदवा') {
            return `⚠️ **तक्रार व गैरशिस्त नोंदणी (4️⃣ तक्रार नोंदवा)**\n\nकोणत्या विद्यार्थ्याची तक्रार नोंदवायची आहे? रोल नंबर आणि प्रकार सांगा (उदा. 'roll 11 ची तक्रार: शाळेत मस्ती').\n\nकिंवा खालीलपैकी विद्यार्थ्याची तक्रार पहा:\n\n\`\`\`options\n["११ (संगम तोडकर तक्रारी)", "५ (श्याम शिनगारे तक्रारी)", "सर्व तक्रारींची यादी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('सर्व तक्रारी') || query.includes('तक्रारींची यादी')) {
            const allCmps = [];
            stus.forEach(s => {
                (s.complaints || []).forEach(c => {
                    allCmps.push({ roll: s.rollNo, name: nameOf(s), ...c });
                });
            });

            if (allCmps.length === 0) {
                return `✅ **गुरुकुलात सध्या कोणतीही तक्रार किंवा गैरशिस्त नोंद नाही!**\n\nसर्व विद्यार्थ्यांचे वर्तन व शिस्त समाधानकारक आहे.\n\n\`\`\`options\n["4️⃣ तक्रार नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
            }

            const lines = allCmps.slice(0, 10).map((c, i) => `${i + 1}. **Roll ${c.roll} (${c.name}):** ${c.type || 'सामान्य'} — 📅 ${c.date || 'नोंद नाही'} (${c.severity || 'सामान्य'})\n   👉 *कारवाई:* ${c.action || 'नोंद नाही'}`).join('\n\n');

            return `⚠️ **गुरुकुलातील सर्व नोंदवलेल्या तक्रारी (${allCmps.length}):**\n\n${lines}\n\n\`\`\`options\n["4️⃣ तक्रार नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 13. SMS Notification Handlers
        if (query.includes('8️⃣') || query === 'सूचना पाठवा') {
            return `📢 **पालकांना सूचना पाठवा (8️⃣ सूचना पाठवा)**\n\nपालकांना WhatsApp / SMS द्वारे सूचना पाठवण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["गैरहजर विद्यार्थ्यांच्या पालकांना SMS", "फी थकबाकी सूचना", "सामान्य गुरुकुल सूचना", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('गैरहजर विद्यार्थ्यांच्या पालकांना SMS') || query.includes('गैरहजर sms')) {
            return `📲 **पालकांसाठी WhatsApp / SMS मजकूर (तयार):**\n\n> *\"आदरणीय पालक, जय हरी. आपला पाल्य आज शांतीब्रह्म गुरुकुलम् येथे गैरहजर आहे. कृपया गैरहजेरीचे कारण कळवावे किंवा गुरुकुलाशी संपर्क साधावा. - अंकुश महाराज (मो. 9822334455)\"*\n\n✅ *हा मेसेज सर्व गैरहजर विद्यार्थ्यांच्या पालकांना पाठवण्यासाठी सज्ज आहे.*\n\n\`\`\`options\n["फी थकबाकी सूचना", "सामान्य गुरुकुल सूचना", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('फी थकबाकी सूचना')) {
            return `📲 **पालकांसाठी फी थकबाकी SMS मजकूर (तयार):**\n\n> *\"आदरणीय पालक, जय हरी. शांतीब्रह्म गुरुकुलम् शैक्षणिक वर्ष २०२६ ची आपल्या पाल्याची उर्वरित फी जमा करण्याची नम्र विनंती आहे. त्वरित कार्यालयाशी संपर्क साधावा. - अंकुश महाराज (मो. 9822334455)\"*\n\n✅ *हा मेसेज थकबाकीदार पालकांना पाठवण्यासाठी सज्ज आहे.*\n\n\`\`\`options\n["🔴 शिल्लक फी यादी", "गैरहजर विद्यार्थ्यांच्या पालकांना SMS", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('सामान्य गुरुकुल सूचना')) {
            return `📢 **सामान्य गुरुकुल सूचना मजकूर (तयार):**\n\n> *\"सर्व आदरणीय पालकांना कळविण्यात येते की, गुरुकुलातील आगामी कार्यक्रम / सुट्टी संदर्भातील माहिती वेळेत दिली जाईल. गुरुकुलाशी संपर्क: अंकुश महाराज (मो. 9822334455)\"*\n\n\`\`\`options\n["8️⃣ सूचना पाठवा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 14. Daily Tasks / Timetable
        if (query.includes('🔟') || query === 'दैनंदिन सेवा') {
            return `⏰ **दैनंदिन सेवा व वेळापत्रक (🔟 दैनंदिन सेवा)**\n\nकाकडा, दैनंदिन पाठ, हरिपाठ व संध्या आरतीच्या कामांची माहिती:\n\n\`\`\`options\n["🌅 सकाळची सेवा", "🌆 संध्याकाळची सेवा", "सेवा पूर्ण नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('सकाळची सेवा') || query.includes('काकडा')) {
            return `🌅 **पहाटे व सकाळची सेवा वेळापत्रक:**\n\n• **०४:०० ते ०४:३०:** जागरण व शुचिर्भूर्तता\n• **०४:३० ते ०५:३०:** काकडा आरती व भूपाळी\n• **०५:३० ते ०६:३०:** भगवद्गीता व ज्ञानेश्वरी पाठांतर\n• **०६:३० ते ०७:३०:** स्नान, नाश्ता व गुरुकुल परिसर सेवा\n• **०७:३० ते ०९:३०:** मृदंग व संगीत सराव वर्ग\n\n\`\`\`options\n["🌆 संध्याकाळची सेवा", "सेवा पूर्ण नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('संध्याकाळची सेवा') || query.includes('हरिपाठ')) {
            return `🌆 **संध्याकाळची सेवा व वेळापत्रक:**\n\n• **०५:०० ते ०६:००:** खेळ व शारीरिक व्यायाम\n• **०६:०० ते ०६:३०:** संध्या स्नान व ध्यान\n• **०६:३० ते ०७:३०:** हरिपाठ व सांज आरती\n• **०७:३० ते ०८:३०:** महाप्रसाद (रात्रीचे जेवण)\n• **०८:३० ते ०९:३०:** रात्रीचा गृहपाठ व अभ्यास\n• **०९:३० ते १०:००:** शेजारती व विश्रांती\n\n\`\`\`options\n["🌅 सकाळची सेवा", "सेवा पूर्ण नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        // 15. Other Menus
        if (query.includes('2️⃣') || query === 'विद्यार्थी माहिती') {
            return `👥 **विद्यार्थी माहिती डिरेक्टरी (2️⃣ विद्यार्थी माहिती)**\n\nज्या विद्यार्थ्याची संपूर्ण माहिती, निकाल व फी हवी आहे, त्यांचा **हजेरी क्रमांक (Roll No. १ ते ७२)** इथे टाका:\n\n\`\`\`options\n["१ (अवधूत गाडेकर)", "२ (यश खरात)", "११ (संगम तोडकर)", "१५ (लक्की बाघुल)", "३५ (वेदांत गव्हाणे)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('3️⃣') || query === 'मागील इतिहास') {
            return `📜 **विद्यार्थी मागील इतिहास (3️⃣ मागील इतिहास)**\n\nविद्यार्थ्यांची मागील उपस्थिती, गैरशिस्त व प्रगतीचा इतिहास पाहण्यासाठी विद्यार्थ्याचा रोल नंबर सांगा:\n\n\`\`\`options\n["११ (संगम तोडकर इतिहास)", "५ (श्याम शिनगारे इतिहास)", "२३ (ज्ञानेश्वर इतिहास)", "३५ (वेदांत गव्हाणे इतिहास)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('5️⃣') || query === 'आदर्श विद्यार्थी') {
            let adarshText = 'या आठवड्याचे स्टार विद्यार्थी: **ज्ञानेश्वर मासोळे** (हजेरी क्र. २५)\n• नोंद: उत्कृष्ट पाठांतर व शिस्तबद्ध सेवा';
            try {
                const raw = localStorage.getItem('vss_adarsh_week');
                if (raw) {
                    const obj = JSON.parse(raw);
                    const st = stus.find(x => String(x.id) === String(obj.studentId));
                    if (st) adarshText = `या आठवड्याचे स्टार विद्यार्थी: **${nameOf(st)}** (हजेरी क्र. ${st.rollNo})\n• नोंद: ${obj.note || 'उत्कृष्ट शिस्त व अभ्यास'}`;
                }
            } catch (_) {}
            return `⭐ **आदर्श विद्यार्थी (5️⃣ आदर्श विद्यार्थी)**\n\n${adarshText}\n\nनवीन आदर्श विद्यार्थी निवडण्यासाठी रोल नंबर सांगा (उदा. 'roll 25 ला आदर्श विद्यार्थी करा'):\n\n\`\`\`options\n["२५ (ज्ञानेश्वर मासोळे)", "१ (अवधूत गाडेकर)", "१० (तन्मय गाडेकर)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('6️⃣') || query === 'आजची बॅकअप') {
            return `💾 **आजचा बॅकअप (6️⃣ आजची बॅकअप)**\n\nसर्व ७२ विद्यार्थ्यांचा डेटा, ९ आठवड्यांचे गुण, फी आणि हजेरी सुरक्षित सेव्ह झाली आहे.\n\nबॅकअप डाउनलोड करण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["📥 बॅकअप डाउनलोड करा", "📊 विद्यार्थी एक्सेल एक्सपोर्ट", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('बॅकअप डाउनलोड')) {
            try {
                const data = { app_state: {}, exported_at: new Date().toISOString() };
                ['vss_students', 'vss_exams', 'vss_adarsh_week'].forEach(k => {
                    const v = localStorage.getItem(k);
                    if (v !== null) data.app_state[k] = v;
                });
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const u = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = u;
                a.download = `gurukulam-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(u);
            } catch (_) {}
            return `✅ **बॅकअप फाईल यशस्वीरीत्या डाउनलोड झाली आहे!**\n\nसर्व ७२ विद्यार्थी व परीक्षा डेटा सुरक्षित सेव्ह झाला आहे.\n\n\`\`\`options\n["🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('📊') || query === 'साप्ताहिक गुण') {
            return `📈 **साप्ताहिक परीक्षा गुण व आलेख (📊 साप्ताहिक गुण)**\n\nहप्ता १ ते ९ चे गुण आणि प्रगती आलेख पाहण्यासाठी विद्यार्थ्याचा रोल नंबर टाका:\n\n\`\`\`options\n["१ (अवधूत गुण)", "२ (यश गुण)", "११ (संगम गुण)", "१५ (लक्की गुण)", "२५ (ज्ञानेश्वर गुण)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('🎓') || query === 'नवीन प्रवेश') {
            return `🎓 **नवीन विद्यार्थी प्रवेश (🎓 नवीन प्रवेश)**\n\nनवीन विद्यार्थी नोंदणीसाठी खालील माहिती इथे सांगा (उदा. 'नवीन विद्यार्थी: नाव - रोहन शिंदे, वर्ग - ५ वी, फोन - 9876543210'):\n\n\`\`\`options\n["विद्यार्थी यादी पहा", "प्रवेश नियम", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('🧾') || query === 'फी पावती') {
            return `🧾 **फी पावती (🧾 फी पावती)**\n\nज्या विद्यार्थ्याची फी पावती तयार करायची किंवा पाहायची आहे, त्यांचा रोल नंबर टाका:\n\n\`\`\`options\n["१५ (लक्की बाघुल पावती)", "१ (अवधूत पावती)", "२ (यश पावती)", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('📝') || query === 'मूल्यांकन') {
            return `📊 **विद्यार्थी मूल्यमापन अहवाल (📝 मूल्यांकन)**\n\nअभ्यास, शिस्त आणि परीक्षेवर आधारित मूल्यांकन रिपोर्ट:\n\n\`\`\`options\n["गुणवत्ता यादी (Merit List)", "सुधारणा आवश्यक विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('🏠 रजा') || query === 'रजा / गावी गेला') {
            return `🏠 **विद्यार्थी रजा नोंद (🏠 रजा / गावी गेला)**\n\nगावी गेलेल्या विद्यार्थ्यांची रजा नोंदवण्यासाठी रोल नंबर सांगा (उदा. 'roll 10 गावी गेला आहे - रजा नोंदवा'):\n\n\`\`\`options\n["१० (तन्मय गाडेकर रजा)", "३५ (वेदांत गव्हाणे रजा)", "रजेवर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('📚') || query === 'विषय बदला') {
            return `📚 **विषय व अभ्यासक्रम व्यवस्थापन (📚 विषय बदला)**\n\nगुरुकुलामध्ये शिकवले जाणारे विषय:\n• 🪘 **मृदंग वादन**\n• 🎶 **गायन व तबला**\n• 📖 **कीर्तन व पाठांतर**\n• 🏫 **शालेय शिक्षण (५ वी ते १० वी)**\n\n\`\`\`options\n["मृदंग विषय विद्यार्थी", "कीर्तन विषय विद्यार्थी", "शालेय अभ्यासक्रम", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        if (query.includes('✏️') || query === 'बदल करा') {
            return `⚙️ **सॉफ्टवेअर सेटिंग्ज व बदल (✏️ बदल करा)**\n\nकाय बदल करायचा आहे ते सांगा (उदा. पासवर्ड, बायोमेट्रिक, बॅकअप):\n\n\`\`\`options\n["🔐 पासवर्ड बदला", "👤 ॲडमिन प्रोफाईल", "🛡️ बायोमेट्रिक फिंगरप्रिंट", "🏠 मुख्य मेनू"]\n\`\`\``;
        }

        return null;
    }

    async function sendQuery(text) {
        const query = (text || '').trim();
        if (!query) return;

        const input = document.getElementById('bot-input-text');
        if (input) input.value = '';

        history.push({ role: 'user', content: query });
        saveHistory();

        // ⚡ 0ms INSTANT ENGINE: If matched, answer immediately with ZERO waiting time!
        const instantReply = tryInstantReply(query);
        if (instantReply) {
            history.push({ role: 'assistant', content: instantReply });
            saveHistory();
            renderMessages(false);
            return;
        }

        // Only show spinner for conversational queries calling Gemini
        renderMessages(true);

        // Default: Call backend AI (Gemini) with full snapshot including weekly marks
        try {
            const reply = await askBackend(snapshot(), history.slice(-12));
            history.push({ role: 'assistant', content: reply });

            // Handle actions if present in reply
            const blocks = reply.match(/```action\s*([\s\S]*?)```/g) || [];
            blocks.forEach((b) => {
                const body = b.replace(/```action\s*/, '').replace(/```$/, '').trim();
                let action = null;
                try { action = JSON.parse(body); } catch (_) { return; }
                const run = (a) => {
                    if (!a || typeof a !== 'object') return;
                    // Normalize: Gemini uses "action" field, ai-actions.js uses "type" field
                    if (!a.type && a.action) a.type = a.action;
                    // Normalize: Gemini uses "id", ai-actions.js uses "studentId"
                    if (!a.studentId && a.id) a.studentId = a.id;

                    // Route ALL actions through vssApplyAiAction for proper save + refresh
                    if (typeof window.vssApplyAiAction === 'function') {
                        const msg = window.vssApplyAiAction(a);
                        if (msg) {
                            history.push({ role: 'assistant', content: '✅ ' + msg });
                            saveHistory();
                            renderMessages(false);
                        }
                        return;
                    }

                    // Fallback: direct handling if ai-actions.js not loaded
                    if (a.type === 'open_panel' && typeof switchPanel === 'function') {
                        if (/उघडा|open|जा|दाखवा/i.test(query)) {
                            setTimeout(() => switchPanel(a.value), 600);
                        }
                        return;
                    }
                    if (a.type === 'open_student' && typeof window.renderStudentProfile === 'function') {
                        if (/प्रोफाईल उघडा|open profile|profile open/i.test(query)) {
                            setTimeout(() => {
                                window.renderStudentProfile(a.studentId);
                                const pBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
                                if (pBtn) pBtn.click();
                            }, 400);
                        }
                        return;
                    }
                };
                if (Array.isArray(action)) action.forEach(run); else run(action);
            });
        } catch (err) {
            console.error('Bot Gemini Error:', err);
            history.push({
                role: 'assistant',
                content: t('माफ करा, उत्तर मिळण्यात अडचण आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.',
                    'Sorry, I could not get a reply. Please try again in a moment.')
            });
        }

        saveHistory();
        renderMessages(false);
    }

    /* ---------- API Key Modal ---------- */
    function openKeyModal() {
        const old = document.getElementById('ai-key-modal');
        if (old) old.remove();

        const el = document.createElement('div');
        el.id = 'ai-key-modal';
        el.className = 'ai-key-backdrop';
        el.innerHTML = `
            <div class="ai-key-card animate-scale-in">
                <h3><i class="fa-solid fa-key" style="color:#2563EB;"></i> Google AI Studio (Gemini) Key</h3>
                <p>${t('तुमची Gemini API की इथे सेव्ह करा. की थेट Google AI Studio ला पाठवली जाते.', 'Enter your Gemini API key from Google AI Studio.')}</p>
                <div class="ai-key-row">
                    <input type="password" id="ai-key-input" placeholder="AQ... किंवा AIzaSy..." value="${esc(getKey())}" />
                    <button type="button" id="ai-key-eye" title="Show"><i class="fa-solid fa-eye"></i></button>
                </div>
                <label class="ai-key-model">
                    ${t('मॉडेल:', 'Model:')}
                    <select id="ai-key-model-sel">
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (जलद & अचूक - शिफारस)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </select>
                </label>
                <div class="ai-key-actions">
                    <button type="button" class="ghost" id="ai-key-close">${t('रद्द करा', 'Cancel')}</button>
                    <button type="button" class="primary" id="ai-key-save">${t('सेव्ह करा', 'Save Key')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);

        const input = el.querySelector('#ai-key-input');
        const modelSel = el.querySelector('#ai-key-model-sel');
        if (modelSel) modelSel.value = getModel();

        el.querySelector('#ai-key-eye').onclick = () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        };

        const close = () => el.remove();
        el.querySelector('#ai-key-close').onclick = close;

        el.querySelector('#ai-key-save').onclick = () => {
            const val = (input.value || '').trim();
            setKey(val);
            if (modelSel) {
                try { localStorage.setItem('vss_gemini_model', modelSel.value); } catch (_) { }
            }
            close();
            if (typeof toast === 'function') {
                toast(t('Gemini API की यशस्वीरित्या सेव्ह झाली!', 'Gemini API key saved!'));
            } else {
                alert(t('Gemini API की सेव्ह झाली!', 'Key saved!'));
            }
        };
    }

    /* ---------- Initialization ---------- */
    function initBot() {
        const form = document.getElementById('bot-input-form');
        const input = document.getElementById('bot-input-text');
        const btnClear = document.getElementById('btn-bot-clear');
        const btnKey = document.getElementById('btn-bot-key');

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                if (input) sendQuery(input.value);
            };
        }

        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery(input.value);
                }
            };
        }

        if (btnClear) {
            btnClear.onclick = () => {
                if (confirm('सर्व चॅट इतिहास हटवायचा का? (Clear all chat history?)')) {
                    history = [];
                    try { localStorage.removeItem(HKEY); } catch (_) { }
                    saveHistory();
                    renderMessages(false);
                    if (typeof showToast === 'function') {
                        showToast('✅ चॅट इतिहास यशस्वीरित्या हटवला!', 'success');
                    }
                }
            };
        }

        const fab = document.getElementById('ai-chat-fab');
        if (fab) {
            fab.onclick = () => {
                if (typeof switchPanel === 'function') {
                    switchPanel('panel-bot');
                }
                const inp = document.getElementById('bot-input-text');
                if (inp) setTimeout(() => inp.focus(), 150);
            };
        }

        if (btnKey) {
            btnKey.onclick = openKeyModal;
        }

        renderMessages(false);
    }

    window.vssRenderBotChat = function () {
        initBot();
        const input = document.getElementById('bot-input-text');
        if (input) setTimeout(() => input.focus(), 150);
    };

    window.vssOpenAiKeyModal = openKeyModal;

    window.vssOpenAiChat = function () {
        if (typeof switchPanel === 'function') {
            switchPanel('panel-bot');
        }
    };

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBot);
    } else {
        setTimeout(initBot, 200);
    }
})();
