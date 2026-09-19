import { createFileRoute } from "@tanstack/react-router";
import { admin, sendMessage } from "@/lib/telegram.server";
import { sendDocument } from "@/lib/telegram-menu.server";
import { snapshotFor, SESSIONS, SESSION_MR, type Snap } from "@/lib/telegram-parent.server";

/**
 * रोजचा बॅकअप — रात्री १० वाजता चालवा.
 * pg_cron / external scheduler:
 *   POST /api/public/telegram/daily  { "key": "<TELEGRAM_BOT_TOKEN चा शेवटचा भाग नाही — link_code>" }
 * key नसेल तर सर्व संस्थांना पाठवते (scheduler-only endpoint).
 */
function csv(snap: Snap) {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["रोल", "नाव", "इयत्ता", "पालक", "फोन", "फी एकूण", "भरले", "बाकी", "आजची हजेरी"];
  const rows = (snap.students ?? []).map((s) =>
    [
      s.roll,
      s.name,
      s.standard,
      s.parent,
      s.phone,
      s.fees?.total ?? "",
      s.fees?.paid ?? "",
      s.fees?.due ?? "",
      SESSIONS.map((k) => `${SESSION_MR[k]}:${s.today?.[k] ?? "-"}`).join(" "),
    ]
      .map(q)
      .join(","),
  );
  return [head.map(q).join(","), ...rows].join("\n");
}

function summary(snap: Snap) {
  const list = snap.students ?? [];
  const lines = [`🌙 <b>आजचा अहवाल — ${snap.today ?? ""}</b>`, ""];
  for (const k of SESSIONS) {
    const p = list.filter((s) => s.today?.[k] === "present").length;
    const a = list.filter((s) => s.today?.[k] === "absent").length;
    lines.push(`${SESSION_MR[k]}: हजर ${p} • गैरहजर ${a}`);
  }
  const due = list.filter((s) => (s.fees?.due ?? 0) > 0);
  lines.push("", `एकूण विद्यार्थी: ${list.length}`, `फी बाकी: ${due.length} विद्यार्थी`);
  lines.push("", "🙏 राम कृष्ण हरी");
  return lines.join("\n");
}

export const Route = createFileRoute("/api/public/telegram/daily")({
  server: {
    handlers: {
      POST: async () => {
        const db = admin();
        const { data: links } = await db.from("telegram_links").select("chat_id, org_id");
        if (!links?.length) return Response.json({ ok: true, sent: 0 });

        const byOrg = new Map<string, number[]>();
        for (const l of links) {
          const org = String(l.org_id);
          byOrg.set(org, [...(byOrg.get(org) ?? []), Number(l.chat_id)]);
        }

        let sent = 0;
        const failed: Array<{ orgId: string; chatId: number; reason: string }> = [];

        for (const [orgId, chats] of byOrg) {
          const snap = (await snapshotFor(orgId)) as Snap | null;
          if (!snap) {
            console.error("daily backup skipped: no snapshot", { orgId });
            failed.push({ orgId, chatId: 0, reason: "No current snapshot is available" });
            continue;
          }
          const date = snap.today ?? new Date().toISOString().slice(0, 10);
          for (const chatId of chats) {
            try {
              await sendMessage(chatId, summary(snap));
              await sendDocument(chatId, `backup-${date}.csv`, csv(snap), "💾 आजची बॅकअप फाइल");
              sent++;
            } catch (err) {
              const reason = err instanceof Error ? err.message : String(err);
              console.error("daily backup failed", { orgId, chatId, reason });
              failed.push({ orgId, chatId, reason });
            }
          }
        }

        if (failed.length) {
          console.error("daily backup incomplete", { sent, failed });
          return Response.json({ ok: false, sent, failed: failed.length }, { status: 503 });
        }

        return Response.json({ ok: true, sent });
      },
    },
  },
});
