import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAdminAuth } from "@/admin/AdminAuthProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { slugify } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: ProfilePage,
});

const empty = {
  full_name: "",
  professional_title: "",
  slug: "",
  bio: "",
  photo_url: "",
  specialties: "",
  years_experience: "",
  qualifications: "",
  certifications: "",
  clinical_interests: "",
  availability: "",
  phone: "",
  public_email: "",
  is_published: false,
};

interface Faq {
  q: string;
  a: string;
}
interface GalleryItem {
  url: string;
  caption: string;
}

function asFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => ({ q: String((v as Faq)?.q ?? ""), a: String((v as Faq)?.a ?? "") }))
    .filter((f) => f.q || f.a);
}
function asGallery(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => ({
      url: String((v as GalleryItem)?.url ?? ""),
      caption: String((v as GalleryItem)?.caption ?? ""),
    }))
    .filter((g) => g.url);
}

function ProfilePage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [form, setForm] = useState({ ...empty });
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin", "my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setSlugTouched(true);
      setForm({
        full_name: profile.full_name ?? "",
        professional_title: profile.professional_title ?? "",
        slug: profile.slug ?? "",
        bio: profile.bio ?? "",
        photo_url: profile.photo_url ?? "",
        specialties: (profile.specialties ?? []).join(", "),
        years_experience: profile.years_experience != null ? String(profile.years_experience) : "",
        qualifications: profile.qualifications ?? "",
        certifications: profile.certifications ?? "",
        clinical_interests: (profile.clinical_interests ?? []).join(", "),
        availability: profile.availability ?? "",
        phone: profile.phone ?? "",
        public_email: profile.public_email ?? "",
        is_published: profile.is_published ?? false,
      });
      setFaqs(asFaqs(profile.faqs));
      setGallery(asGallery(profile.gallery));
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not signed in");
      const years = form.years_experience.trim();
      const payload = {
        user_id: user.id,
        full_name: form.full_name.trim(),
        professional_title: form.professional_title.trim(),
        slug: (form.slug.trim() || slugify(form.full_name)).trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        specialties: form.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        years_experience: years ? Number(years) : null,
        qualifications: form.qualifications.trim() || null,
        certifications: form.certifications.trim() || null,
        clinical_interests: form.clinical_interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availability: form.availability.trim() || null,
        faqs: faqs.filter((f) => f.q.trim() || f.a.trim()) as unknown as Json,
        gallery: gallery.filter((g) => g.url.trim()) as unknown as Json,
        phone: form.phone.trim() || null,
        public_email: form.public_email.trim() || null,
        is_published: form.is_published,
      };
      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "my-profile"] });
      toast.success("Profile saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const publicSlug = form.slug.trim() || slugify(form.full_name);

  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        description="Manage the public profile shown on the PainFix website."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.full_name.trim()) return toast.error("Full name is required");
            if (!form.professional_title.trim())
              return toast.error("Professional title is required");
            save.mutate();
          }}
          className="max-w-3xl space-y-6"
        >
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            {form.photo_url ? (
              <img
                src={form.photo_url}
                alt="Profile preview"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <UserCircle className="h-8 w-8" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading font-semibold text-foreground">
                {form.full_name || "Your name"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {form.professional_title || "Your professional title"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Full name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.full_name}
                onChange={(e) => {
                  const full_name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    full_name,
                    slug: slugTouched ? f.slug : slugify(full_name),
                  }));
                }}
                placeholder="Dr. Zain Ul Abideen"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Professional title <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.professional_title}
                onChange={(e) => setForm((f) => ({ ...f, professional_title: e.target.value }))}
                placeholder="Clinical Physiotherapist"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Profile URL slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
              }}
              placeholder="dr-zain-ul-abideen"
            />
            <p className="text-xs text-muted-foreground">
              Used as your unique profile identifier: {publicSlug || "…"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              rows={5}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A short professional biography shown on your public profile."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Photo URL</Label>
              <Input
                value={form.photo_url}
                onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Years of experience</Label>
              <Input
                type="number"
                min={0}
                value={form.years_experience}
                onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
                placeholder="8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Specialties</Label>
            <Input
              value={form.specialties}
              onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
              placeholder="Sports injuries, Post-surgical rehab, Manual therapy"
            />
            <p className="text-xs text-muted-foreground">Separate with commas.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Qualifications</Label>
            <Textarea
              rows={3}
              value={form.qualifications}
              onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))}
              placeholder="DPT, MSPT — University of…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Certifications</Label>
            <Textarea
              rows={3}
              value={form.certifications}
              onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
              placeholder="Certified Strength & Conditioning, Dry Needling, etc."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Clinical interests</Label>
            <Input
              value={form.clinical_interests}
              onChange={(e) => setForm((f) => ({ ...f, clinical_interests: e.target.value }))}
              placeholder="Strength training, Return to sport, Chronic pain"
            />
            <p className="text-xs text-muted-foreground">Separate with commas.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Consultation availability</Label>
            <Textarea
              rows={2}
              value={form.availability}
              onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
              placeholder="Mon–Sat, 10am–7pm. Online sessions on request."
            />
          </div>

          {/* FAQs */}
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">FAQs</p>
                <p className="text-sm text-muted-foreground">
                  Questions and answers shown on your public profile.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFaqs((prev) => [...prev, { q: "", a: "" }])}
              >
                Add FAQ
              </Button>
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={faq.q}
                    onChange={(e) =>
                      setFaqs((prev) =>
                        prev.map((f, idx) => (idx === i ? { ...f, q: e.target.value } : f)),
                      )
                    }
                    placeholder="Question"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => setFaqs((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, idx) => (idx === i ? { ...f, a: e.target.value } : f)),
                    )
                  }
                  placeholder="Answer"
                />
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
            )}
          </div>

          {/* Gallery */}
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Gallery images</p>
                <p className="text-sm text-muted-foreground">
                  Image URLs (upload in Media Library, then paste the URL here).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGallery((prev) => [...prev, { url: "", caption: "" }])}
              >
                Add image
              </Button>
            </div>
            {gallery.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center"
              >
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.caption || "Gallery item"}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <UserCircle className="h-6 w-6" />
                  </span>
                )}
                <Input
                  value={item.url}
                  onChange={(e) =>
                    setGallery((prev) =>
                      prev.map((g, idx) => (idx === i ? { ...g, url: e.target.value } : g)),
                    )
                  }
                  placeholder="https://…"
                />
                <Input
                  value={item.caption}
                  onChange={(e) =>
                    setGallery((prev) =>
                      prev.map((g, idx) => (idx === i ? { ...g, caption: e.target.value } : g)),
                    )
                  }
                  placeholder="Caption (optional)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            {gallery.length === 0 && (
              <p className="text-sm text-muted-foreground">No gallery images added yet.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Public phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0317 0356265"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Public email</Label>
              <Input
                type="email"
                value={form.public_email}
                onChange={(e) => setForm((f) => ({ ...f, public_email: e.target.value }))}
                placeholder="name@painfix.pk"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div>
              <p className="font-medium text-foreground">Publish profile</p>
              <p className="text-sm text-muted-foreground">
                When on, your profile is visible on the public website.
              </p>
            </div>
            <Switch
              checked={form.is_published}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
            />
          </div>

          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save profile
          </Button>
        </form>
      )}
    </div>
  );
}
