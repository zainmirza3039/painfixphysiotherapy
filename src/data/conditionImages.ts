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
 * Maps a condition slug to its optimized, lazy-loaded illustration.
 * All images are branded flat medical illustrations (~4:3, WebP).
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
