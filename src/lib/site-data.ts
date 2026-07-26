// Shared site data — image URLs, contact info, bank details, etc.
// Content sourced from user-provided PDFs and screenshots.

export const SITE = {
  name: { en: "Shriramkrishna Adhyatmik", mr: "श्रीरामकृष्ण अध्यात्मिक" },
  tagline: { en: "Varkari Shikshan Sanstha", mr: "वारकरी शिक्षण संस्था" },
  logo: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/Transparent-Logo.png",
  phone: "+91 75887 91149",
  email: "info@shriramkrishnatrust.org",
  address: {
    en: "Survey No. 116/9, Indrayani Nagar, Near Phala Sansthan, Alandi Dewachi, Tal. Khed, Dist. Pune - 412105",
    mr: "सर्वे नं. ११६/९, इंद्रायणी नगर, फळा संस्थान शेजारी, आळंदी देवाची, ता. खेड, जि. पुणे - ४१२१०५",
  },
  trustReg: "F-20829/Pune (18-09-2002)",
  website: "www.shriramkrishnatrust.org",
};

export const BANK_ACCOUNTS = [
  { name: "HDFC Bank (Alandi Branch)", ac: "50200069272060", ifsc: "HDFC0009467" },
  { name: "ICICI Bank (Kothrud Branch)", ac: "033805006282", ifsc: "ICIC0000338" },
  { name: "SBI FCRA (New Delhi Branch)", ac: "40106372110", ifsc: "SBIN0000691" },
];

export const UPI_ID = "hbr.shinde@icici";
export const TAX_BENEFITS = { reg12AA: "AAKIB1287K", exempt80G: "AAKIB1287KF20214" };

export const NAV = [
  { to: "/", en: "Home", mr: "मुख्यपृष्ठ" },
  { to: "/about", en: "About", mr: "आमच्याबद्दल" },
  { to: "/activities", en: "Activities", mr: "उपक्रम" },
  { to: "/curriculum", en: "Curriculum", mr: "अभ्यासक्रम" },
  { to: "/gallery", en: "Gallery", mr: "गॅलरी" },
  { to: "/contact", en: "Contact", mr: "संपर्क" },
] as const;

// Desktop hero slides
export const HERO_DESKTOP = [
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/पुणे-येथे-पं.-भीमसेन-जोशी-संगीत-महोत्सव.jpg",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेमध्ये-विद्यार्थी-मृदंग-प्रॅक्टिस-सराव-करताना.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेमध्ये-विद्यार्थी-डिनर-रात्रीचे-जेवण-करताना.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/क्रिफ्ट-Crift-कंपनीकडून-श्रीरामकृष्ण-संस्थेमध्ये-कॉम्प्युटर-वाटप-करण्यात-आले-2.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेचे-विद्यार्थी-शाळेत-जाताना.png",
];

export const HERO_MOBILE = [
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/23.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/क्रिफ्ट-Crift-कंपनीकडून-श्रीरामकृष्ण-संस्थेमध्ये-कॉम्प्युटर-वाटप-करण्यात-आले-2.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेचे-विद्यार्थी-शाळेत-जाताना-3.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेमध्ये-विद्यार्थी-डिनर-रात्रीचे-जेवण-करताना-4.png",
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेमध्ये-विद्यार्थी-मृदंग-प्रॅक्टिस-सराव-करताना-5.png",
];

export const STATS = [
  { value: "2,006", en: "Sanstha Established", mr: "संस्था स्थापना" },
  { value: "1,607+", en: "Students Educated", mr: "शिक्षित विद्यार्थी" },
  { value: "13", en: "Current Resident Students", mr: "सद्य निवासी विद्यार्थी" },
  { value: "7–8", en: "Free Orphan Adoption Annually", mr: "मोफत अनाथ दत्तक (वार्षिक)" },
];

// Founder photo (from screenshots — served from user's existing CDN)
export const FOUNDER_PHOTO =
  "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/संस्थापक-1.jpg";

