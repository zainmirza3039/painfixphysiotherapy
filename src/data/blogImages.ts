import { conditionImages } from "@/data/conditionImages";
import { serviceImages } from "@/data/serviceImages";

export interface BlogVisual {
  src: string;
  alt: string;
}

const stockAlt = (description: string) =>
  `Representative stock photograph of ${description}; not a PainFix patient or clinic photograph.`;

/** Category-specific visuals; diagrams are retained for anatomy-led topics. */
const categoryVisuals: Record<string, BlogVisual> = {
  "back-pain": {
    src: conditionImages["back-pain"],
    alt: "Medical illustration highlighting the lower-back region and lumbar spine",
  },
  "neck-pain": {
    src: conditionImages["neck-pain"],
    alt: "Medical illustration highlighting the neck and upper shoulder region",
  },
  sciatica: {
    src: conditionImages.sciatica,
    alt: "Medical illustration tracing the sciatic nerve down the leg",
  },
  "frozen-shoulder": {
    src: conditionImages["frozen-shoulder"],
    alt: stockAlt("a patient being guided through therapeutic upper-limb exercise"),
  },
  "knee-pain": {
    src: conditionImages["knee-pain"],
    alt: stockAlt("electrotherapy electrodes placed around the knee during rehabilitation"),
  },
  "sports-injuries": {
    src: conditionImages["sports-injuries"],
    alt: stockAlt("a physiotherapist applying kinesiology tape during sports rehabilitation"),
  },
  "stroke-rehabilitation": {
    src: conditionImages["stroke-rehabilitation"],
    alt: stockAlt("therapist-assisted upper-limb rehabilitation"),
  },
  "neurological-rehabilitation": {
    src: conditionImages["stroke-rehabilitation"],
    alt: stockAlt("therapist-assisted upper-limb rehabilitation"),
  },
  "elderly-care": {
    src: conditionImages["balance-disorders"],
    alt: stockAlt("an older adult practising supported mobility exercise at home"),
  },
  posture: {
    src: serviceImages["posture-ergonomic-assessment"],
    alt: stockAlt("a physiotherapist assessing a patient's posture"),
  },
  "exercise-therapy": {
    src: serviceImages["exercise-therapy"],
    alt: stockAlt("a physiotherapist instructing a patient in therapeutic exercise"),
  },
  "manual-therapy": {
    src: serviceImages["manual-therapy"],
    alt: stockAlt("a physiotherapist performing a hands-on neck treatment"),
  },
  electrotherapy: {
    src: serviceImages.electrotherapy,
    alt: stockAlt("electrotherapy electrodes applied during knee rehabilitation"),
  },
  "home-physiotherapy": {
    src: serviceImages["home-physiotherapy"],
    alt: stockAlt("an older adult practising assisted mobility exercise at home"),
  },
  "pediatric-physiotherapy": {
    src: serviceImages["exercise-therapy"],
    alt: stockAlt("a physiotherapist instructing a patient in therapeutic exercise"),
  },
  "womens-health": {
    src: serviceImages["exercise-therapy"],
    alt: stockAlt("a physiotherapist instructing a patient in therapeutic exercise"),
  },
  "sports-performance": {
    src: serviceImages["sports-rehabilitation"],
    alt: stockAlt("a physiotherapist applying kinesiology tape during sports rehabilitation"),
  },
  "recovery-tips": {
    src: serviceImages["exercise-therapy"],
    alt: stockAlt("a physiotherapist instructing a patient in therapeutic exercise"),
  },
  "patient-education": {
    src: serviceImages["posture-ergonomic-assessment"],
    alt: stockAlt("a physiotherapist assessing a patient's posture"),
  },
  hijama: {
    src: serviceImages["hijama-cupping-therapy"],
    alt: stockAlt("cupping therapy being applied by a practitioner"),
  },
};

const defaultVisual: BlogVisual = {
  src: serviceImages["exercise-therapy"],
  alt: stockAlt("a physiotherapist instructing a patient in therapeutic exercise"),
};

export function getBlogVisual(category: string, uploadedImage?: string): BlogVisual {
  if (uploadedImage) {
    return {
      src: uploadedImage,
      alt: "Featured image uploaded for this PainFix physiotherapy article",
    };
  }
  return categoryVisuals[category] ?? defaultVisual;
}
