import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { conditionMap } from "@/data/conditions";
import { conditionImages, conditionImageAlt, conditionImageFitClass } from "@/data/conditionImages";
import { Reveal } from "./Reveal";

export function RelatedConditions({
  slugs,
  title = "Related Conditions",
}: {
  slugs: string[];
  title?: string;
}) {
  const items = slugs.map((s) => conditionMap[s]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          {title}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((condition, i) => {
            const image = conditionImages[condition.slug];
            return (
              <Reveal key={condition.slug} anim="up" delay={i * 70}>
                <Link
                  to="/conditions/$slug"
                  params={{ slug: condition.slug }}
                  aria-label={`Learn about ${condition.title} treatment`}
                  className="hover-lift group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft transition-shadow hover:border-primary/40 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {image && (
                    <div className="aspect-[16/9] overflow-hidden bg-surface">
                      <img
                        src={image}
                        alt={
                          conditionImageAlt[condition.slug] ??
                          `${condition.title} physiotherapy treatment in Multan`
                        }
                        loading="lazy"
                        decoding="async"
                        width={700}
                        height={394}
                        className={`h-full w-full ${conditionImageFitClass[condition.slug] ?? "object-cover"} transition-transform duration-500 group-hover:scale-105`}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {condition.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {condition.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
