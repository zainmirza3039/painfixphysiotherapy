import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Dumbbell, Hand, HeartPulse, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { serviceMap } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import { Reveal } from "./Reveal";

type TreatmentService = {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
} & (
  | { slug: string; href?: never; to?: never }
  | { to: "/contact" | "/services"; href?: never; slug?: never }
);

const treatmentServices: TreatmentService[] = [
  {
    title: "Manual Therapy",
    description: serviceMap["manual-therapy"].tagline,
    icon: Hand,
    slug: "manual-therapy",
    action: "Learn more",
  },
  {
    title: "Exercise Therapy",
    description: serviceMap["exercise-therapy"].tagline,
    icon: Dumbbell,
    slug: "exercise-therapy",
    action: "Learn more",
  },
  {
    title: "Kinesiology Taping",
    description: "Ask the PainFix team whether taping is suitable for your care plan.",
    icon: Activity,
    to: "/contact",
    action: "Ask our team",
  },
  {
    title: "Electrotherapy",
    description: serviceMap.electrotherapy.tagline,
    icon: Zap,
    slug: "electrotherapy",
    action: "Learn more",
  },
  {
    title: "Rehabilitation",
    description: "Explore physiotherapy and rehabilitation options for different recovery goals.",
    icon: HeartPulse,
    to: "/services",
    action: "Browse services",
  },
];

const cardClassName =
  "group col-span-1 flex h-full min-h-[20rem] flex-col overflow-hidden rounded-xl border border-border/80 border-t-[3px] border-t-secondary bg-card p-4 shadow-[0_2px_12px_rgba(3,46,97,0.035)] transition-all duration-300 xl:col-span-2 hover:-translate-y-1 hover:border-secondary/70 hover:shadow-[0_14px_34px_rgba(3,46,97,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5";

function TreatmentCardContent({ service }: { service: TreatmentService }) {
  const Icon = service.icon;
  const image = service.slug
    ? serviceImages[service.slug]
    : service.title === "Kinesiology Taping"
      ? serviceImages["sports-rehabilitation"]
      : serviceImages["exercise-therapy"];
  const imageAlt = `${service.title} at PainFix Physiotherapy Clinic in Multan`;
  return (
    <>
      <span className="-mx-4 -mt-4 mb-1 block aspect-[4/3] overflow-hidden rounded-t-md bg-surface sm:-mx-5 sm:-mt-5">
        <img
          src={image}
          alt={imageAlt}
          width={640}
          height={480}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-secondary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-3 block font-heading text-base font-semibold leading-snug text-foreground">
        {service.title}
      </span>
      <span className="mt-2 block flex-1 text-xs leading-5 text-muted-foreground sm:text-sm">
        {service.description}
      </span>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors group-hover:text-secondary sm:text-sm">
        {service.action} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </>
  );
}

export function Services() {
  return (
    <section id="services" className="home-section scroll-mt-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> How we can help
            </p>
            <h2 className="home-section-title mt-4">Treatment Services</h2>
          </div>
          <Link
            to="/services"
            className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-secondary pb-1 text-sm font-semibold text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Explore all services <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 xl:[&>*:nth-child(4)]:col-start-2 xl:[&>*:nth-child(5)]:col-start-4">
          {treatmentServices.map((service, index) => (
            <Reveal key={service.title} anim="up" delay={index * 45}>
              {service.slug ? (
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className={cardClassName}
                >
                  <TreatmentCardContent service={service} />
                </Link>
              ) : service.to ? (
                <Link to={service.to} className={cardClassName}>
                  <TreatmentCardContent service={service} />
                </Link>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
