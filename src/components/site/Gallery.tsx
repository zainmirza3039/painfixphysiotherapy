import clinicImg from "@/assets/gallery-clinic.jpg";
import treatmentImg from "@/assets/gallery-treatment.jpg";
import equipmentImg from "@/assets/gallery-equipment.jpg";
import patientsImg from "@/assets/gallery-patients.jpg";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const photos = [
  { src: clinicImg, label: "Clinic", span: "row-span-2", w: 800, h: 1000 },
  { src: treatmentImg, label: "Treatment Room", span: "", w: 800, h: 800 },
  { src: equipmentImg, label: "Equipment", span: "", w: 800, h: 800 },
  { src: patientsImg, label: "Patients", span: "row-span-2", w: 800, h: 1000 },
];

export function Gallery() {
  return (
    <section id="gallery" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Inside our clinic"
          subtitle="A calm, modern space designed for healing and comfort."
        />
        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-4 sm:auto-rows-[240px] lg:grid-cols-4">
          {photos.map((p, i) => (
            <Reveal key={p.label} anim="up" delay={(i % 4) * 80} className={p.span}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] shadow-soft ring-1 ring-border">
                <img
                  src={p.src}
                  alt={`${p.label} at PainFix Physiotherapy Clinic`}
                  width={p.w}
                  height={p.h}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 translate-y-2 font-heading font-bold text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
