import { MapPin, Phone, MessageCircle, Facebook, Instagram, AtSign, Navigation } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  WHATSAPP_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  CLINIC_NAME,
} from "./constants";

const socials = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/painfixphysiotherapy" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/painfixphysiotherapy" },
  { icon: AtSign, label: "TikTok", href: "https://tiktok.com/@painfixphysiotherapy" },
];

export function Contact() {
  return (
    <section id="contact" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Visit us in Multan"
          subtitle="We're here to answer your questions and get your recovery started."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal anim="left" className="space-y-4">
            <div className="rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Address</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Usman Raja Market, Near Khair Ul Maarif School,
                    <br />
                    Shalimar Colony, Multan
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={PHONE_TEL}
                className="hover-lift rounded-[1.75rem] border border-border bg-card p-7 shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <Phone className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading font-bold text-foreground">Phone</h3>
                <p className="mt-1 text-sm text-muted-foreground">{PHONE_DISPLAY}</p>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-lift rounded-[1.75rem] border border-border bg-card p-7 shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/12 text-secondary">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading font-bold text-foreground">WhatsApp</h3>
                <p className="mt-1 text-sm text-muted-foreground">{PHONE_DISPLAY}</p>
              </a>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
              <h3 className="font-heading font-bold text-foreground">Follow Us</h3>
              <p className="mt-1 text-sm text-muted-foreground">@painfixphysiotherapy</p>
              <div className="mt-4 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform hover:scale-110"
                  >
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal anim="right">
            <div className="overflow-hidden rounded-[20px] border border-border shadow-soft">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.330882772591!2d71.4830637!3d30.2394736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393ceb007f8c2985%3A0x77b8484bc13b3cce!2sPainFix%20Physiotherapy%20Clinic!5e0!3m2!1sen!2spk!4v1719816000000!5m2!1sen!2spk"
                width="100%"
                height="450"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title={`${CLINIC_NAME} location on Google Maps`}
                className="block h-[320px] w-full border-0 md:h-[450px]"
              />
              <a
                href="https://www.google.com/maps/place/PainFix+Physiotherapy+Clinic/@30.2394736,71.4830637,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="hover-lift flex items-center justify-center gap-2 bg-primary px-6 py-4 font-heading font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Navigation className="h-5 w-5" />
                Get Directions
              </a>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
