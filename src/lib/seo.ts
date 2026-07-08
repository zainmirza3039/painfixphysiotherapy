import { SITE_URL } from "@/components/site/constants";

export interface MetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
}

/** Build a consistent meta array for a route head(). */
export function pageMeta({ title, description, path, type = "website", image }: MetaInput) {
  const url = `${SITE_URL}${path}`;
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push(
      { property: "og:image", content: image },
      { name: "twitter:image", content: image },
    );
  }
  return meta;
}

/** Canonical link for a leaf route. */
export function canonical(path: string) {
  return [{ rel: "canonical", href: `${SITE_URL}${path}` }];
}

export interface Crumb {
  label: string;
  path: string;
}

/** BreadcrumbList JSON-LD script for head(). */
export function breadcrumbLd(items: Crumb[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.label,
        item: `${SITE_URL}${c.path}`,
      })),
    }),
  };
}

/** FAQPage JSON-LD script for head(). */
export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  };
}
