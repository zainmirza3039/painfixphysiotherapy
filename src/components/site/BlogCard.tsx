import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { type BlogPost, blogCategoryMap, readingMinutes } from "@/data/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const cat = blogCategoryMap[post.category];
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="hover-lift group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-secondary/12 px-3 py-1 text-secondary">{cat?.name ?? "Article"}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" /> {readingMinutes(post)} min read
        </span>
      </div>
      <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-foreground">{post.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
      </span>
    </Link>
  );
}
