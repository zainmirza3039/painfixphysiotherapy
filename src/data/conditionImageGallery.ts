import backPain from "@/assets/conditions/back-pain-upload.webp";
import neckPain from "@/assets/conditions/neck-pain-upload.webp";
import sciatica from "@/assets/conditions/sciatica-upload.webp";
import shoulderPain from "@/assets/conditions/shoulder-pain-upload.webp";
import slippedDisc from "@/assets/conditions/slipped-disc-upload.webp";
import kneeJoint from "@/assets/conditions/knee-pain-joint-upload.webp";
import kneeXray from "@/assets/conditions/knee-pain-xray-upload.webp";
import sportsInjuryAnkle from "@/assets/conditions/sports-injury-ankle-upload.webp";
import heelPain from "@/assets/conditions/heel-pain-upload.webp";

export interface ConditionImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const slippedDiscVisual: ConditionImage = {
  src: slippedDisc,
  alt: "Illustration labelled ‘Slipped Disc’ showing a lower-back area and a highlighted spinal disc.",
  width: 739,
  height: 415,
};

/** User-supplied visual references grouped under the site's existing condition pages. */
export const conditionImageGallery: Record<string, ConditionImage[]> = {
  "back-pain": [
    {
      src: backPain,
      alt: "Illustration of a person holding the lower back, with the lumbar area highlighted in red.",
      width: 493,
      height: 335,
    },
    slippedDiscVisual,
  ],
  "neck-pain": [
    {
      src: neckPain,
      alt: "Illustration of a person holding the back of the neck, with the neck and upper shoulders highlighted in red.",
      width: 675,
      height: 454,
    },
  ],
  sciatica: [
    {
      src: sciatica,
      alt: "Diagram tracing the sciatic nerve down the leg with pain areas highlighted.",
      width: 547,
      height: 560,
    },
  ],
  "frozen-shoulder": [
    {
      src: shoulderPain,
      alt: "Illustration of a person holding a shoulder, with the shoulder area highlighted in red.",
      width: 678,
      height: 452,
    },
  ],
  "knee-pain": [
    {
      src: kneeJoint,
      alt: "Medical illustration highlighting a knee joint in red against a blue background.",
      width: 554,
      height: 554,
    },
    {
      src: kneeXray,
      alt: "Illustration of a person holding a painful knee alongside a knee-joint scan.",
      width: 678,
      height: 452,
    },
  ],
  "sports-injuries": [
    {
      src: sportsInjuryAnkle,
      alt: "Runner holding an ankle, with the ankle area highlighted in red.",
      width: 593,
      height: 395,
    },
  ],
  "plantar-fasciitis": [
    {
      src: heelPain,
      alt: "Illustration highlighting the heel and underside of the foot to indicate heel pain.",
      width: 678,
      height: 452,
    },
  ],
};

/** The first supplied image becomes the cover image wherever the site shows one condition image. */
export const conditionImageCover = Object.fromEntries(
  Object.entries(conditionImageGallery).map(([slug, images]) => [slug, images[0].src]),
) as Record<string, string>;

export const conditionImageCoverAlt = Object.fromEntries(
  Object.entries(conditionImageGallery).map(([slug, images]) => [slug, images[0].alt]),
) as Record<string, string>;
