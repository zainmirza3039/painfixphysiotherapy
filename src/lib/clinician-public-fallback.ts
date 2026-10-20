/** Public presentation only: never use this boundary for admin reads or mutations. */
export async function withPublicClinicianFallback<T>(
  read: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    // An empty list or null is authoritative (including unpublication), not an outage.
    return await read();
  } catch {
    // The public API intentionally hides DB details; do not classify its generic errors
    // or log potentially sensitive error payloads. Keep the outage observable.
    console.warn("Public clinician API unavailable; using existing static team content.");
    return fallback();
  }
}
