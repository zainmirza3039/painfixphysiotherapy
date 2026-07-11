import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Clock, CheckCircle2, Facebook, MessageCircle, Calendar, Phone, MapPin, ArrowRight } from "lucide-react";
import { getPost, readingMinutes, relatedPosts, blogCategoryMap, type BlogPost } from "@/data/blog";
import { getTeamMember } from "@/data/team";
import { serviceMap } from "@/data/services";
import { conditionMap } from "@/data/conditions";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { AuthorCard } from "@/components/site/AuthorCard";
import { Newsletter } from "@/components/site/Newsletter";
import { BlogCard } from "@/components/site/BlogCard";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta, canonical, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL, WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, MAP_DIRECTIONS_URL } from "@/components/site/constants";
import { openCalendlyPopup } from "@/components/site/calendly";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article Not Found — PainFix" }, { name: "robots", content: "noindex" }] };
    }
    const post = loaderData;
    const path = `/blog/${params.slug}`;
    const author = getTeamMember(post.authorKey);
    return {
      meta: pageMeta({
        title: post.seoTitle,
        description: post.metaDescription,
        path,
        type: "article",
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: post.title, path },
        ]),
        faqLd(post.faqs),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.date,
            dateModified: post.updated,
            url: `${SITE_URL}${path}`,
            mainEntityOfPage: `${SITE_URL}${path}`,
            author: author
              ? { "@type": "Person", name: author.name, jobTitle: author.role, description: author.credentials }
              : { "@type": "Organization", name: "PainFix Physiotherapy Clinic" },
            reviewedBy: author ? { "@type": "Person", name: author.name, jobTitle: author.role } : undefined,
            publisher: {
              "@type": "MedicalClinic",
              name: "PainFix Physiotherapy Clinic",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Multan",
                addressRegion: "Punjab",
                addressCountry: "PK",
              },
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: BlogNotFound,
  component: BlogArticle,
});

function BlogNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This article doesn't exist or has moved.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Back to blog
        </Link>
      </section>
    </PageLayout>
  );
}

function BlogArticle() {
  const post: BlogPost = Route.useLoaderData();
  const cat = blogCategoryMap[post.category];
  const related = relatedPosts(post, 3);
  const services = post.relatedServices.map((s) => serviceMap[s]).filter(Boolean);
  const conditions = post.relatedConditions.map((c) => conditionMap[c]).filter(Boolean);
  const shareUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <PageLayout>
      <PageHero
        eyebrow={cat?.name ?? "Article"}
        title={post.title}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: post.title, path: `/blog/${post.slug}` },
        ]}
        showActions={false}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <article className="min-w-0">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {readingMinutes(post)} min read
              </span>
              <span aria-hidden>•</span>
              <span>
                Updated{" "}
                {new Date(post.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Quick Answer (AEO) */}
            <div className="mt-6 rounded-[1.75rem] border-l-4 border-secondary bg-surface p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Quick Answer</p>
              <p className="mt-2 text-base leading-relaxed text-foreground">{post.quickAnswer}</p>
            </div>

            {/* Sections */}
            <div className="mt-8 space-y-8">
              {post.sections.map((s, i) => (
                <Reveal key={i} anim="up">
                  <section>
                    {s.heading && (
                      <h2 className="font-heading text-2xl font-extrabold text-foreground">{s.heading}</h2>
                    )}
                    <div className={s.heading ? "mt-3 space-y-4" : "space-y-4"}>
                      {s.paragraphs.map((p, j) => (
                        <p key={j} className="text-base leading-relaxed text-muted-foreground">{p}</p>
                      ))}
                    </div>
                    {s.list && (
                      <ul className="mt-4 space-y-2.5">
                        {s.list.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </Reveal>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="mt-10 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
              <h2 className="font-heading text-xl font-bold text-foreground">Key Takeaways</h2>
              <ul className="mt-4 space-y-2.5">
                {post.keyTakeaways.map((k) => (
                  <li key={k} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQs */}
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-extrabold text-foreground">Frequently Asked Questions</h2>
              <div className="mt-6">
                <FaqAccordion faqs={post.faqs} />
              </div>
            </div>

            {/* Conversion CTA */}
            <div className="mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-8 text-center shadow-card">
              <h2 className="font-heading text-2xl font-extrabold text-primary-foreground">Have a question about this?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
                Chat with our physiotherapists on WhatsApp for honest advice about your condition — no obligation to book.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={WHATSAPP_CONSULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ripple inline-flex items-center gap-2 rounded-2xl bg-background px-5 py-3 text-sm font-semibold text-primary shadow-card"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Consultation
                </a>
                <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-5 py-3 text-sm font-semibold text-primary-foreground">
                  <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
                </a>
                <a href={MAP_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/40 px-5 py-3 text-sm font-semibold text-primary-foreground">
                  <MapPin className="h-4 w-4" /> Directions
                </a>
              </div>
            </div>

            {/* Medical disclaimer */}
            <p className="mt-8 rounded-2xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Medical disclaimer:</strong> This article is for general education and
              is not a substitute for personalized medical advice, diagnosis or treatment. Always consult a qualified
              physiotherapist or healthcare professional about your specific condition.
            </p>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <AuthorCard authorKey={post.authorKey} updated={post.updated} />

            {/* Share */}
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
              <p className="text-sm font-bold text-foreground">Share this article</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(post.title + " " + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Related services */}
            {services.length > 0 && (
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                <p className="text-sm font-bold text-foreground">Related Services</p>
                <ul className="mt-3 space-y-2">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link to="/services/$slug" params={{ slug: s.slug }} className="group inline-flex items-center gap-1.5 text-sm text-primary">
                        {s.title}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related conditions */}
            {conditions.length > 0 && (
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
                <p className="text-sm font-bold text-foreground">Related Conditions</p>
                <ul className="mt-3 space-y-2">
                  {conditions.map((c) => (
                    <li key={c.slug}>
                      <Link to="/conditions/$slug" params={{ slug: c.slug }} className="group inline-flex items-center gap-1.5 text-sm text-primary">
                        {c.title}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Newsletter />
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-extrabold text-foreground">Related Articles</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} anim="up" delay={i * 70}>
                  <BlogCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
