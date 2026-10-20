import type { ApplicationStatus, Certificate } from "./internships.contract";

/** UI choices mirror database transitions; the database remains authoritative. */
export function applicationDecisionChoices(status: ApplicationStatus): ApplicationStatus[] {
  const next: Record<ApplicationStatus, ApplicationStatus[]> = {
    submitted: ["under_review", "rejected", "withdrawn"],
    under_review: ["shortlisted", "accepted", "rejected", "withdrawn"],
    shortlisted: ["under_review", "accepted", "rejected", "withdrawn"],
    accepted: ["withdrawn"],
    rejected: [],
    withdrawn: [],
    completed: [],
  };
  return [status, ...next[status]];
}

export function replacementPredecessor(
  certificates: Certificate[],
  type: Certificate["type"],
  sourceId: string,
): Certificate | undefined {
  return certificates.find(
    (certificate) =>
      certificate.type === type &&
      certificate.source_id === sourceId &&
      certificate.status === "revoked" &&
      !certificates.some((successor) => successor.replacement_for === certificate.id),
  );
}
