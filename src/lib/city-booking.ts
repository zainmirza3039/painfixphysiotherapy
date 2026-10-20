import { getLocalDateInputValue, type HomeVisitFormValues } from "./home-visit-form.ts";

export function createSingleSubmissionGuard() {
  let submitted = false;
  return {
    enter() {
      if (submitted) return false;
      submitted = true;
      return true;
    },
    release() {
      submitted = false;
    },
  };
}

export const BOOKING_CITIES = [
  { value: "multan", label: "Multan" },
  { value: "rahim-yar-khan", label: "Rahim Yar Khan" },
  { value: "other", label: "Other city" },
] as const;
export type BookingCity = (typeof BOOKING_CITIES)[number]["value"];
export type BookingService = "clinic" | "home_visit" | "online";
export function bookingServices(city: BookingCity | "") {
  if (city === "multan")
    return [
      { value: "clinic", label: "Clinic appointment" },
      { value: "home_visit", label: "Home visit" },
      { value: "online", label: "Online consultation enquiry" },
    ] as const;
  if (city === "rahim-yar-khan")
    return [{ value: "online", label: "Online consultation with Ariba Babar, DPT" }] as const;
  if (city === "other")
    return [{ value: "online", label: "Online consultation availability enquiry" }] as const;
  return [];
}
export function parseBookingSearch(search: Record<string, unknown>): {
  city?: BookingCity;
  service?: BookingService;
} {
  const city = BOOKING_CITIES.find((entry) => entry.value === search.city)?.value;
  const service = city
    ? bookingServices(city).find((entry) => entry.value === search.service)?.value
    : undefined;
  return { ...(city ? { city } : {}), ...(service ? { service } : {}) };
}
export function validateBookingDetails(
  values: HomeVisitFormValues,
  today = getLocalDateInputValue(),
): string | null {
  if (
    [
      values.full_name,
      values.phone,
      values.medical_condition,
      values.preferred_date,
      values.preferred_time,
    ].some((value) => !value.trim())
  )
    return "Please complete all required fields.";
  if (
    !/^[+\d\s().-]+$/.test(values.phone) ||
    values.phone.replace(/\D/g, "").length < 7 ||
    values.phone.replace(/\D/g, "").length > 15
  )
    return "Please enter a valid phone or WhatsApp number (7–15 digits).";
  const parsed = new Date(`${values.preferred_date}T00:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.preferred_date) ||
    Number.isNaN(parsed.getTime()) ||
    getLocalDateInputValue(parsed) !== values.preferred_date ||
    values.preferred_date < today
  )
    return "Please choose a valid date today or later.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.preferred_time))
    return "Please enter a valid preferred time.";
  if (
    values.full_name.trim().length > 120 ||
    values.phone.length > 24 ||
    values.medical_condition.length > 200 ||
    values.notes.length > 1000
  )
    return "Please shorten the information to fit the field limits.";
  return null;
}
export function bookingWhatsAppUrl(
  city: BookingCity,
  values: HomeVisitFormValues,
  clinicWhatsAppUrl: string,
): string {
  const cityLabel = BOOKING_CITIES.find((entry) => entry.value === city)!.label;
  const recipient = city === "rahim-yar-khan" ? "https://wa.me/923120102560" : clinicWhatsAppUrl;
  const lines = [
    city === "rahim-yar-khan"
      ? "Hello Ariba Babar, I'd like to enquire about an online physiotherapy consultation through PainFix."
      : "Hello PainFix, I'd like to enquire about online physiotherapy availability.",
    `Name: ${values.full_name.trim()}`,
    `Phone/WhatsApp: ${values.phone.trim()}`,
    `City: ${cityLabel}`,
    "Service: Online consultation enquiry",
    `Reason: ${values.medical_condition.trim()}`,
    `Preferred date: ${values.preferred_date}`,
    `Preferred time: ${values.preferred_time} (Pakistan time)`,
    ...(values.notes.trim() ? [`Notes: ${values.notes.trim()}`] : []),
    "Please confirm availability. This is an enquiry, not a confirmed appointment.",
  ];
  return `${recipient}?text=${encodeURIComponent(lines.join("\n"))}`;
}
export function clinicCalendarUrl(base: string, values: HomeVisitFormValues): string {
  const url = new URL(base);
  // Only the standard supported name prefill is passed. Clinical details stay off the URL.
  url.searchParams.set("name", values.full_name.trim());
  return url.toString();
}
