// Bilingual (English / Urdu) content dictionary.
// `en` and `ur` share the exact same shape so components stay type-safe.

export type Lang = "en" | "ur";

export const en = {
  nav: {
    home: "Home",
    about: "About",
    services: "Services",
    conditions: "Conditions",
    homeVisit: "Home Visit",
    gallery: "Gallery",
    testimonials: "Testimonials",
    faq: "FAQ",
    contact: "Contact",
  },
  actions: {
    book: "Book Appointment",
    whatsapp: "WhatsApp",
    whatsappNow: "WhatsApp Now",
    callNow: "Call Now",
    bookHomeVisit: "Book a Home Visit",
    requestVisit: "Request Home Visit",
    getDirections: "Get Directions",
    submit: "Submit Request",
    submitting: "Submitting…",
    sendMessage: "Send Message",
    sending: "Sending…",
    learnMore: "Learn More",
  },
  hero: {
    badge: "Trusted Physiotherapy in Multan",
    titleLines: ["Move Better.", "Recover Faster.", "Live Pain-Free."],
    desc: "PainFix Physiotherapy Clinic provides evidence-based physiotherapy and rehabilitation to help patients overcome pain, recover from injuries, and restore movement through personalized treatment plans.",
  },
  homePhysio: {
    eyebrow: "Home Physiotherapy",
    title: "Physiotherapy at Your Doorstep",
    subtitle:
      "Can't visit our clinic? Get personalized physiotherapy at home, subject to location and appointment availability.",
    intro:
      "Receive professional physiotherapy treatment in the comfort of your home. Our experienced physiotherapists provide personalized assessment, treatment, and rehabilitation for patients who are unable to visit the clinic or prefer treatment at home.",
    suitableTitle: "Ideal for",
    suitable: [
      "Elderly patients",
      "Stroke rehabilitation",
      "Post-surgical rehabilitation",
      "Neurological rehabilitation",
      "Orthopedic conditions",
      "Chronic pain",
      "Sports injury recovery",
      "Mobility limitations",
    ],
    highlights: [
      "Elderly mobility support",
      "Stroke rehabilitation",
      "Post-operative rehabilitation",
      "Mobility-related conditions",
    ],
    requestButton: "Request a Home Visit",
    askFirst: "Prefer to ask first? Message the team about home-visit availability.",
  },
  homeVisit: {
    metaTitle: "Book a Home Visit — Home Physiotherapy in Multan | PainFix",
    metaDesc:
      "Premium home physiotherapy in Multan. Licensed physiotherapists provide personalized assessment, treatment and rehabilitation at your home. Request a home visit today.",
    hero: {
      badge: "Premium Home Healthcare",
      title: "Home Physiotherapy in Multan",
      subtitle:
        "Expert physiotherapy assessment, treatment and rehabilitation — delivered to your home with professional equipment and care.",
    },
    intro: {
      title: "Care that comes to you",
      body: "Receive professional physiotherapy treatment in the comfort of your home. Our experienced physiotherapists provide personalized assessment, treatment, and rehabilitation for patients who are unable to visit the clinic or prefer treatment at home.",
    },
    suitableTitle: "Suitable for",
    how: {
      title: "How Home Visits Work",
      subtitle: "A simple, guided process from request to recovery.",
      steps: [
        {
          title: "Submit a Request",
          desc: "Submit a Home Visit Request through the website or WhatsApp.",
        },
        {
          title: "We Contact You",
          desc: "Our team will contact you to understand your condition and confirm your location.",
        },
        {
          title: "Schedule a Time",
          desc: "A suitable appointment date and time will be scheduled.",
        },
        {
          title: "Physiotherapist Visits",
          desc: "A licensed physiotherapist will visit your home with the required equipment.",
        },
        {
          title: "Assessment & Treatment",
          desc: "A personalized assessment and treatment session will be performed.",
        },
        {
          title: "Rehabilitation Plan",
          desc: "A customized rehabilitation plan and follow-up schedule will be provided.",
        },
      ],
    },
    areas: {
      title: "Service Areas",
      body: "We provide home physiotherapy services across Multan.",
      note: "Availability depends on your location and appointment schedule.",
    },
    scheduling: {
      title: "Appointment Scheduling",
      subtitle: "Patients can schedule a home visit by:",
      ways: ["WhatsApp", "Phone Call", "Website Appointment Form"],
    },
    pricing: {
      title: "Pricing",
      subtitle: "Transparent, customized to your treatment needs.",
      items: [
        "Home Visit Charges",
        "Initial Assessment Fee",
        "Follow-up Session Fee",
        "Monthly Rehabilitation Packages",
      ],
      travelNote: "Travel charges may apply depending on distance.",
      note: "Contact us for current pricing and customized treatment packages.",
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "How long is one home session?",
          a: "A typical home physiotherapy session lasts around 45–60 minutes, depending on your condition and treatment plan.",
        },
        {
          q: "Who can benefit from home physiotherapy?",
          a: "Elderly patients, stroke and post-surgical patients, neurological and orthopedic cases, chronic pain sufferers, and anyone with mobility limitations.",
        },
        {
          q: "What equipment will the physiotherapist bring?",
          a: "Our physiotherapists carry the essential portable equipment needed for assessment, mobilization, and rehabilitation exercises.",
        },
        {
          q: "Can family members attend the session?",
          a: "Yes. We encourage family involvement so caregivers can learn how to support ongoing recovery at home.",
        },
        {
          q: "How do I reschedule an appointment?",
          a: "Simply contact us on WhatsApp or by phone and we'll arrange a new date and time that suits you.",
        },
      ],
    },
    form: {
      title: "Request a Home Visit",
      subtitle: "Fill in the details below and our team will contact you to confirm.",
      fullName: "Patient Name",
      phone: "WhatsApp or Contact Number",
      address: "Area or Location in Multan",
      addressHint: "Area or nearby landmark (for example, Shalimar Colony)",
      condition: "Main Condition or Reason for Physiotherapy",
      date: "Preferred Visit Date",
      time: "Preferred Visit Time",
      notes: "Additional Information (optional)",
      success: "Request received! Our team will contact you shortly.",
      error: "Something went wrong. Please try again or reach us on WhatsApp.",
      required: "Please complete all required fields.",
      phoneInvalid: "Enter a valid contact number.",
      dateInvalid: "Choose today or a future date.",
    },
  },
  contact: {
    eyebrow: "Contact",
    title: "Visit us in Multan",
    subtitle: "We're here to answer your questions and get your recovery started.",
    address: "Address",
    phone: "Phone",
    whatsapp: "WhatsApp",
    follow: "Follow Us",
    formTitle: "Send us a message",
    formSubtitle: "We'll get back to you as soon as possible.",
    name: "Your Name",
    email: "Email (optional)",
    phoneField: "Phone",
    message: "Message",
    bookTitle: "Book Your Appointment",
    bookSubtitle: "Pick a time that works for you and schedule instantly — no calls needed.",
    success: "Message sent! We'll be in touch soon.",
    error: "Couldn't send your message. Please try again.",
    required: "Please add your name, phone and a message.",
  },
  cta: {
    title: "Ready to Begin Your Recovery?",
    subtitle:
      "Take the first step toward a stronger, pain-free life. Our team is ready to help you move better.",
  },
  footer: {
    tagline:
      "Evidence-based physiotherapy and rehabilitation in Multan, helping you move better and live pain-free.",
    quickLinks: "Quick Links",
    contact: "Contact",
    rights: "All rights reserved.",
  },
};

