import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import photo1 from "@/assets/clinic-photo-1.webp";
import photo2 from "@/assets/clinic-photo-2.webp";
import photo3 from "@/assets/clinic-photo-3.webp";
import photo4 from "@/assets/clinic-photo-4.webp";
import photo5 from "@/assets/clinic-photo-5.webp";
import photo6 from "@/assets/clinic-photo-6.webp";
import exteriorImg from "@/assets/clinic-exterior.webp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Photo = {
  src: string;
  alt: string;
  caption: string;
  /** grid placement classes */
  span: string;
  /** object-position class override */
  pos?: string;
  w: number;
  h: number;
};

const photos: Photo[] = [
  {
    src: exteriorImg,
    alt: "Storefront exterior of PainFix Physiotherapy Clinic with signage in Shalimar Colony, Multan",
    caption: "Our Multan Clinic",
    span: "col-span-2 row-span-2",
    pos: "object-top",
    w: 1100,
    h: 1381,
  },
  {
    src: photo1,
    alt: "Physiotherapist treating a patient's leg with infrared heat therapy at PainFix Physiotherapy Clinic, Multan",
    caption: "Infrared Heat Therapy",
    span: "col-span-2 lg:col-span-1 lg:row-span-2",
    w: 1200,
    h: 1600,
  },
  {
    src: photo2,
    alt: "Clinical physiotherapist assessing a patient beside wall bars during a consultation",
    caption: "Patient Assessment",
    span: "col-span-1",
    w: 1050,
    h: 1400,
  },
  {
    src: photo3,
    alt: "Physiotherapist using a percussion massage device for muscle recovery",
    caption: "Instrument-Assisted Therapy",
    span: "col-span-1",
    w: 646,
    h: 1400,
  },
  {
    src: photo4,
    alt: "Hands-on manual therapy session at PainFix Physiotherapy Clinic",
    caption: "Manual Therapy",
    span: "col-span-1",
    w: 720,
    h: 1280,
  },
  {
    src: photo5,
    alt: "Physiotherapist guiding a patient through a personalized treatment session",
    caption: "Treatment Session",
    span: "col-span-1",
    w: 720,
    h: 1280,
  },
  {
    src: photo6,
    alt: "Modern, clean physiotherapy treatment room with anatomy charts at PainFix Clinic, Multan",
    caption: "Our Treatment Room",
    span: "col-span-2 lg:col-span-2",
    w: 738,
    h: 1280,
  },
];

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="gallery" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Inside our clinic"
          subtitle="A calm, modern space in Multan designed for healing, comfort and evidence-based recovery."
        />
        <div className="mt-12 grid auto-rows-[42vw] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-3">
          {photos.map((p, i) => (
            <Reveal key={p.src} anim="up" delay={(i % 3) * 80} className={p.span}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Open image: ${p.caption}`}
                className="group relative block h-full w-full overflow-hidden rounded-[1.75rem] shadow-soft ring-1 ring-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${p.pos ?? ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 translate-y-2 font-heading font-bold text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.caption}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active !== null && (
        <Lightbox
          photos={photos}
          index={active}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
        />
      )}
    </section>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const photo = photos[index];

  const go = useCallback(
    (dir: number) => {
      setZoomed(false);
      onIndexChange((index + dir + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOrigin(`${x}% ${y}%`);
    }
    setZoomed((z) => !z);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      className="fixed inset-0 z-[100] flex flex-col bg-foreground/90 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
        <span className="font-heading text-sm font-bold text-background sm:text-base">{photo.caption}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className="grid h-10 w-10 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30"
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 sm:px-16">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30 sm:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <img
          src={photo.src}
          alt={photo.alt}
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom(e);
          }}
          style={{ transformOrigin: origin }}
          className={`max-h-full max-w-full rounded-2xl object-contain shadow-glow transition-transform duration-300 ${
            zoomed ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in"
          }`}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Next image"
          className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/15 text-background transition hover:bg-background/30 sm:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Counter */}
      <div className="pb-5 text-center text-sm font-medium text-background/80" onClick={(e) => e.stopPropagation()}>
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}
