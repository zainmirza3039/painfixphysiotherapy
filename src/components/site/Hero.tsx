import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Pause,
  Play,
} from "lucide-react";
import heroImg from "@/assets/hero.webp";
import heroAvif480 from "@/assets/hero-480.avif";
import heroAvif768 from "@/assets/hero-768.avif";
import heroAvif960 from "@/assets/hero-960.avif";
import heroWebp480 from "@/assets/hero-480.webp";
import heroWebp768 from "@/assets/hero-768.webp";
import heroWebp960 from "@/assets/hero-960.webp";
import heroClinicTreatment480 from "@/assets/hero-clinic-treatment-480.webp";
import heroClinicTreatment560 from "@/assets/hero-clinic-treatment-560.webp";
import heroClinicTreatment768 from "@/assets/hero-clinic-treatment-768.webp";
import clinicRehab360 from "@/assets/clinic-rehab-360.webp";
import clinicRehab480 from "@/assets/clinic-rehab-480.webp";
import clinicRehab540 from "@/assets/clinic-rehab-540.webp";
import clinicRehabImg from "@/assets/clinic-photo-4.webp";
import userClinicImg from "@/assets/hero-clinic-treatment.webp";
import { WHATSAPP_CONSULT_URL } from "./constants";
import { openCalendlyPopup } from "./calendly";

const HERO_SIZES =
  "(min-width: 1280px) 552px, (min-width: 1024px) 42vw, (min-width: 640px) 80vw, 100vw";
const HERO_AVIF_SRCSET = `${heroAvif480} 480w, ${heroAvif768} 768w, ${heroAvif960} 960w`;
const HERO_WEBP_SRCSET = `${heroWebp480} 480w, ${heroWebp768} 768w, ${heroWebp960} 960w`;
const HERO_CLINIC_WEBP_SRCSET = `${heroClinicTreatment480} 480w, ${heroClinicTreatment560} 560w, ${heroClinicTreatment768} 768w, ${userClinicImg} 1080w`;
const HERO_REHAB_WEBP_SRCSET = `${clinicRehab360} 360w, ${clinicRehab480} 480w, ${clinicRehab540} 540w, ${clinicRehabImg} 720w`;

type HeroSlide = {
  src: string;
  alt: string;
  title: string;
  source: string;
  width: number;
  height: number;
  objectPosition: string;
  responsiveSources: { avif?: string; webp?: string } | null;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    src: heroImg,
    alt: "PainFix physiotherapist providing hands-on treatment while a patient lies on a treatment table.",
    title: "Hands-on treatment",
    source: "PainFix clinic photo",
    width: 853,
    height: 1280,
    objectPosition: "50% 48%",
    responsiveSources: { avif: HERO_AVIF_SRCSET, webp: HERO_WEBP_SRCSET },
  },
  {
    src: userClinicImg,
    alt: "PainFix physiotherapist Dr. Jalal assisting a patient during a treatment session at the clinic.",
    title: "Personalized treatment",
    source: "PainFix clinic photo",
    width: 1080,
    height: 2094,
    objectPosition: "50% 30%",
    responsiveSources: { webp: HERO_CLINIC_WEBP_SRCSET },
  },
  {
    src: clinicRehabImg,
    alt: "PainFix physiotherapist guiding a patient through a supported movement exercise at the clinic.",
    title: "Guided movement",
    source: "PainFix clinic photo",
    width: 720,
    height: 1280,
    objectPosition: "50% 54%",
    responsiveSources: { webp: HERO_REHAB_WEBP_SRCSET },
  },
];

