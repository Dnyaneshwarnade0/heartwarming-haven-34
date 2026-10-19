import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const RequestSchema = z.object({
  message: z.string().min(1).max(10000),
  context: z.string().max(100000).optional(),
  apiKey: z.string().optional(),
  workspaceId: z.string().optional(),
  provider: z.enum(["gemini", "claude"]).optional(),
});

export const Route = createFileRoute("/api/public/app/claude")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try {
          body = RequestSchema.parse(await request.json());
        } catch (err: any) {
          return Response.json({ ok: false, error: "bad_request", details: err?.message }, { status: 400 });
        }

        const systemPrompt = `तुम्ही "शांतिब्रह्म गुरुकुलम" (वारकरी शिक्षण संस्था) चे गुरुवर्य AI सहाय्यक आहात.
तुम्ही मराठी आणि इंग्रजीत उत्तर द्या.
गुरुकुल व्यवस्थापन, विद्यार्थ्यांची माहिती, हजेरी, तक्रारी, फी, दैनिक कार्य, आणि संस्कार याबद्दल अत्यंत आदरयुक्त, अचूक आणि विनयपूर्वक मार्गदर्शन करा.
जर वापरकर्त्याने विद्यार्थ्याबद्दल काही विचारले, तर दिलेल्या डेटाचा संदर्भ घेऊन उत्तर द्या.
प्रत्येक उत्तरात आध्यात्मिक, नम्र आणि आपुलकीची भावना ठेवावी (उदा. "हरि ॐ!", "जय हरी!").

सध्याचा डेटा संदर्भ:
${body.context || "कोणताही संदर्भ उपलब्ध नाही."}`;

        // 1. Try Gemini 3.8 Flash (Active & Free)
        const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
        const prefersClaude = body.provider === "claude";

        if (geminiKey && !prefersClaude) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;
            const gRes = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemPrompt }]
                },
                contents: [
                  {
                    parts: [{ text: body.message }]
                  }
                ]
              })
            });

            const gData = await gRes.json();
            if (gRes.ok && gData.candidates?.[0]?.content?.parts?.[0]?.text) {
              return Response.json({
                ok: true,
                provider: "gemini-3.8-flash",
                reply: gData.candidates[0].content.parts[0].text
              });
            }
          } catch (gErr) {
            console.warn("Gemini call failed, trying Claude fallback:", gErr);
          }
        }

        // 2. Try Claude AI
        const apiKey = (body.apiKey || process.env.ANTHROPIC_API_KEY || "").trim();
        const workspaceId = (body.workspaceId || process.env.ANTHROPIC_WORKSPACE_ID || "").trim();

        if (apiKey) {
          const headers: Record<string, string> = {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          };

          if (workspaceId) {
            headers["anthropic-workspace-id"] = workspaceId;
          }

          try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers,
              body: JSON.stringify({
                model: "claude-3-5-haiku-20241022",
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: "user", content: body.message }]
              })
            });

            const data = await response.json();

            if (response.ok) {
              const replyText = data.content?.[0]?.text || "उत्तर मिळू शकले नाही.";
              return Response.json({
                ok: true,
                provider: "claude",
                reply: replyText
              });
            } else {
              return Response.json({
                ok: false,
                error: "anthropic_error",
                status: response.status,
                details: data?.error?.message || data?.error || data
              }, { status: 200 });
            }
          } catch (fetchErr: any) {
            return Response.json({
              ok: false,
              error: "network_error",
              message: fetchErr?.message || "AI शी संपर्क होऊ शकला नाही."
            }, { status: 500 });
          }
        }

        return Response.json({
          ok: false,
          error: "missing_api_key",
          message: "कोणतीही AI API Key उपलब्ध नाही."
        }, { status: 400 });
      }
    }
  }
});