// Press highlights (newspaper clippings)
export const PRESS = [
  {
    img: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/भारतरत्न-पं.-भीमसेन-जोशी-शास्त्रीय-संगीत-महोत्सव-पुण्यात-रंगणार.png",
    title: { en: "Bharat Ratna Pt. Bhimsen Joshi festival to unfold in Pune", mr: "भारतरत्न पं. भीमसेन जोशी शास्त्रीय संगीत महोत्सव पुण्यात रंगणार" },
  },
  {
    img: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/तोरणा-किल्ल्याच्या-कुशीत-अखंड-हरिनामाचा-जागर.png",
    title: { en: "Unbroken Harinam jagar in the arms of Torna fort", mr: "तोरणा किल्ल्याच्या कुशीत अखंड हरिनामाचा जागर" },
  },
  {
    img: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-संस्थेच्या-मुलांना-ब्लँकेट-वाटप.png",
    title: { en: "Blanket distribution for Shriramkrishna Sanstha children", mr: "श्रीरामकृष्ण संस्थेच्या मुलांना ब्लँकेट वाटप" },
  },
  {
    img: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/अर्धविनायक-सिटी-सोसायटीकडून-गरजू-विद्यार्थ्यांना-फॅनचे-वाटप.png",
    title: { en: "Ardhavinayak City Society distributes fans to needy students", mr: "अर्धविनायक सिटी सोसायटीकडून गरजू विद्यार्थ्यांना फॅनचे वाटप" },
  },
  {
    img: "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/श्रीरामकृष्ण-वारकरीच्या-विद्यार्थिनीचे-कीर्तनाने-श्रोते-मंत्रमुग्ध.png",
    title: { en: "Student's Kirtan enthralls listeners", mr: "श्रीरामकृष्ण वारकरीच्या विद्यार्थिनीचे कीर्तनाने श्रोते मंत्रमुग्ध" },
  },
];

