import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'vss-students-backup.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JFHBwrC_cd_QB3NYZZjaPefD4CR-cIBMYahIYViDGqtA';
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite'
];
const queryCache = new Map();

const SYSTEM_PROMPT = `You are "गुरुकुल सहाय्यक", the built-in AI assistant of a Marathi school student-management app (शांतीब्रह्म गुरुकुलम - श्री क्षेत्र राक्षसभुवन).
Your name is "स्वप्निल बॉट". The administrator and head of the gurukul is "अंकुश महाराज".

RULES & BEHAVIOR:
1. Always address the user as "अंकुश महाराज" with highest respect and reply in simple, respectful Marathi (Devanagari).
2. When the user says "hi", "hii", "hello", "नमस्कार" or initiates a greeting, respond with:
   "🙏 राम कृष्ण हरी, अंकुश महाराज!\n\nखाली पर्याय निवडा — काहीही टाइप करायची गरज नाही."
   and provide the Telegram bot menu options using an options block:
   \`\`\`options
   1️⃣ हजेरी घ्या
   2️⃣ विद्यार्थी माहिती
   3️⃣ मागील इतिहास
   4️⃣ तक्रार नोंदवा
   5️⃣ आदर्श विद्यार्थी
   6️⃣ आजची बॅकअप
   7️⃣ फी व्यवहार
   8️⃣ सूचना पाठवा
   9️⃣ परीक्षा गुण
   📊 साप्ताहिक गुण
   🔟 दैनंदिन सेवा
   🎓 नवीन प्रवेश
   📝 मूल्यांकन
   🏠 रजा / गावी गेला
   📚 विषय बदला
   ✏️ बदल करा
   \`\`\`
3. COMPREHENSIVE STUDENT DATA ACCESS:
   - You have 100% full, unrestricted access to EVERY student's data in the Gurukul (all 72 students):
     • Name (mr & en), Roll number (1-72), Class/Standard, Section
     • Parents, Phone numbers, Emergency contacts, Addresses
     • Complaints (तक्रारी): Date (तारीख), Type (प्रकार), Severity (तीव्रता), Action taken (कारवाई / कृती)
     • Remarks (शेरे / नोंदी): Date, text, author
     • Medical details (रक्तगट, ऍलर्जी, आजार, डॉक्टरांच्या नोंदी)
     • Documents status (Aadhaar, LC, Marksheet, Photo)
     • Fees (एकूण फी, भरलेली फी, शिल्लक फी)
     • Weekly exam marks (Weeks 1 to 9) and average
   - NEVER say "माझ्याकडे तक्रारीची माहिती उपलब्ध नाही" or "माझ्याकडे फक्त हजेरी, गुण आणि फीची माहिती असते". You possess the complete, full student database!
   - When asked about any student's complaint:
     • Look up that student immediately in the database.
     • List all recorded complaints with date, type, severity, and action taken.
     • If a student has no complaints, say: "या विद्यार्थ्याच्या नावावर सध्या कोणतीही तक्रार नोंदवलेली नाही."
     • Trigger action command to open their profile:
       \`\`\`action
       {"type": "open_student", "studentId": "<studentId>"}
       \`\`\`
4. ROLL NUMBER DETECTION (1 to 72):
   - If user enters a number between 1 and 72, immediately identify the student with that roll number.
   - Display their name, details, pending fees, and Weekly Exam Marks.
   - For Attendance: If today's attendance has NOT been recorded (todayAttendanceRecorded is false), DO NOT show any attendance percentage or report. State clearly: "📅 आजची हजेरी: ⚠️ आजची हजेरी घेतलेली नाही (Not Taken)". NEVER invent or show morning/school/evening attendance percentages!
5. INVALID ROLL NUMBER:
   - If user enters a number outside 1-72, inform:
     "हा हजेरी क्रमांक (Roll Number) गुरुकुलातील विद्यार्थ्यांशी जुळत नाही. कृपया १ ते ७२ मधील हजेरी क्रमांक टाका."
6. CLARITY & CROSS-QUESTIONS:
   - If user's intent is clear, give direct, specific, accurate answers immediately from the app snapshot.
   - If user's intent is ambiguous or not clear, ask polite cross-questions to discover what they need.
7. ATTENDANCE & CONTEXTUAL MENUS:
   - If today's attendance has not been recorded, you MUST state clearly: "⚠️ आजची हजेरी अद्याप घेतलेली नाही." Do not show attendance as present or marked.
8. INTERACTIVE BUTTONS:
   - Always put suggested follow-up choices inside a \`\`\`options block (one per line) so user can tap them.

9. ★★★ DATA WRITE / SAVE CAPABILITIES ★★★
   You can SAVE data directly into the software! When the user asks you to add/record/save any data, you MUST output an action block with the correct JSON format. The software will automatically save it to the student database and show a confirmation toast.

   IMPORTANT: The "type" field determines what action is performed. Always use the exact field names shown below.

   A) ADD COMPLAINT (तक्रार नोंदवा):
      When user says "तक्रार नोंदवा", "complaint add करा", "शिस्तभंग नोंदवा", etc.:
      - Ask which student (name or roll number) if not specified
      - Ask the complaint type (शाळेत मस्ती, वसतिगृह नियमभंग, अस्वच्छता, अभ्यास न करणे, मारामारी, इतर) if not specified
      - Ask severity (सौम्य/सामान्य/गंभीर) if not specified
      - Ask action taken / what happened (कारवाई) if not specified
      - Once you have all details, output:
      \`\`\`action
      {"type": "add_complaint", "studentId": "<studentId>", "ctype": "शाळेत मस्ती", "severity": "गंभीर", "text": "शिक्षकांना उत्तर दिले", "date": "2026-09-19"}
      \`\`\`
      Then confirm: "✅ तक्रार यशस्वीरीत्या सॉफ्टवेअरमध्ये सेव्ह झाली!"

   B) ADD REMARK / NOTE (शेरा / नोंद):
      When user says "नोंद करा", "remark add करा", "शेरा लिहा":
      \`\`\`action
      {"type": "add_remark", "studentId": "<studentId>", "text": "अभ्यासात सुधारणा दिसत आहे", "by": "अंकुश महाराज", "date": "2026-09-19"}
      \`\`\`

   C) ADD FEE PAYMENT (फी भरणा):
      When user says "फी जमा करा", "fee pay", "₹5000 भरले":
      \`\`\`action
      {"type": "add_fee", "studentId": "<studentId>", "amount": 5000, "mode": "रोख", "date": "2026-09-19"}
      \`\`\`

   D) ADD MEDICAL NOTE (वैद्यकीय नोंद):
      \`\`\`action
      {"type": "add_medical", "studentId": "<studentId>", "text": "ताप आल्यामुळे विश्रांती", "date": "2026-09-19"}
      \`\`\`

   E) SET STAR STUDENT (आदर्श विद्यार्थी):
      \`\`\`action
      {"type": "set_adarsh", "studentId": "<studentId>", "note": "सर्वोत्कृष्ट शिस्त आणि अभ्यास"}
      \`\`\`

   F) MARK ATTENDANCE (हजेरी नोंदवा):
      \`\`\`action
      {"type": "mark_absent", "session": "morning", "rollNos": [5, 12, 23], "date": "2026-09-19"}
      \`\`\`

   CRITICAL RULES FOR SAVING DATA:
   - ALWAYS gather ALL required information BEFORE outputting the action block.
   - If any detail is missing, ask a cross-question first. Do NOT output incomplete action blocks.
   - After saving, confirm to the user that the data is saved in the software.
   - Use the student's actual "id" field (like "stud-101", "stud-115") from the database, NOT their roll number, for the "studentId" field.
   - Today's date is available in the data snapshot. Use ISO format (YYYY-MM-DD).
   - You can combine reading + writing: e.g., show existing complaints AND add a new one.`;


