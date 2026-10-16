import {
  AtSign,
  CalendarClock,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { CalendlyInline } from "./CalendlyInline";
import { ContactForm } from "./ContactForm";
import { GoogleReviewButton } from "./GoogleReviewButton";
import {
  EMAIL,
  EMAIL_HREF,
  WHATSAPP_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  CLINIC_NAME,
  CLINIC_ADDRESS_LINES,
  MAP_PLACE_URL,
  MAP_DIRECTIONS_URL,
  OPENING_HOURS,
  SOCIAL_LINKS,
} from "./constants";

const socials = [
  { icon: Facebook, label: "Facebook", ...SOCIAL_LINKS.facebook },
  { icon: Instagram, label: "Instagram", ...SOCIAL_LINKS.instagram },
  { icon: AtSign, label: "TikTok", ...SOCIAL_LINKS.tiktok },
  { icon: Linkedin, label: "LinkedIn", ...SOCIAL_LINKS.linkedin },
];

export function Contact() {
  return (
    <section id="contact" className="home-section home-section--tint scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Visit or get in touch"
          title="PainFix Physiotherapy Clinic, Multan"
          subtitle="Find the clinic, call or message the team, send an enquiry, or choose an appointment time."
        />

        <div className="mt-10 grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          <Reveal anim="left" className="home-contact-details">
            <a
              href={MAP_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-contact-item"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <span>
                <span className="home-contact-item__label">Clinic address</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {CLINIC_ADDRESS_LINES.map((line, index) => (
                    <span key={line}>
                      {line}
                      {index < CLINIC_ADDRESS_LINES.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </span>
            </a>

            <div className="home-contact-item">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="home-contact-item__label">Clinic hours</span>
                <span className="mt-2 block space-y-1 text-sm text-muted-foreground">
                  {OPENING_HOURS.map((hours) => (
                    <span
                      key={hours.days}
                      className="flex flex-wrap justify-between gap-x-4 gap-y-1"
                    >
                      <span>{hours.days}</span>
                      <span className="font-medium text-foreground">{hours.time}</span>
                    </span>
                  ))}
                </span>
              </span>
            </div>

            <a href={PHONE_TEL} className="home-contact-item">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <span>
                <span className="home-contact-item__label">Phone</span>
                <span className="mt-1 block text-sm text-muted-foreground">{PHONE_DISPLAY}</span>
              </span>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-contact-item"
            >
              <MessageCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <span>
                <span className="home-contact-item__label">WhatsApp</span>
                <span className="mt-1 block text-sm text-muted-foreground">Message the clinic</span>
              </span>
            </a>

            <a href={EMAIL_HREF} className="home-contact-item">
              <AtSign className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <span>
                <span className="home-contact-item__label">Email</span>
                <span className="mt-1 block break-all text-sm text-muted-foreground">{EMAIL}</span>
              </span>
            </a>

            <div className="border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Follow PainFix
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socials.map(({ icon: Icon, label, url, username }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label}: ${username}`}
                    className="inline-flex min-h-10 items-center gap-2 border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <GoogleReviewButton variant="outline" />
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal anim="right" className="overflow-hidden border border-border bg-background">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.330882772591!2d71.4830637!3d30.2394736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393ceb007f8c2985%3A0x77b8484bc13b3cce!2sPainFix%20Physiotherapy%20Clinic!5e0!3m2!1sen!2spk!4v1719816000000!5m2!1sen!2spk"
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title={`${CLINIC_NAME} location on Google Maps`}
              className="block h-[320px] w-full border-0 sm:h-[450px]"
            />
          </Reveal>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal anim="left" className="home-contact-form-panel">
            <h3 className="font-heading text-2xl font-semibold text-foreground">Send an enquiry</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Share a few details and the clinic team can follow up.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal anim="right" className="home-contact-form-panel">
            <div id="book" className="scroll-mt-24">
              <div className="mb-5 flex items-start gap-3">
                <CalendarClock
                  className="mt-1 h-5 w-5 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-foreground">
                    Choose an appointment time
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Appointments are confirmed through the existing booking service.
                  </p>
                </div>
              </div>
              <CalendlyInline />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
