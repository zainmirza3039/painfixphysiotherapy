import { useEffect, useRef, useState } from "react";
import { loadCalendly } from "./calendly";
import { CALENDLY_URL } from "./constants";

/**
 * Inline Calendly scheduler embedded directly in the page.
 * The heavy third-party widget assets are only fetched once the container
 * scrolls near the viewport, keeping it off the critical path.
 */
export function CalendlyInline() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Defer loading until the scheduler is close to the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    loadCalendly()
      .then(() => {
        if (cancelled || !ref.current || !window.Calendly) return;
        ref.current.innerHTML = "";
        window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: ref.current });
      })
      .catch(() => {
        /* popup fallback handles failures elsewhere */
      });
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      aria-label="Appointment scheduler"
      className="h-[680px] w-full min-w-[320px] overflow-hidden rounded-[20px]"
    />
  );
}
