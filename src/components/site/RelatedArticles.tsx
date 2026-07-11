import { type BlogPost } from "@/data/blog";
import { BlogCard } from "./BlogCard";
import { Reveal } from "./Reveal";

export function RelatedArticles({
  posts,
  title = "Related Articles",
}: {
  posts: BlogPost[];
  title?: string;
}) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          {title}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} anim="up" delay={i * 70}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
