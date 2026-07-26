import { Button } from "@/components/ui/button";
import { Phone, Heart } from "lucide-react";
import { DonateModal } from "./DonateModal";
import { SITE } from "@/lib/site-data";
import { useLang } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

export function PageHero({
  image,
  eyebrow,
  title,
  description,
}: {
  image: string;
  eyebrow: { en: string; mr: string };
  title: { en: string; mr: string };
  description: { en: string; mr: string };
}) {
  const { t } = useLang();
  return (
    <section className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="relative container-page h-full flex items-end pb-10 md:pb-14">
        <div className="max-w-lg rounded-2xl bg-maroon/85 text-maroon-foreground p-6 md:p-7 backdrop-blur-sm shadow-warm">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">▶ {t(eyebrow)}</div>
          <h1 className="mt-3 text-2xl md:text-3xl font-display">{t(title)}</h1>
          <p className="mt-3 text-sm opacity-90 leading-relaxed">{t(description)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/contact"><Phone className="mr-1.5 h-3.5 w-3.5" />{t({ en: "Contact Us", mr: "संपर्क" })}</Link>
            </Button>
            <DonateModal>
              <Button size="sm" variant="outline" className="rounded-full border-primary/50 bg-transparent text-primary-foreground hover:bg-primary/20">
                <Heart className="mr-1.5 h-3.5 w-3.5 fill-current" />{t({ en: "Donate Us", mr: "देणगी द्या" })}
              </Button>
            </DonateModal>
          </div>
        </div>
      </div>
    </section>
  );
}