function HeroSlideImage({
  slide,
  priority,
}: {
  slide: (typeof HERO_SLIDES)[number];
  priority: boolean;
}) {
  const image = (
    <img
      src={slide.src}
      alt={slide.alt}
      width={slide.width}
      height={slide.height}
      className="home-hero__slide-image"
      style={{ objectPosition: slide.objectPosition }}
      fetchPriority={priority ? "high" : "low"}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );

  if (!slide.responsiveSources) return image;

  return (
    <picture className="home-hero__picture">
      {slide.responsiveSources.avif && (
        <source type="image/avif" srcSet={slide.responsiveSources.avif} sizes={HERO_SIZES} />
      )}
      {slide.responsiveSources.webp && (
        <source type="image/webp" srcSet={slide.responsiveSources.webp} sizes={HERO_SIZES} />
      )}
      {image}
    </picture>
  );
}

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [pointerHovering, setPointerHovering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Load the first image and only the next slide; additional slides load as they approach.
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0, 1]));
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const autoRotating = !userPaused && !pointerHovering && !prefersReducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  const goToSlide = useCallback((targetIndex: number, pauseRotation = true) => {
    const normalizedIndex = (targetIndex + HERO_SLIDES.length) % HERO_SLIDES.length;
    setLoadedSlides((loaded) => {
      const nextLoaded = new Set(loaded);
      nextLoaded.add(normalizedIndex);
      nextLoaded.add((normalizedIndex + 1) % HERO_SLIDES.length);
      return nextLoaded;
    });
    setActiveSlide(normalizedIndex);
    if (pauseRotation) setUserPaused(true);
  }, []);

  useEffect(() => {
    if (!autoRotating) return undefined;

    const timer = window.setInterval(() => {
      goToSlide(activeSlide + 1, false);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [activeSlide, autoRotating, goToSlide]);

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

    goToSlide(activeSlide + (deltaX < 0 ? 1 : -1));
  };

  return (
    <section id="home" aria-labelledby="home-heading" className="home-hero scroll-mt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="max-w-2xl">
          <p className="home-eyebrow">
            <span aria-hidden="true" /> Physiotherapy in Multan
          </p>
          <h1
            id="home-heading"
            className="mt-6 font-heading text-[clamp(2.8rem,7.2vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground"
          >
            Move Better.
            <br />
            Recover Faster.
            <br />
            <span className="home-hero__accent">Live Pain-Free.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Start with a thoughtful assessment. Our physiotherapy team will help you understand your
            options and build a recovery plan around your needs, movement and goals.
          </p>

          <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
            <button
              type="button"
              onClick={() => openCalendlyPopup()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book an appointment
            </button>
            <a
              href={WHATSAPP_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary/25 bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask us on WhatsApp
            </a>
          </div>

          <div className="mt-8 hidden flex-col gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:flex sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              Shalimar Colony, Multan
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              Mon–Sat, 11:00 AM–4:00 PM
            </span>
          </div>
          <p className="mt-2 hidden pl-6 text-xs text-muted-foreground sm:block">
            Sunday by appointment
          </p>
        </div>

        <div
          className="home-hero__visual"
          role="region"
          aria-roledescription="carousel"
          aria-label="PainFix physiotherapy care photos"
          onFocusCapture={() => setUserPaused(true)}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setPointerHovering(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setPointerHovering(false);
          }}
        >
          <div
            id="painfix-hero-slides"
            className="home-hero__image-frame"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
          >
            <div
              className="home-hero__track"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              aria-live="off"
            >
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.title}
                  className="home-hero__slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${HERO_SLIDES.length}`}
                  aria-hidden={index !== activeSlide}
                >
                  {index === 0 || loadedSlides.has(index) ? (
                    <HeroSlideImage slide={slide} priority={index === 0} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="home-hero__caption">
            <span className="home-hero__caption-mark" aria-hidden="true" />
            <span>{HERO_SLIDES[activeSlide].title}</span>
            <span className="home-hero__caption-source">{HERO_SLIDES[activeSlide].source}</span>
          </div>

          <div
            className="home-hero__carousel-controls"
            role="group"
            aria-label="Hero photo controls"
          >
            <div className="home-hero__carousel-controls-main">
              <button
                type="button"
                className="home-hero__control"
                aria-label="Previous hero photo"
                aria-controls="painfix-hero-slides"
                onClick={() => goToSlide(activeSlide - 1)}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="home-hero__indicators" role="group" aria-label="Choose a hero photo">
                {HERO_SLIDES.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    className="home-hero__indicator"
                    aria-label={`Show slide ${index + 1}: ${slide.title}`}
                    aria-controls="painfix-hero-slides"
                    aria-pressed={index === activeSlide}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="home-hero__control"
                aria-label="Next hero photo"
                aria-controls="painfix-hero-slides"
                onClick={() => goToSlide(activeSlide + 1)}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className="home-hero__control"
              aria-label={
                prefersReducedMotion
                  ? "Automatic slide changes are disabled by your reduced-motion preference"
                  : userPaused
                    ? "Resume automatic slide changes"
                    : "Pause automatic slide changes"
              }
              aria-controls="painfix-hero-slides"
              aria-pressed={userPaused || prefersReducedMotion}
              disabled={prefersReducedMotion}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              {userPaused || prefersReducedMotion ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="home-hero__mobile-context sm:hidden">
            <span>
              <MapPin className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              Shalimar Colony, Multan
            </span>
            <span>
              <Clock3 className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              Mon–Sat, 11:00 AM–4:00 PM
            </span>
            <span>Sunday by appointment</span>
          </div>
          <p className="sr-only" aria-live={autoRotating ? "off" : "polite"} aria-atomic="true">
            Slide {activeSlide + 1} of {HERO_SLIDES.length}: {HERO_SLIDES[activeSlide].title}
          </p>
        </div>
      </div>
    </section>
  );
}
