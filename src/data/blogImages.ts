import { conditionImages } from "@/data/conditionImages";
import { serviceImages } from "@/data/serviceImages";

export interface BlogVisual {
  src: string;
  alt: string;
}

/** Category-specific imagery with a relevant clinical fallback for every article. */
const categoryVisuals: Record<string, BlogVisual> = {
  "back-pain": { src: conditionImages["back-pain"], alt: "Medical illustration highlighting the lower-back region" },
  "neck-pain": { src: conditionImages["neck-pain"], alt: "Medical illustration highlighting the neck and upper shoulder region" },
  sciatica: { src: conditionImages.sciatica, alt: "Medical illustration tracing the sciatic nerve down the leg" },
  "frozen-shoulder": { src: conditionImages["frozen-shoulder"], alt: "Shoulder pain illustration for frozen shoulder education" },
  "knee-pain": { src: conditionImages["knee-pain"], alt: "Medical illustration of the knee joint" },
  "sports-injuries": { src: conditionImages["sports-injuries"], alt: "Sports injury illustration showing an ankle injury" },
  "stroke-rehabilitation": { src: conditionImages["stroke-rehabilitation"], alt: "Physiotherapy-led stroke rehabilitation" },
  "neurological-rehabilitation": { src: conditionImages["stroke-rehabilitation"], alt: "Physiotherapy-led neurological rehabilitation" },
  "elderly-care": { src: conditionImages["balance-disorders"], alt: "Physiotherapist supporting balance and mobility training" },
  "posture": { src: serviceImages["posture-ergonomic-assessment"], alt: "Physiotherapist assessing posture and spinal alignment" },
  "exercise-therapy": { src: serviceImages["exercise-therapy"], alt: "Physiotherapist guiding a therapeutic exercise session" },
  "manual-therapy": { src: serviceImages["manual-therapy"], alt: "Physiotherapist performing hands-on manual therapy" },
  electrotherapy: { src: serviceImages.electrotherapy, alt: "Physiotherapist applying electrotherapy during rehabilitation" },
  "home-physiotherapy": { src: serviceImages["home-physiotherapy"], alt: "Physiotherapist providing a home physiotherapy session" },
  "pediatric-physiotherapy": { src: serviceImages["exercise-therapy"], alt: "Physiotherapist guiding an individual through therapeutic exercise" },
  "womens-health": { src: serviceImages["exercise-therapy"], alt: "Physiotherapist guiding a patient through therapeutic exercise" },
  "sports-performance": { src: serviceImages["sports-rehabilitation"], alt: "Sports physiotherapist supervising rehabilitation exercise" },
  "recovery-tips": { src: serviceImages["exercise-therapy"], alt: "Guided therapeutic exercise for recovery" },
  "patient-education": { src: serviceImages["posture-ergonomic-assessment"], alt: "Physiotherapist assessing movement and posture" },
  hijama: { src: serviceImages["hijama-cupping-therapy"], alt: "Hijama cupping therapy treatment" },
};

const defaultVisual: BlogVisual = {
  src: serviceImages["exercise-therapy"],
  alt: "Physiotherapist guiding a therapeutic exercise session",
};

export function getBlogVisual(category: string, uploadedImage?: string): BlogVisual {
  if (uploadedImage) {
    return {
      src: uploadedImage,
      alt: "Featured image for this PainFix physiotherapy article",
    };
  }
  return categoryVisuals[category] ?? defaultVisual;
}
