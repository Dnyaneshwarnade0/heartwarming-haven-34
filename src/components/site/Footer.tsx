import { Phone, MapPin, CheckCircle2 } from "lucide-react";
import { BANK_ACCOUNTS, SITE, TAX_BENEFITS, UPI_ID } from "@/lib/site-data";
import { useLang } from "@/lib/i18n";
import { DonateModal } from "./DonateModal";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-maroon text-maroon-foreground">
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            {t({ en: "Contact Office", mr: "संपर्क कार्यालय" })}
          </h3>
          <p className="mt-4 text-sm leading-relaxed opacity-90">
            {t({ en: "Shriramkrishna Varkari Shikshan Sanstha", mr: "श्रीरामकृष्ण वारकरी शिक्षण संस्था" })}
            <br />
            {t(SITE.address)}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-semibold">
            <Phone className="h-4 w-4" /> {SITE.phone}
          </p>
          <p className="mt-2 text-xs opacity-70">Trust Reg. No. {SITE.trustReg}</p>
        </div>

        <div>
          <h3 className="text-primary text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> {t({ en: "Donation Accounts", mr: "देणगी खाती" })}
          </h3>
          <div className="mt-4 space-y-3">
            {BANK_ACCOUNTS.map((b) => (
              <div key={b.ac} className="rounded-lg border border-primary/30 p-3">
                <div className="text-sm font-semibold text-primary">{b.name}</div>
                <div className="mt-1 text-xs opacity-80">A/c: {b.ac} | IFSC: {b.ifsc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            {t({ en: "UPI & Tax Benefits", mr: "UPI आणि कर लाभ" })}
          </h3>
          <div className="mt-4 rounded-lg border border-primary/30 px-3 py-2 text-sm">
            <span className="opacity-70">UPI ID: </span>
            <span className="font-mono text-primary">{UPI_ID}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 12AA Reg: {TAX_BENEFITS.reg12AA}</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 80G Tax Exempt: {TAX_BENEFITS.exempt80G}</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5">
          <h3 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            {t({ en: "Support Our Cause", mr: "आमच्या कार्याला पाठिंबा" })}
          </h3>
          <p className="mt-3 text-sm opacity-90">
            {t({
              en: "Your small contribution helps us provide free education, meals, and Varkari moral values.",
              mr: "आपले छोटेसे योगदान आम्हाला मोफत शिक्षण, भोजन आणि वारकरी संस्कार पुरवण्यास मदत करते.",
            })}
          </p>
          <div className="mt-4">
            <DonateModal>
              <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Heart className="mr-2 h-4 w-4 fill-current" />
                {t({ en: "Donate Now", mr: "आत्ताच देणगी द्या" })}
              </Button>
            </DonateModal>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/20">
        <div className="container-page py-5 text-center text-xs opacity-70">
          © {new Date().getFullYear()} Shriramkrishna Varkari Shikshan Sanstha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
