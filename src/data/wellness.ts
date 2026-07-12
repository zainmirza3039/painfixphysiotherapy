import { blogPosts, type BlogPost } from "./blog";

/**
 * Diet & Nutrition gate.
 *
 * The clinic will offer Diet & Nutrition once a QUALIFIED DIETITIAN officially
 * joins PainFix. Until then every diet page is built and ready, but kept
 * HIDDEN: excluded from navigation, footer and sitemap, marked `noindex`, and
 * shown with a "launching soon" notice so no service is implied before a real
 * professional is in place.
 *
 * Flip this to `true` (and assign the dietitian in team data) to publish the
 * whole Diet & Nutrition section at once.
 */
export const DIET_NUTRITION_ENABLED = false;

export interface WellnessFaq {
  q: string;
  a: string;
}

export interface JourneyStep {
  title: string;
  description: string;
}

export interface WellnessFeature {
  title: string;
  description: string;
}

export interface WellnessPage {
  slug: string;
  eyebrow: string;
  title: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  /** AEO / GEO "Quick Summary" (direct answer). */
  quickSummary: string;
  keyTakeaways: string[];
  featuresHeading?: string;
  features?: WellnessFeature[];
  whoCanBenefit: string[];
  /** Optional patient-journey flow. */
  journeyHeading?: string;
  journey?: JourneyStep[];
  faqs: WellnessFaq[];
  relatedServiceSlugs: string[];
  /** Blog categories used to surface related articles. */
  relatedArticleCategories?: string[];
  /** Explicit related article slugs (take priority over categories). */
  relatedArticleSlugs?: string[];
}

