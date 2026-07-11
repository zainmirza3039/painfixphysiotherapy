import { createServerFn } from "@tanstack/react-start";

export interface GoogleReview {
  author: string;
  photo: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
}

export interface GoogleReviewsData {
  rating: number | null;
  total: number | null;
  reviews: GoogleReview[];
  mapsUri: string | null;
  ok: boolean;
}

const PLACE_ID = "ChIJhSmMfwDrPDkRzjw7wUtIuHc";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

// Simple in-memory cache to avoid hammering the Places API on repeat SSR calls.
let cache: { data: GoogleReviewsData; expires: number } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 hour

const EMPTY: GoogleReviewsData = { rating: null, total: null, reviews: [], mapsUri: null, ok: false };

/**
 * Fetch the clinic's public Google Business Profile rating + reviews via the
 * Google Places API (New) through the Lovable connector gateway. Returns a
 * safe fallback (ok:false, no fabricated data) if the API is unavailable.
 */
export const getGoogleReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<GoogleReviewsData> => {
    if (cache && cache.expires > Date.now()) return cache.data;

    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) return EMPTY;

    try {
      const res = await fetch(`${GATEWAY_URL}/places/v1/places/${PLACE_ID}`, {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": mapsKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
      });

      if (!res.ok) {
        console.error(`Google Places request failed [${res.status}]: ${await res.text()}`);
        return EMPTY;
      }

      const json = (await res.json()) as {
        rating?: number;
        userRatingCount?: number;
        googleMapsUri?: string;
        reviews?: Array<{
          rating?: number;
          relativePublishTimeDescription?: string;
          publishTime?: string;
          text?: { text?: string };
          originalText?: { text?: string };
          authorAttribution?: { displayName?: string; photoUri?: string };
        }>;
      };

      const reviews: GoogleReview[] = (json.reviews ?? [])
        .filter((r) => (r.text?.text || r.originalText?.text)?.trim())
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "Google user",
          photo: r.authorAttribution?.photoUri ?? null,
          rating: r.rating ?? 5,
          text: (r.text?.text || r.originalText?.text || "").trim(),
          relativeTime: r.relativePublishTimeDescription ?? "",
          publishTime: r.publishTime ?? "",
        }));

      const data: GoogleReviewsData = {
        rating: json.rating ?? null,
        total: json.userRatingCount ?? null,
        reviews,
        mapsUri: json.googleMapsUri ?? null,
        ok: true,
      };

      cache = { data, expires: Date.now() + TTL_MS };
      return data;
    } catch (err) {
      console.error("Google reviews fetch error:", err);
      return EMPTY;
    }
  },
);
