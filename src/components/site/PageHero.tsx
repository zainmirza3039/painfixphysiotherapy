import type { ReactNode } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Reveal } from "./Reveal";
import { WHATSAPP_CONSULT_URL, PHONE_TEL } from "./constants";
import type { Crumb } from "@/lib/seo";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs: Crumb[];
  icon?: ReactNode;
  showActions?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  icon,
  showActions = true,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface pt-28 pb-12 sm:pt-36 sm:pb-16">
      <div className="pointer-events-none absolute -top-24 right-0 h-[24rem] w-[24rem] rounded-full bg-secondary/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Breadcrumbs items={crumbs} />
        </div>
        <Reveal anim="up">
          {icon && (
            <span className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-secondary/12 text-secondary">
              {icon}
            </span>
          )}
          {eyebrow && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
          {showActions && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ripple inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary bg-background px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
