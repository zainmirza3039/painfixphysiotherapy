import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { ProgramDetail } from "@/components/internships/ProgramDetail";
import {
  anonymizeInternshipApplication,
  listInternshipAdminData,
  reviewInternshipApplication,
  saveExperienceRecord,
  saveInternshipParticipant,
  saveInternshipProgram,
  issueCertificate,
  revokeCertificate,
} from "@/lib/internships.functions";
import type {
  Application,
  Certificate,
  CertificateEvent,
  ExperienceRecord,
  Participant,
  Program,
} from "@/lib/internships.contract";
import {
  experienceFormToPayload,
  experienceToForm,
  participantFormToPayload,
  participantToForm,
  programFormToPayload,
  programToForm,
  type ExperienceForm,
  type ParticipantForm,
  type ProgramForm,
} from "@/admin/internship-form";
import { applicationDecisionChoices, replacementPredecessor } from "@/lib/internship-workflow";

type AdminData = {
  programs: Program[];
  applications: Application[];
  participants: Participant[];
  experience: ExperienceRecord[];
  certificates: Certificate[];
  events: CertificateEvent[];
};
type View = "programs" | "applications" | "participants" | "experience" | "certificates";
type Fn = (input: { data: unknown }) => Promise<unknown>;
const asFn = (fn: unknown) => fn as Fn;
const text = (value: unknown) => (value == null || value === "" ? "—" : String(value));
const fmtDate = (value: unknown) => (value ? new Date(String(value)).toLocaleDateString() : "—");
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "The request could not be completed.";
const confirmAction = (message: string) => typeof window !== "undefined" && window.confirm(message);
const defaultExperienceType = { engagement_type: "internship" as const };

export function InternshipAdminPage({ view }: { view: View }) {
  const client = useQueryClient();
  const list = useServerFn(listInternshipAdminData);
  const query = useQuery({ queryKey: ["admin", "internships"], queryFn: () => list() });
  const data = query.data as AdminData | undefined;
  const invalidate = () => void client.invalidateQueries({ queryKey: ["admin", "internships"] });
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <ErrorState message={errorText(query.error)} retry={() => void query.refetch()} />;
  return (
    <div className="space-y-5">
      <ViewBody
        view={view}
        data={
          data ?? {
            programs: [],
            applications: [],
            participants: [],
            experience: [],
            certificates: [],
            events: [],
          }
        }
        invalidate={invalidate}
      />
    </div>
  );
}
function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <h2 className="font-semibold text-rose-900">Could not load internship data</h2>
      <p className="mt-2 text-sm text-rose-800">{message}</p>
      <Button className="mt-4" variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
function ViewBody({
  view,
  data,
  invalidate,
}: {
  view: View;
  data: AdminData;
  invalidate: () => void;
}) {
  if (view === "programs") return <Programs programs={data.programs} invalidate={invalidate} />;
  if (view === "applications")
    return (
      <Applications
        applications={data.applications}
        programs={data.programs}
        invalidate={invalidate}
      />
    );
  if (view === "participants")
    return (
      <Participants
        participants={data.participants}
        applications={data.applications}
        programs={data.programs}
        invalidate={invalidate}
      />
    );
  if (view === "experience")
    return <Experience records={data.experience} invalidate={invalidate} />;
  return (
    <Certificates
      certificates={data.certificates}
      participants={data.participants}
      experience={data.experience}
      events={data.events}
      invalidate={invalidate}
    />
  );
}