// Gallery images (Marathi filenames from user's CDN)
const GAL_BASE = "https://shriramkrishnatrust.org/wp-content/uploads/2026/07/";
export const GALLERY_PHOTOS: { src: string; caption: { en: string; mr: string } }[] = [
  ["३०-मुलांना-दत्तक-घेतले.jpg", "30 children adopted", "३० मुलांना दत्तक घेतले"],
  ["अधिकमासानिमित्त-कार्यक्रम.jpg", "Adhikmaas programme", "अधिकमासानिमित्त कार्यक्रम"],
  ["आळंदी-संस्थेतर्फे-श्री-ज्ञानेश्वरी-ग्रंथ-भेट-देताना.jpg", "Dnyaneshwari granth gifted at Alandi", "आळंदी संस्थेतर्फे श्री ज्ञानेश्वरी ग्रंथ भेट"],
  ["कार्तिकी-वारीनिमित्त-महाप्रसाद.jpg", "Kartiki Wari Mahaprasad", "कार्तिकी वारीनिमित्त महाप्रसाद"],
  ["किल्ला-दर्शन-व-शैक्षणिक-सहल.jpg", "Fort visit & educational trip", "किल्ला दर्शन व शैक्षणिक सहल"],
  ["कोरोना-काळामध्ये-धान्य-वाटप-scaled.jpg", "Grain distribution during COVID", "कोरोना काळामध्ये धान्य वाटप"],
  ["कोल्हापूर-येथील-श्री-ज्योतिबा-देवाचे-दर्शन.jpg", "Shri Jyotiba darshan at Kolhapur", "कोल्हापूर श्री ज्योतिबा देवाचे दर्शन"],
  ["क्रिप्ट-कंपनीकडून-मिळालेली-भेट.jpg", "Gift from Crypt company", "क्रिप्ट कंपनीकडून मिळालेली भेट"],
  ["क्रिप्ट-कंपनीकडून-मुलांना-१-वर्षाचे-शालेय-साहित्य-भेट-scaled.jpg", "1-year school supplies from Crypt", "क्रिप्ट कंपनीकडून १ वर्षाचे शालेय साहित्य"],
  ["क्रिप्ट-कंपनीकडून-मुलांना-भेटवस्तू-वाटप-scaled.jpg", "Gifts distributed by Crypt", "क्रिप्ट कंपनीकडून भेटवस्तू वाटप"],
  ["खो-खो-खेळताना.webp", "Playing Kho-Kho", "खो-खो खेळताना"],
  ["जेवणाचे-डबे-वाटप-2-scaled.jpg", "Meal box distribution", "जेवणाचे डबे वाटप"],
  ["ज्ञानेश्वरी-पारायण-सोहळा.webp", "Dnyaneshwari Parayan Sohla", "ज्ञानेश्वरी पारायण सोहळा"],
  ["डॉ.-बाबासाहेब-आंबेडकर-जयंती.jpg", "Dr. Babasaheb Ambedkar Jayanti", "डॉ. बाबासाहेब आंबेडकर जयंती"],
  ["धरण-परिसराची-शैक्षणिक-सहल.jpg", "Dam-area educational trip", "धरण परिसराची शैक्षणिक सहल"],
  ["पंढरपूर-येथे-वारकरी-संस्थेला-भेट-scaled.jpg", "Visit to Varkari Sanstha, Pandharpur", "पंढरपूर वारकरी संस्थेला भेट"],
  ["पुणे-येथे-पं.-भीमसेन-जोशी-संगीत-महोत्सव.jpg", "Pt. Bhimsen Joshi music festival, Pune", "पुणे येथे पं. भीमसेन जोशी संगीत महोत्सव"],
  ["बैलपोळा-सण-उत्साहात-साजरा-केला-scaled.jpg", "Bail Pola festival celebration", "बैलपोळा सण साजरा केला"],
  ["ब्लँकेट-वाटप-2.jpg", "Blanket distribution", "ब्लँकेट वाटप"],
  ["ब्लँकेट-वाटप-scaled.jpg", "Blanket distribution", "ब्लँकेट वाटप"],
  ["भगवद्गीतेचा-पाठ-करताना-2.jpg", "Reciting Bhagavad Gita", "भगवद्गीतेचा पाठ करताना"],
  ["भगवद्गीतेचा-पाठ-करताना.jpg", "Reciting Bhagavad Gita", "भगवद्गीतेचा पाठ करताना"],
  ["भाविकांना-ज्ञानेश्वरी-ग्रंथांचे-वाटप-करण्यात-आले.jpg", "Dnyaneshwari granth distribution", "भाविकांना ज्ञानेश्वरी ग्रंथांचे वाटप"],
  ["भूलभुलैय्या-येथे-शैक्षणिक-सहल.jpg", "Educational trip to Bhulbhulaiya", "भूलभुलैय्या शैक्षणिक सहल"],
  ["मुला-मुलींना-गाद्या-व-उशांचे-वाटप-3.jpg", "Mattress & pillow distribution", "मुला-मुलींना गाद्या व उशांचे वाटप"],
  ["महाराजांच्या-मार्गदर्शनाखाली-वृक्षारोपण-करताना.webp", "Tree planting under Maharaj's guidance", "महाराजांच्या मार्गदर्शनाखाली वृक्षारोपण"],
  ["मुला-मुलींना-गाद्या-व-उशांचे-वाटप.jpg", "Mattress & pillow distribution", "मुला-मुलींना गाद्या व उशांचे वाटप"],
  ["मुला-मुलींना-वह्यांचे-वाटप.jpg", "Notebook distribution", "मुला-मुलींना वह्यांचे वाटप"],
  ["मुला-मुलींना-टॅब-भेटवस्तूंचे-वितरण-करण्यात-आले.jpg", "Tab devices distributed", "मुला-मुलींना टॅब भेटवस्तू वितरण"],
  ["मुला-मुलींना-शालेय-दप्तरांचे-वाटप-2.jpg", "School bag distribution", "मुला-मुलींना शालेय दप्तरांचे वाटप"],
  ["मुला-मुलींना-शालेय-दप्तरांचे-वाटप.jpg", "School bag distribution", "मुला-मुलींना शालेय दप्तरांचे वाटप"],
  ["मुला-मुलींना-शालेय-साहित्य-स्टेशनरी-व-भेटवस्तूंचे-वाटप-scaled.jpg", "School stationery distribution", "शालेय साहित्य स्टेशनरी वाटप"],
  ["मुला-मुलींना-शैक्षणिक-स्टेशनरीचे-वाटप.jpg", "Educational stationery distribution", "शैक्षणिक स्टेशनरीचे वाटप"],
  ["मुलींना-स्टेशनरी-वाटप-2-scaled.jpg", "Stationery distribution to girls", "मुलींना स्टेशनरी वाटप"],
  ["मुलींना-स्टेशनरी-वाटप-scaled.jpg", "Stationery distribution to girls", "मुलींना स्टेशनरी वाटप"],
  ["मृदुंग-वादनाचे-प्रशिक्षण-घेताना.jpg", "Mridang training", "मृदुंग वादनाचे प्रशिक्षण"],
  ["रक्षाबंधन-सोहळा-उत्साहात-साजरा-केला-3-scaled.jpg", "Rakshabandhan celebration", "रक्षाबंधन सोहळा साजरा"],
  ["रक्षाबंधन-सोहळा-उत्साहात-साजरा-केला-scaled.jpg", "Rakshabandhan celebration", "रक्षाबंधन सोहळा साजरा"],
  ["राजस्थानमधील-सोजत-येथे-भेट.jpg", "Visit to Sojat, Rajasthan", "राजस्थानमधील सोजत भेट"],
  ["वाढदिवस-आनंदात-व-उत्साहात-साजरा-केला-2-scaled.jpg", "Birthday celebration", "वाढदिवस साजरा केला"],
  ["वाढदिवस-आनंदात-व-उत्साहात-साजरा-केला-3-scaled.jpg", "Birthday celebration", "वाढदिवस साजरा केला"],
  ["वाढदिवस-आनंदात-व-उत्साहात-साजरा-केला-4-scaled.jpg", "Birthday celebration", "वाढदिवस साजरा केला"],
  ["वाढदिवस-आनंदात-व-उत्साहात-साजरा-केला-scaled.jpg", "Birthday celebration", "वाढदिवस साजरा केला"],
  ["विठ्ठल-रुक्मिणी-मंदिर-समिती.jpg", "Vitthal-Rukmini temple committee", "विठ्ठल रुक्मिणी मंदिर समिती"],
  ["विठ्ठल-रुक्मिणी-संस्थेतर्फे-ज्ञानेश्वरी-माऊलींच्या-प्रतिमेची-भेट.webp", "Dnyaneshwari Mauli image gift", "ज्ञानेश्वरी माऊलींच्या प्रतिमेची भेट"],
  ["शनीश्वर-मंदिर-देवस्थान-दर्शन-2.jpg", "Shanishwar temple darshan", "शनीश्वर मंदिर देवस्थान दर्शन"],
  ["विद्यार्थ्यांना-रंगपेटी-वाटप.webp", "Colour box distribution", "विद्यार्थ्यांना रंगपेटी वाटप"],
  ["शांतिब्रह्म-संस्थेला-संगणक-भेट-दिला-scaled.jpg", "Computer donated to Shantibrahma", "शांतिब्रह्म संस्थेला संगणक भेट"],
  ["श्री.-खैरे-यांच्या-अभिष्टचिंतन-सोहळ्यानिमित्त-मुला-मुलींना-स्टेशनरी-वाटप-scaled.jpg", "Stationery on Khaire's birthday", "श्री. खैरे अभिष्टचिंतन स्टेशनरी वाटप"],
  ["संगणक-वाटप-सोहळा.jpg", "Computer distribution ceremony", "संगणक वाटप सोहळा"],
  ["संगणक-शिक्षण-प्रशिक्षण.jpg", "Computer training", "संगणक शिक्षण प्रशिक्षण"],
  ["संत-नामदेव-महाराजांची-पुण्यतिथी-श्रद्धापूर्वक-साजरी-केली-scaled.jpg", "Sant Namdev punyatithi", "संत नामदेव महाराज पुण्यतिथी"],
  ["संत-नामदेव-महाराजांच्या-पुण्यतिथीनिमित्त-scaled.jpg", "Sant Namdev punyatithi observance", "संत नामदेव पुण्यतिथीनिमित्त"],
  ["संत-सावता-महाराज-पुण्यतिथीनिमित्त-महाप्रसाद.jpg", "Sant Savata Maharaj Mahaprasad", "संत सावता महाराज महाप्रसाद"],
  ["सरदार-पटेल-यांच्या-‘स्टॅच्यू-ऑफ-युनिटीला-शैक्षणिक-सहल-2.jpg", "Statue of Unity educational trip", "स्टॅच्यू ऑफ युनिटी सहल"],
  ["सरदार-पटेल-यांच्या-‘स्टॅच्यू-ऑफ-युनिटीला-शैक्षणिक-सहल-scaled.jpg", "Statue of Unity educational trip", "स्टॅच्यू ऑफ युनिटी सहल"],
  ["हरिनाम-सप्ताहानिमित्त-दिंडीचे-आयोजन.jpg", "Dindi during Harinam Saptah", "हरिनाम सप्ताहानिमित्त दिंडीचे आयोजन"],
  ["होळीचा-सण-आनंदात-व-उत्साहात-साजरा-केला.jpg", "Holi celebration", "होळीचा सण साजरा केला"],
  ["होळीचा-सण-साजरा-करताना.webp", "Holi celebration", "होळीचा सण साजरा करताना"],
].map(([f, en, mr]) => ({ src: GAL_BASE + f, caption: { en, mr } }));

export const VIDEOS = [
  "मृदंग-सराव-व्हिडिओ-2.mp4",
  "मृदंग-सराव-व्हिडिओ-3.mp4",
  "मृदंग-सराव-व्हिडिओ.mp4",
  "राजस्थानातील-कथेमध्ये-फुगडी-खेळतानाचे-दृश्य.mp4",
  "राजस्थानातील-कीर्तन-कथा-व्हिडिओ.mp4",
  "होळी-उत्सव-1.mp4",
  "होळी-उत्सव-2.mp4",
  "होळी-उत्सव-3.mp4",
  "कीर्तन-सोहळ्याचा-व्हिडिओ.mp4",
  "भारतरत्न-पंडित-भीमसेन-जोशी-स्मृती-संगीत-महोत्सव-2.mp4",
  "भारतरत्न-पंडित-भीमसेन-जोशी-स्मृती-संगीत-महोत्सव.mp4",
].map((f) => GAL_BASE + f);
