import { GoogleReviews } from "./GoogleReviews";

/** Compatibility wrapper: public feedback is sourced from the live Google profile. */
export function Testimonials() {
  return <GoogleReviews />;
}
