import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { blogPosts, blogCategoryMap, type BlogPost } from "@/data/blog";

const featuredArticleSlugs = [
  "acl-rehabilitation",
  "sports-injury-recovery",
  "disc-herniation-treatment",
  "best-exercises-for-lower-back-pain",
] as const;

const articles = featuredArticleSlugs
  .map((slug) => blogPosts.find((post) => post.slug === slug))
  .filter((post): post is BlogPost => Boolean(post));

export function TopArticles() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion || articles.length < 2) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % articles.length);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [isPaused, reducedMotion]);

  if (articles.length === 0) return null;

  const activeArticle = articles[activeIndex];
  const category = blogCategoryMap[activeArticle.category]?.name ?? "Physiotherapy Guide";

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + articles.length) % articles.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % articles.length);

  return (
    <section
      aria-labelledby="top-articles-heading"
      aria-roledescription="carousel"
      className="border-y border-border bg-surface"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-12 lg:px-8">
        <div>
          <p className="home-eyebrow">
            <span aria-hidden="true" /> PainFix Journal
          </p>
          <h2 id="top-articles-heading" className="home-section-title mt-4">
            Top Physiotherapy Articles
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Practical guidance on injuries, pain and rehabilitation, written to help you make
            informed decisions about recovery.
          </p>
          <Link
            to="/blog"
            className="mt-5 inline-flex min-h-10 items-center gap-2 border-b border-secondary pb-1 text-sm font-semibold text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Browse all articles <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0">
          <div
            className="flex min-h-[270px] flex-col justify-between bg-primary p-6 text-primary-foreground sm:min-h-[300px] sm:p-8 lg:p-10"
            aria-live="off"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-inverse-accent">
                {category}
              </p>
              <h3 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {activeArticle.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
                {activeArticle.excerpt}
              </p>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/blog/$slug"
                params={{ slug: activeArticle.slug }}
                className="inline-flex min-h-11 items-center gap-2 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-inverse-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Read article <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="mr-2 text-xs font-medium text-primary-foreground/75">
                  {activeIndex + 1} / {articles.length}
                </span>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous article"
                  className="grid h-10 w-10 place-items-center border border-primary-foreground/35 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next article"
                  className="grid h-10 w-10 place-items-center border border-primary-foreground/35 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2" aria-label="Choose article">
            {articles.map((article, index) => (
              <button
                key={article.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show article ${index + 1}: ${article.title}`}
                aria-pressed={index === activeIndex}
                className={`h-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  index === activeIndex
                    ? "w-8 bg-secondary"
                    : "w-2.5 bg-border hover:bg-secondary/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
