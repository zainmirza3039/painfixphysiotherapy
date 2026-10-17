import backPain from "@/assets/conditions/back-pain-symptom.webp";
import neckPain from "@/assets/conditions/neck-pain-symptom.webp";
import sciatica from "@/assets/conditions/sciatica-distribution.webp";
import frozenShoulder from "@/assets/conditions/frozen-shoulder.webp";
import kneePain from "@/assets/conditions/knee-pain.webp";
import osteoarthritis from "@/assets/conditions/osteoarthritis.webp";
import plantarFasciitis from "@/assets/conditions/plantar-fasciitis.webp";
import sportsInjuries from "@/assets/conditions/sports-injuries.webp";
import strokeRehabilitation from "@/assets/conditions/stroke-rehabilitation.webp";
import cervicalRadiculopathy from "@/assets/conditions/cervical-radiculopathy.webp";
import balanceDisorders from "@/assets/conditions/balance-disorders.webp";
import postSurgicalRehabilitation from "@/assets/conditions/post-surgical-rehabilitation.webp";
import { conditionImageCover, conditionImageCoverAlt } from "@/data/conditionImageGallery";

/**
 * Maps a condition slug to its optimized, lazy-loaded condition image.
 */
export const conditionImages: Record<string, string> = {
  "back-pain": backPain,
  "neck-pain": neckPain,
  sciatica: sciatica,
  "frozen-shoulder": frozenShoulder,
  "knee-pain": kneePain,
  osteoarthritis: osteoarthritis,
  "plantar-fasciitis": plantarFasciitis,
  "sports-injuries": sportsInjuries,
  "stroke-rehabilitation": strokeRehabilitation,
  "cervical-radiculopathy": cervicalRadiculopathy,
  "balance-disorders": balanceDisorders,
  "post-surgical-rehabilitation": postSurgicalRehabilitation,
  ...conditionImageCover,
};

/** Keep the supplied symptom illustrations fully visible instead of cropping them. */
export const conditionImageFitClass: Record<string, string> = {
  "back-pain": "object-contain",
  "neck-pain": "object-contain",
  sciatica: "object-contain",
  "frozen-shoulder": "object-contain",
  "knee-pain": "object-contain",
  "sports-injuries": "object-contain",
  "plantar-fasciitis": "object-contain",
};

/**
 * Descriptive ALT text for each condition image.
 */
export const conditionImageAlt: Record<string, string> = {
  "back-pain": "Image showing pain highlighted around the lower back and lumbar spine.",
  "neck-pain": "Image showing pain highlighted across the neck and upper shoulders.",
  sciatica: "Medical illustration tracing the sciatic nerve and radiating pain down the leg.",
  "frozen-shoulder":
    "Physiotherapist mobilising a patient's shoulder joint during frozen shoulder treatment at PainFix Physiotherapy Clinic in Multan",
  "knee-pain":
    "Physiotherapist examining a patient's knee during knee pain rehabilitation at PainFix Physiotherapy Clinic in Multan",
  osteoarthritis:
    "Physiotherapist assessing an older patient's knee during osteoarthritis treatment at PainFix Physiotherapy Clinic in Multan",
  "plantar-fasciitis":
    "Physiotherapist massaging the sole of a patient's foot during plantar fasciitis treatment at PainFix Physiotherapy Clinic in Multan",
  "sports-injuries":
    "Physiotherapist taping an athlete's leg during sports injury rehabilitation at PainFix Physiotherapy Clinic in Multan",
  "stroke-rehabilitation":
    "Physiotherapist guiding a patient through hand and arm exercises during stroke rehabilitation at PainFix Physiotherapy Clinic in Multan",
  "cervical-radiculopathy":
    "Physiotherapist assessing a patient's neck and upper spine during cervical radiculopathy treatment at PainFix Physiotherapy Clinic in Multan",
  "balance-disorders":
    "Physiotherapist supporting an older patient during balance training at PainFix Physiotherapy Clinic in Multan",
  "post-surgical-rehabilitation":
    "Physiotherapist assisting a patient with guided post-surgical rehabilitation exercises at PainFix Physiotherapy Clinic in Multan",
  ...conditionImageCoverAlt,
};

/** Fallback ALT text for any condition without a specific description. */
export const conditionImageAltFallback = (title: string) =>
  `Physiotherapy treatment for ${title} at PainFix Physiotherapy Clinic in Multan`;