const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getBackupData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  return { app_state: {}, exported_at: new Date().toISOString() };
}

function saveBackupData(newData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 1), 'utf-8');
    if (newData.app_state) {
      const seedPath = path.join(PUBLIC_DIR, 'app', 'state-seed.js');
      const seedContent = '/* संपूर्ण ॲप स्नॅपशॉट — विद्यार्थी, हजेरी, परीक्षा, सुट्ट्या */\nwindow.VSS_STATE_SEED = ' +
        JSON.stringify(newData.app_state) + ';\n';
      fs.writeFileSync(seedPath, seedContent, 'utf-8');
    }
    return true;
  } catch (err) {
    console.error('Error saving data file:', err);
    return false;
  }
}

function buildFullGurukulContext(clientContext) {
  const backup = getBackupData();
  const appState = backup.app_state || {};
  let students = [];
  try {
    const raw = appState.vss_students;
    students = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch (_) {}

  let exams = [];
  try {
    const raw = appState.vss_exams;
    exams = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch (_) {}

  const weeklyExams = (exams || []).filter(e => String(e && e.id || '').startsWith('wk-')).sort((a, b) => {
    const na = parseInt(String(a.id).replace('wk-', ''), 10) || 0;
    const nb = parseInt(String(b.id).replace('wk-', ''), 10) || 0;
    return na - nb;
  });

  const compactList = students.map(s => {
    const fees = s.fees || {};
    const totalFees = Number(fees.totalFees || fees.total || 35000);
    const paidFees = Number(fees.paidAmount || fees.paid || 0);
    const bal = totalFees - paidFees;

    const wk = weeklyExams.map(e => {
      const entry = (e.entries && e.entries[s.id]) || {};
      return entry.marks != null ? entry.marks : (entry.mark != null ? entry.mark : null);
    });

    const obj = {
      id: s.id,
      rollNo: s.rollNo,
      name: s.name?.mr || s.name,
      standard: s.standard || '5',
      phone: s.phone || '',
      parent: s.parentName || '',
      address: s.address || '',
      totalFees: totalFees,
      paidFees: paidFees,
      feeBalance: bal,
      weeklyMarks: wk
    };
    if (s.complaints && s.complaints.length) {
      obj.complaints = s.complaints.map(c => ({
        date: c.date || '',
        type: c.type || '',
        severity: c.severity || 'सामान्य',
        action: c.action || ''
      }));
    }
    if (s.remarks && s.remarks.length) {
      obj.remarks = s.remarks;
    }
    return obj;
  });

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayTaken = students.some(s => {
    const da = s.dailyAttendance && s.dailyAttendance[todayKey];
    return da && (da.morning !== undefined || da.school !== undefined || da.evening !== undefined);
  });

  return {
    todayDate: todayKey,
    todayAttendanceRecorded: todayTaken,
    totalStudents: compactList.length,
    students: compactList
  };
}

async function callGemini(messages, context, key, modelName) {
  const apiKey = key || GEMINI_API_KEY;
  const preferredModel = modelName || DEFAULT_MODEL;
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];

  const fullData = buildFullGurukulContext(context);
  const contextStr = JSON.stringify(fullData, null, 1);
  const sysText = `${SYSTEM_PROMPT}\n\nCOMPLETE GURUKUL DATA SNAPSHOT (सर्व ७२ विद्यार्थ्यांची सर्व माहिती - हजेरी, गुण, फी, तक्रारी, पत्ते, पालक):\n${contextStr}`;

  const contents = (messages || [])
    .filter(m => m && typeof m.content === 'string' && m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content).slice(0, 8000) }]
    }));

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'नमस्ते' }] });
  }

  const payload = {
    systemInstruction: {
      parts: [{ text: sysText }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000
    }
  };

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3500)
      });

      if (resp.ok) {
        const data = await resp.json();
        const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
        if (reply) return reply;
      } else {
        const errText = await resp.text();
        console.warn(`[Gemini Fallback] Model ${model} returned ${resp.status}: ${errText.slice(0, 100)}`);
        lastError = new Error(`Gemini ${model} (${resp.status}): ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini Fallback] Model ${model} error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Root redirect
  if (pathname === '/' || pathname === '') {
    res.writeHead(302, { Location: '/app/index.html' });
    res.end();
    return;
  }

  // Handle AI Chat
  if (pathname === '/api/public/ai-chat' || pathname === '/api/ai/chat') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', async () => {
        try {
          const body = bodyStr ? JSON.parse(bodyStr) : {};
          const key = body.geminiKey || GEMINI_API_KEY;
          const model = body.geminiModel || DEFAULT_MODEL;

          // Fast cache check:
          const lastMsg = (body.messages && body.messages.length) ? body.messages[body.messages.length - 1].content : '';
          const cacheKey = String(lastMsg || '').trim().toLowerCase();
          if (cacheKey && queryCache.has(cacheKey)) {
            const cached = queryCache.get(cacheKey);
            if (Date.now() - cached.time < 300000) { // 5 min TTL
              res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, reply: cached.reply, cached: true }));
              return;
            }
          }

          const reply = await callGemini(body.messages, body.context, key, model);

          if (cacheKey && reply) {
            queryCache.set(cacheKey, { reply, time: Date.now() });
          }

          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true, reply: reply }));
        } catch (err) {
          console.error('AI chat endpoint error:', err);
          res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: String(err.message || err) }));
        }
      });
      return;
    }
  }

  // Handle API State
  if (pathname === '/api/public/app/state') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (req.method === 'GET') {
      const current = getBackupData();
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        data: current.app_state || {},
        updated_at: current.exported_at || new Date().toISOString()
      }));
      return;
    }

    if (req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', () => {
        try {
          const body = bodyStr ? JSON.parse(bodyStr) : {};
          const current = getBackupData();

          if (body.action === 'save') {
            const updatedAt = new Date().toISOString();
            current.app_state = {
              ...(current.app_state || {}),
              ...(body.data || {})
            };
            current.exported_at = updatedAt;
            saveBackupData(current);

            res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, updated_at: updatedAt }));
            return;
          }

          // Default: load
          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            ok: true,
            data: current.app_state || {},
            updated_at: current.exported_at || new Date().toISOString()
          }));
        } catch (err) {
          res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'invalid_request', message: String(err) }));
        }
      });
      return;
    }
  }

  // Static File Serving
  let relativePath = pathname;
  if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
  let filePath = path.join(PUBLIC_DIR, relativePath);

  // If path is a directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback check inside public/app if requested without /app prefix
  if (!fs.existsSync(filePath)) {
    const appAltPath = path.join(PUBLIC_DIR, 'app', relativePath);
    if (fs.existsSync(appAltPath) && !fs.statSync(appAltPath).isDirectory()) {
      filePath = appAltPath;
    }
  }

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${pathname}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`[VSS-SERVER] Server running at http://localhost:${PORT}/app/index.html`);
  console.log(`[VSS-SERVER] Network access: http://10.44.196.216:${PORT}/app/index.html`);
  console.log(`[VSS-SERVER] AI Chat active with Gemini API!`);
  console.log(`====================================================`);
});