/** Resolve related articles for a wellness page by explicit slug or category. */
export function relatedArticlesForWellness(page: WellnessPage, limit = 3): BlogPost[] {
  const out: BlogPost[] = [];
  const seen = new Set<string>();

  const push = (p?: BlogPost) => {
    if (!p || seen.has(p.slug) || out.length >= limit) return;
    seen.add(p.slug);
    out.push(p);
  };

  if (page.relatedArticleSlugs) {
    for (const slug of page.relatedArticleSlugs) push(blogPosts.find((p) => p.slug === slug));
  }
  if (page.relatedArticleCategories) {
    for (const p of blogPosts) {
      if (page.relatedArticleCategories.includes(p.category)) push(p);
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Fitness & Rehabilitation (delivered by our physiotherapists)               */
/* -------------------------------------------------------------------------- */

export const fitnessPage: WellnessPage = {
  slug: "fitness-rehabilitation",
  eyebrow: "Fitness & Rehabilitation",
  title: "Personalised Fitness & Rehabilitation",
  heroSubtitle:
    "Physiotherapist-led fitness and rehabilitation in Multan — safe, individualised exercise programmes to rebuild strength, restore movement and keep you injury-free.",
  metaTitle: "Personalised Fitness & Rehabilitation in Multan | PainFix",
  metaDescription:
    "Physiotherapist-led fitness and rehabilitation in Multan. Personalised exercise, corrective training, strength & conditioning, mobility and injury prevention at PainFix.",
  quickSummary:
    "Personalised fitness and rehabilitation at PainFix is a physiotherapist-led exercise programme built around your assessment, goals and daily life. Dr. Zain Ul Abideen and Dr. Jalal Ud Din use corrective exercise, functional training, strength & conditioning, and mobility work to help you recover from injury, move better and prevent recurrence — progressed safely and reviewed as you improve.",
  keyTakeaways: [
    "Every programme is individually assessed and graded to your level",
    "Led by qualified physiotherapists, not generic gym plans",
    "Focus on safe recovery, strength and long-term injury prevention",
    "Includes clear home exercise programmes to continue between sessions",
  ],
  featuresHeading: "What Your Programme Can Include",
  features: [
    {
      title: "Personalised Fitness Programmes",
      description:
        "Individually designed exercise plans matched to your body, goals and current fitness level.",
    },
    {
      title: "Corrective Exercise",
      description:
        "Targeted movements that correct muscle imbalances, weakness and faulty movement patterns.",
    },
    {
      title: "Functional Training",
      description:
        "Real-life movement training so you move, lift and work with less pain and more confidence.",
    },
    {
      title: "Injury Prevention",
      description:
        "Screening and conditioning to reduce your risk of injury and recurring problems.",
    },
    {
      title: "Strength & Conditioning",
      description:
        "Progressive, evidence-based strengthening to rebuild power, stability and endurance.",
    },
    {
      title: "Mobility Training",
      description:
        "Flexibility and joint-mobility work to restore a full, comfortable range of motion.",
    },
    {
      title: "Posture Improvement",
      description:
        "Postural correction for desk workers, students and anyone with tech-neck or back strain.",
    },
    {
      title: "Home Exercise Programmes",
      description:
        "Clear, guided home routines so your progress continues safely between clinic visits.",
    },
  ],
  whoCanBenefit: [
    "People recovering from injury, surgery or long inactivity",
    "Desk workers and students with posture-related pain",
    "Active people and athletes wanting to prevent recurring injuries",
    "Anyone wanting a safe, guided way to get stronger and move better",
  ],
  journeyHeading: "Your Fitness & Rehabilitation Journey",
  journey: [
    {
      title: "Assessment",
      description: "A detailed evaluation of your strength, movement, posture and history.",
    },
    {
      title: "Goal Setting",
      description: "We agree clear, realistic goals based on your needs and lifestyle.",
    },
    {
      title: "Personalised Programme",
      description: "A graded, individualised exercise plan built specifically for you.",
    },
    {
      title: "Progress Monitoring",
      description: "Guided sessions with regular tracking to ensure safe progression.",
    },
    {
      title: "Reassessment",
      description: "We re-test and adjust your programme so you keep improving.",
    },
  ],
  faqs: [
    {
      q: "Who designs and supervises the programme?",
      a: "Your programme is designed and supervised by our qualified physiotherapists, Dr. Zain Ul Abideen and Dr. Jalal Ud Din, based on a full assessment — not a generic template.",
    },
    {
      q: "Do I need to be fit already to start?",
      a: "No. Programmes begin at your current level and are progressed gradually and safely, whether you are recovering from injury or building general fitness.",
    },
    {
      q: "Is this different from a normal gym plan?",
      a: "Yes. Every plan is based on a clinical assessment of your movement, strength and any injuries, so it is safe, targeted and specific to you.",
    },
    {
      q: "Can I continue the exercises at home?",
      a: "Absolutely — we provide a clear home exercise programme with guidance so you can keep progressing between clinic sessions.",
    },
    {
      q: "How soon will I see results?",
      a: "Most people feel stronger and move more comfortably within 2–4 weeks of consistent training, with lasting gains over the following weeks.",
    },
  ],
  relatedServiceSlugs: [
    "exercise-therapy",
    "sports-rehabilitation",
    "post-surgical-rehabilitation",
    "posture-ergonomic-assessment",
    "pain-management",
  ],
  relatedArticleCategories: [
    "exercise-therapy",
    "sports-performance",
    "sports-injuries",
    "posture",
    "recovery-tips",
  ],
};

/* -------------------------------------------------------------------------- */
/* Diet & Nutrition (hidden until a qualified dietitian joins)                */
/* -------------------------------------------------------------------------- */

export const dietMainPage: WellnessPage = {
  slug: "diet-nutrition",
  eyebrow: "Diet & Nutrition",
  title: "Diet & Nutrition",
  heroSubtitle:
    "Evidence-based diet and nutrition support to complement your recovery, manage weight and build healthy, sustainable eating habits.",
  metaTitle: "Diet & Nutrition in Multan | PainFix Physiotherapy Clinic",
  metaDescription:
    "Diet and nutrition services in Multan at PainFix — personalised diet plans, nutrition counselling and healthy-lifestyle guidance to support your health and recovery.",
  quickSummary:
    "PainFix Diet & Nutrition offers personalised diet plans, nutrition counselling and healthy-lifestyle guidance designed to support recovery, weight management and long-term wellbeing. Plans are practical, culturally relevant to Multan, and built around your goals, health and preferences.",
  keyTakeaways: [
    "Personalised, realistic diet plans — not one-size-fits-all",
    "Nutrition counselling to build lasting healthy habits",
    "Guidance that complements your physiotherapy and recovery",
    "Culturally relevant advice suited to local foods and lifestyle",
  ],
  featuresHeading: "Our Diet & Nutrition Approach",
  features: [
    {
      title: "Personalised Diet Plans",
      description:
        "Individual plans built around your goals, health, preferences and daily routine.",
    },
    {
      title: "Nutrition Counselling",
      description: "One-to-one guidance to understand your needs and build sustainable habits.",
    },
    {
      title: "Healthy Lifestyle Guidance",
      description: "Practical advice on balanced eating, hydration and everyday routines.",
    },
    {
      title: "Recovery-Focused Nutrition",
      description: "Nutrition that supports healing, energy and physiotherapy outcomes.",
    },
  ],
  whoCanBenefit: [
    "People wanting to manage their weight healthily",
    "Patients whose recovery can be supported by better nutrition",
    "Anyone wanting to build sustainable, healthy eating habits",
    "People seeking culturally relevant, practical dietary guidance",
  ],
  faqs: [
    {
      q: "Who will prepare my diet plan?",
      a: "Diet plans and nutrition counselling will be provided by a qualified dietitian. This service is launching soon at PainFix — contact us on WhatsApp to register your interest.",
    },
    {
      q: "Are the plans suitable for local foods?",
      a: "Yes. Our guidance is designed to be practical and culturally relevant, built around everyday foods available in Multan.",
    },
    {
      q: "Can nutrition support my physiotherapy recovery?",
      a: "Good nutrition supports healing, energy and overall recovery, which can complement your physiotherapy programme.",
    },
    {
      q: "How do I get started?",
      a: "Message us on WhatsApp to register your interest. We will contact you as soon as our dietitian service is available.",
    },
  ],
  relatedServiceSlugs: ["pain-management", "exercise-therapy", "sports-rehabilitation"],
};

export const dietSubPages: WellnessPage[] = [
  {
    slug: "weight-management",
    eyebrow: "Diet & Nutrition",
    title: "Weight Management",
    heroSubtitle:
      "Sustainable, evidence-based weight management support to help you reach and maintain a healthy weight.",
    metaTitle: "Weight Management in Multan | PainFix Diet & Nutrition",
    metaDescription:
      "Healthy, sustainable weight management support in Multan at PainFix — personalised plans and guidance to reach and maintain a healthy weight.",
    quickSummary:
      "Weight management at PainFix focuses on healthy, sustainable change — not crash diets. A personalised plan combines balanced nutrition, realistic goals and lifestyle guidance to help you reach and keep a healthy weight, supporting joint health and overall wellbeing.",
    keyTakeaways: [
      "Sustainable change over crash dieting",
      "Personalised, realistic and culturally relevant plans",
      "Supports joint health and everyday energy",
    ],
    whoCanBenefit: [
      "People wanting to lose or gain weight healthily",
      "Those whose joint pain is aggravated by excess weight",
      "Anyone seeking a realistic, long-term approach to weight",
    ],
    faqs: [
      {
        q: "Do you use crash diets?",
        a: "No. We focus on safe, sustainable changes you can maintain, with guidance from a qualified dietitian (launching soon).",
      },
      {
        q: "Can losing weight help my joint pain?",
        a: "Reducing excess weight lowers load on the knees, hips and spine, which can ease pain and improve mobility.",
      },
      {
        q: "How do I start?",
        a: "Message us on WhatsApp to register your interest and we'll contact you when the service is available.",
      },
    ],
    relatedServiceSlugs: ["exercise-therapy", "pain-management"],
  },
  {
    slug: "sports-nutrition",
    eyebrow: "Diet & Nutrition",
    title: "Sports Nutrition",
    heroSubtitle:
      "Nutrition guidance for active people and athletes to support performance, recovery and training.",
    metaTitle: "Sports Nutrition in Multan | PainFix Diet & Nutrition",
    metaDescription:
      "Sports nutrition guidance in Multan at PainFix — fuel training, aid recovery and support performance for active people and athletes.",
    quickSummary:
      "Sports nutrition at PainFix helps active people and athletes fuel training, recover faster and support performance. Guidance covers everyday eating around training, hydration and recovery — designed to complement your rehabilitation and conditioning.",
    keyTakeaways: [
      "Fuel training and speed up recovery",
      "Practical guidance around your sport and schedule",
      "Complements sports rehabilitation and conditioning",
    ],
    whoCanBenefit: [
      "Athletes and active people of any level",
      "People returning to sport after injury",
      "Anyone wanting to eat well around training",
    ],
    faqs: [
      {
        q: "Is this only for professional athletes?",
        a: "No — guidance is tailored to every level, from weekend players to competitive athletes.",
      },
      {
        q: "Does it work with my rehab plan?",
        a: "Yes. Sports nutrition is designed to complement your sports rehabilitation and conditioning.",
      },
      {
        q: "How do I start?",
        a: "Message us on WhatsApp to register your interest for when the dietitian service launches.",
      },
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "exercise-therapy"],
  },
  {
    slug: "clinical-nutrition",
    eyebrow: "Diet & Nutrition",
    title: "Clinical Nutrition",
    heroSubtitle:
      "Nutrition guidance that supports overall health and complements your medical and physiotherapy care.",
    metaTitle: "Clinical Nutrition in Multan | PainFix Diet & Nutrition",
    metaDescription:
      "Clinical nutrition guidance in Multan at PainFix — evidence-based dietary support that complements your health and physiotherapy care.",
    quickSummary:
      "Clinical nutrition at PainFix provides evidence-based dietary guidance that supports your overall health and complements medical and physiotherapy care. A qualified dietitian will tailor advice to your individual needs and health goals.",
    keyTakeaways: [
      "Evidence-based, individualised guidance",
      "Complements your medical and physiotherapy care",
      "Delivered by a qualified dietitian (launching soon)",
    ],
    whoCanBenefit: [
      "People who want nutrition guidance alongside their care",
      "Those managing their general health through diet",
      "Anyone seeking professional, evidence-based advice",
    ],
    faqs: [
      {
        q: "Who provides clinical nutrition guidance?",
        a: "A qualified dietitian, once they officially join PainFix. The service is launching soon.",
      },
      {
        q: "Does this replace my doctor's advice?",
        a: "No. Nutrition guidance complements, and never replaces, advice from your treating doctor.",
      },
      {
        q: "How do I start?",
        a: "Message us on WhatsApp to register your interest and we'll be in touch.",
      },
    ],
    relatedServiceSlugs: ["pain-management", "exercise-therapy"],
  },
  {
    slug: "healthy-eating",
    eyebrow: "Diet & Nutrition",
    title: "Healthy Eating",
    heroSubtitle:
      "Simple, practical guidance to build balanced, sustainable healthy-eating habits for the whole family.",
    metaTitle: "Healthy Eating Guidance in Multan | PainFix Diet & Nutrition",
    metaDescription:
      "Healthy eating guidance in Multan at PainFix — practical, balanced and sustainable habits built around local foods and everyday life.",
    quickSummary:
      "Healthy eating guidance at PainFix helps you build balanced, sustainable habits using everyday foods. The focus is practical and realistic — small, lasting changes that improve energy, wellbeing and long-term health.",
    keyTakeaways: [
      "Balanced, realistic and sustainable habits",
      "Built around local, everyday foods",
      "Small changes for lasting wellbeing",
    ],
    whoCanBenefit: [
      "Anyone wanting to eat more healthily",
      "Families building better everyday habits",
      "People seeking practical, no-nonsense guidance",
    ],
    faqs: [
      {
        q: "Do I have to give up my favourite foods?",
        a: "No. The focus is balance and moderation with practical, sustainable changes rather than strict restrictions.",
      },
      {
        q: "Is the advice suitable for local cuisine?",
        a: "Yes — guidance is built around foods commonly available and eaten in Multan.",
      },
      {
        q: "How do I start?",
        a: "Message us on WhatsApp to register your interest for the dietitian service launch.",
      },
    ],
    relatedServiceSlugs: ["exercise-therapy", "pain-management"],
  },
  {
    slug: "therapeutic-nutrition",
    eyebrow: "Diet & Nutrition",
    title: "Therapeutic Nutrition",
    heroSubtitle:
      "Nutrition support designed to aid healing, recovery and rehabilitation as part of your care.",
    metaTitle: "Therapeutic Nutrition in Multan | PainFix Diet & Nutrition",
    metaDescription:
      "Therapeutic nutrition in Multan at PainFix — dietary support to aid healing, recovery and rehabilitation alongside physiotherapy.",
    quickSummary:
      "Therapeutic nutrition at PainFix uses tailored dietary support to aid healing, recovery and rehabilitation. Working alongside your physiotherapy, a qualified dietitian will guide nutrition that supports tissue repair, energy and overall recovery.",
    keyTakeaways: [
      "Nutrition that supports healing and recovery",
      "Works alongside your physiotherapy programme",
      "Tailored by a qualified dietitian (launching soon)",
    ],
    whoCanBenefit: [
      "People recovering from injury or surgery",
      "Patients whose recovery can be supported by nutrition",
      "Anyone wanting recovery-focused dietary guidance",
    ],
    faqs: [
      {
        q: "How does nutrition help recovery?",
        a: "The right nutrition supports tissue repair, energy and immune function, which can complement your physiotherapy recovery.",
      },
      {
        q: "Is this the same as a normal diet plan?",
        a: "It is tailored specifically to support healing and rehabilitation, guided by a qualified dietitian.",
      },
      {
        q: "How do I start?",
        a: "Message us on WhatsApp to register your interest and we'll contact you when the service is available.",
      },
    ],
    relatedServiceSlugs: ["post-surgical-rehabilitation", "exercise-therapy"],
  },
];

export const dietPageMap: Record<string, WellnessPage> = Object.fromEntries(
  dietSubPages.map((p) => [p.slug, p]),
);

export function getDietSubPage(slug: string): WellnessPage | undefined {
  return dietPageMap[slug];
}
