export const WHATSAPP_URL = "https://wa.me/923143039582";
export const PHONE_DISPLAY = "0314-3039582";
export const PHONE_TEL = "tel:+923143039582";

// Exact clinic location on Google Maps
export const CLINIC_NAME = "PainFix Physiotherapy Clinic";
export const CLINIC_ADDRESS =
  "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony, Multan, Pakistan";
const CLINIC_QUERY =
  "PainFix Physiotherapy Clinic, Usman Raja Market, Shalimar Colony, Multan, Pakistan";
// Embedded map pointing directly to the clinic by name + address
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  CLINIC_QUERY,
)}&output=embed`;
// Opens Google Maps with directions to the clinic
export const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  CLINIC_QUERY,
)}`;

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
