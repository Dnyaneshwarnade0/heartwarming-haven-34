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
    const DEFAULT_KEY = 'AQ.Ab8RN6J7nM5GNvxRhS2TzH3Q50Uocviqkpe3fMVa1OMqfWxQ_Q';
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

    function snapshot() {
        const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        const list = students().map((s) => {
            const fees = s.fees || {};
            const total = Number(fees.totalFees || 0);
            const paid = Number(fees.paidAmount || 0);
            const todayAtt = (s.dailyAttendance && s.dailyAttendance[today]) || {};
            return {
                id: s.id,
                rollNo: s.rollNo,
                name: nameOf(s),
                standard: s.standard,
                section: s.section,
                phone: s.phone,
                parentName: s.parentName,
                fees: { total, paid, balance: total - paid, status: fees.status || 'Pending' },
                today: {
                    morning: todayAtt.morning ? 'Present' : (todayAtt.morning === false ? 'Absent' : 'Not marked'),
                    evening: todayAtt.evening ? 'Present' : (todayAtt.evening === false ? 'Absent' : 'Not marked'),
                    school: todayAtt.school ? 'Present' : (todayAtt.school === false ? 'Absent' : 'Not marked')
                },
                stats: sessionStats(s)
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

    const SYSTEM_PROMPT = `You are "गुरुकुल सहाय्यक" (Gurukulam Assistant), the built-in AI assistant for a Marathi Gurukul school management app (शांतीब्रह्म गुरुकुलम्).

Rules:
1. Greet the user respectfully with "🙏 राम कृष्ण हरी!" when starting.
2. Reply in simple, polite Marathi by default (or English if the user asks in English).
3. You have access to the app data snapshot (students, roll numbers, attendance, fees, star student). Use ONLY this data to answer accurately.
4. Keep answers clean, well-formatted, and concise with bullet points.
5. If the user wants to take action in the app (like opening a panel, marking attendance, or exporting), you can suggest actions at the end:
\`\`\`action
{"type":"open_panel","value":"students"|"dashboard"}
\`\`\`
6. You can also suggest 2-4 quick follow-up options:
\`\`\`options
["हजेरी बघा", "फी बाकी", "विद्यार्थी यादी"]
\`\`\`
`;

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
                    <p style="margin: 0; font-size: 0.9rem;">${t('मी तुमचा गुरुकुल AI सहाय्यक आहे. हजेरी, विद्यार्थी माहिती किंवा फी संबंधी काहीही विचारा.', 'I am your Gurukulam AI Assistant. Ask about attendance, students, fees or tasks.')}</p>
                </div>
            `;
            renderChips();
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
        renderChips();
    }

    const DEFAULT_CHIPS = [
        '📊 आजची हजेरी काय आहे?',
        '❌ कोण गैरहजर आहे?',
        '💰 फी बाकी असणारे विद्यार्थी',
        '⭐ आदर्श विद्यार्थी कोण?',
        '👥 एकूण विद्यार्थी किती?'
    ];

    function renderChips() {
        const chipsCont = document.getElementById('bot-quick-chips');
        if (!chipsCont) return;

        chipsCont.innerHTML = DEFAULT_CHIPS.map((c) => {
            return `<button type="button" class="btn-bot-chip" data-q="${esc(c)}">${esc(c)}</button>`;
        }).join('');

        chipsCont.querySelectorAll('.btn-bot-chip').forEach((btn) => {
            btn.onclick = () => {
                const q = btn.getAttribute('data-q');
                if (q) sendQuery(q);
            };
        });
    }

    async function sendQuery(text) {
        const query = (text || '').trim();
        if (!query) return;

        const input = document.getElementById('bot-input-text');
        if (input) input.value = '';

        history.push({ role: 'user', content: query });
        saveHistory();
        renderMessages(true);

        try {
            const reply = await askBackend(snapshot(), history.slice(-12));
            history.push({ role: 'assistant', content: reply });

            // Handle actions if present in reply — तक्रार/नोंद खरोखर ॲपमध्ये सेव्ह होते
            const blocks = reply.match(/```action\s*([\s\S]*?)```/g) || [];
            blocks.forEach((b) => {
                const body = b.replace(/```action\s*/, '').replace(/```$/, '').trim();
                let action = null;
                try { action = JSON.parse(body); } catch (_) { return; }
                const run = (a) => {
                    if (!a || typeof a !== 'object') return;
                    if (a.type === 'open_panel' && typeof switchPanel === 'function') {
                        setTimeout(() => switchPanel(a.value), 600);
                        return;
                    }
                    if (typeof window.vssApplyAiAction === 'function') {
                        const msg = window.vssApplyAiAction(a);
                        if (msg) {
                            history.push({ role: 'assistant', content: '✅ ' + msg });
                            saveHistory();
                            renderMessages(false);
                        }
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
