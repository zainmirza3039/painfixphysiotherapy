const exercises = [
  {
    name: "Pelvic tilts",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Pelvic_tilt-CDC_strength_training_for_older_adults.gif",
    alt: "CDC animation showing a pelvic tilt exercise in hook-lying",
    credit: "Centers for Disease Control and Prevention",
    source: "https://commons.wikimedia.org/wiki/File:Pelvic_tilt-CDC_strength_training_for_older_adults.gif",
    license: "Public domain",
    dimensions: { width: 250, height: 200 },
  },
  {
    name: "Cat–cow (cow phase)",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/48/Yoga_at_Your_Park_-_Bidalasana.jpg",
    alt: "Person on hands and knees demonstrating the cow phase of cat–cow",
    credit: "Mary O'Neill / U.S. National Park Service",
    source: "https://commons.wikimedia.org/wiki/File:Yoga_at_Your_Park_-_Bidalasana.jpg",
    license: "Public domain (U.S. federal work)",
    dimensions: { width: 1000, height: 812 },
  },
  {
    name: "Single knee-to-chest",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Woman_doing_yoga_exercise_at_home_on_a_mat_while_in_a_focused_position.jpg",
    alt: "Woman lying on a mat and gently bringing one knee toward her chest",
    credit: "Shixart1985",
    source:
      "https://commons.wikimedia.org/wiki/File:Woman_doing_yoga_exercise_at_home_on_a_mat_while_in_a_focused_position.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    dimensions: { width: 1000, height: 667 },
  },
  {
    name: "Glute bridge",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Glute-bridge.png",
    alt: "Two positions demonstrating a glute bridge exercise",
    credit: "Marianne Gilbak",
    source: "https://commons.wikimedia.org/wiki/File:Glute-bridge.png",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    dimensions: { width: 1000, height: 1000 },
  },
  {
    name: "Bird-dog",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Bird_dog_exercise.jpg/1280px-Bird_dog_exercise.jpg",
    alt: "Woman holding the bird-dog position with opposite arm and leg extended",
    credit: "PTPioneer",
    source: "https://commons.wikimedia.org/wiki/File:Bird_dog_exercise.jpg",
    license: "CC BY 2.0",
    dimensions: { width: 1000, height: 667 },
  },
];

export function LowerBackExerciseGallery() {
  return (
    <section aria-labelledby="lower-back-exercise-gallery">
      <h2
        id="lower-back-exercise-gallery"
        className="font-heading text-2xl font-extrabold text-foreground"
      >
        Exercise positions: visual guide
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        These reference images illustrate selected movements from the guide. They are not a
        personalised prescription; choose exercises according to your symptoms and clinical
        assessment.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => (
          <figure
            key={exercise.name}
            className="overflow-hidden border border-border bg-card"
          >
            <div className="flex h-52 items-center justify-center bg-muted/40 p-3">
              <img
                src={exercise.image}
                alt={exercise.alt}
                width={exercise.dimensions.width}
                height={exercise.dimensions.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <figcaption className="p-4">
              <h3 className="font-semibold text-foreground">{exercise.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Image: {exercise.credit}.{" "}
                <a
                  href={exercise.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Source
                </a>
                {" · "}
                {exercise.licenseUrl ? (
                  <a
                    href={exercise.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    {exercise.license}
                  </a>
                ) : (
                  exercise.license
                )}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
