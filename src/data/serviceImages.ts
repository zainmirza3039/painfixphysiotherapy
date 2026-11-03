/**
 * Clinically relevant representative stock photographs.
 *
 * These are Pexels-hosted images, not photographs of PainFix staff, patients,
 * premises or treatment sessions. Keep that distinction in visible ALT text.
 * Source and licence details are recorded in docs/image-sources.md.
 */
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export const serviceImages: Record<string, string> = {
  "manual-therapy": pexels(20860591),
  "exercise-therapy": pexels(20860593),
  electrotherapy: pexels(30483049),
  "sports-rehabilitation": pexels(5794059),
  "home-physiotherapy": pexels(7551611),
  "post-surgical-rehabilitation": pexels(20860582),
  "stroke-rehabilitation": pexels(20860596),
  "pain-management": pexels(5793792),
  "posture-ergonomic-assessment": pexels(20860581),
  "hijama-cupping-therapy": pexels(8312821),
};

/** ALT text describes the image itself and never implies it is a PainFix case. */
export const serviceImageAlt: Record<string, string> = {
  "manual-therapy":
    "Representative stock photo of a physiotherapist performing a hands-on neck treatment; not a PainFix clinic photograph",
  "exercise-therapy":
    "Representative stock photo of a physiotherapist instructing a patient in therapeutic exercise; not a PainFix clinic photograph",
  electrotherapy:
    "Representative stock photo showing electrotherapy electrodes applied during knee rehabilitation; not a PainFix clinic photograph",
  "sports-rehabilitation":
    "Representative stock photo of a physiotherapist applying kinesiology tape during sports rehabilitation; not a PainFix clinic photograph",
  "home-physiotherapy":
    "Representative stock photo of an older adult practising assisted mobility exercise at home; not a PainFix home-visit photograph",
  "post-surgical-rehabilitation":
    "Representative stock photo of a physiotherapist assisting a patient with lower-limb stretching; not a PainFix clinic photograph",
  "stroke-rehabilitation":
    "Representative stock photo of therapist-assisted upper-limb rehabilitation; not a PainFix clinic photograph",
  "pain-management":
    "Representative stock photo of a therapist assisting a patient with a physical therapy stretch; not a PainFix clinic photograph",
  "posture-ergonomic-assessment":
    "Representative stock photo of a physiotherapist assessing a patient's posture; not a PainFix clinic photograph",
  "hijama-cupping-therapy":
    "Representative stock photo of cupping therapy being applied by a practitioner; not a PainFix clinic photograph",
};

export const serviceImageAltFallback = (title: string) =>
  `Representative stock photograph related to ${title}; not a PainFix clinic photograph`;
