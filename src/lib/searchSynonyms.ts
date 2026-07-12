// Synonym + query-expansion engine for the site search.
// Pure, dependency-free and tiny. Loaded lazily with the search index so it
// never touches the initial bundle or Core Web Vitals.

/**
 * Bidirectional synonym groups. Every term in a group is treated as an alias
 * for the others, so searching any one of them surfaces the same results.
 * Keep entries lower-case; phrases are matched as substrings of the query.
 */
const SYNONYM_GROUPS: string[][] = [
  [
    "back pain",
    "low back pain",
    "lower back pain",
    "lumbar pain",
    "backache",
    "back ache",
    "lumbago",
  ],
  ["sciatica", "sciatic pain", "nerve pain", "pinched nerve", "radiculopathy", "leg pain"],
  ["neck pain", "cervical pain", "tech neck", "stiff neck", "cervical"],
  ["frozen shoulder", "adhesive capsulitis", "shoulder stiffness"],
  ["knee pain", "knee injury", "runner's knee"],
  ["weight loss", "fat loss", "weight management", "slimming", "lose weight", "obesity"],
  ["fitness", "exercise", "workout", "training", "gym", "strength", "conditioning"],
  ["diet", "nutrition", "meal plan", "eating", "food", "dietitian"],
  ["physiotherapy", "physio", "physical therapy", "rehab", "rehabilitation"],
  ["doctor", "physiotherapist", "therapist", "clinician", "specialist", "physio"],
  ["hijama", "cupping", "cupping therapy", "wet cupping"],
  ["manual therapy", "hands on therapy", "mobilisation", "manipulation", "massage"],
  ["home visit", "home physiotherapy", "domiciliary", "at home", "bedside"],
  ["posture", "ergonomics", "sitting posture"],
  ["stroke", "neurological", "paralysis", "hemiplegia"],
  ["sports injury", "sports injuries", "athletic injury", "sprain", "strain"],
  ["bmi", "body mass index", "ideal weight", "healthy weight"],
  ["calorie", "calories", "energy", "tdee", "bmr"],
  ["water", "hydration", "fluid intake"],
  ["protein", "protein intake", "macros"],
  ["mobility", "flexibility", "stretching", "range of motion"],
  ["membership", "packages", "plans", "pricing", "subscription"],
  ["appointment", "booking", "book", "consultation", "schedule"],
];

/** Lower-case, trim and collapse whitespace. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Light singular/plural stemmer. Returns the base + a couple of common
 * variants so "exercises" matches "exercise" and vice-versa.
 */
export function stemVariants(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>([w]);
  if (w.length > 3) {
    if (w.endsWith("ies")) out.add(w.slice(0, -3) + "y");
    else if (w.endsWith("es")) out.add(w.slice(0, -2));
    if (w.endsWith("s")) out.add(w.slice(0, -1));
    out.add(w + "s");
    if (w.endsWith("y")) out.add(w.slice(0, -1) + "ies");
  }
  return [...out];
}

/**
 * Expand a raw query into a small set of equivalent query strings using the
 * synonym groups. The original query is always first. Each alternative is
 * scored independently by the matcher; the best score wins.
 */
export function expandQuery(query: string): string[] {
  const q = normalize(query);
  if (!q) return [];
  const variants = new Set<string>([q]);

  for (const group of SYNONYM_GROUPS) {
    for (const term of group) {
      if (q.includes(term)) {
        for (const alt of group) {
          if (alt !== term) variants.add(q.replace(term, alt));
        }
      }
    }
  }

  // Cap to keep scoring cheap on long queries.
  return [...variants].slice(0, 12);
}
