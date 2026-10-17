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
    <section className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Breadcrumbs items={crumbs} />
        </div>
        <Reveal anim="up">
          {icon && (
            <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-lg bg-accent text-secondary">
              {icon}
            </span>
          )}
          {eyebrow && (
            <span className="mt-6 inline-flex items-center border-l-2 border-brand-green pl-3 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
              {eyebrow}
            </span>
          )}
          <h1 className="mx-auto mt-5 max-w-[22ch] text-balance font-heading text-[clamp(2.35rem,5.4vw,4rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {subtitle}
            </p>
          )}
          {showActions && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-primary/25 bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
