import { CALENDLY_URL } from "./constants";

const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

let loadPromise: Promise<void> | null = null;

/** Lazily loads the Calendly widget assets exactly once (browser only). */
export function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_JS}"]`);
    if (existing) {
      if (window.Calendly) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Calendly")));
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly"));
    document.body.appendChild(script);
  });

  return loadPromise;
}

/** Opens the Calendly scheduler in a centered popup overlay. */
export async function openCalendlyPopup(url: string = CALENDLY_URL): Promise<void> {
  try {
    await loadCalendly();
    window.Calendly?.initPopupWidget({ url });
  } catch {
    // Fallback: open the scheduling page directly if the widget fails to load.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
