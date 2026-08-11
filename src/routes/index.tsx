import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { HERO_DESKTOP, HERO_MOBILE, STATS, FOUNDER_PHOTO, PRESS } from "@/lib/site-data";
import { SafeImage } from "@/components/site/SafeImage";
import { Button } from "@/components/ui/button";
import { DonateModal } from "@/components/site/DonateModal";
import {
  BookOpen, Monitor, Sprout, HeartHandshake, Sun, Scissors,
  Phone, Heart, Quote, MessageSquare, Award, Users, GraduationCap, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Shriramkrishna Adhyatmik Varkari Shikshan Sanstha" },
      { name: "description", content: "Since 2002, empowering orphan and rural children in Alandi with free Varkari education, classical training, and modern digital skills." },
      { property: "og:title", content: "Shriramkrishna Adhyatmik — Varkari Shikshan Sanstha" },
      { property: "og:description", content: "Traditional Varkari values and modern digital education for orphan and rural children since 2002." },
      { property: "og:image", content: HERO_DESKTOP[0] },
      { name: "twitter:image", content: HERO_DESKTOP[0] },
    ],
  }),
  component: HomePage,
});

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 768px)");
    const on = () => setM(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return m;
}

function HeroCarousel() {
  const { t } = useLang();
  const mobile = useIsMobile();
  const slides = mobile ? HERO_MOBILE : HERO_DESKTOP;
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [slides.length]);
  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);

  return (
    <section className="relative w-full overflow-hidden bg-maroon">
      <div className="relative h-[480px] md:h-[620px]">
        {slides.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            className={"absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 " + (idx === i ? "opacity-100" : "opacity-0")}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 md:bg-gradient-to-r md:from-black/70 md:via-black/30 md:to-transparent" />

        <div className="relative container-page h-full flex items-end md:items-end pb-8 md:pb-14">
          <div className="max-w-xl rounded-2xl bg-maroon/85 text-maroon-foreground p-6 md:p-7 backdrop-blur-sm shadow-warm">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">▶ {t({ en: "Rooted in Tradition, Shaping the Future", mr: "परंपरेत रुजलेले, भविष्य घडवणारे" })}</div>
            <h1 className="mt-3 text-2xl md:text-4xl font-display leading-tight">
              {t({ en: "Traditional Varkari Values &", mr: "पारंपरिक वारकरी मूल्ये आणि" })}
              <br />
              <span className="text-primary">{t({ en: "Modern Digital Education", mr: "आधुनिक डिजिटल शिक्षण" })}</span>
            </h1>
            <p className="mt-3 text-sm opacity-90 leading-relaxed">
              {t({
                en: "We honour the timeless legacy of Sant Dnyaneshwar, Sant Tukaram, Sant Namdev and Sant Eknath Maharaj by empowering rural children with quality education, moral values, and digital skills.",
                mr: "संत ज्ञानेश्वर, संत तुकाराम, संत नामदेव आणि संत एकनाथ महाराजांच्या अखंड परंपरेला जपत आम्ही ग्रामीण मुलांना दर्जेदार शिक्षण, संस्कार आणि डिजिटल कौशल्ये पुरवतो.",
              })}
            </p>
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

        <div className="absolute right-4 top-4 flex gap-1.5">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={"h-1.5 rounded-full transition-all " + (idx === i ? "w-8 bg-primary" : "w-3 bg-white/40")} aria-label={`Slide ${idx + 1}`} />
          ))}
        </div>
        <button onClick={() => go(-1)} aria-label="Previous" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => go(1)} aria-label="Next" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

