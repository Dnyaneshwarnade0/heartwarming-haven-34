import { useState } from "react";
import { Newspaper } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  label?: string;
};

/** Image that degrades to a styled placeholder when the source fails to load. */
export function SafeImage({ src, alt = "", className, fallbackClassName, label }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={
          "flex flex-col items-center justify-center gap-2 bg-secondary/60 text-muted-foreground " +
          (fallbackClassName ?? className ?? "")
        }
        role="img"
        aria-label={alt || label || "Image unavailable"}
      >
        <Newspaper className="h-8 w-8 opacity-50" />
        {label && <span className="px-3 text-center text-[11px] leading-tight">{label}</span>}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
