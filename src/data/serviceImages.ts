import manualTherapy from "@/assets/services/manual-therapy.webp";
import exerciseTherapy from "@/assets/services/exercise-therapy.webp";
import electrotherapy from "@/assets/services/electrotherapy.webp";
import sportsRehabilitation from "@/assets/services/sports-rehabilitation.webp";
import homePhysiotherapy from "@/assets/services/home-physiotherapy.webp";
import postSurgicalRehabilitation from "@/assets/services/post-surgical-rehabilitation.webp";
import strokeRehabilitation from "@/assets/services/stroke-rehabilitation.webp";
import painManagement from "@/assets/services/pain-management.webp";
import postureErgonomicAssessment from "@/assets/services/posture-ergonomic-assessment.webp";
import hijamaCuppingTherapy from "@/assets/services/hijama-cupping-therapy.webp";

/**
 * Maps a service slug to its unique, optimized, lazy-loaded treatment
 * photograph. All images share a consistent clinical style (4:3, WebP,
 * ~800x600, navy/white uniforms, bright natural light).
 */
export const serviceImages: Record<string, string> = {
  "manual-therapy": manualTherapy,
  "exercise-therapy": exerciseTherapy,
  electrotherapy: electrotherapy,
  "sports-rehabilitation": sportsRehabilitation,
  "home-physiotherapy": homePhysiotherapy,
  "post-surgical-rehabilitation": postSurgicalRehabilitation,
  "stroke-rehabilitation": strokeRehabilitation,
  "pain-management": painManagement,
  "posture-ergonomic-assessment": postureErgonomicAssessment,
  "hijama-cupping-therapy": hijamaCuppingTherapy,
};

/** SEO-friendly, service-specific ALT text for each treatment photograph. */
export const serviceImageAlt: Record<string, string> = {
  "manual-therapy":
    "Physiotherapist performing hands-on manual therapy on a patient's spine at PainFix Physiotherapy Clinic in Multan",
  "exercise-therapy":
    "Physiotherapist guiding a patient through resistance-band exercise therapy at PainFix Physiotherapy Clinic in Multan",
  electrotherapy:
    "Physiotherapist applying electrotherapy and TENS to a patient's knee at PainFix Physiotherapy Clinic in Multan",
  "sports-rehabilitation":
    "Sports physiotherapist supervising an athlete's rehabilitation exercise at PainFix Physiotherapy Clinic in Multan",
  "home-physiotherapy":
    "Physiotherapist treating an elderly patient during a home physiotherapy visit in Multan for PainFix Physiotherapy Clinic",
  "post-surgical-rehabilitation":
    "Physiotherapist assisting a patient with post-surgical knee rehabilitation at PainFix Physiotherapy Clinic in Multan",
  "stroke-rehabilitation":
    "Neuro-physiotherapist guiding a stroke patient through hand and arm rehabilitation at PainFix Physiotherapy Clinic in Multan",
  "pain-management":
    "Physiotherapist performing soft-tissue therapy to relieve a patient's neck and shoulder pain at PainFix Physiotherapy Clinic in Multan",
  "posture-ergonomic-assessment":
    "Physiotherapist assessing a patient's posture and spinal alignment at PainFix Physiotherapy Clinic in Multan",
  "hijama-cupping-therapy":
    "Therapist performing Hijama cupping therapy along a patient's back at PainFix Physiotherapy Clinic in Multan",
};

export const serviceImageAltFallback = (title: string) =>
  `${title} treatment at PainFix Physiotherapy Clinic in Multan`;
