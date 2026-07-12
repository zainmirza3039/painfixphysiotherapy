import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, Clock, Newspaper } from "lucide-react";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { BlogCard } from "@/components/site/BlogCard";
import { Newsletter } from "@/components/site/Newsletter";
import {
  blogCategories,
  featuredPosts,
  latestPosts,
  popularPosts,
  readingMinutes,
  type BlogPost,
} from "@/data/blog";
import { listPublishedBlogPosts } from "@/lib/blog.functions";
import { dbPostToBlogPost, mergeBlogPosts } from "@/lib/dbBlog";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { SITE_URL } from "@/components/site/constants";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const path = "/blog";
    return {
      meta: pageMeta({
        title: "Physiotherapy Blog | Expert Health Advice — PainFix Multan",
        description:
          "Evidence-based physiotherapy articles from PainFix Physiotherapy Clinic, Multan — back pain, sciatica, sports injuries, exercises, recovery tips and more.",
        path,
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Blog", path },
        ]),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "PainFix Physiotherapy Blog",
            description:
              "Evidence-based physiotherapy articles from PainFix Physiotherapy Clinic, Multan.",
            url: `${SITE_URL}${path}`,
            publisher: { "@type": "MedicalClinic", name: "PainFix Physiotherapy Clinic" },
          }),
        },
      ],
    };
  },
  loader: async () => {
    try {
      const rows = await listPublishedBlogPosts();
      return { dbPosts: rows.map(dbPostToBlogPost) };
    } catch {
      return { dbPosts: [] as BlogPost[] };
    }
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { dbPosts } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const all = useMemo(() => mergeBlogPosts(latestPosts(), dbPosts), [dbPosts]);
  const featured = featuredPosts();
  const popular = popularPosts(5);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, all]);

  return (
    <PageLayout>
      <PageHero
        eyebrow="Physiotherapy Blog"
        title="Expert Physiotherapy Advice & Recovery Guides"
        subtitle="Evidence-based articles on pain relief, injury recovery and healthy movement — written and reviewed by our physiotherapists in Multan."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
        ]}
        showActions={false}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mx-auto max-w-xl">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles (e.g. back pain, sciatica, neck)…"
                className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {blogCategories.map((c) => (
              <Link
                key={c.slug}
                to="/blog/category/$category"
                params={{ category: c.slug }}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Featured (hidden while searching) */}
          {!query && featured.length > 0 && (
            <div className="mt-14">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground">
                <Star className="h-5 w-5 text-secondary" /> Featured Articles
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.slice(0, 3).map((p, i) => (
                  <Reveal key={p.slug} anim="up" delay={i * 70}>
                    <BlogCard post={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Latest / results */}
            <div>
              <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground">
                <Newspaper className="h-5 w-5 text-primary" />
                {query ? `Results (${filtered.length})` : "Latest Articles"}
              </h2>
              {filtered.length === 0 ? (
                <p className="mt-6 text-muted-foreground">
                  No articles match your search. Try another term.
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {filtered.map((p, i) => (
                    <Reveal key={p.slug} anim="up" delay={i * 50}>
                      <BlogCard post={p} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                  <Star className="h-4 w-4 text-secondary" /> Popular Articles
                </h3>
                <ul className="mt-4 space-y-4">
                  {popular.map((p) => (
                    <li key={p.slug}>
                      <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block">
                        <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                          {p.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {readingMinutes(p)} min read
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Newsletter />
            </aside>
          </div>
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
