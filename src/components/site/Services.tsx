import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Dumbbell, Hand, HeartPulse, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { serviceMap } from "@/data/services";
import { Reveal } from "./Reveal";

// Illustrative photographs under the Pexels free-use license.
// Credits: manual/exercise/rehab — Funkcinės Terapijos Centras;
// taping — Antoni Shkraba; electrotherapy — Cansu Hangül.
const TREATMENT_IMAGES: Record<string, string> = {
  "Manual Therapy":
    "https://images.pexels.com/photos/20860597/pexels-photo-20860597.jpeg?auto=compress&cs=tinysrgb&w=720",
  "Exercise Therapy":
    "https://images.pexels.com/photos/20860594/pexels-photo-20860594.jpeg?auto=compress&cs=tinysrgb&w=720",
  "Kinesiology Taping":
    "https://images.pexels.com/photos/6076134/pexels-photo-6076134.jpeg?auto=compress&cs=tinysrgb&w=720",
  Electrotherapy:
    "https://images.pexels.com/photos/30483049/pexels-photo-30483049.jpeg?auto=compress&cs=tinysrgb&w=720",
  Rehabilitation:
    "https://images.pexels.com/photos/20860580/pexels-photo-20860580.jpeg?auto=compress&cs=tinysrgb&w=720",
};

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
  "group flex h-full min-h-44 flex-col rounded-lg border border-border border-t-[3px] border-t-secondary bg-card p-4 transition-colors hover:border-secondary hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5";

function TreatmentCardContent({ service }: { service: TreatmentService }) {
  const Icon = service.icon;
  const image = TREATMENT_IMAGES[service.title];
  const imageAltByTitle: Record<string, string> = {
    "Manual Therapy":
      "Physiotherapist performing hands-on treatment on a patient's leg in a clinical setting; illustrative photograph.",
    "Exercise Therapy":
      "Physiotherapist instructing a patient during a supervised rehabilitation exercise session; illustrative photograph.",
    "Kinesiology Taping":
      "Physiotherapist applying kinesiology tape to a patient's shoulder; illustrative photograph.",
    Electrotherapy:
      "Electrotherapy applied during a knee physiotherapy session; illustrative photograph.",
    Rehabilitation:
      "Physiotherapist assisting a patient with rehabilitation exercises on a treatment table; illustrative photograph.",
  };
  const imageAlt =
    imageAltByTitle[service.title] ?? `${service.title} treatment; illustrative photograph.`;
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
          fetchPriority="low"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
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
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
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
