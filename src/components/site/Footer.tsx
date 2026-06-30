import { Facebook, Instagram, AtSign, MapPin, Phone } from "lucide-react";
import { NAV_LINKS, WHATSAPP_URL, PHONE_DISPLAY, PHONE_TEL } from "./constants";
import logoAsset from "@/assets/painfix-logo.png.asset.json";


const socials = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/painfixphysiotherapy" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/painfixphysiotherapy" },
  { icon: AtSign, label: "TikTok", href: "https://tiktok.com/@painfixphysiotherapy" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-background p-0.5">
                <img
                  src={logoAsset.url}
                  alt="PainFix Physiotherapy Clinic logo"
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </span>

              <div className="leading-tight">
                <div className="font-heading text-lg font-bold">PainFix</div>
                <div className="text-xs text-background/60">Physiotherapy Clinic</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
              Evidence-based physiotherapy and rehabilitation in Multan. Helping you move better, recover faster, and
              live pain-free.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-background/10 transition-colors hover:bg-secondary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background/90">Quick Links</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-background/70 transition-colors hover:text-secondary">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background/90">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>Usman Raja Market, Shalimar Colony, Multan</span>
              </li>
              <li>
                <a href={PHONE_TEL} className="flex items-center gap-2.5 transition-colors hover:text-secondary">
                  <Phone className="h-4 w-4 shrink-0 text-secondary" /> {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition-transform hover:scale-105"
                >
                  Book Appointment
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/15 pt-6 text-sm text-background/60 sm:flex-row">
          <p>© {new Date().getFullYear()} PainFix Physiotherapy Clinic. All rights reserved.</p>
          <a href="#home" className="transition-colors hover:text-secondary">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
