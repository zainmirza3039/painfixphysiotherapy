import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Loader2, Save, Send, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SITE_CUSTOMIZATION, type SiteCustomization } from "@/components/site/useSiteCustomization";

export const Route = createFileRoute("/_authenticated/admin/website-editor")({
  component: () => <AdminOnly><WebsiteEditor /></AdminOnly>,
});

type StoredConfig = { draft?: Partial<SiteCustomization>; published?: Partial<SiteCustomization>; updated_at?: string };
const fields: { key: keyof SiteCustomization; label: string; multiline?: boolean }[] = [
  { key: "brandName", label: "Brand name" },
  { key: "tagline", label: "Brand subtitle" },
  { key: "primaryColor", label: "Primary colour (hex)" },
  { key: "accentColor", label: "Accent colour (hex)" },
  { key: "heroEyebrow", label: "Homepage eyebrow" },
  { key: "heroTitle", label: "Homepage main heading" },
  { key: "heroDescription", label: "Homepage description", multiline: true },
  { key: "primaryCta", label: "Primary booking button label" },
  { key: "secondaryCta", label: "Secondary booking button label" },
  { key: "clinicHours", label: "Clinic hours text" },
  { key: "footerDescription", label: "Footer description", multiline: true },
];

function WebsiteEditor() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SiteCustomization>(DEFAULT_SITE_CUSTOMIZATION);
  const [published, setPublished] = useState<SiteCustomization>(DEFAULT_SITE_CUSTOMIZATION);
  const [tab, setTab] = useState<"content" | "design">("content");
  const stored = useQuery({
    queryKey: ["admin-site-customization"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clinic_settings").select("value").eq("key", "site_customization").maybeSingle();
      if (error) throw error;
      return (data?.value as StoredConfig | null) ?? {};
    },
  });
  useEffect(() => {
    if (stored.data) {
      setDraft({ ...DEFAULT_SITE_CUSTOMIZATION, ...(stored.data.draft ?? {}) });
      setPublished({ ...DEFAULT_SITE_CUSTOMIZATION, ...(stored.data.published ?? {}) });
    }
  }, [stored.data]);

  const save = useMutation({
    mutationFn: async (publish: boolean) => {
      const next = { draft, published: publish ? draft : published, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("clinic_settings").upsert({ key: "site_customization", value: next as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      if (publish) {
        const { error: publishError } = await supabase.from("site_customization_public").upsert(
          { id: "published", config: draft as unknown as Json, updated_at: next.updated_at },
          { onConflict: "id" },
        );
        if (publishError) throw publishError;
      }
      return next;
    },
    onSuccess: async (next, publish) => {
      setPublished({ ...DEFAULT_SITE_CUSTOMIZATION, ...(next.published ?? {}) });
      await qc.invalidateQueries({ queryKey: ["admin-site-customization"] });
      await qc.invalidateQueries({ queryKey: ["public-site-customization"] });
      toast.success(publish ? "Website changes published." : "Draft saved. Public website is unchanged.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save website settings."),
  });

  const update = (key: keyof SiteCustomization, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const isDesign = (key: keyof SiteCustomization) => key === "primaryColor" || key === "accentColor";
  const preview = draft;

  return <div>
    <AdminPageHeader title="Website Customization" description="Edit supported website content and brand colours without changing source code. Save a draft first, then publish when it is ready." actions={<a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Eye className="h-4 w-4" /> Open live website</a>} />
    <div className="mb-5 flex flex-wrap gap-2">
      <Button variant={tab === "content" ? "default" : "outline"} onClick={() => setTab("content")}>Website content</Button>
      <Button variant={tab === "design" ? "default" : "outline"} onClick={() => setTab("design")}>Brand colours</Button>
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="mb-5"><h2 className="font-heading text-lg font-semibold">{tab === "content" ? "Homepage and brand content" : "Visual identity"}</h2><p className="mt-1 text-sm text-muted-foreground">Changes are stored as a draft until you publish.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.filter((field) => isDesign(field.key) === (tab === "design")).map((field) => <div key={field.key} className={field.multiline ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
            <Label>{field.label}</Label>
            {field.multiline ? <Textarea rows={4} value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} /> : <div className="flex gap-2"><Input value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} />{isDesign(field.key) && <input aria-label={field.label + " picker"} type="color" value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} className="h-10 w-12 rounded border bg-transparent p-1" />}</div>}
          </div>)}
          {tab === "content" && <div className="sm:col-span-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">Booking button destinations and service routes remain protected and unchanged. Clinic hours are displayed on the homepage. Keep all public hours accurate before publishing.</div>}
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t pt-5">
          <Button variant="outline" onClick={() => setDraft(DEFAULT_SITE_CUSTOMIZATION)}><RotateCcw className="mr-2 h-4 w-4" /> Reset editor</Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={save.isPending || stored.isLoading} onClick={() => save.mutate(false)}>{save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save draft</Button>
            <Button disabled={save.isPending || stored.isLoading} onClick={() => save.mutate(true)}><Send className="mr-2 h-4 w-4" /> Publish changes</Button>
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Live preview (editor)</h2><span className="text-xs text-muted-foreground">Draft view</span></div>
          <div className="overflow-hidden rounded-xl border" style={{ ["--preview-primary" as string]: preview.primaryColor, ["--preview-accent" as string]: preview.accentColor }}>
            <div className="flex items-center gap-2 border-b p-3"><span className="h-8 w-8 rounded-lg" style={{ background: preview.primaryColor }} /><span><b className="block text-sm">{preview.brandName}</b><small className="text-muted-foreground">{preview.tagline}</small></span></div>
            <div className="space-y-3 p-4"><p className="text-xs font-semibold" style={{ color: preview.accentColor }}>{preview.heroEyebrow}</p><h3 className="font-heading text-2xl font-bold leading-tight">{preview.heroTitle}</h3><p className="text-sm text-muted-foreground">{preview.heroDescription}</p><div className="rounded-md px-3 py-2 text-center text-xs font-semibold text-white" style={{ background: preview.primaryColor }}>{preview.primaryCta}</div><p className="text-xs text-muted-foreground">{preview.clinicHours}</p></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">This is an editor preview of the fields above, not a full browser rendering of every website page.</p>
        </div>
        <div className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">Currently published</h3><p className="mt-2 text-sm text-muted-foreground">{published.heroTitle}</p><div className="mt-3 flex gap-2"><span className="h-5 w-5 rounded" style={{ background: published.primaryColor }} /><span className="h-5 w-5 rounded" style={{ background: published.accentColor }} /></div></div>
      </aside>
    </div>
  </div>;
}
