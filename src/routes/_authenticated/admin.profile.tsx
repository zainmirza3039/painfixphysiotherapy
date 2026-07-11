import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  phone: "",
  public_email: "",
  is_published: false,
};

function ProfilePage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [form, setForm] = useState({ ...empty });
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
        years_experience:
          profile.years_experience != null ? String(profile.years_experience) : "",
        qualifications: profile.qualifications ?? "",
        phone: profile.phone ?? "",
        public_email: profile.public_email ?? "",
        is_published: profile.is_published ?? false,
      });
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
        phone: form.phone.trim() || null,
        public_email: form.public_email.trim() || null,
        is_published: form.is_published,
      };
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, professional_title: e.target.value }))
                }
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
            <p className="text-xs text-muted-foreground">Public page: /team/{publicSlug || "…"}</p>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, years_experience: e.target.value }))
                }
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
