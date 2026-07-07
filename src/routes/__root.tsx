import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider } from "@/i18n/LanguageProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0F4C81" },
      { name: "author", content: "PainFix Physiotherapy Clinic" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PainFix Physiotherapy Clinic" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Lovable App" },
      { property: "og:title", content: "Lovable App" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "description", content: "PainFix Thrive is a modern, responsive website for a physiotherapy clinic, offering a premium healthcare experience." },
      { property: "og:description", content: "PainFix Thrive is a modern, responsive website for a physiotherapy clinic, offering a premium healthcare experience." },
      { name: "twitter:description", content: "PainFix Thrive is a modern, responsive website for a physiotherapy clinic, offering a premium healthcare experience." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ff27b9c6-baba-4cbf-832a-78b288542943/id-preview-f229848a--83e6e489-3179-4efe-bff2-ce1a9fc022c8.lovable.app-1782856644173.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ff27b9c6-baba-4cbf-832a-78b288542943/id-preview-f229848a--83e6e489-3179-4efe-bff2-ce1a9fc022c8.lovable.app-1782856644173.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/__l5e/assets-v1/75948e0c-8e21-469d-84f9-a156e5280404/painfix-logo.png" },
      { rel: "apple-touch-icon", href: "/__l5e/assets-v1/75948e0c-8e21-469d-84f9-a156e5280404/painfix-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Physiotherapy",
          name: "PainFix Physiotherapy Clinic",
          logo: "/__l5e/assets-v1/75948e0c-8e21-469d-84f9-a156e5280404/painfix-logo.png",
          image: "/__l5e/assets-v1/75948e0c-8e21-469d-84f9-a156e5280404/painfix-logo.png",

          description:
            "Evidence-based physiotherapy and rehabilitation in Multan, Pakistan. Personalized treatment plans for pain relief, injury recovery, and restored movement.",
          telephone: "+92-314-3039582",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony",
            addressLocality: "Multan",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          medicalSpecialty: "Physiotherapy",
          priceRange: "$$",
          sameAs: [
            "https://facebook.com/painfixphysiotherapy1",
            "https://instagram.com/painfixphysiotherapy_",
            "https://tiktok.com/@painfixphysiotherapy",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
