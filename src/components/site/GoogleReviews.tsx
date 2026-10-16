import { ExternalLink } from "lucide-react";
import { Reveal } from "./Reveal";
import { GoogleReviewButton, GoogleG } from "./GoogleReviewButton";
import { GOOGLE_BUSINESS_PROFILE_URL } from "./constants";

export function GoogleReviews() {
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
            Read current patient feedback directly on PainFix’s Google Business Profile. Reviews and
            ratings are kept on Google, where you can see the latest information.
          </p>
        </div>

        <Reveal anim="up">
          <div className="home-review-summary">
            <div className="flex items-center gap-4">
              <GoogleG className="h-10 w-10 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">PainFix on Google</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse current patient reviews, ratings, and clinic details.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={GOOGLE_BUSINESS_PROFILE_URL}
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
      </div>
    </section>
  );
}
