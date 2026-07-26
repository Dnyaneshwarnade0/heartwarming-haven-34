import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { PageHero } from "@/components/site/PageHero";
import { FOUNDER_PHOTO, HERO_DESKTOP } from "@/lib/site-data";
import {
  Flame, GraduationCap, HandHeart, ShieldCheck, Cpu, Scale,
  Home, Utensils, Bed, BookOpen, Coffee, Droplet, Flame as FireIcon, PartyPopper, Bus, BookMarked, Users2, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shriramkrishna Adhyatmik Sanstha" },
      { name: "description", content: "Learn about our mission, vision, six guiding principles, ISO 9001 accreditation, and 25 social welfare initiatives serving orphan and rural children since 2002." },
      { property: "og:title", content: "About Shriramkrishna Adhyatmik Sanstha" },
      { property: "og:description", content: "Mission, vision, values, leadership and 25 welfare initiatives serving orphan and rural children since 2002." },
      { property: "og:image", content: HERO_DESKTOP[3] },
      { name: "twitter:image", content: HERO_DESKTOP[3] },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLang();
  const principles = [
    { i: Flame, en: "Faith & Tradition", mr: "श्रद्धा व परंपरा", edesc: "An unwavering bond with the timeless teachings of Sant Dnyaneshwar & Tukaram Maharaj.", mdesc: "संत ज्ञानेश्वर व तुकाराम महाराजांच्या अखंड शिकवणीशी अभंग नाते." },
    { i: GraduationCap, en: "Quality Education", mr: "गुणवत्तापूर्ण शिक्षण", edesc: "Anyone can learn. Value-based academics matched to complete studies.", mdesc: "मूल्याधिष्ठित शालेय शिक्षण सर्वांसाठी उपलब्ध." },
    { i: HandHeart, en: "Compassion & Service", mr: "करुणा व सेवा", edesc: "We serve society by nurturing orphan, rural and underprivileged children.", mdesc: "अनाथ, ग्रामीण व वंचित मुलांना जपून समाजाची सेवा." },
    { i: ShieldCheck, en: "Character Building", mr: "चारित्र्य घडवणे", edesc: "We focus on moral values, daily discipline, yoga, and leadership development.", mdesc: "नैतिक मूल्ये, दैनंदिन शिस्त, योग व नेतृत्व विकासावर भर." },
    { i: Cpu, en: "Digital & Modern Skills", mr: "डिजिटल व आधुनिक कौशल्ये", edesc: "We prepare students with modern computer education alongside spiritual training.", mdesc: "आध्यात्मिक शिक्षणासोबत आधुनिक संगणक शिक्षण." },
    { i: Scale, en: "Inclusion & Equality", mr: "समावेश व समता", edesc: "We provide equal education & care for all, regardless of the birthright of caste.", mdesc: "जात-पातीच्या पलीकडे सर्वांसाठी समान शिक्षण व काळजी." },
  ];

  const features = [
    { i: Home, en: "Spacious Spiritual Campus", mr: "प्रशस्त अध्यात्मिक संस्था" },
    { i: Bed, en: "Excellent Residential Facility", mr: "उत्तम निवासी व्यवस्था" },
    { i: BookOpen, en: "Individual Bed for Every Student", mr: "प्रत्येक विद्यार्थ्याला स्वतंत्र बेड" },
    { i: BookMarked, en: "Spacious Study Hall", mr: "अभ्यासासाठी प्रशस्त हॉल" },
    { i: GraduationCap, en: "Integrated Academic & Spiritual Studies", mr: "एकात्मिक शैक्षणिक व अध्यात्मिक अभ्यास" },
    { i: Users2, en: "Subject-Wise Special Classes", mr: "प्रत्येक विषयाचा वेगळा वर्ग" },
    { i: Utensils, en: "Pure Sattvic Meals", mr: "शुद्ध सात्विक भोजन" },
    { i: Droplet, en: "RO Filtered Drinking Water", mr: "आरओ फिल्टर केलेले पिण्याचे पाणी" },
    { i: FireIcon, en: "Hot Water Facility", mr: "गरम पाण्याची सुविधा" },
    { i: PartyPopper, en: "Traditional Sacred Celebrations", mr: "पारंपरिक धार्मिक उत्सव" },
    { i: Coffee, en: "Spacious Boarding Centre", mr: "प्रशस्त भोजन केंद्र" },
    { i: Bus, en: "School Bus Transport", mr: "शाळेसाठी बस वाहतूक" },
  ];

  const initiatives = [
    { en: "Disaster Relief: Food, Clothes, Utensils & Medicine aid for flood victims", mr: "पूरग्रस्तांना अन्न, वस्त्र, भांडी व औषधोपचार मदत" },
    { en: "COVID-19 Pandemic Relief: Food, Grocery & Vegetables Distribution for Thousands", mr: "कोरोना काळात हजारो लोकांना जीवनावश्यक वस्तू व भाजीपाला वाटप" },
    { en: "Eye & Ear Operations & Spectacles distribution in Remote Villages", mr: "दुर्गम भागामध्ये डोळ्याचे व कानाचे मोफत ऑपरेशन" },
    { en: "Tree Plantation & Mobility Aid Distribution for Differently-Abled", mr: "वृक्षारोपण व दिव्यांगांना तीनचाकी सायकल वाटप" },
    { en: "Organising Voluntary Blood Donation Camps", mr: "स्वेच्छेने रक्तदान शिबिरांचे आयोजन" },
    { en: "Child Moral & Value Education (Bal Sanskar) Camps", mr: "बालसंस्कार शिबिरांचे आयोजन" },
    { en: "Tailoring & Skill Enhancement Training for Rural Women", mr: "ग्रामीण महिलांसाठी शिवणकाम व कौशल्य प्रशिक्षण" },
    { en: "Organising Voluntary Blood Donation Camps in Alandi Temple Hygiene Campaigns", mr: "आळंदी मंदिर स्वच्छता मोहीम व रक्तदान शिबिरे" },
    { en: "Tree Plantation & Environmental Conservation Drives", mr: "वृक्षारोपण व पर्यावरण संवर्धन मोहिमा" },
    { en: "Clothes & Blanket Distribution for the Needy", mr: "गरजू लोकांना कपडे व ब्लँकेट वाटप" },
    { en: "Children Care Medical & Health Prevention Camps", mr: "बालक आरोग्य व वैद्यकीय शिबिरे" },
    { en: "Free Boarding, School, Notebooks, Uniforms & Tab distribution to needy children", mr: "गरजू मुलांना मोफत निवास, शालेय वह्या, गणवेश व टॅब वाटप" },
    { en: "Free Consumer Digital Literacy Training for All Students", mr: "सर्व विद्यार्थ्यांसाठी मोफत डिजिटल साक्षरता प्रशिक्षण" },
    { en: "Agri-Tech Education & Assistance for Rural Children", mr: "ग्रामीण मुलांसाठी कृषी-तंत्रज्ञान शिक्षण" },
    { en: "Free Kirtan, Music, Kirtan & Schooling for Orphan & Rural Children", mr: "अनाथ व ग्रामीण मुलांसाठी मोफत कीर्तन, संगीत व शालेय शिक्षण" },
    { en: "Community Awareness Sessions on Ancient Scripture & Sanskar", mr: "प्राचीन ग्रंथ व संस्कारावर समुदाय जागृती सत्रे" },
    { en: "Celebration of Technology, Stationery & Educational Kits in Remote Areas", mr: "दुर्गम भागांमध्ये तंत्रज्ञान व शैक्षणिक साहित्य वितरण" },
    { en: "Providing Books & Educational Materials to Institutions", mr: "संस्थांना पुस्तके व शैक्षणिक साहित्य पुरवणे" },
    { en: "Contributing Birth & Memorial Anniversaries of Saints & National Leaders", mr: "संत व राष्ट्रीय नेत्यांच्या जयंती व पुण्यतिथी सोहळे" },
    { en: "Preservation, Protection & Care of Native Indian Cows (Goshala)", mr: "देशी गायींचे संगोपन व गोशाळा" },
    { en: "Public Awareness & Campaigns Against Female Foeticide", mr: "स्त्रीभ्रूणहत्येविरुद्ध जनजागृती मोहिमा" },
    { en: "Grief Support for Bereaved Families", mr: "शोकाकुल कुटुंबांना आधार" },
    { en: "Annadaan — Free Community Meals throughout the year", mr: "अन्नदान — वर्षभर मोफत सामुदायिक भोजन" },
    { en: "Support for Elderly & Underprivileged Widows", mr: "वृद्ध व विधवा महिलांना आधार" },
    { en: "Musical Instrument distribution to promising students", mr: "गुणी विद्यार्थ्यांना वाद्ये भेट" },
  ];

  const stats = [
    { v: "24+", en: "Years of Trust (Since 2002)", mr: "२४+ वर्षांचा विश्वास" },
    { v: "2,782+", en: "Students Educated", mr: "शिक्षित विद्यार्थी" },
    { v: "2+", en: "Acres of Campus", mr: "एकर परिसर" },
    { v: "20+", en: "Annual Programmes", mr: "वार्षिक कार्यक्रम" },
  ];

  return (
    <>
      <PageHero
        image={HERO_DESKTOP[3]}
        eyebrow={{ en: "Rooted in Tradition, Shaping the Future", mr: "परंपरेत रुजलेले" }}
        title={{ en: "About Us", mr: "आमच्याबद्दल" }}
        description={{
          en: "Shriramkrishna Adhyatmik Varkari Shikshan Sanstha was established in 2002 with the mission of preserving Varkari traditions and empowering underprivileged children through spiritual, cultural and modern education.",
          mr: "श्रीरामकृष्ण अध्यात्मिक वारकरी शिक्षण संस्थेची स्थापना २००२ मध्ये वारकरी परंपरा जपत वंचित मुलांना आध्यात्मिक, सांस्कृतिक व आधुनिक शिक्षण देण्यासाठी झाली.",
        }}
      />

      {/* Mission & Vision */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Our Values & Sacred Goal", mr: "आमची मूल्ये आणि पवित्र ध्येय" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Purpose That Guides Us", mr: "आमचे मार्गदर्शक ध्येय" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-primary-soft p-8 relative overflow-hidden">
              <div className="section-eyebrow">{t({ en: "Our Mission", mr: "आमचे मिशन" })}</div>
              <h3 className="mt-2 text-2xl font-display text-maroon">{t({ en: "Our Mission", mr: "आमचे मिशन" })}</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {t({
                  en: "To nurture and empower orphan, poor, farmer, and rural children by providing free accommodation, wholesome food, Varkari-based schooling and classical Kirtan-Pakhavaj education — a spiritual education inspired by Sant Dnyaneshwar and Sant Tukaram Maharaj.",
                  mr: "अनाथ, गरीब, शेतकरी व ग्रामीण मुलांना मोफत निवास, पौष्टिक अन्न, वारकरी शालेय शिक्षण आणि शास्त्रीय कीर्तन-पखवाज शिक्षण देऊन घडवणे — संत ज्ञानेश्वर व संत तुकाराम महाराजांच्या प्रेरणेने.",
                })}
              </p>
            </div>
            <div className="rounded-3xl bg-primary-soft p-8">
              <div className="section-eyebrow">{t({ en: "Our Vision", mr: "आमची दृष्टी" })}</div>
              <h3 className="mt-2 text-2xl font-display text-maroon">{t({ en: "Our Vision", mr: "आमची दृष्टी" })}</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {t({
                  en: "To build a compassionate society where every child receives holistic education that combines traditional moral values with modern conceptual literacy, shaping responsible and cultured citizens for India.",
                  mr: "जिथे प्रत्येक मूल पारंपरिक नैतिक मूल्यांसह आधुनिक शिक्षण मिळवते अशी करुणाशील समाजरचना घडवणे — जबाबदार व सुसंस्कृत भारतीय नागरिक तयार करणे.",
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Principles */}
      <section className="py-16 md:py-20 bg-primary-soft/40">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Our Values & Approach", mr: "आमची मूल्ये" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Six Principles We Live By", mr: "आमची सहा तत्त्वे" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((p) => {
              const I = p.i;
              return (
                <div key={p.en} className="rounded-2xl bg-card p-5 border shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <I className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display text-lg text-maroon">{t({ en: p.en, mr: p.mr })}</div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t({ en: p.edesc, mr: p.mdesc })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Key Facilities & Amenities", mr: "मुख्य सुविधा" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Sanstha Features & Infrastructure", mr: "संस्था वैशिष्ट्ये" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const I = f.i;
              return (
                <div key={f.en} className="rounded-2xl bg-card p-5 border shadow-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <I className="h-4.5 w-4.5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-maroon">{t({ en: f.en, mr: f.mr })}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder card */}
      <section className="py-16 md:py-20 bg-primary-soft/40">
        <div className="container-page">
          <div className="rounded-3xl bg-card overflow-hidden grid md:grid-cols-[1fr_1.4fr] shadow-warm">
            <div className="bg-primary p-6 md:p-10 flex items-center justify-center">
              <img src={FOUNDER_PHOTO} alt="Mohan Maharaj Shinde" className="rounded-2xl w-full max-w-xs object-cover" />
            </div>
            <div className="p-6 md:p-10">
              <div className="section-eyebrow">{t({ en: "Founder Leadership", mr: "संस्थापक नेतृत्व" })}</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-display text-maroon">H.B.P. Mohan Maharaj Shinde</h2>
              <div className="text-sm text-muted-foreground">{t({ en: "Founder & President", mr: "संस्थापक व अध्यक्ष" })}</div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {t({
                  en: "Established in 2002, the Sanstha under the leadership of Shri Mohan Maharaj Shinde has been working tirelessly for the upliftment of B.A.Y. Sanskar orphans through his passion to provide free accommodation, food and education for over 2,000 needy children.",
                  mr: "२००२ पासून ह.भ.प. मोहन महाराज शिंदे यांच्या नेतृत्वाखाली संस्था अखंडपणे अनाथ मुलांच्या उत्थानासाठी कार्यरत आहे — २०००+ मुलांना मोफत निवास, अन्न व शिक्षण.",
                })}
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  { en: "Preserving Varkari & Sant lineage — Dnyaneshwari, Abhang, Haripath", mr: "वारकरी व संत परंपरा जपत — ज्ञानेश्वरी, अभंग, हरिपाठ" },
                  { en: "Personal training in Pakhavaj, Harmonium, Tabla & Vocal", mr: "पखवाज, हार्मोनियम, तबला व गायनाचे प्रशिक्षण" },
                  { en: "Free computer literacy and daily physical exercise at 5:00 AM", mr: "मोफत संगणक शिक्षण व पहाटे ५:०० वाजता व्यायाम" },
                  { en: "Extensive humanitarian & social relief across Maharashtra", mr: "महाराष्ट्रभर विस्तृत मानवतावादी व सामाजिक मदत" },
                ].map((x) => (
                  <li key={x.en} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{t(x)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 25 initiatives */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Human Touch & Community Service", mr: "मानवी स्पर्श व समाजसेवा" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "25 Social Welfare Initiatives by the Sanstha", mr: "संस्थेचे २५ सामाजिक कल्याण उपक्रम" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((x, idx) => (
              <div key={idx} className="rounded-xl bg-card border px-4 py-3 text-sm flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-bold shrink-0">▶</span>
                <span className="text-foreground/85">{t(x)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="py-16 md:py-20 bg-maroon text-maroon-foreground">
        <div className="container-page text-center">
          <div className="text-xs font-bold tracking-widest text-primary uppercase">{t({ en: "Our Impact in Numbers", mr: "आमचा प्रभाव" })}</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-display">{t({ en: "Two Decades of Meaningful Change", mr: "दोन दशकांचा अर्थपूर्ण बदल" })}</h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.en} className="rounded-2xl bg-white/5 border border-primary/20 py-6">
                <div className="font-display text-3xl md:text-4xl text-primary">{s.v}</div>
                <div className="mt-1 text-xs opacity-80">{t({ en: s.en, mr: s.mr })}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="section-eyebrow">{t({ en: "Trust & Compliance", mr: "विश्वास व अनुपालन" })}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-display text-maroon">{t({ en: "Registrations & Certifications", mr: "नोंदणी व प्रमाणपत्रे" })}</h2>
            <span className="divider-gold" />
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-primary-soft p-6">
              <div className="font-display text-xl text-maroon">ISO 9001 Certified</div>
              <p className="mt-2 text-sm text-foreground/80">Quality Management System certification for our educational and social welfare operations.</p>
            </div>
            <div className="rounded-2xl bg-primary-soft p-6">
              <div className="font-display text-xl text-maroon">Government Registrations</div>
              <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                <li>• Charity Commissioner: F-20829/Pune</li>
                <li>• 12AA Reg: AAJTS8449R25PN01</li>
                <li>• 80G Exempt: AAJTS8449R25PN02</li>
                <li>• FCRA: 083930714</li>
                <li>• Niti Aayog Darpan: MH/2017/0164490</li>
                <li>• CSR: CSR00014214</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
