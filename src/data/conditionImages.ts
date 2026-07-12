import backPain from "@/assets/conditions/back-pain.webp";
import neckPain from "@/assets/conditions/neck-pain.webp";
import sciatica from "@/assets/conditions/sciatica.webp";
import frozenShoulder from "@/assets/conditions/frozen-shoulder.webp";
import kneePain from "@/assets/conditions/knee-pain.webp";
import osteoarthritis from "@/assets/conditions/osteoarthritis.webp";
import plantarFasciitis from "@/assets/conditions/plantar-fasciitis.webp";
import sportsInjuries from "@/assets/conditions/sports-injuries.webp";
import strokeRehabilitation from "@/assets/conditions/stroke-rehabilitation.webp";
import cervicalRadiculopathy from "@/assets/conditions/cervical-radiculopathy.webp";
import balanceDisorders from "@/assets/conditions/balance-disorders.webp";
import postSurgicalRehabilitation from "@/assets/conditions/post-surgical-rehabilitation.webp";

/**
 * Maps a condition slug to its optimized, lazy-loaded medical photograph.
 * All images are realistic clinical physiotherapy photos (4:3, WebP, ~800x600).
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
};

/**
 * SEO-friendly, condition-specific ALT text for each medical photograph.
 * Describes the treatment shown and reinforces local (Multan) relevance.
 */
export const conditionImageAlt: Record<string, string> = {
  "back-pain":
    "Physiotherapist assessing a patient's lower back during back pain treatment at PainFix Physiotherapy Clinic in Multan",
  "neck-pain":
    "Physiotherapist examining a patient's neck during neck pain treatment at PainFix Physiotherapy Clinic in Multan",
  sciatica:
    "Physiotherapist treating the lower back and hip to relieve sciatica nerve pain at PainFix Physiotherapy Clinic in Multan",
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
};

/** Fallback ALT text for any condition without a specific description. */
export const conditionImageAltFallback = (title: string) =>
  `Physiotherapy treatment for ${title} at PainFix Physiotherapy Clinic in Multan`;
