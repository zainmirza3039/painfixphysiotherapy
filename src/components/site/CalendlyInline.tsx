import { useEffect, useRef } from "react";
import { loadCalendly } from "./calendly";
import { CALENDLY_URL } from "./constants";

/** Inline Calendly scheduler embedded directly in the page. */
export function CalendlyInline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div
      ref={ref}
      aria-label="Appointment scheduler"
      className="h-[680px] w-full min-w-[320px] overflow-hidden rounded-[20px]"
    />
  );
}
