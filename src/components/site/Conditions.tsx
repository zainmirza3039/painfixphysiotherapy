import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { conditionMap } from "@/data/conditions";
import {
  conditionImages,
  conditionImageAlt,
  conditionImageAltFallback,
  conditionImageFitClass,
} from "@/data/conditionImages";
import { slippedDiscVisual } from "@/data/conditionImageGallery";
import { Reveal } from "./Reveal";

type FeaturedCondition = {
  conditionSlug: string;
  title: string;
  description?: string;
  action?: string;
  image?: string;
  imageAlt?: string;
};

const featuredConditions: FeaturedCondition[] = [
  { conditionSlug: "sciatica", title: "Sciatica" },
  { conditionSlug: "osteoarthritis", title: "Knee Osteoarthritis (Knee OA)" },
  { conditionSlug: "back-pain", title: "Lower Back Pain" },
  { conditionSlug: "neck-pain", title: "Neck Pain" },
  { conditionSlug: "frozen-shoulder", title: "Frozen Shoulder" },
  {
    conditionSlug: "back-pain",
    title: "Slip Disc",
    description: "See the existing Back Pain guide for related disc-problem information.",
    action: "Learn More — Back Pain guide",
    image: slippedDiscVisual.src,
    imageAlt: slippedDiscVisual.alt,
  },
  { conditionSlug: "stroke-rehabilitation", title: "Stroke Rehabilitation" },
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
              Explore common concerns and the information available from PainFix. A physiotherapist
              can help you decide what is appropriate for your situation.
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
            const image = featured.image ?? conditionImages[condition.slug];
            const imageAlt =
              featured.imageAlt ??
              conditionImageAlt[condition.slug] ??
              conditionImageAltFallback(condition.title);
            const imageFitClass = featured.image
              ? "object-contain"
              : (conditionImageFitClass[condition.slug] ?? "object-cover");

            return (
              <Reveal
                key={`${featured.title}-${featured.conditionSlug}`}
                anim="up"
                delay={index * 45}
              >
                <Link
                  to="/conditions/$slug"
                  params={{ slug: featured.conditionSlug }}
                  aria-label={`Learn more about ${featured.title}${featured.title === "Slip Disc" ? " in the existing Back Pain guide" : ""}`}
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
                      {featured.description ?? condition.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors group-hover:text-secondary sm:text-sm">
                      {featured.action ?? "Learn More"}
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
