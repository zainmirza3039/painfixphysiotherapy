import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CLINICIAN_PHOTO_BUCKET,
  CLINICIAN_PHOTO_MIME_TYPES,
  MAX_CLINICIAN_PHOTO_BYTES,
  clinicianProfileInputSchema,
  type AdminClinicianProfile,
  type ClinicianProfileInput,
} from "@/admin/clinician-profile.contract";
import {
  clearAdminClinicianPhoto,
  createAdminClinicianPhotoUploadUrl,
  deleteAdminClinicianPhoto,
  listAdminClinicianProfiles,
  removeAdminClinicianProfile,
  saveAdminClinicianProfile,
} from "@/admin/clinicians.functions";
import {
  clinicianFormToInput,
  clinicianProfileToForm,
  emptyClinicianForm,
  slugFromClinicianName,
  type ClinicianFormState,
} from "@/admin/clinician-form";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/clinicians")({
  component: () => (
    <AdminOnly>
      <CliniciansPage />
    </AdminOnly>
  ),
});

type PhotoCleanup = { clinicianId: string; photoPath: string; clinicianName: string };
type SaveResult = {
  profile: AdminClinicianProfile;
  uploadError: string | null;
  cleanupPath: string | null;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function validatePhotoFile(file: File): string | null {
  if (!(CLINICIAN_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Choose a JPEG, PNG, WebP, or AVIF image.";
  }
  if (file.size <= 0) return "The selected image is empty.";
  if (file.size > MAX_CLINICIAN_PHOTO_BYTES) return "The image must be 5 MiB or smaller.";
  return null;
}

function CliniciansPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const operationRef = useRef(false);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const beginOperation = () => {
    if (operationRef.current) return false;
    operationRef.current = true;
    return true;
  };
  const endOperation = () => {
    operationRef.current = false;
  };
  const listProfiles = useServerFn(listAdminClinicianProfiles);
  const saveProfile = useServerFn(saveAdminClinicianProfile);
  const removeProfile = useServerFn(removeAdminClinicianProfile);
  const clearPhoto = useServerFn(clearAdminClinicianPhoto);
  const createPhotoUploadUrl = useServerFn(createAdminClinicianPhotoUploadUrl);
  const deletePhoto = useServerFn(deleteAdminClinicianPhoto);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminClinicianProfile | null>(null);
  const [form, setForm] = useState<ClinicianFormState>(emptyClinicianForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminClinicianProfile | null>(null);
  const [clearPhotoTarget, setClearPhotoTarget] = useState<AdminClinicianProfile | null>(null);
  const [photoCleanup, setPhotoCleanup] = useState<PhotoCleanup | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  useEffect(() => {
    if (formError) formErrorRef.current?.focus();
  }, [formError]);

  const profilesQuery = useQuery({
    queryKey: ["admin", "clinician-profiles"],
    queryFn: () => listProfiles(),
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: {
      payload: ClinicianProfileInput;
      file: File | null;
      previousPhotoPath: string | null;
    }): Promise<SaveResult> => {
      const profile = await saveProfile({ data: vars.payload });
      if (!vars.file) return { profile, uploadError: null, cleanupPath: null };

      let signedUpload: Awaited<ReturnType<typeof createPhotoUploadUrl>>;
      try {
        signedUpload = await createPhotoUploadUrl({
          data: {
            clinicianId: profile.id,
            contentType: vars.file.type as (typeof CLINICIAN_PHOTO_MIME_TYPES)[number],
            sizeBytes: vars.file.size,
          },
        });
      } catch (error) {
        return {
          profile,
          uploadError: `Profile details were saved, but the photo upload could not be prepared: ${errorMessage(error)}`,
          cleanupPath: null,
        };
      }

      let uploadErrorMessage: string | null = null;
      try {
        const { error: uploadError } = await supabase.storage
          .from(signedUpload.bucket || CLINICIAN_PHOTO_BUCKET)
          .uploadToSignedUrl(signedUpload.path, signedUpload.token, vars.file, {
            contentType: vars.file.type,
          });
        if (uploadError) uploadErrorMessage = uploadError.message;
      } catch (error) {
        uploadErrorMessage = errorMessage(error);
      }

      if (uploadErrorMessage) {
        let cleanupPath: string | null = null;
        try {
          await deletePhoto({ data: { clinicianId: profile.id, photoPath: signedUpload.path } });
        } catch {
          cleanupPath = signedUpload.path;
        }
        return {
          profile,
          uploadError: `Profile details were saved, but the photo upload failed: ${uploadErrorMessage}`,
          cleanupPath,
        };
      }

      try {
        const updatedProfile = await saveProfile({
          data: { ...vars.payload, id: profile.id, photo_path: signedUpload.path },
        });
        return {
          profile: updatedProfile,
          uploadError: null,
          cleanupPath:
            vars.previousPhotoPath && vars.previousPhotoPath !== signedUpload.path
              ? vars.previousPhotoPath
              : null,
        };
      } catch (error) {
        let cleanupPath: string | null = null;
        try {
          await deletePhoto({ data: { clinicianId: profile.id, photoPath: signedUpload.path } });
        } catch {
          cleanupPath = signedUpload.path;
        }
        return {
          profile,
          uploadError: `Profile details were saved, but the new photo could not be attached: ${errorMessage(error)}`,
          cleanupPath,
        };
      }
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clinician-profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["public-clinician-profiles"] });
      void router.invalidate();
      setEditing(result.profile);
      setForm(clinicianProfileToForm(result.profile));
      setFormError(result.uploadError);
      if (result.uploadError) {
        toast.error(result.uploadError);
      } else {
        setPhotoFile(null);
        setDialogOpen(false);
        toast.success("Clinician profile saved");
      }
      if (result.cleanupPath) {
        setPhotoCleanup({
          clinicianId: result.profile.id,
          photoPath: result.cleanupPath,
          clinicianName: result.profile.full_name,
        });
        setCleanupDialogOpen(true);
      }
    },
    onError: (error) => {
      setFormError(errorMessage(error));
      toast.error(errorMessage(error));
    },
    onSettled: endOperation,
  });

  const deactivateMutation = useMutation({
    mutationFn: (profile: AdminClinicianProfile) => removeProfile({ data: { id: profile.id } }),
    onSuccess: (_result, profile) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clinician-profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["public-clinician-profiles"] });
      void router.invalidate();
      setDeactivateTarget(null);
      if (editing?.id === profile.id) closeEditor();
      toast.success(`${profile.full_name} was removed from the public website`);
    },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: endOperation,
  });

  const activateMutation = useMutation({
    mutationFn: (profile: AdminClinicianProfile) => {
      const payload = clinicianFormToInput(clinicianProfileToForm(profile), profile.photo_path);
      return saveProfile({ data: { ...payload, is_active: true } });
    },
    onSuccess: (profile) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clinician-profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["public-clinician-profiles"] });
      void router.invalidate();
      toast.success(
        profile.is_published
          ? "Clinician profile reactivated"
          : "Clinician profile activated; publish it when it is ready for public display",
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: endOperation,
  });

  const clearPhotoMutation = useMutation({
    mutationFn: async (profile: AdminClinicianProfile) => {
      await clearPhoto({ data: { id: profile.id } });
      return {
        profile: { ...profile, photo_path: null, photo_url: null, resolved_photo_url: null },
        cleanupPath: profile.photo_path,
      };
    },
    onSuccess: ({ profile, cleanupPath }) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "clinician-profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["public-clinician-profiles"] });
      void router.invalidate();
      if (editing?.id === profile.id) setEditing(profile);
      setClearPhotoTarget(null);
      toast.success("The portrait reference was cleared");
      if (cleanupPath) {
        setPhotoCleanup({
          clinicianId: profile.id,
          photoPath: cleanupPath,
          clinicianName: profile.full_name,
        });
        setCleanupDialogOpen(true);
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: endOperation,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (cleanup: PhotoCleanup) =>
      deletePhoto({ data: { clinicianId: cleanup.clinicianId, photoPath: cleanup.photoPath } }),
    onSuccess: () => {
      setCleanupDialogOpen(false);
      setPhotoCleanup(null);
      toast.success("Unused uploaded photo deleted");
    },
    onError: (error) => {
      setCleanupDialogOpen(false);
      toast.error(errorMessage(error));
    },
    onSettled: endOperation,
  });

  const isBusy =
    saveMutation.isPending ||
    deactivateMutation.isPending ||
    activateMutation.isPending ||
    clearPhotoMutation.isPending ||
    deletePhotoMutation.isPending;
  const profiles = profilesQuery.data ?? [];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredProfiles = profiles.filter((profile) =>
    [
      profile.full_name,
      profile.name,
      profile.designation,
      profile.slug,
      profile.city,
      profile.service_mode === "online_only" ? "online-only online only" : "clinic clinic-based",
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );

  function resetEditor() {
    setEditing(null);
    setForm(emptyClinicianForm());
    setPhotoFile(null);
    setFormError(null);
  }

  function closeEditor() {
    if (operationRef.current) return;
    setDialogOpen(false);
    resetEditor();
  }

  function openNewEditor() {
    if (operationRef.current) return;
    resetEditor();
    setDialogOpen(true);
  }

  function openEditEditor(profile: AdminClinicianProfile) {
    if (operationRef.current) return;
    setEditing(profile);
    setForm(clinicianProfileToForm(profile));
    setPhotoFile(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function updateForm(patch: Partial<ClinicianFormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setFormError(null);
  }

  function handlePhotoSelection(file: File | null) {
    if (!file) {
      setPhotoFile(null);
      return;
    }
    const problem = validatePhotoFile(file);
    if (problem) {
      setPhotoFile(null);
      setFormError(problem);
      return;
    }
    setPhotoFile(file);
    setFormError(null);
  }

  function submitForm(
    event: Pick<FormEvent<HTMLFormElement>, "preventDefault">,
    confirmedDeactivation = false,
  ) {
    event.preventDefault();
    if (operationRef.current) return;
    if (photoFile) {
      const photoProblem = validatePhotoFile(photoFile);
      if (photoProblem) {
        setFormError(photoProblem);
        return;
      }
    }

    const deactivating = editing?.is_active && !form.is_active;
    const payload = clinicianFormToInput(
      deactivating ? { ...form, is_published: false } : form,
      editing?.photo_path ?? null,
    );
    if (payload.slug !== editing?.slug && isReservedRootSlug(payload.slug)) {
      setFormError("That URL is already used by another PainFix page. Choose a different slug.");
      return;
    }
    const parsed = clinicianProfileInputSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join(".");
      setFormError(
        field
          ? `${field}: ${issue.message}`
          : (issue?.message ?? "Check the profile fields and try again."),
      );
      return;
    }

    if (deactivating && !confirmedDeactivation) {
      setDeactivateTarget(editing);
      return;
    }
    if (!beginOperation()) return;
    saveMutation.mutate({
      payload: parsed.data,
      file: photoFile,
      previousPhotoPath: editing?.photo_path ?? null,
    });
  }

  const photoFormatLabel = CLINICIAN_PHOTO_MIME_TYPES.map((mime) =>
    mime.replace("image/", ""),
  ).join(", ");

  return (
    <div>
      <AdminPageHeader
        title="Clinician profiles"
        description="Manage the public clinician directory and profile pages. These records do not create or change staff login accounts."
        actions={
          <Button size="sm" onClick={openNewEditor} disabled={isBusy}>
            <Plus className="mr-2 h-4 w-4" /> Add clinician
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Public visibility requires both <strong className="text-foreground">Active</strong> and{" "}
            <strong className="text-foreground">Published</strong>.
          </span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search clinician profiles"
            placeholder="Search name, role, city, or URL"
            className="pl-9"
          />
        </div>
      </div>

      {photoCleanup && !cleanupDialogOpen && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">
            An unused uploaded photo for <strong>{photoCleanup.clinicianName}</strong> is pending
            cleanup.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCleanupDialogOpen(true)}>
              Retry photo deletion
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPhotoCleanup(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
        aria-label="Clinician profiles"
      >
        {profilesQuery.isLoading ? (
          <div className="space-y-3 p-4" aria-label="Loading clinician profiles" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : profilesQuery.isError ? (
          <div role="alert" className="p-8 text-center">
            <p className="font-medium text-foreground">Clinician profiles could not be loaded.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage(profilesQuery.error)}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              disabled={profilesQuery.isFetching}
              onClick={() => void profilesQuery.refetch()}
            >
              {profilesQuery.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Try again
            </Button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
              No clinician profiles yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Add a public clinician profile here. This will not create a staff login or
              authentication account.
            </p>
            <Button className="mt-5" onClick={openNewEditor}>
              <Plus className="mr-2 h-4 w-4" /> Add the first clinician
            </Button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-foreground">No profiles match “{search}”.</p>
            <Button variant="ghost" className="mt-2" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinician</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Public page</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => {
                  const isVisible = profile.is_active && profile.is_published;
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="min-w-[260px]">
                        <div className="flex items-center gap-3">
                          {profile.resolved_photo_url ? (
                            <img
                              src={profile.resolved_photo_url}
                              alt=""
                              className="h-11 w-11 rounded-xl border border-border object-cover"
                            />
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                              <UserRound className="h-5 w-5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {profile.full_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {profile.designation}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {profile.service_mode === "online_only"
                                ? "Online-only"
                                : "Clinic-based"}
                              {" · "}
                              {profile.city?.trim() || "Multan"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={profile.is_active ? "secondary" : "outline"}>
                            {profile.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={profile.is_published ? "secondary" : "outline"}>
                            {profile.is_published ? "Published" : "Draft"}
                          </Badge>
                          {isVisible && <span className="sr-only">Publicly visible</span>}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {profile.display_order}
                      </TableCell>
                      <TableCell>
                        {isVisible ? (
                          <a
                            href={`/${profile.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            View <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not public</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          {!profile.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={activateMutation.isPending || operationRef.current}
                              onClick={() => {
                                if (beginOperation()) activateMutation.mutate(profile);
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          {(profile.is_active || profile.is_published) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${profile.full_name} from the public website`}
                              className="text-rose-600"
                              disabled={deactivateMutation.isPending || operationRef.current}
                              onClick={() => {
                                if (!operationRef.current) setDeactivateTarget(profile);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Edit ${profile.full_name}`}
                            disabled={isBusy}
                            onClick={() => openEditEditor(profile)}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (operationRef.current) return;
          if (open) setDialogOpen(true);
          else closeEditor();
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.full_name}` : "Add clinician profile"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Public profile content only. Staff access and login accounts are managed separately.
            </p>
          </DialogHeader>

          <form onSubmit={submitForm} className="space-y-6">
            <fieldset disabled={isBusy} className="contents" aria-busy={isBusy}>
              <FormSection title="Public identity">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="clinician-name"
                    label="Display name"
                    required
                    value={form.name}
                    onChange={(value) => updateForm({ name: value })}
                    maxLength={120}
                  />
                  <TextField
                    id="clinician-full-name"
                    label="Full name"
                    required
                    value={form.full_name}
                    onChange={(value) => updateForm({ full_name: value })}
                    maxLength={180}
                  />
                  <TextField
                    id="clinician-designation"
                    label="Designation"
                    required
                    value={form.designation}
                    onChange={(value) => updateForm({ designation: value })}
                    maxLength={160}
                    placeholder="Clinical Physiotherapist"
                  />
                  <TextField
                    id="clinician-title"
                    label="Professional title"
                    required
                    value={form.professional_title}
                    onChange={(value) => updateForm({ professional_title: value })}
                    maxLength={180}
                    placeholder="Physiotherapist in Multan | DPT"
                  />
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <TextField
                          id="clinician-slug"
                          label="Public page URL slug"
                          required
                          value={form.slug}
                          onChange={(value) => updateForm({ slug: value })}
                          maxLength={100}
                          placeholder="dr-example-pt-multan"
                          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mb-0.5 shrink-0"
                        onClick={() =>
                          updateForm({ slug: slugFromClinicianName(form.full_name || form.name) })
                        }
                        disabled={!form.full_name.trim() && !form.name.trim()}
                      >
                        Generate slug
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The public profile URL will be painfixphysiotherapy.com/
                      {form.slug || "your-slug"}. Use lowercase letters, numbers, and hyphens.
                    </p>
                  </div>
                  <TextField
                    id="clinician-credentials"
                    label="Credentials"
                    value={form.credentials}
                    onChange={(value) => updateForm({ credentials: value })}
                    maxLength={240}
                    placeholder="DPT (Doctor of Physical Therapy)"
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="clinician-service-mode">Service mode *</Label>
                    <select
                      id="clinician-service-mode"
                      value={form.service_mode}
                      onChange={(event) =>
                        updateForm({
                          service_mode:
                            event.target.value === "online_only" ? "online_only" : "clinic",
                        })
                      }
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="clinic">Clinic-based</option>
                      <option value="online_only">Online-only</option>
                    </select>
                  </div>
                  <TextField
                    id="clinician-city"
                    label="City"
                    required
                    value={form.city}
                    onChange={(value) => updateForm({ city: value })}
                    maxLength={120}
                    placeholder="Multan"
                  />
                  <TextField
                    id="clinician-years"
                    label="Years of experience"
                    type="number"
                    min={0}
                    max={80}
                    step={1}
                    value={form.years_experience}
                    onChange={(value) => updateForm({ years_experience: value })}
                    placeholder="Leave blank if not stated"
                  />
                </div>
              </FormSection>

              <FormSection title="Biography and areas of practice">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextAreaField
                    id="clinician-bio"
                    label="Biography"
                    value={form.bio}
                    onChange={(value) => updateForm({ bio: value })}
                    maxLength={5000}
                    rows={4}
                  />
                  <TextAreaField
                    id="clinician-seo-bio"
                    label="Search summary"
                    value={form.seo_bio}
                    onChange={(value) => updateForm({ seo_bio: value })}
                    maxLength={5000}
                    rows={4}
                    hint="Used as a search-friendly summary when supplied."
                  />
                  <ListField
                    id="clinician-specialties"
                    label="Specialties"
                    value={form.specialtiesText}
                    onChange={(value) => updateForm({ specialtiesText: value })}
                  />
                  <ListField
                    id="clinician-tags"
                    label="Public tags"
                    value={form.tagsText}
                    onChange={(value) => updateForm({ tagsText: value })}
                  />
                  <ListField
                    id="clinician-qualifications"
                    label="Qualifications"
                    value={form.qualificationsText}
                    onChange={(value) => updateForm({ qualificationsText: value })}
                  />
                  <ListField
                    id="clinician-experience"
                    label="Experience"
                    value={form.experienceText}
                    onChange={(value) => updateForm({ experienceText: value })}
                  />
                  <ListField
                    id="clinician-training"
                    label="Training"
                    value={form.trainingText}
                    onChange={(value) => updateForm({ trainingText: value })}
                    hint="Include relevant training such as dry needling, one item per line."
                  />
                  <ListField
                    id="clinician-research"
                    label="Research"
                    value={form.researchText}
                    onChange={(value) => updateForm({ researchText: value })}
                  />
                  <ListField
                    id="clinician-expertise"
                    label="Areas of expertise"
                    value={form.expertiseText}
                    onChange={(value) => updateForm({ expertiseText: value })}
                  />
                  <ListField
                    id="clinician-conditions"
                    label="Conditions treated"
                    value={form.conditions_treatedText}
                    onChange={(value) => updateForm({ conditions_treatedText: value })}
                  />
                </div>
              </FormSection>

              <FormSection title="Profile page content">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ListField
                    id="clinician-intro"
                    label="Profile introduction"
                    value={form.introText}
                    onChange={(value) => updateForm({ introText: value })}
                    hint="One paragraph per line."
                    rows={5}
                  />
                  <ListField
                    id="clinician-approach"
                    label="Treatment approach"
                    value={form.approachText}
                    onChange={(value) => updateForm({ approachText: value })}
                    hint="One paragraph per line."
                    rows={5}
                  />
                  <TextField
                    id="clinician-meta-title"
                    label="Search title"
                    value={form.meta_title}
                    onChange={(value) => updateForm({ meta_title: value })}
                    maxLength={200}
                  />
                  <TextField
                    id="clinician-meta-description"
                    label="Search description"
                    value={form.meta_description}
                    onChange={(value) => updateForm({ meta_description: value })}
                    maxLength={320}
                  />
                </div>
              </FormSection>

              <FormSection title="Contact and portrait">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="clinician-phone"
                    label="Display phone"
                    value={form.phone_display}
                    onChange={(value) => updateForm({ phone_display: value })}
                    maxLength={40}
                    placeholder="0314-3039582"
                  />
                  <TextField
                    id="clinician-whatsapp"
                    label="WhatsApp number (international digits)"
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={(value) => updateForm({ whatsapp_number: value.replace(/\D/g, "") })}
                    maxLength={15}
                    placeholder="923143039582"
                    hint="Digits only, including country code."
                  />
                </div>

                <div className="mt-4 rounded-xl border border-border p-4">
                  <Label htmlFor="clinician-photo" className="font-semibold">
                    Profile photo
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {photoFormatLabel}; maximum 5 MiB. Images upload to the dedicated clinician
                    photo bucket using a server-issued signed URL.
                  </p>
                  {editing?.resolved_photo_url && !photoFile && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={editing.resolved_photo_url}
                        alt={`Current portrait of ${editing.full_name}`}
                        className="h-16 w-16 rounded-xl border border-border object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Current public portrait
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="mt-1 h-8 px-2 text-rose-600"
                          onClick={() => {
                            if (!operationRef.current) setClearPhotoTarget(editing);
                          }}
                          disabled={clearPhotoMutation.isPending}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Remove photo
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Input
                      id="clinician-photo"
                      type="file"
                      accept={CLINICIAN_PHOTO_MIME_TYPES.join(",")}
                      onChange={(event) => {
                        handlePhotoSelection(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                      className="max-w-xl"
                    />
                    {photoFile && (
                      <>
                        <span className="text-xs text-muted-foreground">
                          Selected: {photoFile.name}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setPhotoFile(null)}
                        >
                          Cancel selection
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Publication and ordering">
                <div className="grid gap-5 sm:grid-cols-3 sm:items-start">
                  <SwitchField
                    id="clinician-active"
                    label="Active"
                    description="Inactive profiles do not appear publicly."
                    checked={form.is_active}
                    onCheckedChange={(checked) => updateForm({ is_active: checked })}
                  />
                  <SwitchField
                    id="clinician-published"
                    label="Published"
                    description="Draft profiles stay out of public listings."
                    checked={form.is_published}
                    onCheckedChange={(checked) => updateForm({ is_published: checked })}
                  />
                  <TextField
                    id="clinician-order"
                    label="Display order"
                    type="number"
                    min={0}
                    max={100000}
                    step={1}
                    value={form.display_order}
                    onChange={(value) => updateForm({ display_order: value })}
                  />
                </div>
              </FormSection>

              {formError && (
                <p
                  ref={formErrorRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-700"
                >
                  {formError}
                </p>
              )}

              <DialogFooter className="sticky bottom-0 -mx-1 border-t border-border bg-card/95 px-1 py-3 backdrop-blur">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeEditor}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editing ? (
                    <Pencil className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {saveMutation.isPending ? "Saving…" : "Save profile"}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => {
          if (!open && !operationRef.current) setDeactivateTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {deactivateTarget?.full_name} from the public website?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This safely deactivates and unpublishes the public clinician profile. The profile
              record, uploaded photo, and any separate staff login account are not deleted. You can
              reactivate the profile later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deactivateMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deactivateTarget) {
                  if (editing?.id === deactivateTarget.id) {
                    setDeactivateTarget(null);
                    submitForm(event, true);
                  } else if (beginOperation()) deactivateMutation.mutate(deactivateTarget);
                }
              }}
            >
              {deactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove from website
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!clearPhotoTarget}
        onOpenChange={(open) => {
          if (!open && !operationRef.current) setClearPhotoTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this clinician portrait?</AlertDialogTitle>
            <AlertDialogDescription>
              The portrait reference will be removed from the public profile. If it is an uploaded
              image, you will be asked separately whether to permanently delete the now-unused file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearPhotoMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={clearPhotoMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (clearPhotoTarget && beginOperation())
                  clearPhotoMutation.mutate(clearPhotoTarget);
              }}
            >
              {clearPhotoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear portrait
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cleanupDialogOpen && !!photoCleanup}
        onOpenChange={(open) => {
          if (!operationRef.current) setCleanupDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the unused uploaded photo?</AlertDialogTitle>
            <AlertDialogDescription>
              The profile for {photoCleanup?.clinicianName} no longer references this uploaded
              image. Deleting it permanently removes that object from clinician photo storage. The
              profile record is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletePhotoMutation.isPending}
              onClick={() => {
                setCleanupDialogOpen(false);
                setPhotoCleanup(null);
              }}
            >
              Keep file
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deletePhotoMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (photoCleanup && beginOperation()) deletePhotoMutation.mutate(photoCleanup);
              }}
            >
              {deletePhotoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete photo file
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const RESERVED_ROOT_SLUGS = new Set([
  "about",
  "auth",
  "best-physiotherapist-in-multan",
  "blog",
  "book-appointment",
  "conditions",
  "contact",
  "diet-nutrition",
  "fitness",
  "fitness-assessment",
  "fitness-rehabilitation",
  "fitness-resources",
  "gallery",
  "health-calculators",
  "home-visit",
  "membership",
  "our-team",
  "physiotherapist-in-multan",
  "physiotherapy-clinic-in-multan",
  "privacy",
  "reset-password",
  "search",
  "services",
  "success-stories",
  "terms",
]);

function isReservedRootSlug(slug: string): boolean {
  return RESERVED_ROOT_SLUGS.has(slug);
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-6 last:border-0 last:pb-0">
      <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  required,
  ...inputProps
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
} & Omit<React.ComponentProps<typeof Input>, "id" | "value" | "onChange">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        {...inputProps}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  hint,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
} & Omit<React.ComponentProps<typeof Textarea>, "id" | "value" | "onChange">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ListField({
  id,
  label,
  value,
  onChange,
  hint = "One item per line.",
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <TextAreaField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      hint={hint}
      rows={rows}
    />
  );
}

function SwitchField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="font-semibold">
          {label}
        </Label>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}
