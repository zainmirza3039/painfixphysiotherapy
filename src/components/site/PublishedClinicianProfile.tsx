import { Link } from "@tanstack/react-router";
import type { PublicClinicianProfile } from "@/admin/clinician-profile.contract";
import { DoctorProfile } from "@/components/site/DoctorProfile";
import { PageLayout } from "@/components/site/PageLayout";
import { toClinicianView } from "@/lib/clinician-view";

export function PublishedClinicianProfile({ profile }: { profile: PublicClinicianProfile }) {
  return <DoctorProfile doc={toClinicianView(profile)} />;
}

export function ClinicianProfileNotFound() {
  return (
    <PageLayout>
      <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:py-40">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Clinician profile not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          This profile may be unpublished or no longer available.
        </p>
        <Link
          to="/our-team"
          className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          View the clinician directory
        </Link>
      </section>
    </PageLayout>
  );
}
