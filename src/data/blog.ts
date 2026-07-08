export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  metaDescription: string;
  content: { heading?: string; paragraphs: string[]; list?: string[] }[];
  relatedServices: string[];
}

export const blogCategories = [
  "Back Pain",
  "Neck Pain",
  "Sciatica",
  "Sports Injuries",
  "Exercise Tips",
  "Posture",
  "Healthy Lifestyle",
  "Home Physiotherapy",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "5-daily-habits-to-prevent-back-pain",
    title: "5 Daily Habits to Prevent Back Pain",
    category: "Back Pain",
    excerpt: "Simple, science-backed habits you can build into your day to protect your spine and avoid recurring back pain.",
    date: "2026-06-20",
    readingMinutes: 5,
    metaDescription:
      "Prevent back pain with 5 simple daily habits recommended by physiotherapists. Practical tips to protect your spine from PainFix Physiotherapy Clinic, Multan.",
    content: [
      {
        paragraphs: [
          "Back pain is one of the most common problems we treat — and much of it is preventable. Small, consistent habits can dramatically reduce your risk of recurring pain.",
        ],
      },
      {
        heading: "1. Move regularly",
        paragraphs: ["Avoid sitting for long periods. Stand, stretch and walk for a few minutes every hour to keep your spine mobile."],
      },
      {
        heading: "2. Lift smart",
        paragraphs: ["Bend from your hips and knees, keep the load close to your body, and avoid twisting while lifting."],
      },
      {
        heading: "3. Strengthen your core",
        paragraphs: ["A strong core supports your spine. Simple daily exercises make a big difference over time."],
      },
      {
        heading: "4. Mind your posture",
        paragraphs: ["Set up your workstation so your screen is at eye level and your back is supported."],
      },
      {
        heading: "5. Stay active",
        paragraphs: ["Regular activity keeps muscles strong and joints healthy. If pain persists, book an assessment so we can address the cause."],
      },
    ],
    relatedServices: ["exercise-therapy", "manual-therapy", "pain-management"],
  },
  {
    slug: "desk-posture-tips-to-reduce-neck-pain",
    title: "Desk Posture Tips to Reduce Neck Pain",
    category: "Posture",
    excerpt: "Working long hours at a desk? These posture adjustments help reduce neck strain and prevent 'tech neck'.",
    date: "2026-06-10",
    readingMinutes: 4,
    metaDescription:
      "Reduce neck pain from desk work with practical posture tips from PainFix physiotherapists in Multan. Set up your workstation to prevent 'tech neck'.",
    content: [
      {
        paragraphs: ["Long hours at a screen are a leading cause of neck pain. A few simple adjustments can protect your neck and shoulders throughout the day."],
      },
      {
        heading: "Set your screen at eye level",
        paragraphs: ["Your monitor top should be at or just below eye level so you're not constantly looking down."],
      },
      {
        heading: "Support your back",
        paragraphs: ["Sit back in your chair with your lower back supported and feet flat on the floor."],
      },
      {
        heading: "Take micro-breaks",
        paragraphs: ["Every 30–45 minutes, roll your shoulders and gently move your neck through its range."],
        list: ["Chin tucks", "Shoulder rolls", "Gentle neck rotations"],
      },
    ],
    relatedServices: ["posture-ergonomic-assessment", "manual-therapy", "pain-management"],
  },
  {
    slug: "safe-return-to-sport-after-injury",
    title: "A Safe Return to Sport After Injury",
    category: "Sports Injuries",
    excerpt: "Rushing back too soon is the most common cause of re-injury. Here's how to return to sport safely.",
    date: "2026-05-28",
    readingMinutes: 6,
    metaDescription:
      "Return to sport safely after injury with guidance from PainFix physiotherapists in Multan. Avoid re-injury with a structured, criteria-based approach.",
    content: [
      {
        paragraphs: ["Returning to sport too early is the biggest cause of re-injury. A structured, criteria-based approach keeps your comeback safe and lasting."],
      },
      {
        heading: "Rebuild strength first",
        paragraphs: ["Full recovery means restoring strength, control and confidence — not just being pain-free."],
      },
      {
        heading: "Progress gradually",
        paragraphs: ["Increase intensity in stages, monitoring how your body responds at each step."],
      },
      {
        heading: "Pass return-to-sport tests",
        paragraphs: ["We use objective tests to confirm you're ready to compete safely before you return."],
      },
    ],
    relatedServices: ["sports-rehabilitation", "exercise-therapy", "manual-therapy"],
  },
  {
    slug: "when-is-home-physiotherapy-the-right-choice",
    title: "When Is Home Physiotherapy the Right Choice?",
    category: "Home Physiotherapy",
    excerpt: "Home physiotherapy brings expert care to your door. Here's who benefits most and what to expect.",
    date: "2026-05-15",
    readingMinutes: 4,
    metaDescription:
      "Learn when home physiotherapy is the right choice, who benefits most and what to expect. Home visits available across Multan from PainFix Physiotherapy Clinic.",
    content: [
      {
        paragraphs: ["Home physiotherapy delivers the same expert care you'd receive in clinic — in the comfort of your own home. It's ideal for several groups of patients."],
      },
      {
        heading: "Who benefits most",
        paragraphs: ["Home visits are especially valuable when travel is difficult or recovery is in its early stages."],
        list: [
          "Elderly patients with reduced mobility",
          "Patients recovering from surgery",
          "Stroke and neurological rehabilitation",
          "Anyone who finds travel difficult",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: ["A physiotherapist assesses you and your home environment, then delivers a personalized treatment plan with scheduled follow-up visits."],
      },
    ],
    relatedServices: ["home-physiotherapy", "post-surgical-rehabilitation", "stroke-rehabilitation"],
  },
];

export const blogMap = Object.fromEntries(blogPosts.map((p) => [p.slug, p]));

export function getPost(slug: string): BlogPost | undefined {
  return blogMap[slug];
}
