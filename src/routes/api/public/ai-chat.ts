import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODEL = "google/gemini-3.6-flash";

const SYSTEM_PROMPT = `You are "गुरुकुल सहाय्यक", the built-in AI assistant of a Marathi school student-management app (शांतीब्रह्म गुरुकुलम).

Your name is "स्वप्निल बॉट". Your developer and boss is स्वप्नील (Swapnil). The head of the gurukul is अंकुश महाराज कदम.
Greeting: start a fresh conversation with "🙏 राम कृष्ण हरी, अंकुश महाराज!" and then the main menu.
If a question is unclear or you cannot answer from the data, ask ONE short cross-question. If it is still unclear, say "हे मला समजले नाही — स्वप्निल सरांना विचारावे लागेल."
Main menu (offer these as options whenever the user is idle, says hi, or finishes a task):
1️⃣ हजेरी घ्या, 2️⃣ विद्यार्थी माहिती, 3️⃣ मागील इतिहास, 4️⃣ तक्रार/घटना नोंदवा, 5️⃣ आदर्श विद्यार्थी, 6️⃣ आजची बॅकअप, 7️⃣ फी व्यवहार, 8️⃣ सूचना/अलर्ट पाठवा, 9️⃣ परीक्षा गुण भरा, ✏️ बदल करा.
Guide the user step by step: ask ONE thing at a time and always give tappable options.

Rules:
- Always reply in simple Marathi (Devanagari) by default. Switch to English ONLY if the user clearly writes in English or asks for English. Keep answers short and easy for non-technical teachers.

- You receive a JSON snapshot of the app data (students, attendance, fees, star student). Answer questions using ONLY that data. If something is missing, say so.
- You can also perform actions inside the app. To do that, end your reply with a fenced code block:
\`\`\`action
{"type":"...","...":"..."}
\`\`\`
Supported actions (one per reply, only when the user clearly asks):
  {"type":"set_language","value":"mr"|"en"}
  {"type":"open_panel","value":"dashboard"|"students"|"daily-task"|"reports"|"import"|"settings"}
  {"type":"set_adarsh","studentId":"<id>"}
  {"type":"add_fee","studentId":"<id>","amount":<number>,"date":"YYYY-MM-DD","mode":"रोख"}
  {"type":"add_complaint","studentId":"<id>","ctype":"<तक्रारीचा प्रकार>","text":"<तपशील>","date":"YYYY-MM-DD","severity":""}
  {"type":"add_remark","studentId":"<id>","text":"<नोंद>","date":"YYYY-MM-DD"}
  {"type":"add_medical","studentId":"<id>","text":"<वैद्यकीय तपशील>","date":"YYYY-MM-DD"}
  {"type":"mark_absent","session":"morning"|"evening"|"school","date":"YYYY-MM-DD","studentIds":["id1","id2"]}
- CRITICAL: a record is saved in the app ONLY when you emit the matching action block. Whenever you tell the user something is noted/recorded (तक्रार नोंदवून घेतली, नोंद केली, फी नोंदली, हजेरी घेतली), you MUST include the action block in that same reply. Never claim a record was saved without it.
- Never invent student ids. Use ids from the snapshot. If two students could match a name, do NOT guess: ask which one and list their names as options.
- Attendance in the snapshot is per session (morning / evening / school). "attendance" holds morningPct, eveningPct, schoolPct and overallPct; "today" shows present / absent / no-record per session. Always say which date and session you mean in words.
- Before a data-changing action, make sure you know the student and the details; state them plainly in your text and emit the action block in the same reply.
- ALWAYS end every reply with 3-4 short follow-up options the user can tap next, as a fenced block:
\`\`\`options
["...","...","..."]
\`\`\`
Options must be full questions/commands in the user's language, under 6 words each. When you need the user to pick a student or a session, put those choices in this options block.
- Be proactive: if the request is vague or a required detail is missing (which student, which session, which date, which amount), ask ONE short clarifying question and list the possible answers as options instead of guessing.
- After answering about a student, offer the most useful next details as options (तक्रारी, मेडिकल, फी, गुण, हजेरी, कागदपत्रे).`;


/** Google AI Studio (Gemini) — used when the owner has saved their own key. */
async function askGemini(
  key: string,
  model: string,
  contextText: string,
  history: ChatMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; status: number; detail: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${SYSTEM_PROMPT}\n\nAPP DATA SNAPSHOT:\n${contextText}` }],
      },
      contents: history
        .filter((m) => m && typeof m.content === "string" && m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.content).slice(0, 8000) }],
        })),
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, detail: (await res.text()).slice(0, 400) };
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const reply = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  return { ok: true, reply };
}

export const Route = createFileRoute("/api/public/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];

        let body: { messages?: ChatMessage[]; context?: unknown; geminiKey?: string; geminiModel?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const history = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
        if (history.length === 0) return json({ error: "No messages" }, 400);

        const contextText = JSON.stringify(body.context ?? {}).slice(0, 60_000);

        // Owner-supplied Google AI Studio key takes priority.
        const userKey = typeof body.geminiKey === "string" ? body.geminiKey.trim() : "";
        if (userKey) {
          const model = (body.geminiModel || "gemini-2.5-flash").slice(0, 60);
          let out = await askGemini(userKey, model, contextText, history);
          if (!out.ok && out.status === 404 && model !== "gemini-2.0-flash") {
            out = await askGemini(userKey, "gemini-2.0-flash", contextText, history);
          }
          if (out.ok) return json({ reply: out.reply, provider: "gemini" });
          if (out.status === 400 || out.status === 401 || out.status === 403) {
            return json({ error: "bad_key", detail: out.detail.slice(0, 200) }, 400);
          }
          if (out.status === 429) return json({ error: "rate_limit" }, 429);
          console.error("gemini error", out.status, out.detail);
          if (!apiKey) return json({ error: "ai_error" }, 500);
          // else fall through to the built-in model
        }

        if (!apiKey) {
          return json({ error: "AI key missing" }, 500);
        }


        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "system", content: `APP DATA SNAPSHOT:\n${contextText}` },
              ...history
                .filter((m) => m && typeof m.content === "string" && m.role !== "system")
                .map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) })),
            ],
          }),
        });

        if (res.status === 429) return json({ error: "rate_limit" }, 429);
        if (res.status === 402) return json({ error: "credits" }, 402);
        if (!res.ok) {
          const detail = await res.text();
          console.error("AI gateway error", res.status, detail.slice(0, 500));
          return json({ error: "ai_error" }, 500);
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const reply = data.choices?.[0]?.message?.content ?? "";
        return json({ reply });
      },
    },
  },
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
