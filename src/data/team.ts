import drZainImg from "@/assets/dr-zain.webp";
import drJalalImg from "@/assets/dr-jalal.webp";

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  specialties: string[];
  initials: string;
  photo: string;
  /** Display phone number for this clinician. */
  phoneDisplay: string;
  /** Digits-only international number used for wa.me WhatsApp links. */
  whatsapp: string;
}

export const team: TeamMember[] = [
  {
    name: "Dr. Zain Ul Abideen",
    role: "Doctor of Physical Therapy (DPT)",
    credentials: "DPT (Doctor of Physical Therapy)",
    bio: "Dr. Zain Ul Abideen leads patient care at PainFix with a focus on evidence-based, personalized rehabilitation. He is dedicated to helping patients overcome pain, recover from injury and restore lasting movement.",
    specialties: [
      "Evidence-Based Physiotherapy",
      "Manual Therapy",
      "Sports Rehabilitation",
      "Musculoskeletal Rehabilitation",
      "Home Physiotherapy",
    ],
    initials: "ZA",
    photo: drZainImg,
    phoneDisplay: "0314-3039582",
    whatsapp: "923143039582",
  },
  {
    name: "Dr. Jalal Ud Din",
    role: "Clinical Physiotherapist",
    credentials: "DPT (Doctor of Physical Therapy)",
    bio: "Dr. Jalal Ud Din specialises in rehabilitation and recovery, designing individualized treatment plans that target the root cause of each patient's condition for long-term results.",
    specialties: [
      "Exercise Therapy",
      "Neurological Rehabilitation",
      "Orthopaedic Rehabilitation",
      "Pain Management",
    ],
    initials: "JD",
    photo: drJalalImg,
    phoneDisplay: "0317-0356265",
    whatsapp: "923170356265",
  },
];

export const trustPoints = [
  { title: "Evidence-Based Treatment", description: "Care grounded in the latest physiotherapy research and proven techniques." },
  { title: "Personalized Care Plans", description: "Every treatment plan is tailored to your body, condition and goals." },
  { title: "Patient Education", description: "We help you understand your condition so you can recover with confidence." },
  { title: "Modern Rehabilitation", description: "Up-to-date equipment and methods for effective, comfortable treatment." },
  { title: "Home Visits Available", description: "Professional physiotherapy delivered in the comfort of your home." },
  { title: "Experienced Physiotherapists", description: "Qualified, caring clinicians committed to your long-term recovery." },
];

export const teamMap = Object.fromEntries(team.map((m) => [m.initials, m]));

export function getTeamMember(key: string): TeamMember | undefined {
  return teamMap[key];
}
