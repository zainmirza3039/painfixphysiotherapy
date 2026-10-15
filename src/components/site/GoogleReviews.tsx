import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2, Star } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { GoogleReviewButton, GoogleG } from "./GoogleReviewButton";
import { GOOGLE_BUSINESS_PROFILE_URL } from "./constants";
import { getGoogleReviews, type GoogleReview } from "@/lib/google-reviews.functions";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5 text-secondary"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < full ? "fill-current" : "text-border"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <figure className="home-review-card">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <GoogleG className="h-5 w-5 shrink-0" />
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-6 text-foreground/90">
        “{review.text}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {review.photo ? (
          <img
            src={review.photo}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-semibold text-primary"
            aria-hidden="true"
          >
            {review.author.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {review.author}
          </span>
          <span className="block text-xs text-muted-foreground">
            {review.relativeTime ? `${review.relativeTime} · ` : ""}Google Review
          </span>
        </span>
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
    <section id="testimonials" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
          <div>
            <p className="home-eyebrow">
              <span aria-hidden="true" /> Patient feedback
            </p>
            <h2 className="home-section-title mt-4">Feedback on Google.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Read current patient feedback on PainFix’s Google Business Profile. Reviews and ratings
            below are shown only when returned by the connected profile feed.
          </p>
        </div>

        <Reveal anim="up">
          <div className="home-review-summary">
            <div className="flex items-center gap-4">
              <GoogleG className="h-10 w-10 shrink-0" />
              <div>
                {rating !== null ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-3xl font-semibold text-foreground">
                        {rating.toFixed(1)}
                      </span>
                      <Stars rating={rating} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {total !== null
                        ? `Based on ${total} Google reviews`
                        : "Google Business Profile rating"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">PainFix on Google</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {total !== null
                        ? `${total} Google reviews`
                        : "Browse current patient feedback and clinic details."}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={viewAllUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View Google profile <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <GoogleReviewButton variant="outline" />
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <p
            className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading Google reviews…
          </p>
        ) : reviews.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((review, index) => (
              <Reveal key={`${review.author}-${index}`} anim="up" delay={(index % 3) * 45}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            No review text is available in the live feed right now. Use the Google profile above to
            see the latest feedback.
          </p>
        )}
      </div>
    </section>
  );
}
