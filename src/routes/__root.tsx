import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/site/ThemeProvider";
import { SITE_URL } from "@/components/site/constants";
import type { AuthChangeEvent } from "@supabase/supabase-js";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap";

const LOGO_URL = SITE_URL + "/painfix-logo.png";

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
      { name: "google-site-verification", content: "3bV8F81i2VTJdIbqGuC217jQ4AaSTxmLIKHuNJzc16U" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PainFix Physiotherapy Clinic" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "PainFix Physiotherapy Clinic — Multan" },
      { property: "og:title", content: "PainFix Physiotherapy Clinic — Multan" },
      { name: "twitter:title", content: "PainFix Physiotherapy Clinic — Multan" },
      {
        name: "description",
        content:
          "PainFix Physiotherapy Clinic in Multan, Pakistan — evidence-based physiotherapy and rehabilitation for lasting pain relief, injury recovery, and restored movement.",
      },
      {
        property: "og:description",
        content:
          "PainFix Physiotherapy Clinic in Multan, Pakistan — evidence-based physiotherapy and rehabilitation for lasting pain relief, injury recovery, and restored movement.",
      },
      {
        name: "twitter:description",
        content:
          "PainFix Physiotherapy Clinic in Multan, Pakistan — evidence-based physiotherapy and rehabilitation for lasting pain relief, injury recovery, and restored movement.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/painfix-logo.png" },
      { rel: "apple-touch-icon", href: "/painfix-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Preload the font CSS as a resource so it is discovered early, but load
      // it non-render-blocking (the swap happens in RootShell) so FCP isn't
      // gated on a cross-origin stylesheet round-trip. font-display:swap in the
      // URL keeps text visible with the fallback until the webfont arrives.
      { rel: "preload", as: "style", href: FONT_HREF },
      // DNS prefetch for third-party origins that load lazily (on scroll,
      // interaction, or idle). Cheaper than preconnect and avoids reserving
      // sockets for origins that may never be needed on a given visit.
      { rel: "dns-prefetch", href: "https://www.clarity.ms" },
      { rel: "dns-prefetch", href: "https://assets.calendly.com" },
      { rel: "dns-prefetch", href: "https://www.google.com" },
      { rel: "dns-prefetch", href: "https://maps.googleapis.com" },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["MedicalClinic", "LocalBusiness"],
          "@id": SITE_URL + "/#clinic",
          name: "PainFix Physiotherapy Clinic",
          url: SITE_URL,
          logo: LOGO_URL,
          image: LOGO_URL,
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
          geo: {
            "@type": "GeoCoordinates",
            latitude: 30.239469,
            longitude: 71.4856386,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "09:00",
              closes: "21:00",
            },
          ],
          medicalSpecialty: "Physiotherapy",
          priceRange: "$$",
          hasMap: "https://maps.google.com/?cid=8626724576429817038",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "31",
            bestRating: "5",
            worstRating: "1",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Consultation Fees",
            itemListElement: [
              {
                "@type": "Offer",
                name: "In-Clinic Consultation",
                description: "Initial assessment and treatment plan.",
                price: "2000",
                priceCurrency: "PKR",
              },
              {
                "@type": "Offer",
                name: "Video Consultation",
                description: "Online consultation for follow-ups and second opinions.",
                price: "1000",
                priceCurrency: "PKR",
              },
            ],
          },
          sameAs: [
            "https://facebook.com/painfixphysiotherapy1",
            "https://instagram.com/painfixphysiotherapy_",
            "https://tiktok.com/@painfixphysiotherapy",
            "https://www.linkedin.com/company/painfix-physiotherapy-clinic1/",
          ],
        }),
      },
      {
        // Microsoft Clarity — deferred until the browser is idle after load so
        // it never competes with hydration or the LCP for main-thread time.
        // Falls back to a timeout where requestIdleCallback is unsupported.
        children:
          '(function(){function l(){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xkrug632ml")}function s(){"requestIdleCallback"in window?requestIdleCallback(l,{timeout:6000}):setTimeout(l,3000)}"complete"===document.readyState?s():window.addEventListener("load",s,{once:true})})();',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Non-render-blocking web fonts: load with media="print" then flip to
            "all" once the stylesheet arrives, so FCP is never gated on the
            cross-origin font CSS. The inline script performs the swap (React
            strips string event handlers, so this is more reliable than onload).
            <noscript> keeps fonts for no-JS clients. */}
        <link id="gfont-css" rel="stylesheet" href={FONT_HREF} media="print" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var g=document.getElementById('gfont-css');if(!g)return;function a(){g.media='all';}if(g.sheet){a();}else{g.addEventListener('load',a,{once:true});}})();",
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_HREF} />
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
        <SpeedInsights />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    // Defer the Supabase client (auth + realtime) off the initial bundle; the
    // marketing pages never need it before hydration completes.
    void import("@/integrations/supabase/client").then(({ supabase }) => {
      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
