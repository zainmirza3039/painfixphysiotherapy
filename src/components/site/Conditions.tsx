import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { conditionMap } from "@/data/conditions";
import {
  conditionImages,
  conditionImageAlt,
  conditionImageAltFallback,
  conditionImageFitClass,
} from "@/data/conditionImages";
import { Reveal } from "./Reveal";

type FeaturedCondition = {
  conditionSlug: string;
  title: string;
  description?: string;
  action?: string;
};

const featuredConditions: FeaturedCondition[] = [
  {
    conditionSlug: "back-pain",
    title: "Lower Back Pain",
    description:
      "Assessment and rehabilitation for back pain, stiffness and movement-related limitations.",
  },
  {
    conditionSlug: "neck-pain",
    title: "Neck Pain",
    description: "Care for neck pain, stiffness and difficulty turning or moving the head.",
  },
  {
    conditionSlug: "sciatica",
    title: "Sciatica",
    description:
      "Assessment-led care for pain, tingling or altered sensation travelling into the leg.",
  },
  {
    conditionSlug: "slipped-disc",
    title: "Slip Disc / Disc Herniation",
    description:
      "Guidance for suspected disc-related symptoms, nerve irritation and safe rehabilitation.",
  },
  {
    conditionSlug: "knee-pain",
    title: "Knee Pain",
    description:
      "Assessment and rehabilitation for knee pain, reduced loading tolerance and difficulty with everyday activities.",
  },
  {
    conditionSlug: "frozen-shoulder",
    title: "Frozen Shoulder",
    description: "Individualised care for shoulder pain and progressive restriction of movement.",
  },
  {
    conditionSlug: "shoulder-pain",
    title: "Shoulder Pain",
    description: "Assessment of shoulder pain affecting reaching, lifting and everyday activities.",
  },
  {
    conditionSlug: "plantar-fasciitis",
    title: "Heel Pain / Plantar Fasciitis",
    description:
      "Care for heel and plantar foot pain that can make standing and walking difficult.",
  },
  {
    conditionSlug: "sports-injuries",
    title: "Sports Injuries",
    description:
      "Rehabilitation for sports-related sprains, muscle strains, ligament injuries and return to activity.",
  },
  {
    conditionSlug: "osteoarthritis",
    title: "Osteoarthritis",
    description:
      "Physiotherapy for joint pain and stiffness, including knee and hip osteoarthritis, with a focus on mobility and function.",
  },
  {
    conditionSlug: "stroke-rehabilitation",
    title: "Stroke Rehabilitation",
    description:
      "Task-specific rehabilitation to improve mobility, balance and everyday function after stroke.",
  },
  {
    conditionSlug: "balance-disorders",
    title: "Balance & Gait Disorders",
    description:
      "Assessment and rehabilitation for unsteadiness, walking difficulty and reduced balance confidence.",
  },
  {
    conditionSlug: "cervical-radiculopathy",
    title: "Cervical Radiculopathy",
    description:
      "Assessment and rehabilitation for neck-related arm pain, tingling or neurological symptoms.",
  },
  {
    conditionSlug: "post-surgical-rehabilitation",
    title: "Post-Surgical Rehabilitation",
    description:
      "Progressive rehabilitation following surgery, guided by the procedure and recovery stage.",
  },
];

export function Conditions() {
  return (
    <section
      id="conditions"
      aria-labelledby="home-conditions-heading"
      className="home-section home-section--navy scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="home-eyebrow home-eyebrow--light">
              <span aria-hidden="true" /> Find a starting point
            </p>
            <h2
              id="home-conditions-heading"
              className="home-section-title home-section-title--light mt-4"
            >
              Conditions We Treat
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Looking for back pain physiotherapy, sciatica treatment, knee or neck pain
              rehabilitation, frozen shoulder care, slipped-disc rehabilitation or stroke
              physiotherapy in Multan? Explore our condition guides below. PainFix plans care around
              your assessment, clinical findings and recovery goals.
            </p>
          </div>
          <Link
            to="/conditions"
            className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 border-b border-secondary pb-1 text-sm font-semibold text-white transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Browse all conditions <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3">
          {featuredConditions.map((featured, index) => {
            const condition = conditionMap[featured.conditionSlug];
            if (!condition) return null;
            const image = conditionImages[condition.slug];
            const imageAlt =
              conditionImageAlt[condition.slug] ?? conditionImageAltFallback(condition.title);
            const imageFitClass = conditionImageFitClass[condition.slug] ?? "object-cover";

            return (
              <Reveal
                key={`${featured.title}-${featured.conditionSlug}`}
                anim="up"
                delay={index * 35}
              >
                <Link
                  to="/conditions/$slug"
                  params={{ slug: featured.conditionSlug }}
                  aria-label={`Learn more about ${featured.title}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#032e61]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-surface p-2 sm:p-3">
                    {image && (
                      <img
                        src={image}
                        alt={imageAlt}
                        loading="lazy"
                        decoding="async"
                        width={700}
                        height={525}
                        className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${imageFitClass}`}
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-5">
                    <h3 className="font-heading text-sm font-bold leading-snug text-foreground sm:text-lg">
                      {featured.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                      {featured.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors group-hover:text-secondary sm:text-sm">
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
