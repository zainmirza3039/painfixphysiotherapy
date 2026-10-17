import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { CalendlyInline } from "@/components/site/CalendlyInline";
import { PageHero } from "@/components/site/PageHero";
import { PageLayout } from "@/components/site/PageLayout";
import {
  CALENDLY_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_CONSULT_URL,
} from "@/components/site/constants";
import { breadcrumbLd, canonical, pageMeta } from "@/lib/seo";

const TITLE = "Book a Physiotherapy Appointment in Multan | PainFix";
const DESCRIPTION =
  "Choose an appointment time with PainFix Physiotherapy Clinic in Multan using our existing online booking service, or contact the clinic directly.";

export const Route = createFileRoute("/book-appointment")({
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
  return (
    <PageLayout>
      <PageHero
        eyebrow="Appointments"
        title="Choose a time to speak with PainFix."
        subtitle="Use the clinic’s existing online booking calendar to select an appointment time."
        icon={<CalendarCheck className="h-7 w-7" aria-hidden="true" />}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Book an appointment", path: "/book-appointment" },
        ]}
        showActions={false}
      />
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-7">
            <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Appointment calendar
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select an available time in the calendar. If it does not load, open the booking page
              directly or contact the clinic.
            </p>
            <div className="mt-5 min-h-[680px]">
              <CalendlyInline />
            </div>
            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Open booking calendar <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-secondary/50 px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp the clinic
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
