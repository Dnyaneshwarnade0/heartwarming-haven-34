import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { NAV, SITE } from "@/lib/site-data";
import { useLang } from "@/lib/i18n";
import { DonateModal } from "./DonateModal";
import { Button } from "@/components/ui/button";

export function Header() {
  const { lang, setLang, t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <img src={SITE.logo} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
          <div className="leading-tight">
            <div className="text-sm md:text-base font-display font-semibold text-primary">
              {t(SITE.name)}
            </div>
            <div className="text-[10px] md:text-xs font-semibold tracking-wider text-maroon/70 uppercase">
              {t(SITE.tagline)}
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:text-primary")
                }
              >
                {t({ en: n.en, mr: n.mr })}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={"rounded-full px-2.5 py-1 " + (lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              EN
            </button>
            <button
              onClick={() => setLang("mr")}
              className={"rounded-full px-2.5 py-1 font-devanagari " + (lang === "mr" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              मराठी
            </button>
          </div>
          <DonateModal />
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-background">
          <div className="container-page py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={
                  "rounded-md px-3 py-2 text-sm font-medium " +
                  (pathname === n.to ? "bg-primary-soft text-primary" : "text-foreground/80 hover:bg-muted")
                }
              >
                {t({ en: n.en, mr: n.mr })}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setLang("en")}
                className={"rounded-full px-3 py-1 text-xs font-semibold " + (lang === "en" ? "bg-primary text-primary-foreground" : "border")}
              >
                EN
              </button>
              <button
                onClick={() => setLang("mr")}
                className={"rounded-full px-3 py-1 text-xs font-semibold font-devanagari " + (lang === "mr" ? "bg-primary text-primary-foreground" : "border")}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
