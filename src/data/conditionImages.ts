import backPain from "@/assets/conditions/back-pain-symptom.webp";
import neckPain from "@/assets/conditions/neck-pain-symptom.webp";
import sciatica from "@/assets/conditions/sciatica-distribution.webp";
import { conditionImageCover, conditionImageCoverAlt } from "@/data/conditionImageGallery";
import { serviceImages } from "@/data/serviceImages";

/**
 * Anatomy/symptom illustrations remain local and are preferred where supplied.
 * Other treatment photographs use the representative stock-photo set in
 * serviceImages; they are not PainFix patient or clinic photographs.
 */
export const conditionImages: Record<string, string> = {
  "back-pain": backPain,
  "neck-pain": neckPain,
  sciatica,
  "frozen-shoulder": serviceImages["exercise-therapy"],
  "knee-pain": serviceImages.electrotherapy,
  osteoarthritis: serviceImages["home-physiotherapy"],
  "plantar-fasciitis": serviceImages["post-surgical-rehabilitation"],
  "sports-injuries": serviceImages["sports-rehabilitation"],
  "stroke-rehabilitation": serviceImages["stroke-rehabilitation"],
  "cervical-radiculopathy": serviceImages["manual-therapy"],
  "balance-disorders": serviceImages["home-physiotherapy"],
  "post-surgical-rehabilitation": serviceImages["post-surgical-rehabilitation"],
  ...conditionImageCover,
};

/** Keep diagrams fully visible; photographic treatment images use a cover crop. */
export const conditionImageFitClass: Record<string, string> = {
  "back-pain": "object-contain",
  "neck-pain": "object-contain",
  sciatica: "object-contain",
  "frozen-shoulder": "object-contain",
  "knee-pain": "object-contain",
  "sports-injuries": "object-contain",
  "plantar-fasciitis": "object-contain",
};

const representative = (description: string) =>
  `Representative stock photograph: ${description}. Not a PainFix patient or clinic photograph.`;

export const conditionImageAlt: Record<string, string> = {
  "back-pain": "Medical illustration highlighting the lower-back region and lumbar spine.",
  "neck-pain": "Medical illustration highlighting the neck and upper shoulder region.",
  sciatica: "Medical illustration tracing the sciatic nerve and radiating pain down the leg.",
  "frozen-shoulder": representative(
    "a patient being guided through therapeutic upper-limb exercise",
  ),
  "knee-pain": representative(
    "electrotherapy electrodes placed around the knee during rehabilitation",
  ),
  osteoarthritis: representative("an older adult practising assisted mobility exercise at home"),
  "plantar-fasciitis": representative(
    "a therapist assisting a patient with lower-limb stretching",
  ),
  "sports-injuries": representative(
    "a physiotherapist applying kinesiology tape during sports rehabilitation",
  ),
  "stroke-rehabilitation": representative("therapist-assisted upper-limb rehabilitation"),
  "cervical-radiculopathy": representative("a physiotherapist performing a hands-on neck treatment"),
  "balance-disorders": representative("an older adult practising supported mobility exercise at home"),
  "post-surgical-rehabilitation": representative(
    "a physiotherapist assisting a patient with lower-limb stretching",
  ),
  ...conditionImageCoverAlt,
};

export const conditionImageAltFallback = (title: string) =>
  `Representative stock photograph related to ${title}; not a PainFix clinic photograph.`;
