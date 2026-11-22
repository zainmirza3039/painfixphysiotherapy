# Back-pain exercise CTR snippet test — 23 November 2026

## Baseline

Source: Pakistan-filtered Google Search Console, last 28 days ending 22 November 2026, for `sc-domain:painfixphysiotherapy.com`.

| Query | Landing page | Impressions | Clicks | CTR | Average position |
|---|---|---:|---:|---:|---:|
| `kamar dard ki exercise` | `/blog/best-exercises-for-lower-back-pain` | 136 | 1 | 0.74% | 8.68 |
| `kamar dard exercise` | `/blog/best-exercises-for-lower-back-pain` | 23 | 0 | 0% | 7.96 |
| `kamar ki exercise` | `/blog/best-exercises-for-lower-back-pain` | 16 | 0 | 0% | 7.56 |
| `kamar dard symptoms` | `/blog/kamar-dard-kab-serious-hota-hai` | 60 | 0 | 0% | 7.55 |
| `kamar dard ki waja` | `/blog/kamar-dard-kab-serious-hota-hai` | 20 | 0 | 0% | 6.40 |

The exercise guide owns the exercise-instruction cluster. The symptom article owns causes/symptoms. The safety article has only a small number of overlapping exercise-query impressions; this is not evidence of material cannibalisation.

## Change under test

Primary article: `/blog/best-exercises-for-lower-back-pain`

- SEO title before: `Kamar Dard Exercise: 6 Exercises, Reps & Safety | PainFix`
- SEO title after: `Kamar Dard Ki Exercise: 6 Exercises & Reps | PainFix`
- Meta description before: `Kamar dard exercise guide: 6 practical exercises for lower back pain, with clear positions, repetitions and safety tips. Learn how to start and progress.`
- Meta description after: `Kamar dard ki exercise guide: 6 lower-back movements with clear positions, repetitions and safety cues. Learn how to start comfortably and progress safely.`

Rationale: mirror the exact phrase in the highest-impression Pakistan query while preserving the article's factual six-exercise scope. The change is a single metadata experiment, not a content rewrite.

## Protected scope

- Keep the existing URL, canonical, H1, body copy, images and FAQ content.
- Keep the safety and symptom articles, their metadata and their distinct intent unchanged.
- No redirects, sitemap, schema, database or GBP changes.
- No production deployment without approval.

## Measurement

After the preview is approved and deployed, compare the same Pakistan-filtered query/page pairs over a fresh 28-day period. Review CTR together with average position and impressions; do not attribute changes to the snippet if rankings or demand materially shift. Search engines may rewrite titles and descriptions, so this is a test of the supplied metadata, not a guarantee of the displayed snippet.
