import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, ExternalLink, Loader2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { GoogleReviewButton, GoogleG } from "./GoogleReviewButton";
import { GOOGLE_BUSINESS_PROFILE_URL } from "./constants";
import { getGoogleReviews, type GoogleReview } from "@/lib/google-reviews.functions";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 text-secondary" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < full ? "fill-current" : "text-border"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: GoogleReview }) {
  return (
    <figure className="hover-lift flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-7 shadow-soft">
      <div className="flex items-center justify-between">
        <Stars rating={r.rating} />
        <GoogleG className="h-5 w-5" />
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90 line-clamp-6">
        "{r.text}"
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {r.photo ? (
          <img
            src={r.photo}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
            {r.author.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-foreground">{r.author}</div>
          <div className="text-xs text-muted-foreground">
            {r.relativeTime ? `${r.relativeTime} · ` : ""}Google Review
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export function GoogleReviews() {
  const fetchReviews = useServerFn(getGoogleReviews);
  const { data, isLoading } = useQuery({
    queryKey: ["google-reviews"],
    queryFn: () => fetchReviews(),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const rating = data?.rating ?? null;
  const total = data?.total ?? null;
  const reviews = data?.reviews ?? [];
  const viewAllUrl = data?.mapsUri ?? GOOGLE_BUSINESS_PROFILE_URL;

  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient Reviews"
          title="Loved by our patients"
          subtitle="Real, verified reviews from patients on our Google Business Profile."
        />

        {/* Rating summary */}
        <Reveal anim="up" className="mt-10">
          <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-border bg-surface p-7 text-center shadow-soft sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <GoogleG className="h-10 w-10" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-3xl font-extrabold text-foreground">
                    {rating != null ? rating.toFixed(1) : "5.0"}
                  </span>
                  <Stars rating={rating ?? 5} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {total != null ? `Based on ${total} Google reviews` : "Rated on Google Reviews"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={viewAllUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ripple inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                View All Reviews on Google <ExternalLink className="h-4 w-4" />
              </a>
              <GoogleReviewButton variant="outline" />
            </div>
          </div>
        </Reveal>

        {/* Reviews grid */}
        {isLoading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
          </div>
        ) : reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((r, i) => (
              <Reveal key={`${r.author}-${i}`} anim="up" delay={(i % 3) * 90}>
                <ReviewCard r={r} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Read our verified patient reviews directly on{" "}
            <a
              href={viewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Google
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
