# Back-pain content CTR — Priority 2

## Search-intent ownership

- Primary URL: `/blog/best-exercises-for-lower-back-pain`
  - Retain its URL and canonical.
  - Own the practical exercise query cluster, especially `kamar dard ki exercise`.
  - Updated SEO title: `Kamar Dard Ki 6 Exercises: Reps & Sahi Tareeqa | PainFix`.
  - Updated meta description emphasises six movements, positions, repetitions and safety.
- Supporting URL: `/blog/safe-kamar-dard-exercises`
  - Retain its URL and canonical.
  - Own exercise safety, stop signals, warning symptoms and when to seek assessment.
  - Remove the broad exact exercise-query tag to reduce overlap.
  - Updated H1 and SEO title are safety-led.

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
