import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Program } from "@/lib/internships.contract";
import { isApplicationOpen } from "@/lib/internships.contract";
import { serviceImages } from "@/data/serviceImages";

export function InternshipCard({ program }: { program: Program }) {
  const open = isApplicationOpen(program);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft">
      <div className="aspect-[16/8] overflow-hidden bg-surface">
        <img
          src={serviceImages["exercise-therapy"]}
          alt="Physiotherapist demonstrating a therapeutic exercise during supervised clinical learning"
          width={800}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary">
            {program.discipline}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}
          >
            {open ? "Applications open" : "Applications closed"}
          </span>
        </div>
        <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
          {program.title}
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-muted-foreground">
          {program.description}
        </p>
        <dl className="mt-5 grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-secondary" />
            <dt className="sr-only">Duration</dt>
            <dd>{program.duration}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary" />
            <dt className="sr-only">Location</dt>
            <dd>{program.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <dt className="sr-only">Seats</dt>
            <dd>{program.seats} seats</dd>
          </div>
        </dl>
        <Link
          to="/internships/$slug"
          params={{ slug: program.slug }}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          View program <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
