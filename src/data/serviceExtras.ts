import { conditions } from "./conditions";
import { blogPosts, type BlogPost } from "./blog";

/**
 * "Who can benefit" — the audience each service is best suited to. Kept
 * separate from services.ts so the core service data stays lean, while every
 * service page can present a clear, patient-facing "is this for me?" panel.
 */
export const whoCanBenefit: Record<string, string[]> = {
  "manual-therapy": [
    "People with stiff, painful joints or restricted movement",
    "Those with neck, back or shoulder pain from posture or strain",
    "Patients recovering from injury who need hands-on mobilisation",
    "Anyone seeking drug-free relief before or alongside exercise therapy",
  ],
  "exercise-therapy": [
    "Anyone rebuilding strength after injury, surgery or long inactivity",
    "People with chronic back, neck or joint pain",
    "Patients with arthritis wanting to move with less pain",
    "Older adults working on balance, mobility and independence",
  ],
  electrotherapy: [
    "People with acute or persistent muscular and joint pain",
    "Those with muscle spasm, swelling or slow-healing soft-tissue injuries",
    "Patients who need pain relief to tolerate exercise and manual therapy",
    "Anyone seeking a comfortable, non-invasive, drug-free option",
  ],
  "sports-rehabilitation": [
    "Athletes and active people recovering from a sports injury",
    "Weekend runners, gym-goers and team players of any level",
    "Anyone returning to sport after an operation",
    "Players wanting to reduce the risk of recurring injuries",
  ],
  "home-physiotherapy": [
    "Elderly patients who find travelling to a clinic difficult",
    "People recovering from surgery or a fracture at home",
    "Stroke and neurological patients needing bedside rehabilitation",
    "Anyone with reduced mobility or a busy schedule",
  ],
  "post-surgical-rehabilitation": [
    "Patients recovering after joint replacement or ligament surgery",
    "Those healing from fracture fixation or spinal surgery",
    "People after shoulder, rotator cuff or tendon repair",
    "Anyone who wants a safe, guided return to work and daily life",
  ],
  "stroke-rehabilitation": [
    "Patients regaining movement and strength after a stroke",
    "Those with weakness, spasticity or balance difficulty on one side",
    "People relearning walking, hand and arm function",
    "Families supporting a loved one's neurological recovery",
  ],
  "pain-management": [
    "People with long-standing or recurring pain",
    "Those wanting to treat the cause of pain, not just the symptoms",
    "Patients seeking a drug-free, non-invasive approach",
    "Anyone whose pain is affecting sleep, work or daily activities",
  ],
  "posture-ergonomic-assessment": [
    "Office workers and students with desk-related pain",
    "People with recurring neck, shoulder or back discomfort",
    "Those with rounded shoulders or forward-head posture",
    "Anyone setting up a healthier home or office workspace",
  ],
  "hijama-cupping-therapy": [
    "People with general muscle tension, tightness or heaviness",
    "Those seeking a complementary therapy alongside physiotherapy",
    "Anyone wanting relaxation and improved local circulation",
    "Patients cleared as suitable after a safety assessment",
  ],
};

/**
 * Explicit related-conditions overrides for services whose relevant conditions
 * are not fully captured by the automatic derivation below.
 */
const relatedConditionsOverride: Record<string, string[]> = {
  "hijama-cupping-therapy": ["back-pain", "neck-pain", "osteoarthritis"],
};

/**
 * Conditions relevant to a service. Uses an explicit override when provided,
 * otherwise derives the list from conditions that reference this service in
 * their own `relatedServices`.
 */
export function relatedConditionsForService(slug: string, limit = 6): string[] {
  if (relatedConditionsOverride[slug]) return relatedConditionsOverride[slug].slice(0, limit);
  return conditions
    .filter((c) => c.relatedServices.includes(slug))
    .map((c) => c.slug)
    .slice(0, limit);
}

/**
 * Blog articles relevant to a service — matched by the article's category or
 * its `relatedServices`, in publication order.
 */
export function relatedArticlesForService(slug: string, limit = 3): BlogPost[] {
  const out: BlogPost[] = [];
  for (const p of blogPosts) {
    if (p.category === slug || p.relatedServices?.includes(slug)) {
      out.push(p);
      if (out.length >= limit) break;
    }
  }
  return out;
}
