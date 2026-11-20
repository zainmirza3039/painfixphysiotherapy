# Back-pain content CTR — Priority 2

## Search-intent ownership

Keep both existing URLs, canonical destinations, SEO titles and meta descriptions unchanged. The pages serve adjacent but distinct informational intents; do not consolidate them or make the safety article compete for the broad exercise-instruction query cluster.

### Primary: practical exercise instructions

- URL: `/blog/best-exercises-for-lower-back-pain`
- H1: `Kamar Dard Ki 6 Exercises: Reps, Form & Safety`
- SEO title: `Kamar Dard Exercise: 6 Exercises, Reps & Safety | PainFix`
- Meta description: `Kamar dard exercise guide: 6 practical exercises for lower back pain, with clear positions, repetitions and safety tips. Learn how to start and progress.`
- Owns practical exercise selection, starting positions, repetitions, technique and progression, especially `kamar dard ki exercise` and `kamar dard exercise`.
- Retain the existing contextual link to the safety article for stop signals and safe progression.

### Supporting: exercise safety and stop signals

- URL: `/blog/safe-kamar-dard-exercises`
- H1: `Kamar Dard Mein Exercise Kab Rokni Chahiye?`
- SEO title: `Kamar Dard Exercise Safety: Stop Signals | PainFix`
- Meta description: `Kamar dard mein exercise stop signals, warning symptoms and common mistakes. Learn when to modify movement and when to seek medical assessment.`
- Owns warning symptoms, exercise modification, stop signals, precautions and when to seek clinical assessment.
- Retain safety-led targeting and avoid adding the broad exact-match `kamar dard ki exercise` tag.
- Add one contextual link to the primary article for step-by-step exercise positions, repetitions and progression. The link should not change the safety article's title, description or primary intent.

### Linking and ownership rules

- Primary article → safety article: existing contextual link remains in place.
- Safety article → primary article: add one contextual link from the safety discussion to the six-exercise guide.
- Preserve both canonical URLs, H1s, SEO titles and meta descriptions; no keyword-targeting changes are required for this implementation.
- Reassess query overlap using Pakistan-filtered GSC data after sufficient post-change data accumulates. Small impression counts on the safety URL are not evidence of material cannibalization.

## Exercise reference images

The primary exercise article includes a responsive, lazy-loaded image gallery. Images are embedded from Wikimedia Commons rather than copied into the repository. Each card displays its author/source and licence.

| Exercise | Source | Attribution / licence |
|---|---|---|
| Pelvic tilt | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pelvic_tilt-CDC_strength_training_for_older_adults.gif) | CDC; public domain |
| Cat–cow, cow phase | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Yoga_at_Your_Park_-_Bidalasana.jpg) | Mary O'Neill / U.S. National Park Service; public domain U.S. federal work |
| Single knee-to-chest | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Woman_doing_yoga_exercise_at_home_on_a_mat_while_in_a_focused_position.jpg) | Shixart1985; CC BY 2.0 |
| Glute bridge | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Glute-bridge.png) | Marianne Gilbak; CC BY-SA 4.0 |
| Bird-dog | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bird_dog_exercise.jpg) | PTPioneer; CC BY 2.0 |

Images are illustrative, not a treatment prescription. The article retains individual exercise instructions and clinical safety guidance. The image gallery currently illustrates five of the six listed exercises; the dead-bug instructions remain text-only.

## Scope protection

- No URL, redirect, canonical, sitemap or robots changes.
- No article consolidation.
- No change to the existing ranking URL.
- No production deployment.
- Search Console figures from the prior audit are historical and not a fresh query-level comparison.

## QA requirements

- Verify tests, lint, typecheck and production build on the latest PR commit.
- Confirm responsive gallery layout, image loading, alt text and attribution links in preview.
- Confirm both article URLs return their existing canonical destinations.
