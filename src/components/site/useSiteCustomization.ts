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
  clinicHours: "Mon–Sat, 11:00 AM–4:00 PM · Sunday by appointment",
  footerDescription: "Evidence-based physiotherapy and rehabilitation in Multan. Helping you move better, recover faster, and live pain-free.",
};

export function useSiteCustomization() {
  const query = useQuery({
    queryKey: ["public-site-customization"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clinic_settings").select("value").eq("key", "site_customization").maybeSingle();
      if (error) throw error;
      const value = data?.value as { published?: Partial<SiteCustomization> } | null;
      return { ...DEFAULT_SITE_CUSTOMIZATION, ...(value?.published ?? {}) };
    },
    staleTime: 60_000,
  });
  const settings = query.data ?? DEFAULT_SITE_CUSTOMIZATION;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.primaryColor);
    root.style.setProperty("--secondary", settings.accentColor);
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
    };
  }, [settings.primaryColor, settings.accentColor]);
  return settings;
}
