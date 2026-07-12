import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { Reveal } from "@/components/site/Reveal";
import { BlogCard } from "@/components/site/BlogCard";
import { blogCategoryMap, blogCategories, postsByCategory, type BlogPost, type BlogCategory } from "@/data/blog";
import { listPublishedBlogPosts } from "@/lib/blog.functions";
import { dbPostToBlogPost, mergeBlogPosts } from "@/lib/dbBlog";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/blog/category/$category")({
  loader: async ({ params }) => {
    const category = blogCategoryMap[params.category];
    if (!category) throw notFound();
    let dbPosts: BlogPost[] = [];
    try {
      const rows = await listPublishedBlogPosts();
      dbPosts = rows.map(dbPostToBlogPost).filter((p) => p.category === params.category);
    } catch {
      dbPosts = [];
    }
    return { category, posts: mergeBlogPosts(postsByCategory(params.category), dbPosts) };
  },

  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category Not Found — PainFix" }, { name: "robots", content: "noindex" }] };
    }
    const { category } = loaderData;
    const path = `/blog/category/${params.category}`;
    return {
      meta: pageMeta({
        title: `${category.name} Articles | Physiotherapy Blog — PainFix Multan`,
        description: category.description,
        path,
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: category.name, path },
        ]),
      ],
    };
  },
  notFoundComponent: CategoryNotFound,
  component: BlogCategoryPage,
});

function CategoryNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-40 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Category not found</h1>
        <Link to="/blog" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Back to blog
        </Link>
      </section>
    </PageLayout>
  );
}

function BlogCategoryPage() {
  const { category, posts } = Route.useLoaderData() as { category: BlogCategory; posts: BlogPost[] };

  return (
    <PageLayout>
      <PageHero
        eyebrow="Blog Category"
        title={category.name}
        subtitle={category.description}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: category.name, path: `/blog/category/${category.slug}` },
        ]}
        showActions={false}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {blogCategories.map((c) => (
              <Link
                key={c.slug}
                to="/blog/category/$category"
                params={{ category: c.slug }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  c.slug === category.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary hover:text-primary"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">
              No articles in this category yet. Explore{" "}
              <Link to="/blog" className="font-semibold text-primary">all articles</Link>.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.slug} anim="up" delay={i * 60}>
                  <BlogCard post={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <PageCTA />
    </PageLayout>
  );
}
