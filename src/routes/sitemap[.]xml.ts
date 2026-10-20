import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://painfixphysiotherapy.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { services } = await import("@/data/services");
        const { conditions } = await import("@/data/conditions");
        const { blogPosts, blogCategories } = await import("@/data/blog");
        const { localPages } = await import("@/data/localPages");
        const { dietMainPage, dietSubPages, DIET_NUTRITION_ENABLED } =
          await import("@/data/wellness");
        const { fitnessPages } = await import("@/data/fitness");
        const { listPublishedBlogPosts } = await import("@/lib/blog.functions");
        let dbPosts: { slug: string; updated_at: string }[] = [];
        let clinicianSlugs: string[] = [];
        let internshipEntries: SitemapEntry[] = [];
        try {
          dbPosts = (await listPublishedBlogPosts()).map((p) => ({
            slug: p.slug,
            updated_at: p.updated_at,
          }));
        } catch {
          dbPosts = [];
        }
        try {
          const { listPublishedClinicianProfiles } = await import("@/admin/clinicians.functions");
          clinicianSlugs = (await listPublishedClinicianProfiles()).map((profile) => profile.slug);
        } catch {
          // Do not re-advertise a previously published profile after unpublication.
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "60",
            },
          });
        }
        try {
          const { listInternshipPrograms } = await import("@/lib/internships.functions");
          internshipEntries = (await listInternshipPrograms())
            .filter((program) => program.status === "published")
            .map((program) => ({
              path: `/internships/${program.slug}`,
              lastmod: program.updated_at,
              changefreq: "weekly" as const,
              priority: "0.7",
            }));
        } catch {
          // Fail closed rather than serving stale or unverified program URLs.
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "60",
            },
          });
        }
        // De-duplicate CMS slugs that also exist in static data.
        const staticSlugs = new Set(blogPosts.map((p) => p.slug));
        const cmsBlogEntries = dbPosts
          .filter((p) => !staticSlugs.has(p.slug))
          .map((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.updated_at,
            changefreq: "monthly" as const,
            priority: "0.7",
          }));

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "yearly", priority: "0.7" },
          { path: "/our-team", changefreq: "monthly", priority: "0.8" },
          { path: "/services", changefreq: "monthly", priority: "0.9" },
          { path: "/conditions", changefreq: "monthly", priority: "0.9" },
          { path: "/home-visit", changefreq: "monthly", priority: "0.8" },
          { path: "/gallery", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "yearly", priority: "0.6" },
          { path: "/book-appointment", changefreq: "monthly", priority: "0.8" },
          { path: "/fitness-rehabilitation", changefreq: "monthly", priority: "0.8" },
          { path: "/fitness", changefreq: "monthly", priority: "0.8" },
          { path: "/fitness-assessment", changefreq: "monthly", priority: "0.7" },
          { path: "/fitness-resources", changefreq: "monthly", priority: "0.7" },
          { path: "/health-calculators", changefreq: "monthly", priority: "0.7" },
          { path: "/membership", changefreq: "monthly", priority: "0.7" },
          { path: "/success-stories", changefreq: "monthly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.9" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/internships", changefreq: "weekly", priority: "0.7" },
          { path: "/certificates", changefreq: "monthly", priority: "0.6" },
          ...internshipEntries,
          // Diet & Nutrition is only listed once a qualified dietitian officially joins.
          ...(DIET_NUTRITION_ENABLED
            ? [
                { path: `/${dietMainPage.slug}`, changefreq: "monthly" as const, priority: "0.8" },
                ...dietSubPages.map((p) => ({
                  path: `/diet-nutrition/${p.slug}`,
                  changefreq: "monthly" as const,
                  priority: "0.7",
                })),
              ]
            : []),
          ...clinicianSlugs.map((slug) => ({
            path: `/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...fitnessPages.map((p) => ({
            path: `/fitness/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...localPages.map((p) => ({
            path: `/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.9",
          })),
          ...services.map((s) => ({
            path: `/services/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...conditions.map((c) => ({
            path: `/conditions/${c.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...blogCategories.map((c) => ({
            path: `/blog/category/${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.6",
          })),
          ...blogPosts.map((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.updated,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...cmsBlogEntries,
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
