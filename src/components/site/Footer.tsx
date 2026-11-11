import { MapPin, Phone, MessageCircle, Clock, ArrowRight } from "lucide-react";
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
import { latestPosts } from "@/data/blog";

const socials = [
  { label: "Facebook", ...SOCIAL_LINKS.facebook },
  { label: "Instagram", ...SOCIAL_LINKS.instagram },
  { label: "TikTok", ...SOCIAL_LINKS.tiktok },
  { label: "LinkedIn", ...SOCIAL_LINKS.linkedin },
  { label: "YouTube", ...SOCIAL_LINKS.youtube },
];

function SocialBrandIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    Facebook:
      "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.018 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.953h-1.513c-1.49 0-1.955.93-1.955 1.885v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.09 24 18.092 24 12.073Z",
    TikTok:
      "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.5v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.2-.02-.4-.06-.6v-3.56a6.4 6.4 0 1 0 3.56 5.73V9.3a8.2 8.2 0 0 0 4.8 1.55V7.36c-.35 0-.7-.03-1.03-.1Z",
    LinkedIn:
      "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.44c.98 0 1.79-.77 1.79-1.72V1.72C24 .77 23.19 0 22.22 0Z",
    YouTube:
      "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z",
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      {label === "Instagram" ? (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="6.5" r="1.2" />
        </>
      ) : (
        <path d={paths[label] ?? paths.YouTube} />
      )}
    </svg>
  );
}

export function Footer({ hideClinicDetails = false }: { hideClinicDetails?: boolean }) {
  const articles = latestPosts(4);

  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + socials */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white p-0.5">
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
                <div className="text-sm text-white/75">Physiotherapy Clinic</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80">
              {hideClinicDetails
                ? "PainFix physiotherapy and rehabilitation. Online consultations are booked directly with your clinician."
                : "Evidence-based physiotherapy and rehabilitation in Multan. Helping you move better, recover faster, and live pain-free."}
            </p>

            {/* Working hours */}
            {!hideClinicDetails && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-white/95">
                  <Clock className="h-4 w-4 text-inverse-accent" /> Working Hours
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                  {OPENING_HOURS.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4">
                      <span>{h.days}</span>
                      <span className="font-medium text-white/95">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label}: ${s.username}`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:border-white/30 hover:bg-white/20"
                >
                  <SocialBrandIcon label={s.label} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white/95">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/internships"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Internship Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/certificates"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Certificates
                </Link>
              </li>
              <li>
                <Link
                  to="/verify-certificate"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Verify a Certificate
                </Link>
              </li>
              <li>
                <Link
                  to="/clinical-resources"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Clinical Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  About PainFix
                </Link>
              </li>
              <li>
                <Link
                  to="/our-team"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  to="/conditions"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  All Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/fitness-rehabilitation"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Fitness &amp; Rehabilitation
                </Link>
              </li>
              <li>
                <Link
                  to="/fitness"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Fitness Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/health-calculators"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Health Calculators
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Clinic Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/book-appointment"
                  className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                >
                  Book an Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Latest Articles + Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white/95">
              Latest Articles
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {articles.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="text-white/80 transition-colors hover:text-inverse-accent hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 font-semibold text-inverse-accent"
                >
                  Read the Blog <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>

            {!hideClinicDetails && (
              <>
                <h3 className="mt-8 font-heading text-sm font-bold uppercase tracking-wider text-white/95">
                  Get in Touch
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  <li>
                    <a
                      href={MAP_PLACE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 transition-colors hover:text-inverse-accent hover:underline"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-inverse-accent" />
                      <span>{CLINIC_ADDRESS}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={PHONE_TEL}
                      className="flex items-center gap-2.5 transition-colors hover:text-inverse-accent hover:underline"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-inverse-accent" /> {PHONE_DISPLAY}
                    </a>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full min-h-11 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-transform hover:scale-105"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  <GoogleReviewButton variant="inverse" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 text-sm text-white/75 sm:flex-row">
          <p>© {new Date().getFullYear()} PainFix Physiotherapy Clinic. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-5">
            <Link
              to="/privacy"
              className="transition-colors hover:text-inverse-accent hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-inverse-accent hover:underline"
            >
              Terms of Service
            </Link>
            <a
              href="/sitemap.xml"
              className="transition-colors hover:text-inverse-accent hover:underline"
            >
              Sitemap
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
