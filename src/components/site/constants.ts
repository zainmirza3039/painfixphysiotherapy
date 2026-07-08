export const SITE_URL = "https://painfix-heal-path.lovable.app";

export const WHATSAPP_URL = "https://wa.me/923143039582";
export const PHONE_DISPLAY = "0314-3039582";
export const PHONE_TEL = "tel:+923143039582";
export const EMAIL = "painfixphysiotherapy@gmail.com";
export const EMAIL_HREF = "mailto:painfixphysiotherapy@gmail.com";

// Clinic opening hours (used across pages + schema)
export const OPENING_HOURS = [
  { days: "Monday – Saturday", time: "9:00 AM – 9:00 PM" },
  { days: "Sunday", time: "By Appointment" },
];

// Calendly scheduling link — swap this for your real Calendly event URL.
// e.g. "https://calendly.com/painfixphysiotherapy/consultation"
export const CALENDLY_URL = "https://calendly.com/painfixphysiotherapy/consultation";

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
};

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Conditions", href: "#conditions" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
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
