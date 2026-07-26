import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/site/PageHero";
import { GALLERY_PHOTOS, VIDEOS, PRESS, HERO_DESKTOP } from "@/lib/site-data";
import { X, Play } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Moments of Service & Learning" },
      { name: "description", content: "Visual journey through festivals, educational trips, cultural events, community welfare drives and student life at the Sanstha." },
      { property: "og:title", content: "Gallery — Shriramkrishna Sanstha" },
      { property: "og:description", content: "Photos, videos and press coverage from years of service and learning." },
      { property: "og:image", content: HERO_DESKTOP[4] },
      { name: "twitter:image", content: HERO_DESKTOP[4] },
    ],
  }),
  component: GalleryPage,
});

type Tab = "photos" | "videos" | "news";

function GalleryPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("photos");
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <PageHero
        image={HERO_DESKTOP[4]}
        eyebrow={{ en: "Photos & Memories", mr: "क्षणचित्रे" }}
        title={{ en: "Gallery", mr: "गॅलरी" }}
        description={{
          en: "A visual journey through our festivals, educational trips, cultural programs and community welfare initiatives.",
          mr: "आमचे सण, शैक्षणिक सहली, सांस्कृतिक कार्यक्रम आणि समाजसेवा उपक्रमांचा दृश्य प्रवास.",
        }}
      />

      <section className="py-12">
        <div className="container-page">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-card border p-1 shadow-card">
              {(["photos", "videos", "news"] as Tab[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={"px-5 py-2 rounded-full text-sm font-semibold transition " + (tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {k === "photos" && `${t({ en: "Photos", mr: "छायाचित्रे" })} (${GALLERY_PHOTOS.length})`}
                  {k === "videos" && `${t({ en: "Videos", mr: "व्हिडिओ" })} (${VIDEOS.length})`}
                  {k === "news" && t({ en: "News", mr: "बातम्या" })}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="section-eyebrow">
              {tab === "photos" && t({ en: "Photo Gallery", mr: "छायाचित्र गॅलरी" })}
              {tab === "videos" && t({ en: "Video Gallery", mr: "व्हिडिओ गॅलरी" })}
              {tab === "news" && t({ en: "Press Coverage", mr: "प्रसारमाध्यम" })}
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">
              {t({ en: "Glimpses of Our Journey", mr: "आमच्या प्रवासाची झलक" })}
            </h2>
            <span className="divider-gold" />
          </div>

          {tab === "photos" && (
            <div className="mt-10 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {GALLERY_PHOTOS.map((p) => (
                <button
                  key={p.src}
                  onClick={() => setLightbox(p.src)}
                  className="block w-full break-inside-avoid overflow-hidden rounded-xl bg-card border shadow-card hover:shadow-warm transition"
                >
                  <img src={p.src} alt={p.caption.en} loading="lazy" className="w-full object-cover" />
                  <div className="p-2.5 text-xs text-maroon/80 line-clamp-1 text-left font-devanagari">{p.caption.mr}</div>
                </button>
              ))}
            </div>
          )}

          {tab === "videos" && (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.map((src) => (
                <div key={src} className="rounded-2xl overflow-hidden bg-black shadow-card">
                  <video controls preload="metadata" className="w-full aspect-video bg-black">
                    <source src={src} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>
          )}

          {tab === "news" && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PRESS.map((p) => (
                <button key={p.img} onClick={() => setLightbox(p.img)} className="rounded-2xl bg-card border overflow-hidden shadow-card hover:shadow-warm transition text-left">
                  <img src={p.img} alt="" className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
                  <div className="p-4">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">Press</div>
                    <div className="mt-1.5 text-sm text-maroon line-clamp-3">"{t(p.title)}"</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" aria-label="Close">
            <X className="h-8 w-8" />
          </button>
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