function Programs({ programs, invalidate }: { programs: Program[]; invalidate: () => void }) {
  const save = asFn(useServerFn(saveInternshipProgram));
  const [editing, setEditing] = useState<Program | null>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Program | null>(null);
  const action = async (
    program: Program,
    status: Program["status"],
    applications_open: boolean,
  ) => {
    if (
      !confirmAction(
        `${status === "published" ? "Publish" : status === "archived" ? "Archive" : "Close"} ${program.title}?`,
      )
    )
      return;
    try {
      await save({
        data: programFormToPayload({ ...programToForm(program), status, applications_open }),
      });
      invalidate();
      toast.success("Program updated");
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        title="Internship Programs"
        description="Draft, review, publish, and close verified internship offerings."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            New program
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {programs.length === 0 ? (
          <Empty label="No internship programs yet." />
        ) : (
          programs.map((program) => (
            <article key={program.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{program.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {program.discipline} · {program.duration}
                  </p>
                </div>
                <Badge variant="secondary">{program.status}</Badge>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {program.description}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Info label="Delivery" value={program.delivery_mode} />
                <Info label="Seats" value={text(program.seats)} />
                <Info label="Deadline" value={fmtDate(program.application_close_at)} />
                <Info label="Applications" value={program.applications_open ? "Open" : "Closed"} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(program);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreview(program)}>
                  Preview
                </Button>
                {program.status === "draft" && (
                  <Button size="sm" onClick={() => void action(program, "published", true)}>
                    Publish
                  </Button>
                )}
                {program.status === "published" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void action(program, "closed", false)}
                  >
                    Close
                  </Button>
                )}
                {program.status !== "archived" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void action(program, "archived", false)}
                  >
                    Archive
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <ProgramDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        program={editing}
        save={save}
        invalidate={invalidate}
      />
      <Dialog open={Boolean(preview)} onOpenChange={(value) => !value && setPreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Read-only program preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <>
              <Badge variant="secondary">Draft preview — not publicly available</Badge>
              <ProgramDetail program={preview} disableApplication />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function ProgramDialog({
  open,
  onOpenChange,
  program,
  save,
  invalidate,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  program: Program | null;
  save: Fn;
  invalidate: () => void;
}) {
  const [form, setForm] = useState<ProgramForm>(() => programToForm(program));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setForm(programToForm(program));
    setError("");
  }, [program]);
  const set = <K extends keyof ProgramForm>(key: K, value: ProgramForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      setBusy(true);
      await save({ data: programFormToPayload(form) });
      invalidate();
      onOpenChange(false);
      toast.success("Program saved");
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit internship program" : "Create internship program"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required value={form.title} onChange={(v) => set("title", v)} />
          <Field label="URL slug" required value={form.slug} onChange={(v) => set("slug", v)} />
          <Field
            label="Discipline"
            required
            value={form.discipline}
            onChange={(v) => set("discipline", v)}
          />
          <Field
            label="Duration"
            required
            value={form.duration}
            onChange={(v) => set("duration", v)}
          />
          <SelectField
            label="Delivery mode"
            value={form.delivery_mode}
            options={["on_site", "online", "hybrid"]}
            onChange={(v) => set("delivery_mode", v as ProgramForm["delivery_mode"])}
          />
          <Field label="Location" value={form.location} onChange={(v) => set("location", v)} />
          <Field
            label="Seats"
            type="number"
            min="1"
            value={form.seats}
            onChange={(v) => set("seats", v)}
          />
          <Field label="Fees" value={form.fees} onChange={(v) => set("fees", v)} />
          <Field
            label="Application opens"
            type="datetime-local"
            value={form.application_open_at}
            onChange={(v) => set("application_open_at", v)}
          />
          <Field
            label="Application closes"
            type="datetime-local"
            value={form.application_close_at}
            onChange={(v) => set("application_close_at", v)}
          />
          <Field
            label="Minimum attendance (%)"
            type="number"
            min="0"
            max="100"
            value={form.minimum_attendance}
            onChange={(v) => set("minimum_attendance", v)}
          />
          <SelectField
            label="Status"
            value={form.status}
            options={["draft", "published", "closed", "archived"]}
            onChange={(v) => set("status", v as ProgramForm["status"])}
          />
          <Check
            label="Applications open"
            checked={form.applications_open}
            onChange={(v) => set("applications_open", v)}
          />
          <LongField
            label="Description"
            required
            value={form.description}
            onChange={(v) => set("description", v)}
          />
          <LongField
            label="Eligibility"
            required
            value={form.eligibility}
            onChange={(v) => set("eligibility", v)}
          />
          <LongField
            label="Objectives (one per line)"
            required
            value={form.objectives}
            onChange={(v) => set("objectives", v)}
          />
          <LongField
            label="Requirements (one per line)"
            required
            value={form.requirements}
            onChange={(v) => set("requirements", v)}
          />
          <LongField
            label="Required documents (one per line)"
            required
            value={form.required_documents}
            onChange={(v) => set("required_documents", v)}
          />
          <LongField
            label="Selection criteria"
            required
            value={form.selection_criteria}
            onChange={(v) => set("selection_criteria", v)}
          />
          <LongField
            label="Completion criteria"
            required
            value={form.completion_criteria}
            onChange={(v) => set("completion_criteria", v)}
          />
          <LongField label="Schedule" value={form.schedule} onChange={(v) => set("schedule", v)} />
          <Field
            label="Supervisor"
            value={form.supervisor}
            onChange={(v) => set("supervisor", v)}
          />
          <div className="sm:col-span-2">
            <Label>FAQs</Label>
            <div className="mt-2 space-y-2">
              {form.faqs.map((faq, index) => (
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={`faq-${index}`}>
                  <Input
                    aria-label={`FAQ question ${index + 1}`}
                    value={faq.q}
                    onChange={(e) =>
                      set(
                        "faqs",
                        form.faqs.map((item, i) =>
                          i === index ? { ...item, q: e.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Question"
                  />
                  <Input
                    aria-label={`FAQ answer ${index + 1}`}
                    value={faq.a}
                    onChange={(e) =>
                      set(
                        "faqs",
                        form.faqs.map((item, i) =>
                          i === index ? { ...item, a: e.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Answer"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      set(
                        "faqs",
                        form.faqs.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => set("faqs", [...form.faqs, { q: "", a: "" }])}
              >
                Add FAQ
              </Button>
            </div>
          </div>
          {error && (
            <p role="alert" className="sm:col-span-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Applications({
  applications,
  programs,
  invalidate,
}: {
  applications: Application[];
  programs: Program[];
  invalidate: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const rows = applications.filter((application) => {
    const program = programs.find((item) => item.id === application.program_id);
    return `${application.reference} ${application.full_name} ${application.email} ${application.status} ${program?.title ?? application.program_slug}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });
  return (
    <>
      <AdminPageHeader
        title="Internship Applications"
        description="Review submissions, record decisions, and keep internal notes private."
      />
      <Input
        aria-label="Search applications"
        placeholder="Search reference, applicant, program, or status"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="p-3">Applicant</th>
              <th className="p-3">Program</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((application) => (
              <tr key={application.id} className="border-b last:border-0">
                <td className="p-3 font-medium">
                  {application.full_name}
                  <div className="text-xs text-muted-foreground">
                    {application.reference} · {application.email}
                  </div>
                </td>
                <td className="p-3">
                  {programs.find((program) => program.id === application.program_id)?.title ??
                    application.program_slug}
                </td>
                <td className="p-3">{fmtDate(application.created_at)}</td>
                <td className="p-3">
                  <Badge variant="secondary">{application.status}</Badge>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelected(application)}>
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty label="No applications match your search." />}
      </div>
      <ApplicationDialog
        key={selected?.id ?? "closed"}
        application={selected}
        close={() => setSelected(null)}
        invalidate={invalidate}
      />
    </>
  );
}
function ApplicationDialog({
  application,
  close,
  invalidate,
}: {
  application: Application | null;
  close: () => void;
  invalidate: () => void;
}) {
  const review = asFn(useServerFn(reviewInternshipApplication));
  const anonymize = useServerFn(anonymizeInternshipApplication);
  const [status, setStatus] = useState<Application["status"]>(application?.status ?? "submitted");
  const [notes, setNotes] = useState(application?.internal_notes ?? "");
  const [busy, setBusy] = useState(false);
  if (!application) return null;
  const removePersonalData = async () => {
    const reason = window.prompt(
      "Private retention/deletion decision reason (do not enter applicant data):",
    );
    if (
      !reason?.trim() ||
      !confirmAction(
        "Permanently anonymize this rejected/withdrawn applicant's personal details? Credential sources cannot be removed.",
      )
    )
      return;
    setBusy(true);
    try {
      await anonymize({ data: { id: application.id, reason: reason.trim() } });
      invalidate();
      close();
      toast.success("Application personal details anonymized");
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
    if (!confirmAction(`Save ${status} decision for ${application.full_name}?`)) return;
    try {
      setBusy(true);
      await review({ data: { id: application.id, status, internal_notes: notes.trim() || null } });
      invalidate();
      close();
      toast.success("Application review saved");
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(value) => !value && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review application — {application.reference}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-sm">
          <Info label="Applicant" value={`${application.full_name} · ${application.email}`} />
          <Info label="Phone / city" value={`${application.phone} · ${application.city}`} />
          <Info
            label="Education"
            value={`${application.degree_program} · ${application.educational_institution} · ${application.academic_status}`}
          />
          <Info label="Availability" value={application.availability} />
          <Info label="Clinical exposure" value={application.clinical_exposure ?? "—"} />
          <Info label="Motivation" value={application.motivation} />
          <div>
            <Label htmlFor="application-status">Decision status</Label>
            <select
              id="application-status"
              className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              value={status}
              onChange={(event) => setStatus(event.target.value as Application["status"])}
            >
              {applicationDecisionChoices(application.status).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="internal-notes">Private internal notes</Label>
            <Textarea
              id="internal-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <DialogFooter>
            {["rejected", "withdrawn"].includes(application.status) && (
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => void removePersonalData()}
              >
                Anonymize personal data
              </Button>
            )}
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={busy}>
              {busy ? "Saving…" : "Save review"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Participants({
  participants,
  applications,
  programs,
  invalidate,
}: {
  participants: Participant[];
  applications: Application[];
  programs: Program[];
  invalidate: () => void;
}) {
  const save = asFn(useServerFn(saveInternshipParticipant));
  const [editing, setEditing] = useState<Participant | null>(null);
  return (
    <>
      <AdminPageHeader
        title="Participants & Completion"
        description="Track accepted interns, attendance, sign-offs, and completion decisions."
        actions={<Button onClick={() => setEditing(null)}>New participant</Button>}
      />
      <ParticipantForm
        key={editing?.id ?? "new"}
        initial={editing}
        applications={applications.filter(
          (application) =>
            (application.status === "accepted" &&
              !participants.some((participant) => participant.application_id === application.id)) ||
            application.id === editing?.application_id,
        )}
        programs={programs}
        save={save}
        invalidate={invalidate}
        close={() => setEditing(null)}
      />
      <RecordList
        rows={participants}
        label="participant records"
        onEdit={(row) => {
          if ("application_id" in row) setEditing(row);
        }}
      />
    </>
  );
}
function ParticipantForm({
  initial,
  applications,
  programs,
  save,
  invalidate,
  close,
}: {
  initial: Participant | null;
  applications: Application[];
  programs: Program[];
  save: Fn;
  invalidate: () => void;
  close: () => void;
}) {
  const [form, setForm] = useState<ParticipantForm>(() => participantToForm(initial));
  const set = <K extends keyof ParticipantForm>(key: K, value: ParticipantForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const selected = applications.find((application) => application.id === form.application_id);
  useEffect(() => {
    if (selected)
      setForm((current) => ({
        ...current,
        full_name: selected.full_name,
        program_id: selected.program_id ?? current.program_id,
      }));
  }, [selected]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      form.completion_approved &&
      !confirmAction(
        "Approve completion based on the recorded dates, attendance and assessment sign-off? Your administrator identity is recorded.",
      )
    )
      return;
    try {
      await save({ data: participantFormToPayload(form) });
      invalidate();
      toast.success("Participant record saved");
      close();
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
      <SelectField
        label="Accepted application"
        required
        disabled={Boolean(initial)}
        value={form.application_id}
        options={applications.map((application) => application.id)}
        optionLabels={Object.fromEntries(
          applications.map((application) => [
            application.id,
            `${application.full_name} — ${application.reference}`,
          ]),
        )}
        onChange={(v) => set("application_id", v)}
      />
      <Info
        label="Program"
        value={
          programs.find((program) => program.id === form.program_id)?.title ??
          "Select an accepted application"
        }
      />
      <Info label="Full name" value={form.full_name} />
      <Field
        label="Start date"
        type="date"
        value={form.start_date ?? ""}
        onChange={(v) => set("start_date", v || null)}
      />
      <Field
        label="End date"
        type="date"
        value={form.end_date ?? ""}
        onChange={(v) => set("end_date", v || null)}
      />
      <Field
        label="Supervisor"
        value={form.supervisor ?? ""}
        onChange={(v) => set("supervisor", v || null)}
      />
      <Field
        label="Attendance percent"
        type="number"
        min="0"
        max="100"
        value={form.attendance_percent ?? ""}
        onChange={(v) => set("attendance_percent", v ? Number(v) : null)}
      />
      <SelectField
        label="Completion status"
        value={form.completion_status}
        options={["active", "completed", "not_completed", "withdrawn"]}
        onChange={(v) => set("completion_status", v as ParticipantForm["completion_status"])}
      />
      <Check
        label="Assessment signed off"
        checked={form.assessment_signed_off}
        onChange={(v) => set("assessment_signed_off", v)}
      />
      <Check
        label="Completion approved"
        checked={form.completion_approved}
        onChange={(v) => set("completion_approved", v)}
      />
      <LongField label="Notes" value={form.notes ?? ""} onChange={(v) => set("notes", v || null)} />
      <Button type="submit" className="sm:col-span-2">
        Save participant record
      </Button>
    </form>
  );
}

function Experience({
  records,
  invalidate,
}: {
  records: ExperienceRecord[];
  invalidate: () => void;
}) {
  const save = asFn(useServerFn(saveExperienceRecord));
  const [editing, setEditing] = useState<ExperienceRecord | null>(null);
  return (
    <>
      <AdminPageHeader
        title="Professional Experience"
        description="Maintain verified engagement records without treating interns as employees by default."
        actions={<Button onClick={() => setEditing(null)}>New record</Button>}
      />
      <ExperienceForm
        key={editing?.id ?? "new"}
        initial={editing}
        save={save}
        invalidate={invalidate}
        close={() => setEditing(null)}
      />
      <RecordList
        rows={records}
        label="experience records"
        onEdit={(row) => {
          if ("role" in row) setEditing(row);
        }}
      />
    </>
  );
}
function ExperienceForm({
  initial,
  save,
  invalidate,
  close,
}: {
  initial: ExperienceRecord | null;
  save: Fn;
  invalidate: () => void;
  close: () => void;
}) {
  const [form, setForm] = useState<ExperienceForm>(() => experienceToForm(initial));
  const set = <K extends keyof ExperienceForm>(key: K, value: ExperienceForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      form.approved &&
      !confirmAction(
        "Approve this evidence-backed engagement record? Your administrator identity is recorded as approver.",
      )
    )
      return;
    try {
      await save({ data: experienceFormToPayload(form) });
      invalidate();
      toast.success("Experience record saved");
      close();
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
      <Field
        label="Full name"
        required
        value={form.full_name}
        onChange={(v) => set("full_name", v)}
      />
      <Field
        label="Role / designation"
        required
        value={form.role}
        onChange={(v) => set("role", v)}
      />
      <SelectField
        label="Engagement type"
        value={form.engagement_type}
        options={["internship", "employment", "training", "volunteer", "contract", "other"]}
        onChange={(v) => set("engagement_type", v as ExperienceForm["engagement_type"])}
      />
      <Field
        label="Verified start"
        type="date"
        value={form.start_date ?? ""}
        onChange={(v) => set("start_date", v || null)}
      />
      <Field
        label="Verified end"
        type="date"
        value={form.end_date ?? ""}
        onChange={(v) => set("end_date", v || null)}
      />
      <LongField
        label="Responsibilities"
        required
        value={form.responsibilities}
        onChange={(v) => set("responsibilities", v)}
      />
      <LongField
        label="Evidence summary"
        required
        value={form.evidence_summary}
        onChange={(v) => set("evidence_summary", v)}
      />
      <Check label="Verified" checked={form.verified} onChange={(v) => set("verified", v)} />
      <Check label="Approved" checked={form.approved} onChange={(v) => set("approved", v)} />
      <Button type="submit" className="sm:col-span-2">
        Save verified record
      </Button>
    </form>
  );
}

function Certificates({
  certificates,
  participants,
  experience,
  events,
  invalidate,
}: {
  certificates: Certificate[];
  participants: Participant[];
  experience: ExperienceRecord[];
  events: CertificateEvent[];
  invalidate: () => void;
}) {
  const issue = asFn(useServerFn(issueCertificate));
  const revoke = asFn(useServerFn(revokeCertificate));
  const [type, setType] = useState<"internship" | "experience">("internship");
  const [source, setSource] = useState("");
  const [signatory, setSignatory] = useState("");
  const [designation, setDesignation] = useState("");
  const [replacementReason, setReplacementReason] = useState("");
  const [issuing, setIssuing] = useState(false);
  const predecessor = replacementPredecessor(certificates, type, source);
  const eligible = (
    type === "internship"
      ? participants.filter(
          (participant) =>
            participant.completion_status === "completed" &&
            participant.completion_approved &&
            participant.assessment_signed_off &&
            participant.start_date &&
            participant.end_date,
        )
      : experience.filter(
          (record) => record.verified && record.approved && record.start_date && record.end_date,
        )
  ).filter(
    (record) =>
      !certificates.some(
        (certificate) =>
          certificate.type === type &&
          certificate.source_id === record.id &&
          certificate.status === "issued",
      ),
  );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!source || !signatory.trim() || !designation.trim()) return;
    if (predecessor && replacementReason.trim().length < 3) {
      toast.error("A documented replacement reason is required.");
      return;
    }
    if (!confirmAction("Issue this certificate from the approved eligible record?")) return;
    setIssuing(true);
    try {
      await issue({
        data: {
          type,
          source_id: source,
          signatory_name: signatory.trim(),
          signatory_designation: designation.trim(),
          ...(predecessor
            ? { replacement_for: predecessor.id, replacement_reason: replacementReason.trim() }
            : {}),
        },
      });
      setSource("");
      setReplacementReason("");
      invalidate();
      toast.success("Certificate issued");
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setIssuing(false);
    }
  };
  const pdf = async (certificate: Certificate, mode: "preview" | "download") => {
    try {
      const helper = await import("@/lib/certificate-pdf");
      if (mode === "preview") await helper.previewCertificatePdf(certificate);
      else await helper.downloadCertificatePdf(certificate);
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  const revokeOne = async (certificate: Certificate) => {
    const reason =
      typeof window !== "undefined"
        ? window.prompt("Private reason for revocation (required):")
        : null;
    if (!reason?.trim() || !confirmAction("Revoke this certificate? This cannot be undone."))
      return;
    try {
      await revoke({ data: { id: certificate.id, reason: reason.trim() } });
      invalidate();
      toast.success("Certificate revoked");
    } catch (error) {
      toast.error(errorText(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        title="Certificates"
        description="Issue only from eligible verified records and retain a clear revocation history."
      />
      <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <SelectField
          label="Certificate type"
          value={type}
          options={["internship", "experience"]}
          onChange={(v) => {
            setType(v as typeof type);
            setSource("");
            setReplacementReason("");
          }}
        />
        <SelectField
          label="Eligible source"
          required
          value={source}
          options={eligible.map((item) => item.id)}
          optionLabels={Object.fromEntries(
            eligible.map((item) => [
              item.id,
              `${item.full_name} — ${type === "internship" ? "completed approved" : "verified approved"}`,
            ]),
          )}
          onChange={(value) => {
            setSource(value);
            setReplacementReason("");
          }}
        />
        <Field label="Signatory name" required value={signatory} onChange={setSignatory} />
        <Field
          label="Signatory designation"
          required
          value={designation}
          onChange={setDesignation}
        />
        {predecessor && (
          <>
            <p className="sm:col-span-2 text-sm text-muted-foreground">
              This is a replacement for revoked certificate {predecessor.certificate_number}. Both
              records remain in the audit history.
            </p>
            <LongField
              label="Private replacement reason"
              required
              value={replacementReason}
              onChange={setReplacementReason}
            />
          </>
        )}
        <Button type="submit" className="sm:col-span-2" disabled={issuing || !source}>
          {issuing
            ? "Issuing…"
            : predecessor
              ? "Issue documented replacement"
              : "Issue certificate"}
        </Button>
      </form>
      <div className="space-y-3">
        {certificates.length === 0 ? (
          <Empty label="No certificates issued." />
        ) : (
          certificates.map((certificate) => (
            <div key={certificate.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{certificate.certificate_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {certificate.recipient_name} · {certificate.program_or_role} ·{" "}
                    {certificate.type} · issued {fmtDate(certificate.issued_at)} ·{" "}
                    {certificate.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void pdf(certificate, "preview")}
                  >
                    Preview / print
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void pdf(certificate, "download")}
                  >
                    Download PDF
                  </Button>
                  {certificate.status !== "revoked" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void revokeOne(certificate)}
                    >
                      Revoke
                    </Button>
                  )}
                  {certificate.status === "revoked" &&
                    !certificates.some(
                      (successor) => successor.replacement_for === certificate.id,
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setType(certificate.type);
                          setSource(certificate.source_id);
                          setReplacementReason("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Prepare replacement
                      </Button>
                    )}
                </div>
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium">Certificate history</summary>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {events
                    .filter((event) => event.certificate_id === certificate.id)
                    .map((event) => (
                      <li key={event.id}>
                        {event.event_type} · {fmtDate(event.created_at)}
                        {event.reason ? ` · ${event.reason}` : ""}
                      </li>
                    ))}
                </ul>
              </details>
              {certificate.status === "revoked" && (
                <p className="mt-2 text-xs text-rose-700">
                  Revoked: {certificate.revocation_reason ?? "No reason recorded"}. To replace it,
                  issue a new certificate only after selecting an eligible source and recording a
                  replacement reason.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        required={required}
        type={type}
        min={min}
        max={max}
        value={value == null ? "" : String(value)}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
function LongField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const id = `long-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="sm:col-span-2">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Textarea
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  optionLabels,
  onChange,
  required,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <select
        id={id}
        required={required}
        disabled={disabled}
        className="mt-1 h-10 w-full rounded-md border bg-background px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}
function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap text-foreground">{value}</dd>
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
function RecordList({
  rows,
  label,
  onEdit,
}: {
  rows: Array<Participant | ExperienceRecord>;
  label: string;
  onEdit: (row: Participant | ExperienceRecord) => void;
}) {
  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <Empty label={`No ${label} yet.`} />
      ) : (
        rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-xl border bg-card p-4"
          >
            <div>
              <p className="font-medium">{row.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {"role" in row
                  ? `${row.role} · ${fmtDate(row.start_date)} – ${fmtDate(row.end_date)}`
                  : `${row.completion_status} · ${fmtDate(row.start_date)} – ${fmtDate(row.end_date)}`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
              Edit
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
