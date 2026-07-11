import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentOnly } from "@/components/admin/ContentOnly";
import { CALCULATOR_KEYS, CALCULATOR_LABELS } from "@/lib/fitnessContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/calculators")({
  component: () => (
    <ContentOnly>
      <CalculatorsPage />
    </ContentOnly>
  ),
});

type Row = Database["public"]["Tables"]["calculator_settings"]["Row"];

interface Draft {
  heading: string;
  description: string;
  disclaimer: string;
}

function CalculatorsPage() {
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "calculator-settings"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.from("calculator_settings").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!rows) return;
    const map: Record<string, Draft> = {};
    for (const key of CALCULATOR_KEYS) {
      const row = rows.find((r) => r.key === key);
      map[key] = {
        heading: row?.heading ?? "",
        description: row?.description ?? "",
        disclaimer: row?.disclaimer ?? "",
      };
    }
    setDrafts(map);
  }, [rows]);

  const save = useMutation({
    mutationFn: async (key: string) => {
      const d = drafts[key];
      const { error } = await supabase.from("calculator_settings").upsert(
        {
          key,
          heading: d.heading.trim() || null,
          description: d.description.trim() || null,
          disclaimer: d.disclaimer.trim() || null,
        },
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "calculator-settings"] });
      toast.success("Calculator text saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div>
      <AdminPageHeader
        title="Calculator Content"
        description="Edit the intro text and disclaimers shown on the health calculators. Formulas and logic are fixed in code and cannot be changed here."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {CALCULATOR_KEYS.map((key) => {
            const d = drafts[key] ?? { heading: "", description: "", disclaimer: "" };
            const setField = (field: keyof Draft, value: string) =>
              setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
            return (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/10 text-secondary">
                    <Calculator className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="font-heading font-bold text-foreground">
                    {CALCULATOR_LABELS[key]}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Heading</Label>
                    <Input
                      value={d.heading}
                      onChange={(e) => setField("heading", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={d.description}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Disclaimer</Label>
                    <Textarea
                      rows={3}
                      value={d.disclaimer}
                      onChange={(e) => setField("disclaimer", e.target.value)}
                    />
                  </div>
                  <Button onClick={() => save.mutate(key)} disabled={save.isPending}>
                    {save.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
