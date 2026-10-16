import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight, CalendarClock, BadgeCheck } from "lucide-react";
import { type BlogPost, blogCategoryMap, readingMinutes } from "@/data/blog";
import { getTeamMember } from "@/data/team";
import { conditionImages } from "@/data/conditionImages";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function BlogCard({ post }: { post: BlogPost }) {
  const cat = blogCategoryMap[post.category];
  const reviewer = getTeamMember(post.authorKey);
  const image = post.heroImage ?? conditionImages[post.category];
  const categoryLabel = cat?.name ?? post.categoryName ?? "Article";

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {image && (
        <div className="aspect-[16/9] overflow-hidden bg-surface">
          <img
            src={image}
            alt={`${post.title} — physiotherapy guidance from PainFix Clinic, Multan`}
            loading="lazy"
            decoding="async"
            width={700}
            height={394}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-sm bg-accent px-2.5 py-1 text-accent-foreground">
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {readingMinutes(post)} min read
          </span>
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-foreground">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" /> Updated{" "}
            {dateFmt.format(new Date(post.updated))}
          </span>
          {reviewer && (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-secondary" /> Reviewed by {reviewer.name}
            </span>
          )}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Read article{" "}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}
