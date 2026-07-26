import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/site/PageHero";
import { HERO_DESKTOP, SITE, BANK_ACCOUNTS, UPI_ID } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Reach Shriramkrishna Sanstha, Alandi" },
      { name: "description", content: "Get in touch with Shriramkrishna Adhyatmik Varkari Shikshan Sanstha at Alandi Dewachi, Pune. Phone, email, address and donation account details." },
      { property: "og:title", content: "Contact Shriramkrishna Sanstha" },
      { property: "og:description", content: "Address, phone, email and donation channels for the Sanstha in Alandi, Pune." },
      { property: "og:image", content: HERO_DESKTOP[0] },
      { name: "twitter:image", content: HERO_DESKTOP[0] },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // No backend wired — construct mailto so user's message is delivered.
    const body = `Name: ${form.name}%0D%0APhone: ${form.phone}%0D%0AEmail: ${form.email}%0D%0A%0D%0A${form.message}`;
    window.location.href = `mailto:${SITE.email}?subject=Website enquiry from ${encodeURIComponent(form.name)}&body=${body}`;
    setTimeout(() => {
      toast.success(t({ en: "Opening your mail app…", mr: "मेल अ‍ॅप उघडत आहे…" }));
      setSending(false);
    }, 500);
  };

  return (
    <>
      <PageHero
        image={HERO_DESKTOP[0]}
        eyebrow={{ en: "Get in Touch", mr: "संपर्क साधा" }}
        title={{ en: "Contact Us", mr: "आमच्याशी संपर्क साधा" }}
        description={{
          en: "For admissions, volunteering, donations or partnership — we would love to hear from you.",
          mr: "प्रवेश, स्वयंसेवा, देणगी किंवा भागीदारीसाठी आमच्याशी संपर्क साधा.",
        }}
      />

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-card border p-6 md:p-8 shadow-card">
            <h2 className="text-2xl font-display text-maroon">{t({ en: "Send Us a Message", mr: "आम्हाला संदेश पाठवा" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t({ en: "Fill in the form below and we'll get back to you soon.", mr: "फॉर्म भरा, आम्ही लवकर उत्तर देऊ." })}
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: "Full Name", mr: "पूर्ण नाव" })}</Label>
                  <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t({ en: "Phone", mr: "फोन" })}</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>{t({ en: "Email", mr: "ईमेल" })}</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>{t({ en: "Message", mr: "संदेश" })}</Label>
                <Textarea required rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="mt-1.5" />
              </div>
              <Button type="submit" disabled={sending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                {t({ en: "Send Message", mr: "संदेश पाठवा" })}
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-primary-soft p-6">
              <div className="section-eyebrow">{t({ en: "Contact Office", mr: "संपर्क कार्यालय" })}</div>
              <h3 className="mt-1 text-lg font-display text-maroon">{t(SITE.name)}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span className="text-foreground/85">{t(SITE.address)}</span></div>
                <div className="flex gap-2"><Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-foreground/85 hover:text-primary">{SITE.phone}</a></div>
                <div className="flex gap-2"><Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" /><a href={`mailto:${SITE.email}`} className="text-foreground/85 hover:text-primary break-all">{SITE.email}</a></div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Trust Reg. {SITE.trustReg}</div>
            </div>

            <div className="rounded-2xl bg-card border p-6 shadow-card">
              <div className="section-eyebrow">{t({ en: "Donate via UPI", mr: "UPI द्वारे देणगी" })}</div>
              <div className="mt-3 flex items-center rounded-lg bg-primary-soft p-3 font-mono text-maroon">{UPI_ID}</div>
              <div className="mt-4 space-y-2">
                {BANK_ACCOUNTS.map((b) => (
                  <div key={b.ac} className="rounded-lg border p-3 text-sm">
                    <div className="font-semibold text-maroon">{b.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">A/c {b.ac} • IFSC {b.ifsc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-page">
          <div className="rounded-3xl overflow-hidden border shadow-card aspect-[16/8]">
            <iframe
              title="Location"
              src="https://www.google.com/maps?q=Alandi+Devachi,+Pune,+Maharashtra&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
