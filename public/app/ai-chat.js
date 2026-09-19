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
    const DEFAULT_MODEL = 'gemini-2.5-flash';

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
        out = esc(out);
        out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        out = out.replace(/\*(.+?)\*/g, '<i>$1</i>');
        out = out.replace(/\n/g, '<br>');
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
                <div style="text-align: center; color: #64748B; padding: 40px 16px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: #EFF6FF; color: #2563EB; font-size: 1.8rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <h4 style="color: #1B3A6B; margin: 0 0 6px; font-weight: 700;">${t('🙏 राम कृष्ण हरी!', 'Welcome!')}</h4>
                    <p style="margin: 0; font-size: 0.9rem;">${t('मी तुमचा गुरुकुल AI सहाय्यक आहे. "hii" टाईप करून मेनू पाहा किंवा विद्यार्थ्याचा रोल नंबर टाका.', 'I am your Gurukulam AI Assistant. Type "hii" to see menu or enter student roll number.')}</p>
                </div>
            `;
            renderOptionsChips([]);
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

        // 1. Rule: Greeting ("hii", "hi", "hello", "नमस्कार")
        if (/^(hi|hii|hello|hey|हॅलो|हाय|नमस्कार|राम कृष्ण हरी)$/i.test(lower) || /^(hi|hii|hello)\b/i.test(lower)) {
            const greetingReply = `🙏 राम कृष्ण हरी अंकुश महाराज! मी कशा प्रकारे तुमची मदत करू शकतो?\n\n\`\`\`options\n["हजेरी (Attendance)", "विद्यार्थी माहिती व गुण", "फी व्यवहार (Fees)", "तक्रार नोंदवा"]\n\`\`\``;
            setTimeout(() => {
                history.push({ role: 'assistant', content: greetingReply });
                saveHistory();
                renderMessages(false);
            }, 300);
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
