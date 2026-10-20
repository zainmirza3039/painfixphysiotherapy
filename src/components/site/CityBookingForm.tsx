import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { HomeVisitForm } from "./HomeVisitForm";
import { CalendlyInline } from "./CalendlyInline";
import { CALENDLY_URL, WHATSAPP_URL } from "./constants";
import {
  BOOKING_CITIES,
  bookingServices,
  bookingWhatsAppUrl,
  clinicCalendarUrl,
  createSingleSubmissionGuard,
  validateBookingDetails,
  type BookingCity,
  type BookingService,
} from "@/lib/city-booking";
import { getLocalDateInputValue, type HomeVisitFormValues } from "@/lib/home-visit-form";

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const actionClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
export function CityBookingForm({
  initialCity,
  initialService,
}: {
  initialCity?: BookingCity;
  initialService?: BookingService;
}) {
  const [city, setCity] = useState<BookingCity | "">(initialCity ?? "");
  const [service, setService] = useState<BookingService | "">(initialService ?? "");
  return (
    <div className="space-y-7">
      <fieldset className="space-y-3">
        <legend className="font-heading text-xl font-semibold">1. Choose your city</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {BOOKING_CITIES.map((entry) => (
            <label
              key={entry.value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${city === entry.value ? "border-secondary bg-accent" : "border-border"}`}
            >
              <input
                type="radio"
                name="booking-city"
                value={entry.value}
                checked={city === entry.value}
                onChange={() => {
                  setCity(entry.value);
                  setService("");
                }}
                className="h-4 w-4 accent-primary"
              />
              {entry.label}
            </label>
          ))}
        </div>
      </fieldset>
      {city && (
        <fieldset className="space-y-3">
          <legend className="font-heading text-xl font-semibold">2. Choose your service</legend>
          <label htmlFor="booking-service" className="sr-only">
            Service
          </label>
          <select
            id="booking-service"
            value={service}
            onChange={(event) => setService(event.target.value as BookingService | "")}
            className={inputClass}
          >
            <option value="">Select a service</option>
            {bookingServices(city).map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="text-sm leading-6 text-muted-foreground">
            {city === "rahim-yar-khan" ? (
              <>
                Online-only with{" "}
                <Link
                  to="/$slug"
                  params={{ slug: "ariba-babar" }}
                  className="font-semibold text-primary underline"
                >
                  Ariba Babar, DPT
                </Link>
                . PainFix does not have a physical branch in Rahim Yar Khan.
              </>
            ) : city === "other" ? (
              "We can check online consultation availability for your city. Clinic appointments and home visits are offered in Multan only."
            ) : (
              "Visit the Multan clinic, request a home visit in Multan, or enquire about online availability."
            )}
          </p>
        </fieldset>
      )}
      {city && service && (
        <section
          key={`${city}-${service}`}
          aria-labelledby="booking-details-heading"
          className="border-t border-border pt-7"
        >
          <h2 id="booking-details-heading" className="font-heading text-xl font-semibold">
            3. Your details and preferences
          </h2>
          <p className="mt-2 mb-5 text-sm leading-6 text-muted-foreground">
            Preferred dates and times are requests in Pakistan time, not confirmed slots.
            Availability must be confirmed by the treating team. Share only information needed for
            your enquiry; do not upload medical reports here.
          </p>
          {city === "multan" && service === "home_visit" ? (
            <HomeVisitForm />
          ) : (
            <ConsultationDetailsForm city={city} service={service} />
          )}
        </section>
      )}
    </div>
  );
}
function ConsultationDetailsForm({
  city,
  service,
}: {
  city: BookingCity;
  service: BookingService;
}) {
  const [values, setValues] = useState<HomeVisitFormValues>({
    full_name: "",
    phone: "",
    address: "",
    medical_condition: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const guard = useRef(createSingleSubmissionGuard());
  const change = (key: keyof HomeVisitFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
    setReady(false);
    guard.current.release();
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guard.current.enter()) return;
    const message = validateBookingDetails(values);
    if (message) {
      setError(message);
      guard.current.release();
      return;
    }
    setReady(true);
  }
  return (
    <form onSubmit={submit} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="enquiry-name" className="mb-1.5 block text-sm font-semibold">
          Full name *
        </label>
        <input
          id="enquiry-name"
          name="full_name"
          autoComplete="name"
          maxLength={120}
          required
          className={inputClass}
          value={values.full_name}
          onChange={(event) => change("full_name", event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="enquiry-phone" className="mb-1.5 block text-sm font-semibold">
          Phone / WhatsApp number *
        </label>
        <input
          id="enquiry-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          maxLength={24}
          required
          className={inputClass}
          value={values.phone}
          onChange={(event) => change("phone", event.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enquiry-condition" className="mb-1.5 block text-sm font-semibold">
          Main condition or reason for consultation *
        </label>
        <input
          id="enquiry-condition"
          name="medical_condition"
          maxLength={200}
          required
          className={inputClass}
          value={values.medical_condition}
          onChange={(event) => change("medical_condition", event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="enquiry-date" className="mb-1.5 block text-sm font-semibold">
          Preferred date *
        </label>
        <input
          id="enquiry-date"
          name="preferred_date"
          type="date"
          min={getLocalDateInputValue()}
          required
          className={inputClass}
          value={values.preferred_date}
          onChange={(event) => change("preferred_date", event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="enquiry-time" className="mb-1.5 block text-sm font-semibold">
          Preferred time (Pakistan) *
        </label>
        <input
          id="enquiry-time"
          name="preferred_time"
          type="time"
          required
          className={inputClass}
          value={values.preferred_time}
          onChange={(event) => change("preferred_time", event.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enquiry-notes" className="mb-1.5 block text-sm font-semibold">
          Optional notes
        </label>
        <textarea
          id="enquiry-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          className={inputClass}
          value={values.notes}
          onChange={(event) => change("notes", event.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={ready}
          className={`${actionClass} w-full disabled:opacity-60 sm:w-auto`}
        >
          {ready
            ? "Details ready below"
            : service === "clinic"
              ? "Continue to clinic booking"
              : "Prepare WhatsApp enquiry"}
        </button>
      </div>
      {ready && (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-secondary/40 bg-accent p-5 sm:col-span-2"
        >
          <p className="font-semibold">
            {service === "clinic"
              ? "Your preferences are ready. Continue in the existing clinic calendar."
              : "Your WhatsApp message is ready — it has not been sent."}
          </p>
          <p className="text-sm leading-6">
            {service === "clinic"
              ? "Only your name is prefilled in Calendly. Choose an available time there and share your phone, condition and preferences with the clinic when asked. Nothing has been submitted or saved by this form."
              : "Open WhatsApp, review the prefilled details, then send the message yourself. No request is saved on this website, and opening WhatsApp does not confirm a booking."}
          </p>
          <a
            href={
              service === "clinic"
                ? clinicCalendarUrl(CALENDLY_URL, values)
                : bookingWhatsAppUrl(city, values, WHATSAPP_URL)
            }
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            {service === "clinic"
              ? "Open clinic booking calendar"
              : city === "rahim-yar-khan"
                ? "Open WhatsApp with Ariba"
                : "Open WhatsApp with PainFix"}
          </a>
        </div>
      )}
      {service === "clinic" && (
        <div className="min-w-0 border-t border-border pt-6 sm:col-span-2">
          <h3 className="font-heading text-lg font-semibold">
            Existing clinic appointment calendar
          </h3>
          <p className="mt-2 mb-4 text-sm text-muted-foreground">
            You can also use the calendar directly. Check availability here; a preferred time
            entered above is not reserved.
          </p>
          <CalendlyInline />
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary underline"
          >
            Calendar not loading? Open Calendly directly
          </a>
        </div>
      )}
    </form>
  );
}
