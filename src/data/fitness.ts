import type { WellnessPage } from "./wellness";

/**
 * Fitness platform content.
 *
 * Every page here is delivered by our physiotherapists as evidence-based
 * exercise and rehabilitation. Content is educational and must never make
 * unrealistic health or fitness claims. Programmes are always adapted to the
 * individual after a proper assessment.
 *
 * All pages render through the shared `WellnessTopicPage` component via the
 * `/fitness/$slug` route, so they inherit the site's design, SEO and a11y.
 */

export type FitnessCategory = "services" | "mobility" | "injury-prevention" | "programmes";

export interface FitnessGroup {
  category: FitnessCategory;
  eyebrow: string;
  title: string;
  intro: string;
}

export const FITNESS_GROUPS: FitnessGroup[] = [
  {
    category: "services",
    eyebrow: "Fitness Services",
    title: "Fitness Services",
    intro: "Physiotherapist-led fitness coaching, built around your assessment and goals.",
  },
  {
    category: "mobility",
    eyebrow: "Mobility & Flexibility",
    title: "Mobility & Flexibility",
    intro: "Move freely again — targeted mobility, stretching and posture programmes.",
  },
  {
    category: "injury-prevention",
    eyebrow: "Injury Prevention",
    title: "Injury Prevention",
    intro: "Train smarter and stay injury-free with sport-specific conditioning.",
  },
  {
    category: "programmes",
    eyebrow: "Online Programmes",
    title: "Structured Online Programmes",
    intro: "Guided, time-boxed programmes you can follow — always adapted to your assessment.",
  },
];

export interface FitnessPage extends WellnessPage {
  category: FitnessCategory;
}

const WHATSAPP_FAQ = {
  q: "How do I get started?",
  a: "Message us on WhatsApp for a consultation. We'll assess your needs and build a safe, personalised plan — you only commit when you're ready.",
};

const ADAPT_NOTE =
  "This programme is a general framework and must be adapted to your individual assessment, health and any existing conditions before you begin.";

/* -------------------------------------------------------------------------- */
/* 1. Fitness Services                                                        */
/* -------------------------------------------------------------------------- */

