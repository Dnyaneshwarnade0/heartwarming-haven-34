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
        "🧾 फी पावती",
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
   - Present their details: Name (नाव), Roll No (हजेरी क्रमांक), Class (इयत्ता), Fees, and EVERY WEEK'S EXAM MARKS (आठवडा १ ते ९ चे गुण).
   - End with action to open student profile and graph:
   \`\`\`action
   {"type":"open_student","studentId":"<id>"}
   \`\`\`
   - And provide options:
   \`\`\`options
   ["हजेरी तपासा", "फी लेजर बघा", "तक्रार नोंदवा", "दुसरा रोल नंबर शोधा"]
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


    /* उत्तर आता ॲपच्या स्वतःच्या सर्व्हरवरून (Lovable AI) येते — की लागत नाही */
    async function askBackend(contextData, chatHistory) {
        const res = await fetch('/api/public/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chatHistory
                    .filter((m) => m && typeof m.content === 'string' && m.role !== 'system')
                    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 6000) })),
                context: contextData
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.reply) {
            if (res.status === 429) throw new Error('rate_limit');
            if (res.status === 402) throw new Error('credits');
            throw new Error((data && data.error) || 'ai_error');
        }
        return data.reply;
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

    async function sendQuery(text) {
        const query = (text || '').trim();
        if (!query) return;

        const input = document.getElementById('bot-input-text');
        if (input) input.value = '';

        history.push({ role: 'user', content: query });
        saveHistory();
        renderMessages(true);

        const lower = query.toLowerCase().trim();

        // 1. Rule: Greeting or Main Menu (Telegram bot style)
        if (/^(hi|hii|hello|hey|हॅलो|हाय|नमस्कार|राम कृष्ण हरी|menu|मेनू|मुख्य मेनू|🏠 मुख्य मेनू)$/i.test(lower) || /^(hi|hii|hello)\b/i.test(lower)) {
            setTimeout(() => {
                history.push({ role: 'assistant', content: TELEGRAM_GREETING_REPLY });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
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

            m = s.match(/(?:^|\s)(\d{1,2})\s*(?:number|no|नंबर|ची|चे|चा|च्या|ला|गुण|निकाल|माहिती|chi|che|cha)/i);
            if (m) return parseInt(m[1], 10);

            return null;
        };

        const rNum = extractRollNo(query);
        const isMenuEmoji = /^[1-9]️⃣|🔟|📊|🎓|🧾|📝|🏠|📚|✏️/.test(query);
        const isWriteAction = /(?:add|करा|जमा|नोंदवा)\s*(?:complaint|fee|remark|medical|तक्रार|फी|शेरा)/i.test(query) ||
                              /(?:तक्रार|फी|शेरा|नोंद)\s*(?:करा|नोंदवा|घ्या|जमा)/i.test(query);

        // 2. Rule: Roll Number Entered -> Show ALL Student Details
        if (rNum && !isMenuEmoji && !isWriteAction) {
            if (rNum < 1 || rNum > 72) {
                const notFoundReply = `❌ हजेरी क्रमांक (Roll No.) **${rNum}** गुरुकुलाच्या विद्यार्थी यादीत उपलब्ध नाही.\n\nगुरुकुलामध्ये सध्या **१ ते ७२** हजेरी क्रमांक असलेले विद्यार्थी आहेत. कृपया १ ते ७२ मधील हजेरी क्रमांक टाका.\n\n\`\`\`options\n["१ (अवधूत गाडेकर)", "२ (यश खरात)", "११ (संगम तोडकर)", "१५ (लक्की बाघुल)", "३५ (वेदांत गव्हाणे)", "🏠 मुख्य मेनू"]\n\`\`\``;
                setTimeout(() => {
                    history.push({ role: 'assistant', content: notFoundReply });
                    saveHistory();
                    renderMessages(false);
                }, 200);
                return;
            }

            const stu = students().find((s) => Number(s.rollNo) === rNum);
            if (stu) {
                const stuNameMr = (stu.name && stu.name.mr) ? stu.name.mr : (typeof stu.name === 'string' ? stu.name : 'नाव नाही');
                const stuNameEn = (stu.name && stu.name.en) ? stu.name.en : '';

                // 1. Fees
                const fees = stu.fees || {};
                const totalFees = Number(fees.totalFees || fees.total || 35000);
                const paidFees = Number(fees.paidAmount || fees.paid || 0);
                const balance = totalFees - paidFees;
                const feeStatus = balance <= 0 ? '✅ पूर्ण भरली (NIL Due)' : `⚠️ शिल्लक ₹${balance.toLocaleString('en-IN')}`;

                // 2. Attendance
                const att = sessionStats(stu);
                const mornStr = att.morningPct != null ? `${att.morningPct}%` : 'नोंद नाही';
                const schStr = att.schoolPct != null ? `${att.schoolPct}%` : 'नोंद नाही';
                const eveStr = att.eveningPct != null ? `${att.eveningPct}%` : 'नोंद नाही';
                const ovrStr = att.overallPct != null ? `${att.overallPct}%` : 'नोंद नाही';

                // 3. Weekly Marks
                const wkMarks = getStudentWeeklyMarks(stu.id);
                const marksLines = wkMarks.length ? wkMarks.map((w) => `  • **${w.name}:** ${w.marks != null ? `**${w.marks}** / ${w.max} (${Math.round((w.marks/w.max)*100)}%)` : 'अनुपस्थित / नोंद नाही'}`).join('\n') : '  • कोणत्याही परीक्षेची नोंद नाही';
                const valid = wkMarks.filter((w) => w.marks !== null);
                const avg = valid.length ? Math.round(valid.reduce((acc, x) => acc + x.marks, 0) / valid.length) : null;
                const rating = avg != null ? (avg >= 80 ? '🌟 उत्कृष्ट (Good)' : avg >= 50 ? '👍 मध्यम (Average)' : '⚠️ सुधारणा हवी (Needs Improvement)') : 'नोंद नाही';

                // 4. Complaints
                const cmps = stu.complaints || [];
                let cmpSection = '';
                if (cmps.length === 0) {
                    cmpSection = '  • ✅ कोणतीही तक्रार किंवा गैरशिस्त नोंद नाही. शिस्त समाधानकारक आहे.';
                } else {
                    cmpSection = cmps.map((c, i) => `  ${i + 1}. 📅 **${c.date || 'तारीख नाही'}:** ${c.type || 'सामान्य'} (${c.severity || 'सामान्य'})\n     👉 **कारवाई:** ${c.action || 'नोंद नाही'}`).join('\n');
                }

                // 5. Remarks
                const rems = stu.remarks || [];
                const remSection = rems.length ? rems.map((r, i) => `  ${i + 1}. 📅 ${r.date || ''}: ${r.text || r.remark || ''}`).join('\n') : '  • कोणताही विशेष शेरा नाही.';

                // 6. Medical
                const med = stu.medical || {};
                const blood = med.bloodGroup || 'नोंद नाही';
                const illness = med.illness || med.allergies || 'निरोगी / उत्तम';

                // 7. Photo
                const photoUrl = stu.photo || stu.photoUrl || '';
                const photoMarkdown = photoUrl ? `![${stuNameMr}](${photoUrl})\n` : '';

                // Open student profile and graph in software UI
                if (typeof window.renderStudentProfile === 'function') {
                    setTimeout(() => {
                        try {
                            window.renderStudentProfile(stu.id);
                            setTimeout(() => {
                                const pBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
                                if (pBtn) pBtn.click();
                            }, 250);
                        } catch (_) {}
                    }, 150);
                }

                const studentDetailsReply = `${photoMarkdown}👤 **विद्यार्थी संपूर्ण तपशील (Roll No. ${stu.rollNo})**

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

📊 **हजेरी अहवाल (Attendance):**
• सकाळ: **${mornStr}** | शाळा: **${schStr}** | संध्याकाळ: **${eveStr}**
• **एकूण सरासरी उपस्थिती:** **${ovrStr}**

📈 **साप्ताहिक परीक्षा निकाल (हप्ता १ ते ९):**
${marksLines}
${avg != null ? `\n🎯 **एकूण सरासरी गुण:** **${avg}%** (${rating})\n` : ''}
⚠️ **तक्रारी व गैरशिस्त नोंदी (${cmps.length}):**
${cmpSection}

📝 **शिक्षकांचे शेरे (Remarks):**
${remSection}

🏥 **वैद्यकीय माहिती:**
• रक्तगट: **${blood}** | प्रकृती: **${illness}**

✅ *सॉफ्टवेअरमध्ये **${stuNameMr}** यांचे संपूर्ण प्रोफाईल व **साप्ताहिक गुणांचा आलेख (Graph)** उघडला आहे.*

\`\`\`options
["📝 ${stu.rollNo} ची तक्रार नोंदवा", "💵 ${stu.rollNo} ची फी जमा करा", "🧾 ${stu.rollNo} ची फी पावती", "दुसरा रोल नंबर शोधा", "🏠 मुख्य मेनू"]
\`\`\``;

                setTimeout(() => {
                    history.push({ role: 'assistant', content: studentDetailsReply });
                    saveHistory();
                    renderMessages(false);
                }, 200);
                return;
            }
        }

        // Telegram Bot Menu Handlers
        if (query.includes('1️⃣') || query === 'हजेरी घ्या') {
            if (typeof switchPanel === 'function') switchPanel('panel-attendance');
            const attReply = `📋 **हजेरी व्यवस्थापन (1️⃣ हजेरी घ्या)**\n\nसॉफ्टवेअरमध्ये हजेरी पॅनल उघडले आहे. खालीलपैकी सत्र निवडा किंवा आज गैरहजर असणाऱ्यांची यादी तपासा:\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: attReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('2️⃣') || query === 'विद्यार्थी माहिती') {
            if (typeof switchPanel === 'function') switchPanel('panel-students');
            const stuReply = `👥 **विद्यार्थी माहिती डिरेक्टरी (2️⃣ विद्यार्थी माहिती)**\n\nगुरुकुलातील सर्व ७२ विद्यार्थ्यांची यादी उघडली आहे. ज्या विद्यार्थ्याची संपूर्ण माहिती हवी आहे, त्यांचा **हजेरी क्रमांक (Roll No. १ ते ७२)** इथे टाका:\n\n\`\`\`options\n["१ (अवधूत गाडेकर)", "२ (यश खरात)", "११ (संगम तोडकर)", "१५ (लक्की बाघुल)", "३५ (वेदांत गव्हाणे)", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: stuReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('3️⃣') || query === 'मागील इतिहास') {
            const histReply = `📜 **विद्यार्थी मागील इतिहास (3️⃣ मागील इतिहास)**\n\nविद्यार्थ्यांची मागील उपस्थिती, गैरशिस्त व प्रगतीचा इतिहास पाहण्यासाठी विद्यार्थ्याचा रोल नंबर सांगा:\n\n\`\`\`options\n["११ (संगम तोडकर इतिहास)", "५ (श्याम शिनगारे इतिहास)", "२३ (ज्ञानेश्वर इतिहास)", "३५ (वेदांत गव्हाणे इतिहास)", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: histReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('4️⃣') || query === 'तक्रार नोंदवा') {
            const compMenuReply = `⚠️ **तक्रार व गैरशिस्त नोंदणी (4️⃣ तक्रार नोंदवा)**\n\nकोणत्या विद्यार्थ्याची तक्रार नोंदवायची आहे? रोल नंबर आणि प्रकार सांगा (उदा. 'roll 11 ची तक्रार: शाळेत मस्ती').\n\nकिंवा खालीलपैकी विद्यार्थ्याची तक्रार पहा:\n\n\`\`\`options\n["११ (संगम तोडकर तक्रारी)", "५ (श्याम शिनगारे तक्रारी)", "सर्व तक्रारींची यादी", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: compMenuReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('5️⃣') || query === 'आदर्श विद्यार्थी') {
            let adarshText = 'सध्या कोणताही आदर्श विद्यार्थी सेट केलेला नाही.';
            try {
                const raw = localStorage.getItem('vss_adarsh_week');
                if (raw) {
                    const obj = JSON.parse(raw);
                    const st = students().find(x => String(x.id) === String(obj.studentId));
                    if (st) adarshText = `या आठवड्याचे स्टार विद्यार्थी: **${nameOf(st)}** (हजेरी क्र. ${st.rollNo})\n• नोंद: ${obj.note || 'उत्कृष्ट शिस्त व अभ्यास'}`;
                }
            } catch (_) {}
            const starReply = `⭐ **आदर्श विद्यार्थी (5️⃣ आदर्श विद्यार्थी)**\n\n${adarshText}\n\nनवीन आदर्श विद्यार्थी निवडण्यासाठी रोल नंबर सांगा (उदा. 'roll 25 ला आदर्श विद्यार्थी करा'):\n\n\`\`\`options\n["२५ (ज्ञानेश्वर मासोळे)", "१ (अवधूत गाडेकर)", "१० (तन्मय गाडेकर)", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: starReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('6️⃣') || query === 'आजची बॅकअप') {
            try {
                if (typeof window.vssCloud !== 'undefined' && typeof window.vssCloud.save === 'function') window.vssCloud.save();
            } catch (_) {}
            const backupReply = `💾 **आजचा बॅकअप (6️⃣ आजची बॅकअप)**\n\nसर्व ७२ विद्यार्थ्यांचा डेटा, ९ आठवड्यांचे गुण, फी आणि हजेरी सुरक्षित सेव्ह झाली आहे.\n\nबॅकअप डाउनलोड करण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["📥 बॅकअप डाउनलोड करा", "📊 विद्यार्थी एक्सेल एक्सपोर्ट", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: backupReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('7️⃣') || query === 'फी व्यवहार') {
            const stus = students();
            let totBal = 0;
            let balCount = 0;
            stus.forEach(s => {
                const f = s.fees || {};
                const t = Number(f.totalFees || f.total || 35000);
                const p = Number(f.paidAmount || f.paid || 0);
                if (t - p > 0) { totBal += (t - p); balCount++; }
            });
            const feeReply = `💰 **फी व्यवहार व हिशोब (7️⃣ फी व्यवहार)**\n\n• एकूण विद्यार्थी: **${stus.length}**\n• फी बाकी असणारे: **${balCount} विद्यार्थी** (एकूण थकबाकी: **₹${totBal.toLocaleString('en-IN')}**)\n\nखालीलपैकी पर्याय निवडा:\n\n\`\`\`options\n["🔴 शिल्लक फी यादी", "🟢 पूर्ण फी भरलेले विद्यार्थी", "💵 नवीन फी जमा करा", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: feeReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('8️⃣') || query === 'सूचना पाठवा') {
            if (typeof switchPanel === 'function') switchPanel('panel-sms');
            const alertReply = `📢 **पालकांना सूचना पाठवा (8️⃣ सूचना पाठवा)**\n\nसॉफ्टवेअरमध्ये SMS व सूचना पॅनल उघडले आहे. पालकांना WhatsApp / SMS द्वारे सूचना पाठवण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["गैरहजर विद्यार्थ्यांच्या पालकांना SMS", "फी थकबाकी सूचना", "सामान्य गुरुकुल सूचना", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: alertReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('9️⃣') || query === 'परीक्षा गुण') {
            if (typeof switchPanel === 'function') switchPanel('panel-exam');
            const exReply = `📝 **परीक्षा गुण व्यवस्थापन (9️⃣ परीक्षा गुण)**\n\nसॉफ्टवेअरमध्ये परीक्षा विभाग उघडला आहे. साप्ताहिक परीक्षा १ ते ९ चे गुण तपासण्यासाठी किंवा भरण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["📊 साप्ताहिक गुण", "गुणवत्ता यादी (Merit List)", "नवीन परीक्षा तयार करा", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: exReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('📊') || query === 'साप्ताहिक गुण') {
            const wmReply = `📈 **साप्ताहिक परीक्षा गुण व आलेख (📊 साप्ताहिक गुण)**\n\nहप्ता १ ते ९ चे गुण आणि प्रगती आलेख (Graph) पाहण्यासाठी विद्यार्थ्याचा रोल नंबर टाका:\n\n\`\`\`options\n["१ (अवधूत गुण)", "२ (यश गुण)", "११ (संगम गुण)", "१५ (लक्की गुण)", "२५ (ज्ञानेश्वर गुण)", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: wmReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('🔟') || query === 'दैनंदिन सेवा') {
            if (typeof switchPanel === 'function') switchPanel('panel-daily-task');
            const taskReply = `⏰ **दैनंदिन सेवा व वेळापत्रक (🔟 दैनंदिन सेवा)**\n\nकाकडा, दैनंदिन पाठ, हरिपाठ व संध्या आरतीच्या कामांचे पॅनल उघडले आहे:\n\n\`\`\`options\n["🌅 सकाळची सेवा", "🌆 संध्याकाळची सेवा", "सेवा पूर्ण नोंदवा", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: taskReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('🎓') || query === 'नवीन प्रवेश') {
            if (typeof window.openAddStudentModal === 'function') {
                setTimeout(window.openAddStudentModal, 200);
            } else if (typeof switchPanel === 'function') {
                switchPanel('panel-students');
            }
            const admReply = `🎓 **नवीन विद्यार्थी प्रवेश (🎓 नवीन प्रवेश)**\n\nनवीन विद्यार्थी नोंदणी फॉर्म उघडला आहे. विद्यार्थ्याचे नाव, पालकांचा फोन, वर्ग आणि पत्ता भरून जतन करा.\n\n\`\`\`options\n["विद्यार्थी यादी पहा", "प्रवेश नियम", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: admReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('🧾') || query === 'फी पावती') {
            const rcptReply = `🧾 **फी पावती (🧾 फी पावती)**\n\nज्या विद्यार्थ्याची फी पावती तयार करायची किंवा पाहायची आहे, त्यांचा रोल नंबर टाका:\n\n\`\`\`options\n["१५ (लक्की बाघुल पावती)", "१ (अवधूत पावती)", "२ (यश पावती)", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: rcptReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('📝') || query === 'मूल्यांकन') {
            if (typeof switchPanel === 'function') switchPanel('panel-reports');
            const evalReply = `📊 **विद्यार्थी मूल्यमापन अहवाल (📝 मूल्यांकन)**\n\nअभ्यास, शिस्त आणि परीक्षेवर आधारित मूल्यांकन रिपोर्ट उघडला आहे:\n\n\`\`\`options\n["उत्कृष्ट विद्यार्थी", "सुधारणा आवश्यक विद्यार्थी", "सर्व विद्यार्थी रिपोर्ट", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: evalReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('🏠 रजा') || query === 'रजा / गावी गेला') {
            const leaveReply = `🏠 **विद्यार्थी रजा नोंद (🏠 रजा / गावी गेला)**\n\nगावी गेलेल्या विद्यार्थ्यांची रजा नोंदवण्यासाठी रोल नंबर सांगा (उदा. 'roll 10 गावी गेला आहे - रजा नोंदवा'):\n\n\`\`\`options\n["१० (तन्मय गाडेकर रजा)", "३५ (वेदांत गव्हाणे रजा)", "रजेवर असणारे विद्यार्थी", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: leaveReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('📚') || query === 'विषय बदला') {
            const subjReply = `📚 **विषय व अभ्यासक्रम व्यवस्थापन (📚 विषय बदला)**\n\nगुरुकुलामध्ये शिकवले जाणारे विषय:\n• 🪘 **मृदंग वादन**\n• 🎶 **गायन व तबला**\n• 📖 **कीर्तन व पाठांतर**\n• 🏫 **शालेय शिक्षण (५ वी ते १० वी)**\n\n\`\`\`options\n["मृदंग विषय विद्यार्थी", "कीर्तन विषय विद्यार्थी", "शालेय अभ्यासक्रम", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: subjReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        if (query.includes('✏️') || query === 'बदल करा') {
            if (typeof switchPanel === 'function') switchPanel('panel-settings');
            const setReply = `⚙️ **सॉफ्टवेअर सेटिंग्ज व बदल (✏️ बदल करा)**\n\nसेटिंग्ज पॅनल उघडले आहे. पासवर्ड, ॲडमिन प्रोफाईल किंवा बायोमेट्रिक बदलण्यासाठी पर्याय निवडा:\n\n\`\`\`options\n["🔐 पासवर्ड बदला", "👤 ॲडमिन प्रोफाईल", "🛡️ बायोमेट्रिक फिंगरप्रिंट", "🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: setReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
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
            const dlReply = `✅ **बॅकअप फाईल यशस्वीरीत्या डाउनलोड झाली आहे!**\n\nसर्व ७२ विद्यार्थी व परीक्षा डेटा सुरक्षित सेव्ह झाला आहे.\n\n\`\`\`options\n["🏠 मुख्य मेनू"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: dlReply });
                saveHistory();
                renderMessages(false);
            }, 200);
            return;
        }

        // 2. Rule: Number entered or roll number asked
        const numMatch = query.match(/^(\d{1,3})$/) || 
                         query.match(/^(?:roll|roll\s*no|हजेरी\s*क्र(?:मांक)?|क्रमांक|नंबर)\s*[:.-]?\s*(\d{1,3})$/i) ||
                         query.match(/^(\d{1,3})\s*(?:number|no|नंबर)$/i);
        if (numMatch) {
            const rollNum = parseInt(numMatch[1], 10);
            const stu = students().find((s) => Number(s.rollNo) === rollNum);

            if (!stu) {
                const notFoundReply = `❌ हजेरी क्रमांक (Roll No.) **${rollNum}** गुरुकुलाच्या विद्यार्थी यादीत उपलब्ध नाही.\n\nगुरुकुलामध्ये सध्या **१ ते ७२** हजेरी क्रमांक असलेले विद्यार्थी आहेत. कृपया १ ते ७२ मधील हजेरी क्रमांक टाका.\n\n\`\`\`options\n["विद्यार्थी यादी", "हजेरी तपासा", "फी बाकी असणारे"]\n\`\`\``;
                setTimeout(() => {
                    history.push({ role: 'assistant', content: notFoundReply });
                    saveHistory();
                    renderMessages(false);
                }, 300);
                return;
            }

            // Student found: show details + all 9 weekly marks + open graph in software
            const wkMarks = getStudentWeeklyMarks(stu.id);
            const marksLines = wkMarks.map((w) => `• ${w.name} (${w.date || 'तारीख नाही'}): **${w.marks != null ? w.marks + ' / ' + w.max : 'अनुपस्थित / नोंद नाही'}**`).join('\n');
            const valid = wkMarks.filter((w) => w.marks !== null);
            const avg = valid.length ? Math.round(valid.reduce((acc, x) => acc + x.marks, 0) / valid.length) : null;
            const rating = avg ? (avg >= 80 ? 'उत्कृष्ट (Good)' : avg >= 50 ? 'मध्यम (Average)' : 'सुधारणा हवी (Needs Improvement)') : '';

            const fees = stu.fees || {};
            const totalFees = Number(fees.totalFees || fees.total || 35000);
            const paidFees = Number(fees.paidAmount || fees.paid || 0);
            const balance = totalFees - paidFees;

            const stuName = nameOf(stu);

            // Open student profile and progress chart in software
            if (typeof window.renderStudentProfile === 'function') {
                setTimeout(() => {
                    try {
                        window.renderStudentProfile(stu.id);
                        setTimeout(() => {
                            const pBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
                            if (pBtn) pBtn.click();
                        }, 250);
                    } catch (_) { }
                }, 200);
            }

            const studentReply = `👤 **विद्यार्थी माहिती:**\n• **नाव:** ${stuName}\n• **हजेरी क्रमांक (Roll No.):** ${stu.rollNo}\n• **इयत्ता:** ${stu.standard || '५'} वी\n• **पालक फोन:** ${stu.phone || 'उपलब्ध नाही'}\n• **फी:** एकूण ₹${totalFees} | भरलेली ₹${paidFees} | शिल्लक ₹${balance}\n\n📈 **साप्ताहिक परीक्षा गुण (हप्ता १ ते ९):**\n${marksLines}\n${avg !== null ? `\n📊 **एकूण सरासरी गुण:** **${avg}%** (${rating})\n` : ''}\n✅ *सॉफ्टवेअरमध्ये ${stuName} यांचे प्रोफाईल आणि **साप्ताहिक गुणांचा आलेख (Graph)** उघडला आहे.*\n\n\`\`\`options\n["हजेरी तपासा", "फी लेजर बघा", "तक्रार नोंदवा", "दुसरा रोल नंबर शोधा"]\n\`\`\``;

            setTimeout(() => {
                history.push({ role: 'assistant', content: studentReply });
                saveHistory();
                renderMessages(false);
            }, 300);
            return;
        }

        // 3. Rule: Complaint / गैरशिस्त / नियमभंग query
        const isComplaintQuery = /complaint|तक्रार|गैरशिस्त|नियमभंग|मस्ती/i.test(lower);
        if (isComplaintQuery) {
            const allStus = students();
            const matchedStu = allStus.find(s => {
                const mr = (s.name && s.name.mr) ? s.name.mr.toLowerCase() : (typeof s.name === 'string' ? s.name.toLowerCase() : '');
                const en = (s.name && s.name.en) ? s.name.en.toLowerCase() : '';
                const parts = (mr + ' ' + en).split(/\s+/).filter(Boolean);
                return parts.some(p => p.length >= 3 && lower.includes(p));
            });

            if (matchedStu) {
                const sName = nameOf(matchedStu);
                const cmps = matchedStu.complaints || [];
                let cmpReply = '';
                if (cmps.length === 0) {
                    cmpReply = `👤 **विद्यार्थी:** ${sName} (हजेरी क्र. ${matchedStu.rollNo})\n\n✅ **तक्रारी:** या विद्यार्थ्याच्या नावावर सध्या कोणतीही तक्रार नोंदवलेली नाही. शिस्त समाधानकारक आहे.`;
                } else {
                    const list = cmps.map((c, i) => `${i + 1}. 📅 **तारीख:** ${c.date || 'नोंद नाही'} | **प्रकार:** ${c.type || 'सामान्य'} | **तीव्रता:** ${c.severity || 'सामान्य'}\n   👉 **कारवाई/कृती:** ${c.action || 'कोणतीही नोंद नाही'}`).join('\n\n');
                    cmpReply = `⚠️ **अंकुश महाराज, ${sName} (हजेरी क्र. ${matchedStu.rollNo}) यांच्या नोंदवलेल्या तक्रारी (${cmps.length}):**\n\n${list}\n\n✅ *सॉफ्टवेअरमध्ये विद्यार्थ्याचे प्रोफाईल व गैरशिस्त नोंद पॅनल उघडले आहे.*`;
                }

                if (typeof window.renderStudentProfile === 'function') {
                    setTimeout(() => {
                        try {
                            window.renderStudentProfile(matchedStu.id);
                            setTimeout(() => {
                                const tBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-incident"]');
                                if (tBtn) tBtn.click();
                            }, 250);
                        } catch (_) { }
                    }, 200);
                }

                cmpReply += `\n\n\`\`\`options\n["साप्ताहिक परीक्षा निकाल", "हजेरी तपासा", "फी बाकी असणारे", "विद्यार्थी यादी"]\n\`\`\``;

                setTimeout(() => {
                    history.push({ role: 'assistant', content: cmpReply });
                    saveHistory();
                    renderMessages(false);
                }, 300);
                return;
            }
        }

        // 4. Rule: Hajery / Attendance quick menu
        if (lower === 'हजेरी' || lower === 'हजेरी (attendance)' || lower === 'attendance' || lower === 'hajery') {
            const attReply = `📋 **हजेरी व्यवस्थापन**\n\nहजेरीबद्दल तुम्हाला कोणती माहिती हवी आहे? खालीलपैकी एक सत्र किंवा पर्याय निवडा:\n\n\`\`\`options\n["सकाळची हजेरी (Morning)", "शाळेची हजेरी (School)", "संध्याकाळची हजेरी (Evening)", "आज गैरहजर असणारे विद्यार्थी"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: attReply });
                saveHistory();
                renderMessages(false);
            }, 300);
            return;
        }

        // 4. Rule: Student Info menu
        if (query.includes('विद्यार्थी माहिती व गुण') || query === 'विद्यार्थी यादी') {
            const listReply = `👥 **विद्यार्थी माहिती व साप्ताहिक गुण**\n\nतुम्हाला ज्या विद्यार्थ्याची माहिती व ९ आठवड्यांचे गुण पाहायचे आहेत, त्यांचा **हजेरी क्रमांक (Roll No. १ ते ७२)** इथे टाका:\n\n\`\`\`options\n["१ (अवधूत)", "२ (यश)", "१० (तन्मय)", "३५ (वेदांत)"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: listReply });
                saveHistory();
                renderMessages(false);
            }, 300);
            return;
        }

        // 5. Rule: Fees menu
        if (query.includes('फी व्यवहार') || query === 'फी') {
            const feeReply = `💰 **फी व्यवस्थापन**\n\nफी संबंधी खालीलपैकी कोणती माहिती हवी आहे?\n\n\`\`\`options\n["फी बाकी असणारे विद्यार्थी", "पूर्ण फी भरलेले विद्यार्थी", "फी लेजर"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: feeReply });
                saveHistory();
                renderMessages(false);
            }, 300);
            return;
        }

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
                        setTimeout(() => switchPanel(a.value), 600);
                        return;
                    }
                    if (a.type === 'open_student' && typeof window.renderStudentProfile === 'function') {
                        setTimeout(() => {
                            window.renderStudentProfile(a.studentId);
                            const pBtn = document.querySelector('#panel-student-profile .profile-tabs-card .profile-tab-btn[data-tab="tab-progress"]');
                            if (pBtn) pBtn.click();
                        }, 400);
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
                if (confirm(t('सर्व चॅट इतिहास हटवायचा का?', 'Clear all chat history?'))) {
                    history = [];
                    saveHistory();
                    renderMessages(false);
                }
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
