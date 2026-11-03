import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteCustomization {
  brandName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  clinicHours: string;
  footerDescription: string;
}

export const DEFAULT_SITE_CUSTOMIZATION: SiteCustomization = {
  brandName: "PainFix",
  tagline: "Physiotherapy Clinic",
  primaryColor: "#032E61",
  accentColor: "#00A859",
  heroEyebrow: "Physiotherapy in Multan · Online care for Rahim Yar Khan",
  heroTitle: "Move Better. Recover Faster. Live Pain-Free.",
  heroDescription: "Choose a clinic appointment or home visit in Multan, or start online care from Rahim Yar Khan. Thoughtful assessments and recovery plans built around you.",
  primaryCta: "Multan clinic appointment",
  secondaryCta: "Rahim Yar Khan · Online",
  clinicHours: "Daily, 11:00 AM–4:00 PM",
  footerDescription: "Evidence-based physiotherapy and rehabilitation in Multan. Helping you move better, recover faster, and live pain-free.",
};

function toHsl(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return `${h} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
}

export function useSiteCustomization() {
  const query = useQuery({
    queryKey: ["public-site-customization"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_customization_public").select("config").eq("id", "published").maybeSingle();
      if (error) throw error;
      return { ...DEFAULT_SITE_CUSTOMIZATION, ...((data?.config ?? {}) as Partial<SiteCustomization>) };
    },
    staleTime: 60_000,
  });
  const settings = query.data ?? DEFAULT_SITE_CUSTOMIZATION;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", toHsl(settings.primaryColor) ?? "215 94% 20%");
    root.style.setProperty("--secondary", toHsl(settings.accentColor) ?? "151 100% 33%");
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
    };
  }, [settings.primaryColor, settings.accentColor]);
  return settings;
}