const services: FitnessPage[] = [
  {
    category: "services",
    slug: "weight-management-programme",
    eyebrow: "Fitness Services",
    title: "Weight Management Programme",
    heroSubtitle:
      "A safe, sustainable, physiotherapist-guided approach to reaching and maintaining a healthy weight through exercise and realistic lifestyle change.",
    metaTitle: "Weight Management Programme in Multan | PainFix Fitness",
    metaDescription:
      "Physiotherapist-led weight management in Multan — safe, sustainable exercise programmes and realistic lifestyle guidance to reach and keep a healthy weight.",
    quickSummary:
      "The PainFix Weight Management Programme is a physiotherapist-guided plan combining graded exercise, activity and realistic lifestyle habits to help you lose weight safely and keep it off. It focuses on sustainable change — not crash diets — and protects your joints while you get more active.",
    keyTakeaways: [
      "Safe, sustainable change over crash dieting",
      "Joint-friendly exercise for every fitness level",
      "Personalised, gradually progressed programme",
      "Supports mobility, energy and long-term health",
    ],
    whoCanBenefit: [
      "People wanting to lose weight healthily and keep it off",
      "Those whose joint pain is worsened by excess weight",
      "Anyone starting exercise after a long inactive period",
      "People wanting a realistic, guided long-term approach",
    ],
    features: [
      { title: "Graded Exercise Plan", description: "Low-impact, joint-friendly activity that builds up safely at your pace." },
      { title: "Strength Foundations", description: "Simple strengthening to boost metabolism and protect your joints." },
      { title: "Lifestyle Habits", description: "Practical, realistic guidance on daily activity and routine." },
      { title: "Progress Tracking", description: "Regular check-ins so your plan keeps working as you improve." },
    ],
    faqs: [
      { q: "Do you use crash diets?", a: "No. We focus on safe, gradual, sustainable changes you can maintain. Personalised diet plans will be available from a qualified dietitian once they join PainFix." },
      { q: "Can losing weight help my joint pain?", a: "Reducing excess weight lowers load on the knees, hips and spine, which can ease pain and improve mobility." },
      { q: "Is exercise safe if I'm very unfit?", a: "Yes — every programme starts at your level after an assessment and is progressed gradually and safely." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "pain-management"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
  {
    category: "services",
    slug: "strength-conditioning",
    eyebrow: "Fitness Services",
    title: "Muscle Strength & Conditioning",
    heroSubtitle:
      "Progressive, evidence-based strength and conditioning to rebuild power, stability and resilience — safely graded to your body.",
    metaTitle: "Strength & Conditioning in Multan | PainFix Fitness",
    metaDescription:
      "Physiotherapist-led strength and conditioning in Multan — progressive, evidence-based training to build muscle, power and stability safely at any level.",
    quickSummary:
      "Muscle Strength & Conditioning at PainFix is progressive, physiotherapist-supervised resistance training that rebuilds strength, power, stability and endurance. Every plan is graded to your current level and movement quality, making it safe for beginners, returning athletes and anyone recovering from injury.",
    keyTakeaways: [
      "Progressive, individually graded resistance training",
      "Improves strength, power, stability and endurance",
      "Safe technique coaching to prevent injury",
      "Suitable for beginners through to athletes",
    ],
    whoCanBenefit: [
      "Beginners wanting to build strength safely",
      "People returning to training after injury",
      "Older adults protecting muscle and bone health",
      "Athletes wanting structured conditioning",
    ],
    features: [
      { title: "Movement Assessment", description: "We assess strength and technique before loading anything." },
      { title: "Progressive Overload", description: "Structured, gradual progression for steady, safe gains." },
      { title: "Technique Coaching", description: "Correct form to build strength without injury." },
      { title: "Home & Gym Options", description: "Programmes for the gym or minimal home equipment." },
    ],
    faqs: [
      { q: "Will I get injured lifting weights?", a: "Not when it's programmed and coached correctly. We assess your movement, teach technique and progress load gradually to keep you safe." },
      { q: "Do I need a gym?", a: "No — we can design effective programmes for the gym or for home with minimal equipment." },
      { q: "Is strength training safe for older adults?", a: "Yes. Progressive strength training is one of the most beneficial and evidence-based activities for older adults." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "sports-rehabilitation", "post-surgical-rehabilitation"],
    relatedArticleCategories: ["exercise-therapy", "sports-performance"],
  },
  {
    category: "services",
    slug: "general-fitness-coaching",
    eyebrow: "Fitness Services",
    title: "General Fitness Coaching",
    heroSubtitle:
      "One-to-one fitness coaching to improve your overall health, energy and movement — guided by physiotherapy expertise.",
    metaTitle: "General Fitness Coaching in Multan | PainFix Fitness",
    metaDescription:
      "Personalised general fitness coaching in Multan at PainFix — improve strength, stamina, movement and everyday energy with physiotherapist-guided plans.",
    quickSummary:
      "General Fitness Coaching at PainFix helps you improve overall fitness — strength, stamina, mobility and everyday energy — through a personalised, physiotherapist-guided plan. It's ideal if you want to get fitter safely without guesswork, whatever your starting point.",
    keyTakeaways: [
      "A complete, balanced fitness plan built for you",
      "Improves strength, stamina, mobility and energy",
      "Guided by physiotherapy knowledge of the body",
      "Safe for all levels, adjusted as you progress",
    ],
    whoCanBenefit: [
      "Anyone wanting to get fitter and healthier safely",
      "Busy people wanting an efficient, guided plan",
      "People unsure how to start exercising",
      "Those wanting accountability and structure",
    ],
    faqs: [
      { q: "I've never exercised before — is this for me?", a: "Absolutely. Coaching starts from your current level and builds up gradually, with clear guidance every step." },
      { q: "How often would I train?", a: "Typically 2–4 sessions a week, tailored to your goals, schedule and recovery." },
      { q: "Can I train at home?", a: "Yes — we provide clear home programmes alongside any in-clinic sessions." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "posture-ergonomic-assessment"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
  {
    category: "services",
    slug: "home-workout-programme",
    eyebrow: "Fitness Services",
    title: "Home Workout Programmes",
    heroSubtitle:
      "Effective, physiotherapist-designed workouts you can do at home with little or no equipment.",
    metaTitle: "Home Workout Programmes in Multan | PainFix Fitness",
    metaDescription:
      "Physiotherapist-designed home workout programmes — effective, safe routines with minimal equipment to build strength and fitness from home in Multan.",
    quickSummary:
      "PainFix Home Workout Programmes are physiotherapist-designed routines you can follow at home with little or no equipment. Each plan is matched to your level and goals, with clear guidance so you train safely and effectively without a gym.",
    keyTakeaways: [
      "Effective workouts with minimal equipment",
      "Clear, safe, easy-to-follow routines",
      "Matched to your level and goals",
      "Ideal for busy schedules and privacy",
    ],
    whoCanBenefit: [
      "People who prefer training at home",
      "Those with limited time or no gym access",
      "Beginners wanting simple, guided routines",
      "Anyone maintaining fitness between clinic visits",
    ],
    faqs: [
      { q: "Do I need equipment?", a: "No — programmes can use just your bodyweight, or simple items like resistance bands and light weights if you have them." },
      { q: "How do I know I'm doing it right?", a: "We provide clear instructions and can review your technique on WhatsApp or in an online session." },
      { q: "Will a home workout really work?", a: "Yes. A well-designed, progressive home programme can build real strength and fitness." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy"],
    relatedArticleCategories: ["exercise-therapy"],
  },
  {
    category: "services",
    slug: "online-fitness-coaching",
    eyebrow: "Fitness Services",
    title: "Online Fitness Coaching",
    heroSubtitle:
      "Remote, physiotherapist-guided fitness coaching with personalised programmes and regular support — wherever you are.",
    metaTitle: "Online Fitness Coaching | PainFix Physiotherapy Multan",
    metaDescription:
      "Online fitness coaching from PainFix — personalised, physiotherapist-guided programmes, video check-ins and remote support for clients anywhere.",
    quickSummary:
      "Online Fitness Coaching from PainFix gives you a personalised, physiotherapist-designed programme with remote guidance, video check-ins and regular support — so you can train safely and effectively wherever you live.",
    keyTakeaways: [
      "Personalised programmes delivered remotely",
      "Video check-ins and ongoing support",
      "Safe, physiotherapist-guided progression",
      "Flexible — train on your own schedule",
    ],
    whoCanBenefit: [
      "People who can't attend the clinic in person",
      "Clients outside Multan or abroad",
      "Busy people wanting flexible, guided training",
      "Anyone wanting expert oversight remotely",
    ],
    faqs: [
      { q: "How does online coaching work?", a: "After a remote assessment we send a personalised programme, then support you with video check-ins and messaging to review progress and technique." },
      { q: "Can you coach me from another city or country?", a: "Yes — online coaching works anywhere with an internet connection." },
      { q: "Is it as effective as in-person?", a: "For most fitness goals, well-structured online coaching is highly effective. Some conditions still benefit from hands-on assessment, which we'll advise on." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy"],
    relatedArticleCategories: ["exercise-therapy"],
  },
  {
    category: "services",
    slug: "senior-fitness",
    eyebrow: "Fitness Services",
    title: "Senior Citizen Fitness",
    heroSubtitle:
      "Gentle, safe and effective fitness for older adults — to stay strong, mobile, balanced and independent.",
    metaTitle: "Senior Citizen Fitness in Multan | PainFix Fitness",
    metaDescription:
      "Physiotherapist-led fitness for older adults in Multan — safe strength, balance and mobility programmes to stay active, independent and reduce fall risk.",
    quickSummary:
      "Senior Citizen Fitness at PainFix is gentle, physiotherapist-supervised exercise designed for older adults to build strength, balance and mobility. It helps maintain independence, reduce fall risk and keep everyday activities comfortable — all at a safe, comfortable pace.",
    keyTakeaways: [
      "Safe, gentle exercise designed for older adults",
      "Builds strength, balance and mobility",
      "Helps reduce fall risk and maintain independence",
      "Fully supervised and individually paced",
    ],
    whoCanBenefit: [
      "Older adults wanting to stay active and independent",
      "People worried about balance or falls",
      "Those managing stiffness or age-related weakness",
      "Anyone recovering strength after illness",
    ],
    features: [
      { title: "Balance Training", description: "Evidence-based exercises to improve stability and reduce fall risk." },
      { title: "Gentle Strengthening", description: "Safe resistance work to protect muscle and bone." },
      { title: "Mobility Work", description: "Keep joints comfortable and movement easy for daily life." },
      { title: "Confidence Building", description: "Supervised, reassuring sessions at a comfortable pace." },
    ],
    faqs: [
      { q: "Is exercise safe at my age?", a: "Yes — appropriate, supervised exercise is one of the best things for healthy ageing. Everything is assessed and tailored to you." },
      { q: "What if I have arthritis or other conditions?", a: "We adapt every programme around your conditions to keep it safe and comfortable." },
      { q: "Can this help prevent falls?", a: "Balance and strength training are proven to help reduce fall risk in older adults." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "geriatric-physiotherapy", "pain-management"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
  {
    category: "services",
    slug: "corrective-exercise-programme",
    eyebrow: "Fitness Services",
    title: "Corrective Exercise Programmes",
    heroSubtitle:
      "Targeted exercise to correct muscle imbalances, weakness and faulty movement patterns — the root causes of recurring pain.",
    metaTitle: "Corrective Exercise Programmes in Multan | PainFix Fitness",
    metaDescription:
      "Corrective exercise programmes in Multan at PainFix — targeted training to fix muscle imbalances, poor posture and movement faults that cause recurring pain.",
    quickSummary:
      "Corrective Exercise at PainFix uses targeted, physiotherapist-prescribed movements to fix muscle imbalances, weakness and faulty movement patterns. By addressing the root cause rather than just symptoms, it reduces recurring pain and helps you move better and more efficiently.",
    keyTakeaways: [
      "Targets the root cause of recurring pain",
      "Corrects imbalances, weakness and movement faults",
      "Based on a detailed movement assessment",
      "Improves posture, efficiency and performance",
    ],
    whoCanBenefit: [
      "People with recurring or nagging pain",
      "Those with posture-related discomfort",
      "Athletes wanting more efficient movement",
      "Anyone with muscle imbalances or weakness",
    ],
    faqs: [
      { q: "How do you know what to correct?", a: "We start with a detailed movement and posture assessment to identify the specific imbalances or faults driving your problem." },
      { q: "How long until I notice a difference?", a: "Many people feel improvements within a few weeks, with lasting change over consistent training." },
      { q: "Is this the same as regular exercise?", a: "No — it's specifically targeted to your assessment findings, rather than general fitness work." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "posture-ergonomic-assessment", "manual-therapy"],
    relatedArticleCategories: ["posture", "exercise-therapy"],
  },
];

/* -------------------------------------------------------------------------- */
/* 2. Mobility & Flexibility                                                  */
/* -------------------------------------------------------------------------- */

const mobility: FitnessPage[] = [
  {
    category: "mobility",
    slug: "mobility-flexibility",
    eyebrow: "Mobility & Flexibility",
    title: "Mobility & Flexibility Programmes",
    heroSubtitle:
      "Restore comfortable, full range of motion with physiotherapist-designed mobility, stretching and posture programmes.",
    metaTitle: "Mobility & Flexibility Programmes in Multan | PainFix",
    metaDescription:
      "Mobility and flexibility programmes in Multan at PainFix — assessments, stretching, posture correction and joint-specific mobility to move freely and pain-free.",
    quickSummary:
      "PainFix Mobility & Flexibility programmes restore comfortable, full range of motion through assessment-based stretching, posture correction and joint-specific mobility work. They help desk workers, active people and anyone with stiffness move more freely and reduce pain.",
    keyTakeaways: [
      "Assessment-based, targeted mobility work",
      "Covers spine, neck, shoulder, hip and lower limb",
      "Great for desk workers and stiff, achy joints",
      "Improves comfort, movement and performance",
    ],
    featuresHeading: "What Mobility Work Can Cover",
    features: [
      { title: "Mobility Assessment", description: "We measure your movement and identify restricted or stiff areas." },
      { title: "Stretching Programmes", description: "Safe, effective stretching routines tailored to you." },
      { title: "Posture Correction", description: "Correct posture habits that cause stiffness and pain." },
      { title: "Desk Worker Mobility", description: "Quick routines to counter long hours of sitting." },
      { title: "Back Pain Prevention", description: "Exercises to keep your spine mobile and resilient." },
      { title: "Neck Mobility", description: "Gentle work to ease tech-neck and stiffness." },
      { title: "Shoulder Mobility", description: "Restore reach and comfort in stiff shoulders." },
      { title: "Hip & Lower Limb Mobility", description: "Free up hips, knees and ankles for easier movement." },
    ],
    whoCanBenefit: [
      "Desk workers and students with stiffness",
      "People with tight, achy or restricted joints",
      "Active people wanting better range of motion",
      "Anyone recovering movement after injury",
    ],
    faqs: [
      { q: "Is stretching enough to fix stiffness?", a: "Stretching helps, but lasting mobility usually needs a mix of mobility drills, strengthening and posture work — which we combine based on your assessment." },
      { q: "Can mobility work help my back or neck pain?", a: "Often yes. Improving mobility and posture can reduce strain and ease many types of back and neck discomfort." },
      { q: "How often should I do mobility work?", a: "Short daily routines work best. We'll give you a simple, realistic plan." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "posture-ergonomic-assessment", "manual-therapy"],
    relatedArticleCategories: ["posture", "exercise-therapy"],
  },
];

/* -------------------------------------------------------------------------- */
/* 3. Injury Prevention                                                       */
/* -------------------------------------------------------------------------- */

const injuryPrevention: FitnessPage[] = [
  {
    category: "injury-prevention",
    slug: "gym-injury-prevention",
    eyebrow: "Injury Prevention",
    title: "Gym Injury Prevention",
    heroSubtitle:
      "Train hard and stay safe — technique coaching and conditioning to prevent common gym injuries.",
    metaTitle: "Gym Injury Prevention in Multan | PainFix Fitness",
    metaDescription:
      "Gym injury prevention in Multan at PainFix — technique coaching, warm-ups and conditioning to avoid common lifting injuries and train safely.",
    quickSummary:
      "Gym Injury Prevention at PainFix combines technique coaching, warm-up guidance and targeted conditioning to help you avoid the most common lifting and training injuries. It's ideal for anyone who trains in the gym and wants to keep progressing safely.",
    keyTakeaways: [
      "Correct technique to prevent common injuries",
      "Warm-up and conditioning strategies",
      "Address weak links before they cause problems",
      "Keep training consistently and safely",
    ],
    whoCanBenefit: [
      "Gym-goers of all levels",
      "People who have had lifting injuries before",
      "Beginners learning safe technique",
      "Anyone wanting to train without setbacks",
    ],
    faqs: [
      { q: "I keep getting minor injuries — can you help?", a: "Yes. We assess your technique, mobility and weak links, then build a plan to reduce recurring injuries." },
      { q: "Do you review lifting technique?", a: "Yes, in person or via video for online clients." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "exercise-therapy"],
    relatedArticleCategories: ["sports-injuries", "sports-performance"],
  },
  {
    category: "injury-prevention",
    slug: "runners-programme",
    eyebrow: "Injury Prevention",
    title: "Runner's Programme",
    heroSubtitle:
      "Run stronger and injury-free with a physiotherapist-designed strength, mobility and load-management plan for runners.",
    metaTitle: "Runner's Injury Prevention Programme in Multan | PainFix",
    metaDescription:
      "Runner's programme in Multan at PainFix — strength, mobility and training-load guidance to prevent common running injuries and run stronger for longer.",
    quickSummary:
      "The PainFix Runner's Programme helps you prevent common running injuries — like shin splints, knee pain and IT-band issues — through targeted strength, mobility and sensible training-load guidance, all designed by physiotherapists.",
    keyTakeaways: [
      "Prevent common running injuries",
      "Build running-specific strength and mobility",
      "Smart training-load and progression advice",
      "Return to running safely after injury",
    ],
    whoCanBenefit: [
      "New and experienced runners",
      "Runners with recurring niggles or pain",
      "People returning to running after a break",
      "Anyone training for a race or event",
    ],
    faqs: [
      { q: "Why do runners keep getting injured?", a: "Most running injuries relate to training load and strength deficits. We address both to keep you running." },
      { q: "Can you help me return after injury?", a: "Yes — we build a graded return-to-running plan tailored to you." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "exercise-therapy"],
    relatedArticleCategories: ["sports-injuries", "sports-performance"],
  },
  {
    category: "injury-prevention",
    slug: "cricket-athlete-programme",
    eyebrow: "Injury Prevention",
    title: "Cricket Athlete Programme",
    heroSubtitle:
      "Cricket-specific conditioning to protect against back, shoulder and knee injuries and keep you performing all season.",
    metaTitle: "Cricket Athlete Injury Prevention in Multan | PainFix",
    metaDescription:
      "Cricket-specific injury prevention in Multan at PainFix — conditioning for bowlers and batsmen to protect the back, shoulder and knees and boost performance.",
    quickSummary:
      "The PainFix Cricket Athlete Programme delivers cricket-specific conditioning to reduce common injuries in bowlers, batsmen and fielders — particularly to the lower back, shoulder and knees — while supporting performance across the season.",
    keyTakeaways: [
      "Cricket-specific strength and conditioning",
      "Protects the lower back, shoulder and knees",
      "Bowling and batting load management",
      "Supports performance and durability",
    ],
    whoCanBenefit: [
      "Fast bowlers and spinners",
      "Batsmen and all-rounders",
      "Young cricketers developing safely",
      "Players returning from injury",
    ],
    faqs: [
      { q: "Why are fast bowlers prone to back injury?", a: "The repetitive, high-load bowling action stresses the lower back. Targeted conditioning and load management help reduce this risk." },
      { q: "Do you work with young cricketers?", a: "Yes — with age-appropriate, safe programming and load guidance." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "exercise-therapy"],
    relatedArticleCategories: ["sports-injuries", "sports-performance"],
  },
  {
    category: "injury-prevention",
    slug: "football-athlete-programme",
    eyebrow: "Injury Prevention",
    title: "Football Athlete Programme",
    heroSubtitle:
      "Football-specific conditioning to reduce hamstring, knee and ankle injuries and keep you on the pitch.",
    metaTitle: "Football Athlete Injury Prevention in Multan | PainFix",
    metaDescription:
      "Football injury prevention in Multan at PainFix — evidence-based conditioning to reduce hamstring, ACL, knee and ankle injuries and improve on-pitch performance.",
    quickSummary:
      "The PainFix Football Athlete Programme uses evidence-based conditioning — including proven warm-up and strengthening strategies — to reduce common football injuries such as hamstring strains, knee (ACL) and ankle injuries, and to support performance.",
    keyTakeaways: [
      "Reduce hamstring, knee and ankle injuries",
      "Evidence-based warm-up and strengthening",
      "Agility, landing and change-of-direction control",
      "Support speed, power and performance",
    ],
    whoCanBenefit: [
      "Footballers of all levels",
      "Players with recurring hamstring or ankle issues",
      "Young players developing safely",
      "Athletes returning after injury",
    ],
    faqs: [
      { q: "Can you help reduce hamstring injuries?", a: "Yes — evidence-based eccentric strengthening and load management significantly reduce hamstring injury risk." },
      { q: "Do you help after an ACL injury?", a: "We support graded rehabilitation and return-to-sport conditioning in coordination with your surgeon where needed." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "exercise-therapy", "post-surgical-rehabilitation"],
    relatedArticleCategories: ["sports-injuries", "sports-performance"],
  },
  {
    category: "injury-prevention",
    slug: "warm-up-guide",
    eyebrow: "Injury Prevention",
    title: "Warm-up Guide",
    heroSubtitle:
      "How to warm up properly — prepare your body, boost performance and reduce injury risk before any activity.",
    metaTitle: "How to Warm Up Properly | PainFix Physiotherapy Multan",
    metaDescription:
      "A physiotherapist's warm-up guide — why warming up matters, how to do it well, and a simple, safe routine to prepare for exercise and reduce injury risk.",
    quickSummary:
      "A good warm-up gradually raises your heart rate, activates key muscles and prepares your joints for movement — improving performance and lowering injury risk. This guide explains how to warm up properly with a simple, effective routine before training or sport.",
    keyTakeaways: [
      "Warming up reduces injury risk and boosts performance",
      "Use gentle cardio, then dynamic movements",
      "Prioritise the muscles and joints you'll use",
      "Skip long static stretches before intense activity",
    ],
    whoCanBenefit: [
      "Anyone exercising or playing sport",
      "Gym-goers and runners",
      "Team-sport athletes",
      "People returning to activity",
    ],
    faqs: [
      { q: "How long should a warm-up be?", a: "Around 5–10 minutes is enough for most activities — longer for intense sport." },
      { q: "Should I stretch before exercise?", a: "Favour dynamic movements before activity. Long static stretches are better afterwards." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "sports-rehabilitation"],
    relatedArticleCategories: ["sports-performance", "exercise-therapy"],
  },
  {
    category: "injury-prevention",
    slug: "cool-down-guide",
    eyebrow: "Injury Prevention",
    title: "Cool-down Guide",
    heroSubtitle:
      "How to cool down after exercise — support recovery, reduce stiffness and gradually bring your body back to rest.",
    metaTitle: "How to Cool Down After Exercise | PainFix Multan",
    metaDescription:
      "A physiotherapist's cool-down guide — why cooling down helps, how to do it, and a simple routine to aid recovery and reduce post-exercise stiffness.",
    quickSummary:
      "A cool-down gradually lowers your heart rate and helps your body transition to rest after exercise. Gentle activity and stretching can ease stiffness and support recovery. This guide covers a simple, effective cool-down routine.",
    keyTakeaways: [
      "Cooling down eases the transition back to rest",
      "Use light activity then gentle stretching",
      "Can reduce post-exercise stiffness",
      "Takes just 5–10 minutes",
    ],
    whoCanBenefit: [
      "Anyone who exercises or plays sport",
      "Gym-goers and runners",
      "People prone to post-exercise stiffness",
      "Athletes managing recovery",
    ],
    faqs: [
      { q: "Does cooling down prevent soreness?", a: "It won't eliminate muscle soreness, but gentle cooling down and stretching can help you feel less stiff and ease back to rest." },
      { q: "What should a cool-down include?", a: "A few minutes of light activity followed by gentle static stretching of the muscles you used." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "sports-rehabilitation"],
    relatedArticleCategories: ["recovery-tips", "exercise-therapy"],
  },
  {
    category: "injury-prevention",
    slug: "return-to-sport-rehabilitation",
    eyebrow: "Injury Prevention",
    title: "Return-to-Sport Rehabilitation",
    heroSubtitle:
      "A safe, structured, criteria-based path back to your sport after injury — so you return confident and reduce re-injury risk.",
    metaTitle: "Return-to-Sport Rehabilitation in Multan | PainFix",
    metaDescription:
      "Return-to-sport rehabilitation in Multan at PainFix — structured, criteria-based programmes to safely rebuild strength and confidence and reduce re-injury risk.",
    quickSummary:
      "Return-to-Sport Rehabilitation at PainFix is a structured, criteria-based programme that safely rebuilds strength, control and confidence after injury. Rather than returning by date alone, we progress you through clear milestones to reduce re-injury risk.",
    keyTakeaways: [
      "Criteria-based, not just time-based, return",
      "Rebuilds strength, control and confidence",
      "Sport-specific conditioning and testing",
      "Reduces the risk of re-injury",
    ],
    whoCanBenefit: [
      "Athletes recovering from injury or surgery",
      "Players unsure if they're ready to return",
      "People with recurring sports injuries",
      "Anyone wanting a confident, safe comeback",
    ],
    journeyHeading: "Your Return-to-Sport Pathway",
    journey: [
      { title: "Assessment", description: "Evaluate strength, movement and readiness after injury." },
      { title: "Rebuild", description: "Restore strength, mobility and control progressively." },
      { title: "Sport-Specific", description: "Add sport-specific drills, agility and power." },
      { title: "Testing", description: "Meet clear return-to-sport criteria before progressing." },
      { title: "Return", description: "Graded return to training and competition." },
    ],
    faqs: [
      { q: "When can I return to sport?", a: "When you meet clear strength, control and confidence milestones — not just by a set date. This reduces re-injury risk." },
      { q: "Do you work with surgeons?", a: "Yes, we coordinate with your surgeon's protocol where surgery was involved." },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["sports-rehabilitation", "post-surgical-rehabilitation", "exercise-therapy"],
    relatedArticleCategories: ["sports-injuries", "recovery-tips"],
  },
];

/* -------------------------------------------------------------------------- */
/* 6. Online Programmes                                                       */
/* -------------------------------------------------------------------------- */

const programmes: FitnessPage[] = [
  {
    category: "programmes",
    slug: "4-week-weight-management",
    eyebrow: "Online Programmes",
    title: "4-Week Weight Management Programme",
    heroSubtitle:
      "A structured 4-week kickstart combining joint-friendly exercise and realistic habits to build momentum safely.",
    metaTitle: "4-Week Weight Management Programme | PainFix Multan",
    metaDescription:
      "A structured 4-week weight management programme from PainFix — joint-friendly exercise and realistic habits to kickstart healthy, sustainable weight loss.",
    quickSummary:
      "The 4-Week Weight Management Programme is a structured kickstart that builds an exercise habit with joint-friendly workouts and realistic lifestyle guidance. It's designed to create safe, sustainable momentum — and is always adapted to your individual assessment and health.",
    keyTakeaways: [
      "A structured 4-week kickstart",
      "Joint-friendly, progressive workouts",
      "Realistic, sustainable habit-building",
      "Adapted to your assessment and health",
    ],
    whoCanBenefit: [
      "People wanting a structured starting point",
      "Those returning to exercise after a break",
      "Anyone wanting safe, guided momentum",
    ],
    faqs: [
      { q: "Is 4 weeks enough to lose weight?", a: "Four weeks builds momentum and habits. Sustainable weight change continues beyond that — we help you keep going safely." },
      { q: "Do I need a gym?", a: "No — it can be done at home or in a gym." },
      { q: "Is it safe for me?", a: ADAPT_NOTE },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "pain-management"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
  {
    category: "programmes",
    slug: "30-day-mobility",
    eyebrow: "Online Programmes",
    title: "30-Day Mobility Programme",
    heroSubtitle:
      "A daily 30-day routine to improve flexibility, ease stiffness and restore comfortable movement.",
    metaTitle: "30-Day Mobility Programme | PainFix Physiotherapy Multan",
    metaDescription:
      "A 30-day mobility programme from PainFix — short daily routines to improve flexibility, ease stiffness and restore comfortable, pain-free movement.",
    quickSummary:
      "The 30-Day Mobility Programme uses short, daily physiotherapist-designed routines to improve flexibility, reduce stiffness and restore comfortable movement across the whole body. It's ideal for desk workers and anyone feeling tight or restricted.",
    keyTakeaways: [
      "Short, daily mobility routines",
      "Improves flexibility and eases stiffness",
      "Whole-body, joint-by-joint approach",
      "Adapted to your assessment and health",
    ],
    whoCanBenefit: [
      "Desk workers and students",
      "People with stiff, achy joints",
      "Anyone wanting easier, freer movement",
    ],
    faqs: [
      { q: "How long does each day take?", a: "Most daily routines take around 10–15 minutes." },
      { q: "Will it help my stiffness?", a: "Consistent daily mobility work is one of the best ways to reduce stiffness and improve range of motion." },
      { q: "Is it right for me?", a: ADAPT_NOTE },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "posture-ergonomic-assessment"],
    relatedArticleCategories: ["posture", "exercise-therapy"],
  },
  {
    category: "programmes",
    slug: "back-pain-recovery",
    eyebrow: "Online Programmes",
    title: "Back Pain Recovery Programme",
    heroSubtitle:
      "A guided, progressive programme to ease back pain, rebuild strength and get you moving with confidence again.",
    metaTitle: "Back Pain Recovery Programme | PainFix Multan",
    metaDescription:
      "A guided back pain recovery programme from PainFix — progressive, evidence-based exercises to ease pain, rebuild strength and restore confident movement.",
    quickSummary:
      "The Back Pain Recovery Programme is a guided, progressive plan of evidence-based exercises to ease back pain, rebuild core and back strength, and restore confident movement. It follows physiotherapy best practice and is adapted to your individual assessment.",
    keyTakeaways: [
      "Progressive, evidence-based exercises",
      "Eases pain and rebuilds strength",
      "Restores confident, comfortable movement",
      "Adapted to your assessment and diagnosis",
    ],
    whoCanBenefit: [
      "People with persistent or recurring back pain",
      "Those wanting to move confidently again",
      "Anyone wanting a structured recovery plan",
    ],
    faqs: [
      { q: "Is exercise safe with back pain?", a: "For most back pain, appropriate graded exercise is safe and helpful. We assess you first and adapt the plan to your situation." },
      { q: "What if my pain is severe?", a: "Please get assessed first. Certain symptoms need in-person evaluation before starting — message us and we'll advise." },
      { q: "Is it right for me?", a: ADAPT_NOTE },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "manual-therapy", "pain-management"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
  {
    category: "programmes",
    slug: "office-worker-fitness",
    eyebrow: "Online Programmes",
    title: "Office Worker Fitness Programme",
    heroSubtitle:
      "Beat the effects of desk life — posture, mobility and strength routines designed for busy office workers.",
    metaTitle: "Office Worker Fitness Programme | PainFix Multan",
    metaDescription:
      "An office worker fitness programme from PainFix — posture, mobility and strength routines to counter desk life, ease neck and back strain and boost energy.",
    quickSummary:
      "The Office Worker Fitness Programme tackles the effects of long hours at a desk with short posture, mobility and strength routines. It helps reduce neck and back strain, improve posture and boost energy — designed to fit a busy schedule.",
    keyTakeaways: [
      "Counter the effects of prolonged sitting",
      "Reduce neck, shoulder and back strain",
      "Improve posture and energy",
      "Short routines that fit a busy day",
    ],
    whoCanBenefit: [
      "Office and remote workers",
      "Students studying long hours",
      "Anyone with desk-related aches",
    ],
    faqs: [
      { q: "Can I do this at my desk?", a: "Yes — many routines are designed for short breaks at or near your desk." },
      { q: "Will it help my neck and back?", a: "Improving posture, mobility and strength commonly reduces desk-related neck and back strain." },
      { q: "Is it right for me?", a: ADAPT_NOTE },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["posture-ergonomic-assessment", "exercise-therapy"],
    relatedArticleCategories: ["posture", "exercise-therapy"],
  },
  {
    category: "programmes",
    slug: "senior-fitness-programme",
    eyebrow: "Online Programmes",
    title: "Senior Fitness Programme",
    heroSubtitle:
      "A gentle, structured programme for older adults to build strength, balance and confidence at a safe pace.",
    metaTitle: "Senior Fitness Programme | PainFix Physiotherapy Multan",
    metaDescription:
      "A senior fitness programme from PainFix — gentle, structured strength, balance and mobility routines for older adults to stay active, safe and independent.",
    quickSummary:
      "The Senior Fitness Programme is a gentle, structured plan for older adults to build strength, balance and mobility at a safe, comfortable pace. It supports independence and helps reduce fall risk, and is always adapted to individual health and ability.",
    keyTakeaways: [
      "Gentle, structured and safely paced",
      "Builds strength, balance and mobility",
      "Supports independence and fall prevention",
      "Adapted to individual health and ability",
    ],
    whoCanBenefit: [
      "Older adults wanting to stay active",
      "People concerned about balance or falls",
      "Those rebuilding strength after illness",
    ],
    faqs: [
      { q: "Is it safe for someone with health conditions?", a: "We adapt the programme around your conditions. Please get assessed first so we can make it safe for you." },
      { q: "How gentle is it?", a: "It starts gently and progresses at a pace that's comfortable and safe for you." },
      { q: "Is it right for me?", a: ADAPT_NOTE },
      WHATSAPP_FAQ,
    ],
    relatedServiceSlugs: ["exercise-therapy", "geriatric-physiotherapy"],
    relatedArticleCategories: ["exercise-therapy", "recovery-tips"],
  },
];

export const fitnessPages: FitnessPage[] = [
  ...services,
  ...mobility,
  ...injuryPrevention,
  ...programmes,
];

export const fitnessPageMap: Record<string, FitnessPage> = Object.fromEntries(
  fitnessPages.map((p) => [p.slug, p]),
);

export function getFitnessPage(slug: string): FitnessPage | undefined {
  return fitnessPageMap[slug];
}

export function fitnessPagesByCategory(category: FitnessCategory): FitnessPage[] {
  return fitnessPages.filter((p) => p.category === category);
}

export const fitnessSlugs = fitnessPages.map((p) => p.slug);
