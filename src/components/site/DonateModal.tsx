import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BANK_ACCOUNTS, UPI_ID, TAX_BENEFITS } from "@/lib/site-data";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copied");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-2 inline-flex items-center rounded-md p-1 text-muted-foreground hover:text-primary"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DonateModal({ children }: { children?: ReactNode }) {
  const { t } = useLang();
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Heart className="mr-1.5 h-4 w-4 fill-current" />
            {t({ en: "Donate", mr: "देणगी द्या" })}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-maroon">
            {t({ en: "Support Our Cause", mr: "आमच्या कार्याला पाठिंबा द्या" })}
          </DialogTitle>
          <DialogDescription>
            {t({
              en: "Your contribution funds free education, meals and Varkari moral values for orphan and rural children.",
              mr: "आपले योगदान अनाथ आणि ग्रामीण मुलांना मोफत शिक्षण, भोजन आणि वारकरी संस्कार पुरवते.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <section className="rounded-xl bg-primary-soft p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">UPI</div>
            <div className="mt-1 flex items-center font-mono text-lg text-maroon">
              {UPI_ID}
              <CopyBtn value={UPI_ID} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {t({ en: "Bank Accounts", mr: "बँक खाती" })}
            </div>
            {BANK_ACCOUNTS.map((b) => (
              <div key={b.ac} className="rounded-lg border bg-card p-3">
                <div className="text-sm font-semibold text-maroon">{b.name}</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  A/c: <span className="ml-1 font-mono text-foreground">{b.ac}</span>
                  <CopyBtn value={b.ac} />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  IFSC: <span className="ml-1 font-mono text-foreground">{b.ifsc}</span>
                  <CopyBtn value={b.ifsc} />
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-dashed p-3 text-sm">
            <div className="font-semibold text-maroon">
              {t({ en: "Tax Benefits", mr: "कर लाभ" })}
            </div>
            <div className="mt-1 text-muted-foreground">
              12AA Reg: <span className="font-mono text-foreground">{TAX_BENEFITS.reg12AA}</span>
            </div>
            <div className="text-muted-foreground">
              80G Exempt: <span className="font-mono text-foreground">{TAX_BENEFITS.exempt80G}</span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
