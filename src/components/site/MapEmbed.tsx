import { Navigation } from "lucide-react";
import { MAP_EMBED_URL, MAP_DIRECTIONS_URL, CLINIC_NAME } from "./constants";

export function MapEmbed({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[1.75rem] border border-border shadow-soft ${className}`}>
      <iframe
        title={`Map showing the location of ${CLINIC_NAME}`}
        src={MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full sm:h-72"
        allowFullScreen
      />
      <a
        href={MAP_DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Navigation className="h-4 w-4" /> Get Directions
      </a>
    </div>
  );
}
