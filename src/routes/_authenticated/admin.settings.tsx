import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => (
    <AdminOnly>
      <SettingsPage />
    </AdminOnly>
  ),
});

interface ClinicSettings {
  clinic_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  booking_url: string;
}

const defaults: ClinicSettings = {
  clinic_name: "PainFix Physiotherapy Clinic",
  phone: "0314-3039582",
  whatsapp: "0314-3039582",
  email: "",
  address: "Usman Raja Market, Near Khair Ul Maarif School, Shalimar Colony, Multan",
  facebook: "painfixphysiotherapy",
  instagram: "painfixphysiotherapy",
  tiktok: "painfixphysiotherapy",
  booking_url: "",
};

const FIELDS: { key: keyof ClinicSettings; label: string }[] = [
  { key: "clinic_name", label: "Clinic name" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "booking_url", label: "Booking URL (Calendly)" },
  { key: "facebook", label: "Facebook username" },
  { key: "instagram", label: "Instagram username" },
  { key: "tiktok", label: "TikTok username" },
];

function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ClinicSettings>(defaults);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("value")
        .eq("key", "general")
        .maybeSingle();
      if (error) throw error;
      return (data?.value as Partial<ClinicSettings>) ?? null;
    },
  });

  useEffect(() => {
    if (data) setForm({ ...defaults, ...data });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("clinic_settings")
        .upsert({ key: "general", value: form }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div>
      <AdminPageHeader title="Settings" description="Manage clinic contact details and links." />

      {isLoading ? (
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className={`space-y-1.5 ${f.key === "address" ? "sm:col-span-2" : ""}`}>
                <Label>{f.label}</Label>
                <Input
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