export type Dict = typeof en;

export const ur: Dict = {
  nav: {
    home: "ہوم",
    about: "ہمارے بارے میں",
    services: "خدمات",
    conditions: "امراض",
    homeVisit: "گھر پر وزٹ",
    gallery: "گیلری",
    testimonials: "آراء",
    faq: "سوالات",
    contact: "رابطہ",
  },
  actions: {
    book: "اپائنٹمنٹ بک کریں",
    whatsapp: "واٹس ایپ",
    whatsappNow: "واٹس ایپ کریں",
    callNow: "ابھی کال کریں",
    bookHomeVisit: "گھر پر وزٹ بک کریں",
    requestVisit: "گھر وزٹ کی درخواست",
    getDirections: "راستہ دیکھیں",
    submit: "درخواست بھیجیں",
    submitting: "بھیجا جا رہا ہے…",
    sendMessage: "پیغام بھیجیں",
    sending: "بھیجا جا رہا ہے…",
    learnMore: "مزید جانیں",
  },
  hero: {
    badge: "ملتان میں قابلِ اعتماد فزیوتھراپی",
    titleLines: ["بہتر حرکت کریں۔", "تیزی سے صحتیاب ہوں۔", "درد سے پاک زندگی۔"],
    desc: "پین فکس فزیوتھراپی کلینک شواہد پر مبنی فزیوتھراپی اور بحالی فراہم کرتا ہے تاکہ مریض درد پر قابو پا سکیں، چوٹوں سے صحتیاب ہوں اور ذاتی نوعیت کے علاج کے ذریعے اپنی حرکت بحال کر سکیں۔",
  },
  homePhysio: {
    eyebrow: "گھر پر فزیوتھراپی",
    title: "فزیوتھراپی آپ کی دہلیز پر",
    subtitle:
      "کلینک آنا مشکل ہے؟ مقام اور اپائنٹمنٹ کی دستیابی سے مشروط، گھر پر ذاتی فزیوتھراپی حاصل کریں۔",
    intro:
      "اپنے گھر کے آرام میں پیشہ ورانہ فزیوتھراپی علاج حاصل کریں۔ ہمارے تجربہ کار فزیوتھراپسٹ ان مریضوں کے لیے ذاتی تشخیص، علاج اور بحالی فراہم کرتے ہیں جو کلینک نہیں آ سکتے یا گھر پر علاج کو ترجیح دیتے ہیں۔",
    suitableTitle: "کن کے لیے موزوں ہے",
    suitable: [
      "بزرگ مریض",
      "فالج کی بحالی",
      "آپریشن کے بعد کی بحالی",
      "اعصابی بحالی",
      "ہڈیوں و جوڑوں کے امراض",
      "دائمی درد",
      "کھیل کی چوٹ کی بحالی",
      "حرکت میں محدودیت",
    ],
    highlights: [
      "بزرگوں کی نقل و حرکت میں مدد",
      "فالج کے بعد بحالی",
      "آپریشن کے بعد بحالی",
      "حرکت سے متعلق مسائل",
    ],
    requestButton: "گھر وزٹ کی درخواست دیں",
    askFirst: "پہلے پوچھنا چاہتے ہیں؟ گھر وزٹ کی دستیابی کے بارے میں ٹیم کو پیغام بھیجیں۔",
  },
  homeVisit: {
    metaTitle: "گھر پر وزٹ بک کریں — ملتان میں گھر پر فزیوتھراپی | پین فکس",
    metaDesc:
      "ملتان میں معیاری گھریلو فزیوتھراپی۔ لائسنس یافتہ فزیوتھراپسٹ آپ کے گھر پر ذاتی تشخیص، علاج اور بحالی فراہم کرتے ہیں۔ آج ہی گھر وزٹ کی درخواست دیں۔",
    hero: {
      badge: "معیاری گھریلو ہیلتھ کیئر",
      title: "ملتان میں گھر پر فزیوتھراپی",
      subtitle:
        "ماہرانہ فزیوتھراپی تشخیص، علاج اور بحالی — پیشہ ورانہ آلات اور دیکھ بھال کے ساتھ آپ کے گھر پر۔",
    },
    intro: {
      title: "علاج جو آپ تک آئے",
      body: "اپنے گھر کے آرام میں پیشہ ورانہ فزیوتھراپی علاج حاصل کریں۔ ہمارے تجربہ کار فزیوتھراپسٹ ان مریضوں کے لیے ذاتی تشخیص، علاج اور بحالی فراہم کرتے ہیں جو کلینک نہیں آ سکتے یا گھر پر علاج کو ترجیح دیتے ہیں۔",
    },
    suitableTitle: "کن کے لیے موزوں ہے",
    how: {
      title: "گھر وزٹ کیسے کام کرتا ہے",
      subtitle: "درخواست سے بحالی تک ایک آسان، رہنمائی شدہ عمل۔",
      steps: [
        {
          title: "درخواست جمع کروائیں",
          desc: "ویب سائٹ یا واٹس ایپ کے ذریعے گھر وزٹ کی درخواست دیں۔",
        },
        {
          title: "ہم رابطہ کریں گے",
          desc: "ہماری ٹیم آپ کی حالت سمجھنے اور مقام کی تصدیق کے لیے آپ سے رابطہ کرے گی۔",
        },
        { title: "وقت طے کریں", desc: "ایک موزوں اپائنٹمنٹ تاریخ اور وقت طے کیا جائے گا۔" },
        {
          title: "فزیوتھراپسٹ کی آمد",
          desc: "لائسنس یافتہ فزیوتھراپسٹ ضروری آلات کے ساتھ آپ کے گھر آئے گا۔",
        },
        { title: "تشخیص و علاج", desc: "ذاتی تشخیص اور علاج کا سیشن کیا جائے گا۔" },
        { title: "بحالی پلان", desc: "ذاتی بحالی پلان اور فالو اپ شیڈول فراہم کیا جائے گا۔" },
      ],
    },
    areas: {
      title: "سروس کے علاقے",
      body: "ہم پورے ملتان میں گھریلو فزیوتھراپی خدمات فراہم کرتے ہیں۔",
      note: "دستیابی آپ کے مقام اور اپائنٹمنٹ شیڈول پر منحصر ہے۔",
    },
    scheduling: {
      title: "اپائنٹمنٹ شیڈول",
      subtitle: "مریض گھر وزٹ درج ذیل طریقوں سے طے کر سکتے ہیں:",
      ways: ["واٹس ایپ", "فون کال", "ویب سائٹ اپائنٹمنٹ فارم"],
    },
    pricing: {
      title: "قیمتیں",
      subtitle: "شفاف، آپ کی علاج کی ضروریات کے مطابق۔",
      items: ["گھر وزٹ چارجز", "ابتدائی تشخیص فیس", "فالو اپ سیشن فیس", "ماہانہ بحالی پیکجز"],
      travelNote: "فاصلے کے مطابق سفری چارجز لاگو ہو سکتے ہیں۔",
      note: "موجودہ قیمتوں اور ذاتی علاج پیکجز کے لیے ہم سے رابطہ کریں۔",
    },
    faq: {
      title: "اکثر پوچھے جانے والے سوالات",
      items: [
        {
          q: "ایک گھر سیشن کتنا طویل ہوتا ہے؟",
          a: "عام گھریلو فزیوتھراپی سیشن آپ کی حالت اور علاج پلان کے مطابق تقریباً 45 تا 60 منٹ ہوتا ہے۔",
        },
        {
          q: "گھر پر فزیوتھراپی سے کون فائدہ اٹھا سکتا ہے؟",
          a: "بزرگ مریض، فالج اور آپریشن کے بعد کے مریض، اعصابی و ہڈی جوڑ کے کیسز، دائمی درد کے مریض، اور حرکت میں محدودیت والے افراد۔",
        },
        {
          q: "فزیوتھراپسٹ کون سے آلات لائے گا؟",
          a: "ہمارے فزیوتھراپسٹ تشخیص، حرکت اور بحالی کی ورزشوں کے لیے ضروری پورٹیبل آلات ساتھ لاتے ہیں۔",
        },
        {
          q: "کیا اہلِ خانہ سیشن میں شریک ہو سکتے ہیں؟",
          a: "جی ہاں۔ ہم اہلِ خانہ کی شرکت کی حوصلہ افزائی کرتے ہیں تاکہ وہ گھر پر بحالی میں مدد کرنا سیکھ سکیں۔",
        },
        {
          q: "میں اپائنٹمنٹ دوبارہ کیسے شیڈول کروں؟",
          a: "بس واٹس ایپ یا فون پر ہم سے رابطہ کریں، ہم آپ کے لیے موزوں نئی تاریخ اور وقت طے کر دیں گے۔",
        },
      ],
    },
    form: {
      title: "گھر وزٹ کی درخواست",
      subtitle: "نیچے تفصیلات بھریں، ہماری ٹیم تصدیق کے لیے آپ سے رابطہ کرے گی۔",
      fullName: "مریض کا نام",
      phone: "واٹس ایپ یا رابطہ نمبر",
      address: "ملتان میں علاقہ یا مقام",
      addressHint: "علاقہ یا قریبی نشانی (مثلاً شالیمار کالونی)",
      condition: "فزیوتھراپی کی بنیادی وجہ یا حالت",
      date: "وزٹ کی ترجیحی تاریخ",
      time: "وزٹ کا ترجیحی وقت",
      notes: "اضافی معلومات (اختیاری)",
      success: "درخواست موصول ہو گئی! ہماری ٹیم جلد رابطہ کرے گی۔",
      error: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں یا واٹس ایپ پر رابطہ کریں۔",
      required: "براہِ کرم تمام ضروری خانے مکمل کریں۔",
      phoneInvalid: "براہِ کرم درست رابطہ نمبر درج کریں۔",
      dateInvalid: "آج یا مستقبل کی تاریخ منتخب کریں۔",
    },
  },
  contact: {
    eyebrow: "رابطہ",
    title: "ملتان میں ہم سے ملیں",
    subtitle: "ہم آپ کے سوالات کے جواب دینے اور آپ کی بحالی شروع کرنے کے لیے حاضر ہیں۔",
    address: "پتہ",
    phone: "فون",
    whatsapp: "واٹس ایپ",
    follow: "ہمیں فالو کریں",
    formTitle: "ہمیں پیغام بھیجیں",
    formSubtitle: "ہم جلد از جلد آپ سے رابطہ کریں گے۔",
    name: "آپ کا نام",
    email: "ای میل (اختیاری)",
    phoneField: "فون",
    message: "پیغام",
    bookTitle: "اپنی اپائنٹمنٹ بک کریں",
    bookSubtitle: "اپنے لیے موزوں وقت منتخب کریں اور فوراً شیڈول کریں — کال کی ضرورت نہیں۔",
    success: "پیغام بھیج دیا گیا! ہم جلد رابطہ کریں گے۔",
    error: "پیغام نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔",
    required: "براہِ کرم اپنا نام، فون اور پیغام درج کریں۔",
  },
  cta: {
    title: "اپنی بحالی شروع کرنے کے لیے تیار ہیں؟",
    subtitle:
      "مضبوط، درد سے پاک زندگی کی طرف پہلا قدم اٹھائیں۔ ہماری ٹیم آپ کی بہتر حرکت میں مدد کے لیے تیار ہے۔",
  },
  footer: {
    tagline:
      "ملتان میں شواہد پر مبنی فزیوتھراپی اور بحالی، جو آپ کو بہتر حرکت اور درد سے پاک زندگی میں مدد دیتی ہے۔",
    quickLinks: "فوری لنکس",
    contact: "رابطہ",
    rights: "جملہ حقوق محفوظ ہیں۔",
  },
};

export const translations: Record<Lang, Dict> = { en, ur };
