import {
  Facebook,
  Instagram,
  AtSign,
  MapPin,
  Phone,
  Linkedin,
  MessageCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  WHATSAPP_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SOCIAL_LINKS,
  CLINIC_ADDRESS,
  MAP_PLACE_URL,
  OPENING_HOURS,
} from "./constants";
import { GoogleReviewButton } from "./GoogleReviewButton";
import { services } from "@/data/services";
import { conditions } from "@/data/conditions";
import { latestPosts } from "@/data/blog";

const socials = [
  { icon: Facebook, label: "Facebook", ...SOCIAL_LINKS.facebook },
  { icon: Instagram, label: "Instagram", ...SOCIAL_LINKS.instagram },
  { icon: AtSign, label: "TikTok", ...SOCIAL_LINKS.tiktok },
  { icon: Linkedin, label: "LinkedIn", ...SOCIAL_LINKS.linkedin },
];

const topServices = services.slice(0, 6);
const topConditions = conditions.slice(0, 6);

export function Footer() {
  const articles = latestPosts(4);

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand + socials */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-background p-0.5">
                <img
                  src="/painfix-logo-96.webp"
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
              Evidence-based physiotherapy and rehabilitation in Multan. Helping you move better,
              recover faster, and live pain-free.
            </p>

            {/* Working hours */}
            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-background/90">
                <Clock className="h-4 w-4 text-secondary" /> Working Hours
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-background/70">
                {OPENING_HOURS.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4">
                    <span>{h.days}</span>
                    <span className="font-medium text-background/90">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label}: ${s.username}`}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-background/10 transition-colors hover:bg-secondary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background/90">
              Top Services
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {topServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="text-background/70 transition-colors hover:text-secondary"
                  >
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/fitness-rehabilitation"
                  className="text-background/70 transition-colors hover:text-secondary"
                >
                  Fitness &amp; Rehabilitation
                </Link>
              </li>
              <li>
                <Link
                  to="/fitness"
                  className="text-background/70 transition-colors hover:text-secondary"
                >
                  Fitness Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/health-calculators"
                  className="text-background/70 transition-colors hover:text-secondary"
                >
                  Health Calculators
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="text-background/70 transition-colors hover:text-secondary"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1 font-semibold text-secondary-glow"
                >
                  All Services <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Conditions */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background/90">
              Top Conditions
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {topConditions.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/conditions/$slug"
                    params={{ slug: c.slug }}
                    className="text-background/70 transition-colors hover:text-secondary"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/conditions"
                  className="inline-flex items-center gap-1 font-semibold text-secondary-glow"
                >
                  All Conditions <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Latest Articles + Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background/90">
              Latest Articles
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {articles.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="text-background/70 transition-colors hover:text-secondary"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 font-semibold text-secondary-glow"
                >
                  Read the Blog <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>

            <h3 className="mt-8 font-heading text-sm font-bold uppercase tracking-wider text-background/90">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-background/70">
              <li>
                <a
                  href={MAP_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-secondary"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>{CLINIC_ADDRESS}</span>
                </a>
              </li>
              <li>
                <a
                  href={PHONE_TEL}
                  className="flex items-center gap-2.5 transition-colors hover:text-secondary"
                >
                  <Phone className="h-4 w-4 shrink-0 text-secondary" /> {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <GoogleReviewButton
                variant="outline"
                className="border-background/20 bg-background/10 text-background hover:bg-background/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/15 pt-6 text-sm text-background/60 sm:flex-row">
          <p>© {new Date().getFullYear()} PainFix Physiotherapy Clinic. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/privacy" className="transition-colors hover:text-secondary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-secondary">
              Terms of Service
            </Link>
            <a href="/sitemap.xml" className="transition-colors hover:text-secondary">
              Sitemap
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
