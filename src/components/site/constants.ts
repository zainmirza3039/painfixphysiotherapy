export const SITE_URL = "https://painfixphysiotherapy.lovable.app";

export const WHATSAPP_URL = "https://wa.me/923143039582";
export const PHONE_DISPLAY = "0314-3039582";
export const PHONE_TEL = "tel:+923143039582";

// Primary CTA: WhatsApp consultation link with a friendly prefilled message.
export const WHATSAPP_CONSULT_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Hi PainFix Physiotherapy, I'd like a consultation. Can you help me with my condition?",
)}`;
export const EMAIL = "painfixphysiotherapy@gmail.com";
export const EMAIL_HREF = "mailto:painfixphysiotherapy@gmail.com";

// Clinic opening hours (used across pages + schema)
export const OPENING_HOURS = [
  { days: "Monday – Saturday", time: "9:00 AM – 9:00 PM" },
  { days: "Sunday", time: "By Appointment" },
];

// Calendly scheduling link for PainFix Physiotherapy Clinic.
// Base scheduling page — opens the clinic's booking flow.

export const CALENDLY_URL = "https://calendly.com/zainimirza30396";

// Google Business Profile — review + profile links (NAP consistency)
export const GOOGLE_REVIEW_URL = "https://g.page/r/Cc48O8FLSLh3EBE/review";
export const GOOGLE_PLACE_ID = "ChIJhSmMfwDrPDkRzjw7wUtIuHc";
// Public Google Maps business profile (also used for "View all reviews")
export const GOOGLE_BUSINESS_PROFILE_URL = "https://maps.google.com/?cid=8626724576429817038";

// Exact clinic location on Google Maps
export const CLINIC_NAME = "PainFix Physiotherapy Clinic";
export const CLINIC_ADDRESS =
  "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony, Multan, Punjab, Pakistan";
// Multi-line address lines for display
export const CLINIC_ADDRESS_LINES = [
  "Usman Raja Market,",
  "Near Khair Ul Maarif School,",
  "Shalimar Colony,",
  "Multan, Punjab, Pakistan",
];
// Exact Google Maps location of the clinic (used for map link + directions)
export const MAP_PLACE_URL =
  "https://www.google.com/maps/place/PainFix+Physiotherapy+Clinic/@30.239469,71.4856386,17z";
export const MAP_DIRECTIONS_URL = MAP_PLACE_URL;
// Embeddable Google Maps iframe URL for the clinic location
export const MAP_EMBED_URL =
  "https://www.google.com/maps?q=PainFix+Physiotherapy+Clinic,+Shalimar+Colony,+Multan&output=embed";

// Social media profiles
export const SOCIAL_LINKS = {
  facebook: {
    url: "https://facebook.com/painfixphysiotherapy1",
    username: "painfixphysiotherapy1",
  },
  instagram: {
    url: "https://instagram.com/painfixphysiotherapy_",
    username: "painfixphysiotherapy_",
  },
  tiktok: {
    url: "https://tiktok.com/@painfixphysiotherapy",
    username: "@painfixphysiotherapy",
  },
  linkedin: {
    url: "https://www.linkedin.com/company/painfix-physiotherapy-clinic1/",
    username: "PainFix Physiotherapy Clinic",
  },
};

export const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Conditions", href: "/#conditions" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

// Route-based navigation used across all inner pages (type-safe TanStack routes).
export const SITE_NAV = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Conditions", to: "/conditions" },
  { label: "Home Visit", to: "/home-visit" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

// Footer patient-resource links.
export const RESOURCE_NAV = [
  { label: "FAQ", to: "/faq" },
  { label: "Patient Education", to: "/patient-education" },
  { label: "Recovery Guides", to: "/recovery-guides" },
  { label: "Blog", to: "/blog" },
] as const;

// ── Primary navigation dropdowns ───────────────────────────────────────────
// Items with `to === "/services/$slug"` (or "/conditions/$slug") are dynamic
// route params rendered via <Link params>. All other `to` values are concrete
// static routes. `desc` powers the premium dropdown subtitles.
export const SERVICES_MENU = [
  { label: "Physiotherapy", to: "/services", desc: "Full range of evidence-based care" },
  {
    label: "Manual Therapy",
    to: "/services/$slug",
    slug: "manual-therapy",
    desc: "Hands-on joint & soft-tissue work",
  },
  {
    label: "Exercise Therapy",
    to: "/services/$slug",
    slug: "exercise-therapy",
    desc: "Targeted movement & strengthening",
  },
  {
    label: "Home Physiotherapy",
    to: "/services/$slug",
    slug: "home-physiotherapy",
    desc: "Expert care at your doorstep",
  },
  {
    label: "Hijama Therapy",
    to: "/services/$slug",
    slug: "hijama-cupping-therapy",
    desc: "Cupping therapy for pain relief",
  },
  { label: "Diet & Nutrition", to: "/diet-nutrition", desc: "Personalised nutrition guidance" },
  {
    label: "Personalised Fitness & Rehabilitation",
    to: "/fitness-rehabilitation",
    desc: "Guided strength & recovery programs",
  },
] as const;

export const CONDITIONS_MENU = [
  { label: "Back Pain", to: "/conditions/$slug", slug: "back-pain" },
  { label: "Neck Pain", to: "/conditions/$slug", slug: "neck-pain" },
  { label: "Sciatica", to: "/conditions/$slug", slug: "sciatica" },
  { label: "Knee Pain", to: "/conditions/$slug", slug: "knee-pain" },
  { label: "Frozen Shoulder", to: "/conditions/$slug", slug: "frozen-shoulder" },
  { label: "Heel Pain", to: "/conditions/$slug", slug: "plantar-fasciitis" },
  { label: "Arthritis", to: "/conditions/$slug", slug: "osteoarthritis" },
  { label: "Sports Injury", to: "/conditions/$slug", slug: "sports-injuries" },
  { label: "Stroke Rehabilitation", to: "/conditions/$slug", slug: "stroke-rehabilitation" },
  { label: "Cervical Radiculopathy", to: "/conditions/$slug", slug: "cervical-radiculopathy" },
] as const;
