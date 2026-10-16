interface ClinicianPortraitProps {
  photo: string | null;
  name: string;
  role: string;
  className?: string;
  loading?: "eager" | "lazy";
}

/** Render a real supplied portrait when available, otherwise a clearly non-photographic initials tile. */
export function ClinicianPortrait({
  photo,
  name,
  role,
  className = "",
  loading = "lazy",
}: ClinicianPortraitProps) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={`Professional portrait of ${name}, ${role} at PainFix Physiotherapy Clinic, Multan`}
        loading={loading}
        decoding="async"
        className={`object-cover object-top ${className}`}
      />
    );
  }

  const initials = name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      role="img"
      aria-label={`${name}, ${role}; portrait not provided`}
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-primary/15 via-accent to-secondary/20 ${className}`}
    >
      <span
        aria-hidden="true"
        className="font-heading text-5xl font-extrabold tracking-tight text-primary/80"
      >
        {initials}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-4 text-[10px] font-bold uppercase tracking-[0.24em] text-primary/55"
      >
        PainFix · DPT
      </span>
    </div>
  );
}