function StatsStrip() {
  const { t } = useLang();
  return (
    <section className="relative -mt-14 z-10">
      <div className="container-page">
        <div className="rounded-2xl bg-card shadow-warm grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
          {STATS.map((s) => (
            <div key={s.value} className="px-6 py-6 text-center">
              <div className="font-display text-3xl md:text-4xl text-primary">{s.value}</div>
              <div className="mt-1 text-xs md:text-sm text-muted-foreground">{t({ en: s.en, mr: s.mr })}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Leadership() {
  const { t } = useLang();
  const milestones = [
    { icon: MessageSquare, en: "Digital Literacy", mr: "डिजिटल साक्षरता", edesc: "Pioneered free computer and digital literacy programs for rural children in Alandi.", mdesc: "आळंदीतील ग्रामीण मुलांसाठी मोफत संगणक व डिजिटल साक्षरता कार्यक्रम." },
    { icon: BookOpen, en: "Varkari Heritage", mr: "वारकरी वारसा", edesc: "Preserved Varkari cultural heritage by teaching Kirtan, Pakhawaj, and scriptures.", mdesc: "कीर्तन, पखवाज आणि ग्रंथांच्या शिक्षणातून वारकरी सांस्कृतिक वारसा जपला." },
    { icon: HeartHandshake, en: "Gau-Sewa Practice", mr: "गौ-सेवा", edesc: "Established Gau-Sewa & native cow care as a daily practice for students.", mdesc: "गौ-सेवा व देशी गोपालन विद्यार्थ्यांच्या दैनंदिन जीवनाचा भाग." },
    { icon: GraduationCap, en: "2,782+ Graduates", mr: "२,७८२+ पदवीधर", edesc: "Guided over 2,782 students towards holistic, values-based career paths.", mdesc: "२,७८२ पेक्षा अधिक विद्यार्थ्यांना सर्वांगीण, संस्कारक्षम कारकिर्दीकडे मार्गदर्शन." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <div className="text-center">
          <div className="section-eyebrow">{t({ en: "Founder Message & Vision", mr: "संस्थापक संदेश आणि दृष्टी" })}</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Leadership and Direction", mr: "नेतृत्व आणि दिशा" })}</h2>
          <span className="divider-gold" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] bg-primary-soft rounded-3xl p-6 md:p-10 shadow-card">
          <div>
            <div className="text-xs font-bold tracking-widest text-primary uppercase">
              {t({ en: "Founder President", mr: "संस्थापक अध्यक्ष" })} • <span className="font-devanagari">ह.भ.प.</span>
            </div>
            <h3 className="mt-2 text-2xl md:text-3xl font-display text-maroon">H.B.P. Mohan Maharaj Shinde</h3>
            <blockquote className="mt-5 border-l-4 border-primary bg-card p-4 rounded-r-lg italic text-foreground/90 relative">
              <Quote className="absolute right-3 top-3 h-6 w-6 text-primary/30" />
              {t({
                en: "By integrating digital skills and computer education alongside traditional values and faith, we are preparing our children to thrive in the modern world.",
                mr: "पारंपरिक मूल्ये आणि श्रद्धेसह डिजिटल कौशल्ये व संगणक शिक्षण एकत्र करून, आम्ही आमच्या मुलांना आधुनिक जगात यशस्वी होण्यासाठी घडवत आहोत.",
              })}
            </blockquote>
            <p className="mt-5 text-sm leading-relaxed text-foreground/80">
              {t({
                en: "Under the vision and leadership of H.B.P. Mohan Maharaj Shinde, Shri Ramakrishna Varkari Shikshan Sanstha was established in 2002. Fulfilling the mission of providing holistic, cultural, and digital education to underprivileged, orphan, and rural children, he has guided the institution to successfully educate over 2,782 students — integrating traditional values like Kirtan, Pakhavaj and Gau-Sewa care with computer literacy.",
                mr: "ह.भ.प. मोहन महाराज शिंदे यांच्या दूरदृष्टी व नेतृत्वाखाली २००२ साली श्रीरामकृष्ण वारकरी शिक्षण संस्थेची स्थापना झाली. वंचित, अनाथ आणि ग्रामीण मुलांना सर्वांगीण, सांस्कृतिक व डिजिटल शिक्षण देऊन त्यांनी २,७८२ पेक्षा अधिक विद्यार्थ्यांना घडवले आहे.",
              })}
            </p>

            <div className="mt-6">
              <div className="text-xs font-bold tracking-widest text-primary uppercase">
                {t({ en: "Sanstha Milestones & Vision", mr: "संस्थेचे टप्पे आणि दृष्टी" })}
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {milestones.map((m) => {
                  const I = m.icon;
                  return (
                    <div key={m.en} className="flex gap-3 rounded-xl bg-card p-3 border">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <I className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-maroon">{t({ en: m.en, mr: m.mr })}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t({ en: m.edesc, mr: m.mdesc })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-3 right-3 z-10 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              {t({ en: "Honoured & Respected", mr: "आदरणीय" })}
            </div>
            <img src={FOUNDER_PHOTO} alt="H.B.P. Mohan Maharaj Shinde" className="rounded-2xl w-full h-full object-cover shadow-warm max-h-[560px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreFeatures() {
  const { t } = useLang();
  const features = [
    { icon: BookOpen, en: "Classical Training", mr: "शास्त्रीय प्रशिक्षण", cat: { en: "CLASSICAL TRAINING", mr: "शास्त्रीय प्रशिक्षण" }, edesc: "In-depth study of Varkari Abhang, Dindi, Palkhi Seva, Pravachan, and spiritual texts like Dnyaneshwari and Eknathi Bhagwat.", mdesc: "वारकरी अभंग, दिंडी, पालखी सेवा, प्रवचन आणि ज्ञानेश्वरी व एकनाथी भागवत यांचा सखोल अभ्यास." },
    { icon: Monitor, en: "Computer Literacy", mr: "संगणक साक्षरता", cat: { en: "MODERN COMPUTER EDUCATION", mr: "आधुनिक संगणक शिक्षण" }, edesc: "Hands-on training in basic to advanced computer skills, digital tools, and online learning for a better future.", mdesc: "मूलभूत ते प्रगत संगणक कौशल्ये, डिजिटल साधने आणि ऑनलाइन शिक्षणाचे प्रत्यक्ष प्रशिक्षण." },
    { icon: Sprout, en: "Native Cow Care", mr: "देशी गोसंवर्धन", cat: { en: "NATIVE COW CARE", mr: "गौ-सेवा" }, edesc: "Inculcating the value of Cow Care, Goshala Seva, and rural sustainability as a core practice.", mdesc: "गोसेवा, गोशाळा सेवा आणि ग्रामीण शाश्वततेचे मूल्य विद्यार्थ्यांमध्ये रुजवणे." },
    { icon: HeartHandshake, en: "Social Relief Work", mr: "सामाजिक मदत", cat: { en: "RELIEF AID", mr: "मदत कार्य" }, edesc: "Support to needy families, medical camps, disaster relief, and community welfare activities year-round.", mdesc: "गरजू कुटुंबांना मदत, वैद्यकीय शिबिरे, आपत्ती निवारण आणि सामाजिक कल्याण उपक्रम." },
    { icon: Sun, en: "Summer Moral Camps", mr: "उन्हाळी संस्कार शिबिरे", cat: { en: "SUMMER MORAL CAMPS", mr: "उन्हाळी शिबिरे" }, edesc: "Fun-filled learning with moral stories, spiritual practices, leadership activities and value-based games.", mdesc: "नैतिक कथा, आध्यात्मिक साधना, नेतृत्व उपक्रम आणि मूल्याधिष्ठित खेळांसह आनंददायी शिक्षण." },
    { icon: Scissors, en: "Women Empowerment", mr: "महिला सशक्तीकरण", cat: { en: "SEWING TRAINING", mr: "शिवणकाम प्रशिक्षण" }, edesc: "Empowering rural women with sewing, tailoring skills, self-reliance programs and hygiene awareness.", mdesc: "शिवणकाम, कपडे तयार करण्याचे कौशल्य, स्वावलंबन कार्यक्रम आणि आरोग्य जागृती." },
  ];
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-background to-primary-soft/40">
      <div className="container-page">
        <div className="text-center">
          <div className="section-eyebrow">{t({ en: "Our Educational System", mr: "आमची शिक्षण प्रणाली" })}</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Core Features and Training Programs", mr: "मुख्य वैशिष्ट्ये आणि प्रशिक्षण कार्यक्रम" })}</h2>
          <span className="divider-gold" />
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const I = f.icon;
            return (
              <div key={f.en} className="group rounded-2xl bg-card p-6 shadow-card border hover:shadow-warm transition-shadow">
                <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <I className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-display text-maroon">{t({ en: f.en, mr: f.mr })}</h3>
                <div className="text-[10px] font-bold tracking-widest text-primary uppercase mt-1">{t(f.cat)}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t({ en: f.edesc, mr: f.mdesc })}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PressStrip() {
  const { t } = useLang();
  return (
    <section className="py-20 md:py-24">
      <div className="container-page">
        <div className="text-center">
          <div className="section-eyebrow">{t({ en: "Darshan in the News", mr: "प्रसारमाध्यमांत" })}</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Recent Press Highlights and Media Clippings", mr: "अलीकडील प्रसारमाध्यम कव्हरेज" })}</h2>
          <span className="divider-gold" />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRESS.slice(0, 4).map((p) => (
            <div key={p.img} className="rounded-2xl bg-card border overflow-hidden shadow-card hover:shadow-warm transition">
              <SafeImage
                src={p.img}
                alt={t(p.title)}
                label={t(p.title)}
                className="w-full aspect-[3/4] object-cover object-top"
                fallbackClassName="w-full aspect-[3/4]"
              />
              <div className="p-4">
                <div className="text-[10px] font-bold tracking-widest text-primary uppercase">{t({ en: "Press Highlight", mr: "प्रसारमाध्यम" })}</div>
                <div className="mt-1.5 text-sm text-maroon line-clamp-2">"{t(p.title)}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <HeroCarousel />
      <StatsStrip />
      <Leadership />
      <CoreFeatures />
      <PressStrip />
    </>
  );
}
