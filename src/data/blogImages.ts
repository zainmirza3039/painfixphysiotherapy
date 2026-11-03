import { conditionImageAlt, conditionImages } from "@/data/conditionImages";
import { serviceImages } from "@/data/serviceImages";

export interface BlogVisual {
  src: string;
  alt: string;
}

const stockAlt = (description: string) =>
  `Representative stock photograph of ${description}; not a PainFix patient or clinic photograph.`;

/** Category-specific visuals; anatomy-led topics retain their original diagrams. */
const categoryVisuals: Record<string, BlogVisual> = {
  "back-pain": {
    src: conditionImages["back-pain"],
    alt: conditionImageAlt["back-pain"],
  },
  "neck-pain": {
    src: conditionImages["neck-pain"],
    alt: conditionImageAlt["neck-pain"],
  },
  sciatica: {
    src: conditionImages.sciatica,
    alt: conditionImageAlt.sciatica,
  },
  "frozen-shoulder": {
    src: conditionImages["frozen-shoulder"],
    alt: conditionImageAlt["frozen-shoulder"],
  },
  "knee-pain": {
    src: conditionImages["knee-pain"],
    alt: conditionImageAlt["knee-pain"],
  },
  "sports-injuries": {
    src: conditionImages["sports-injuries"],
    alt: conditionImageAlt["sports-injuries"],
  },
  "stroke-rehabilitation": {
    src: conditionImages["stroke-rehabilitation"],
    alt: conditionImageAlt["stroke-rehabilitation"],
  },
  "neurological-rehabilitation": {
    src: conditionImages["stroke-rehabilitation"],
    alt: conditionImageAlt["stroke-rehabilitation"],
  },
  "elderly-care": {
    src: conditionImages["balance-disorders"],
    alt: conditionImageAlt["balance-disorders"],
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
