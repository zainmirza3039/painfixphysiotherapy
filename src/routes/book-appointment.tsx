import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Phone } from "lucide-react";
import { CityBookingForm } from "@/components/site/CityBookingForm";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_CONSULT_URL } from "@/components/site/constants";
import { parseBookingSearch } from "@/lib/city-booking";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";
const TITLE = "Book Physiotherapy | Multan & Rahim Yar Khan Online | PainFix";
const DESCRIPTION =
  "Request Multan clinic appointments or home visits, or enquire about online physiotherapy with Ariba Babar in Rahim Yar Khan. Availability is confirmed by the team.";
export const Route = createFileRoute("/book-appointment")({
  validateSearch: parseBookingSearch,
  head: () => ({
    meta: pageMeta({ title: TITLE, description: DESCRIPTION, path: "/book-appointment" }),
    links: canonical("/book-appointment"),
    scripts: [
      breadcrumbLd([
        { label: "Home", path: "/" },
        { label: "Book an appointment", path: "/book-appointment" },
      ]),
    ],
  }),
  component: BookAppointmentPage,
});
function BookAppointmentPage() {
  const { city, service } = Route.useSearch();
  return (
    <PageLayout>
      <PageHero
        eyebrow="Find the right care"
        title="Your city. Your way to better movement."
        subtitle="Multan clinic appointments and home visits. Online physiotherapy with Ariba Babar, DPT, in Rahim Yar Khan. Start by choosing your city."
        icon={<CalendarCheck className="h-7 w-7" aria-hidden="true" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Book an appointment", path: "/book-appointment" },
        ]}
        showActions={false}
      />
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-7">
            <CityBookingForm
              key={`${city ?? ""}-${service ?? ""}`}
              initialCity={city}
              initialService={service}
            />
          </div>
          <aside className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span>Need help choosing?</span>
            <a
              href={WHATSAPP_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-primary underline"
            >
              WhatsApp the PainFix clinic
            </a>
            <a
              href={PHONE_TEL}
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </aside>
        </div>
      </section>
    </PageLayout>
  );
}
