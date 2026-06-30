import { MapPin, Phone, MessageCircle, Facebook, Instagram, AtSign } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { WHATSAPP_URL, PHONE_DISPLAY, PHONE_TEL } from "./constants";

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
            <div className="h-full overflow-hidden rounded-[1.75rem] border border-border shadow-soft">
              <iframe
                title="PainFix Physiotherapy Clinic location on Google Maps"
                src="https://www.google.com/maps?q=Shalimar%20Colony%2C%20Multan%2C%20Pakistan&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[360px] w-full"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
