import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/site/PageHero";
import { HERO_DESKTOP } from "@/lib/site-data";
import { BookOpen, Flame, Music, HeartHandshake, Wrench, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonateModal } from "@/components/site/DonateModal";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — Programs & Initiatives" },
      { name: "description", content: "Educational, cultural, spiritual, and community programs that nurture minds, build character, and strengthen society." },
      { property: "og:title", content: "Our Activities — Shriramkrishna Sanstha" },
      { property: "og:description", content: "Educational, moral, cultural, community, skill and spiritual programs run year-round." },
      { property: "og:image", content: HERO_DESKTOP[2] },
      { name: "twitter:image", content: HERO_DESKTOP[2] },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const { t } = useLang();
  const cards = [
    { i: BookOpen, en: "Educational Programs", mr: "शैक्षणिक कार्यक्रम", edesc: "Quality education with modern teaching methods rooted in Varkari values and culture.", mdesc: "वारकरी मूल्यांसह आधुनिक अध्यापन पद्धतीचे दर्जेदार शिक्षण." },
    { i: Flame, en: "Moral & Value Education", mr: "नैतिक शिक्षण", edesc: "Instilling moral values, spiritual wisdom and character building through daily practices.", mdesc: "दैनंदिन आचरणातून नैतिक मूल्ये व चारित्र्य घडवणे." },
    { i: Music, en: "Cultural Programs", mr: "सांस्कृतिक कार्यक्रम", edesc: "Kirtan, Bhajan, Pravachan, Dindi and traditional Varkari performing arts throughout the year.", mdesc: "कीर्तन, भजन, प्रवचन, दिंडी व पारंपरिक वारकरी कला वर्षभर." },
    { i: HeartHandshake, en: "Community Service", mr: "समुदाय सेवा", edesc: "Medical camps, disaster relief and welfare drives for surrounding villages and needy families.", mdesc: "वैद्यकीय शिबिरे, आपत्ती निवारण व गरजू कुटुंबांना मदत." },
    { i: Wrench, en: "Skill Development", mr: "कौशल्य विकास", edesc: "Tailoring, computer literacy, spoken English and life-skills for students and rural women.", mdesc: "शिवणकाम, संगणक साक्षरता, इंग्रजी व जीवन-कौशल्ये." },
    { i: Users, en: "Spiritual Programs", mr: "आध्यात्मिक कार्यक्रम", edesc: "Palkhi Seva, Alandi Yatra, Ekadashi observances and study of Dnyaneshwari & Eknathi Bhagwat.", mdesc: "पालखी सेवा, आळंदी यात्रा, एकादशी व ज्ञानेश्वरी अभ्यास." },
  ];

  return (
    <>
      <PageHero
        image={HERO_DESKTOP[2]}
        eyebrow={{ en: "Serving Society, Uplifting Lives", mr: "समाजसेवा" }}
        title={{ en: "Our Activities", mr: "आमचे उपक्रम" }}
        description={{
          en: "Our activities are designed to preserve Varkari tradition, promote quality education and create holistic development opportunities for children and communities.",
          mr: "आमचे उपक्रम वारकरी परंपरा जपणे, दर्जेदार शिक्षण देणे आणि मुले व समाजासाठी सर्वांगीण विकासाच्या संधी निर्माण करण्यासाठी आहेत.",
        }}
      />

      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Our Programs & Initiatives", mr: "आमचे कार्यक्रम" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "What We Do", mr: "आम्ही काय करतो" })}</h2>
            <span className="divider-gold" />
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground">
              {t({
                en: "We run a wide range of educational, cultural and social programs that nurture minds, build character and strengthen society.",
                mr: "आम्ही मनोविकास, चारित्र्य घडवणी व समाजबांधणीसाठी अनेकविध शैक्षणिक, सांस्कृतिक व सामाजिक कार्यक्रम राबवतो.",
              })}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const I = c.i;
              return (
                <div key={c.en} className="group rounded-2xl bg-card p-6 border shadow-card hover:shadow-warm transition">
                  <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                    <I className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-display text-maroon">{t({ en: c.en, mr: c.mr })}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t({ en: c.edesc, mr: c.mdesc })}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary-soft/40">
        <div className="container-page text-center">
          <h2 className="text-3xl md:text-4xl font-display text-maroon">{t({ en: "Partner With Us", mr: "आमच्यासोबत सहभागी व्हा" })}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            {t({
              en: "Sponsor a program, volunteer your skills or donate materials — every contribution keeps our activities alive for another generation.",
              mr: "एखादा कार्यक्रम प्रायोजित करा, स्वयंसेवा करा किंवा साहित्य दान करा — प्रत्येक योगदान पुढच्या पिढीसाठी उपयोगी.",
            })}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <DonateModal>
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Heart className="mr-2 h-4 w-4 fill-current" />
                {t({ en: "Support a Child's Education", mr: "मुलाच्या शिक्षणाला मदत करा" })}
              </Button>
            </DonateModal>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/contact"><Phone className="mr-2 h-4 w-4" />{t({ en: "Contact Us", mr: "संपर्क" })}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
