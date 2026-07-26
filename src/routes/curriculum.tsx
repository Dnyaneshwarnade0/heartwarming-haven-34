import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/site/PageHero";
import { HERO_DESKTOP } from "@/lib/site-data";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "Curriculum — Classical Subjects & Daily Schedule" },
      { name: "description", content: "9 classical Varkari subjects including Dnyaneshwari, Haripath, Bhagavad Gita, Pakhawaj, Vocal, Harmonium, Tabla, Kirtan and Pravachan — plus a structured daily schedule from 5 AM." },
      { property: "og:title", content: "Curriculum — Shriramkrishna Sanstha" },
      { property: "og:description", content: "Nine classical subjects and a structured Sattvic daily schedule." },
      { property: "og:image", content: HERO_DESKTOP[1] },
      { name: "twitter:image", content: HERO_DESKTOP[1] },
    ],
  }),
  component: CurriculumPage,
});

function CurriculumPage() {
  const { t } = useLang();
  const subjects = [
    ["Dnyaneshwari", "ज्ञानेश्वरी", "Deep textual study, recitation, and interpretation of Sant Dnyaneshwar's Dnyaneshwari.", "संत ज्ञानेश्वरांच्या ज्ञानेश्वरीचा सखोल अभ्यास व पाठ."],
    ["Haripath", "हरिपाठ", "Daily evening recitation and devotional chanting of Sant Dnyaneshwar's Haripath.", "संत ज्ञानेश्वरांच्या हरिपाठाचे दररोज सायंकाळी पठण."],
    ["Shrimad Bhagavad Gita", "भगवद्गीता", "Shloka recitation, grammar, and moral philosophy from the Shrimad Bhagavad Gita.", "श्रीमद्भगवद्गीतेचे श्लोक व नैतिक तत्त्वज्ञान."],
    ["Pakhawaj Percussion", "पखवाज", "Classical rhythmic training and practical mastery on the traditional Pakhawaj.", "पारंपरिक पखवाजाचे शास्त्रीय ताल-प्रशिक्षण."],
    ["Classical Vocal Music", "गायन", "Vocal raga sadhana, Abhang singing, and classical music fundamentals.", "राग साधना, अभंग गायन व शास्त्रीय संगीत मूलतत्त्वे."],
    ["Harmonium", "हार्मोनियम", "Comprehensive harmonium keyboard training aligned with devotional ragas.", "भक्तिरागांसह हार्मोनियम प्रशिक्षण."],
    ["Tabla", "तबला", "Fundamental and advanced rhythmic tala practice on the Tabla.", "तबल्यावर मूलभूत ते प्रगत तालांचा सराव."],
    ["Kirtan Narrative", "कीर्तन", "Traditional Varkari Kirtan performance, storytelling, and stage discourse.", "पारंपरिक वारकरी कीर्तन व मंच सादरीकरण."],
    ["Pravachan Discourse", "प्रवचन", "Art of spiritual discourse, sermon delivery, and philosophical commentary.", "आध्यात्मिक प्रवचन व तात्त्विक भाष्य."],
  ];

  const focus = [
    ["Child Care & Nurturing", "बाल संगोपन", "Loving residential care, wholesome food, and guidance for all students."],
    ["Child Personality Development", "व्यक्तिमत्त्व विकास", "Fostering confidence, moral ethics, and overall growth."],
    ["Spiritual Growth", "आध्यात्मिक विकास", "Nurturing deep spiritual connection and traditional values."],
    ["Community Haripath", "सामूहिक हरिपाठ", "Daily collective evening Haripath chanting."],
    ["Group Bhajans", "समूह भजन", "Rhythmic choral devotional singing with cymbals and mridangam."],
    ["Pakhawaj Practice", "पखवाज सराव", "Dedicated daily percussion practice sessions."],
    ["Community Kirtans", "सामुदायिक कीर्तन", "Student-led devotional Kirtans during holy festivals."],
    ["Saint Memorial Commemorations", "संत पुण्यतिथी", "Observance of sacred memorial anniversaries of Varkari saints."],
    ["National Visionaries Celebrations", "राष्ट्रीय जयंत्या", "Celebrating birth anniversaries of great national leaders and icons."],
  ];

  const schedule = [
    ["05:00 – 06:00", "Daily Physical Exercise (Vyayam) & Yoga for Health", "दैनिक व्यायाम व योग"],
    ["06:00 – 07:30", "Kakada Aarti, Shloka Recitation & Dnyaneshwari Path", "काकड आरती व ज्ञानेश्वरी पाठ"],
    ["07:30 – 08:30", "Morning Bath (Hot Water), Sandhya & Wholesome Breakfast", "स्नान, संध्या व पौष्टिक नाश्ता"],
    ["08:30 – 12:30", "State Board Academic Schooling (English, Maths, Science)", "शालेय शिक्षण"],
    ["12:30 – 14:00", "Pure Sattvic Lunch & Brief Rest", "सात्विक भोजन व विश्रांती"],
    ["14:00 – 16:30", "Free Computer Education, Music Practice (Pakhawaj, Harmonium)", "संगणक व संगीत सराव"],
    ["16:30 – 18:00", "Outdoor Sports, Reading Room & Personal Study", "क्रीडा व स्वयं अभ्यास"],
    ["18:00 – 20:00", "Community Haripath, Evening Sandhya Aarti & Kirtan", "सामूहिक हरिपाठ व कीर्तन"],
    ["20:00 – 21:30", "Sattvic Dinner, Self-Study & Rest", "सात्विक भोजन व विश्रांती"],
  ];

  return (
    <>
      <PageHero
        image={HERO_DESKTOP[4]}
        eyebrow={{ en: "Where Tradition Meets Modern Skill", mr: "परंपरा आणि आधुनिकतेचा संगम" }}
        title={{ en: "Our Curriculum", mr: "आमचा अभ्यासक्रम" }}
        description={{
          en: "A blended study path — classical Varkari literature and music in the morning & evening, state-board academics through the day, with free computer skills.",
          mr: "सकाळ-सायंकाळी शास्त्रीय वारकरी साहित्य व संगीत, दिवसभर शालेय शिक्षण आणि मोफत संगणक कौशल्ये.",
        }}
      />

      {/* 9 subjects */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Core Subjects Taught", mr: "मुख्य विषय" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "9 Classical Subjects of Spiritual & Musical Education", mr: "आध्यात्मिक व संगीत शिक्षणाचे ९ शास्त्रीय विषय" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map(([en, mr, edesc, mdesc], idx) => (
              <div key={en} className="rounded-2xl bg-card p-5 border shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-maroon text-maroon-foreground grid place-items-center text-xs font-bold">{String(idx + 1).padStart(2, "0")}</div>
                  <div className="font-display text-lg text-maroon">{t({ en, mr })}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t({ en: edesc, mr: mdesc })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="py-16 md:py-20 bg-primary-soft/40">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Key Focus Areas", mr: "मुख्य केंद्रबिंदू" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Holistic Development & Community Devotion", mr: "सर्वांगीण विकास व सामुदायिक भक्ती" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {focus.map(([en, mr, desc]) => (
              <div key={en} className="rounded-xl bg-card border p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-maroon">{t({ en, mr })}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Daily Rhythm (Pahate 5:00 AM Exercise)", mr: "दैनिक कार्यक्रम" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "A Structured Day at the Sanstha", mr: "संस्थेतील दैनिक दिनक्रम" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-10 max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-card">
            <div className="grid grid-cols-[140px_1fr] bg-maroon text-maroon-foreground text-xs font-bold uppercase tracking-widest">
              <div className="px-4 py-3">{t({ en: "Time", mr: "वेळ" })}</div>
              <div className="px-4 py-3">{t({ en: "Activity", mr: "उपक्रम" })}</div>
            </div>
            {schedule.map(([time, en, mr], i) => (
              <div key={time} className={"grid grid-cols-[140px_1fr] text-sm " + (i % 2 === 0 ? "bg-card" : "bg-primary-soft/50")}>
                <div className="px-4 py-3 font-mono text-primary">{time}</div>
                <div className="px-4 py-3 text-foreground/85">{t({ en, mr })}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
