import drZainImg from "@/assets/dr-zain.webp";
import drJalalImg from "@/assets/dr-jalal.webp";

export interface TeamMember {
  name: string;
  /** Full professional name including the "PT" suffix (SEO / entity recognition). */
  fullName: string;
  role: string;
  /** Short professional title used on cards, e.g. "Physiotherapist in Multan | DPT". */
  title: string;
  credentials: string;
  bio: string;
  /** SEO-friendly bio for the card (services in Multan, evidence-based rehab, conditions). */
  seoBio: string;
  specialties: string[];
  /** Condition / technique tags shown as chips on the card and profile page. */
  tags: string[];
  initials: string;
  /** URL slug for the dedicated doctor profile page. */
  slug: string;
  photo: string;
  /** Display phone number for this clinician. */
  phoneDisplay: string;
  /** Digits-only international number used for wa.me WhatsApp links. */
  whatsapp: string;
  /** Profile-page content. */
  profile: {
    metaTitle: string;
    metaDescription: string;
    intro: string[];
    qualifications: string[];
    expertise: string[];
    conditionsTreated: string[];
    approach: string[];
  };
}

export const team: TeamMember[] = [
  {
    name: "Dr. Zain Ul Abideen",
    fullName: "Dr. Zain Ul Abideen PT",
    role: "Doctor of Physical Therapy (DPT)",
    title: "Physiotherapist in Multan | DPT",
    credentials: "DPT (Doctor of Physical Therapy)",
    bio: "Dr. Zain Ul Abideen leads patient care at PainFix with a focus on evidence-based, personalized rehabilitation. He is dedicated to helping patients overcome pain, recover from injury and restore lasting movement.",
    seoBio:
      "Dr. Zain Ul Abideen PT is a leading physiotherapist in Multan providing evidence-based physiotherapy and rehabilitation. He treats back pain, neck pain, sciatica, sports injuries and post-surgery recovery using manual therapy and modern rehabilitation.",
    specialties: [
      "Evidence-Based Physiotherapy",
      "Manual Therapy",
      "Sports Rehabilitation",
      "Musculoskeletal Rehabilitation",
      "Home Physiotherapy",
    ],
    tags: [
      "Back Pain",
      "Neck Pain",
      "Sciatica",
      "Sports Injuries",
      "Manual Therapy",
      "Rehabilitation",
    ],
    initials: "ZA",
    slug: "dr-zain-ul-abideen-pt-multan",
    photo: drZainImg,
    phoneDisplay: "0314-3039582",
    whatsapp: "923143039582",
    profile: {
      metaTitle: "Dr. Zain Ul Abideen PT — Physiotherapist in Multan | DPT",
      metaDescription:
        "Dr. Zain Ul Abideen PT is a trusted physiotherapist in Multan offering evidence-based physiotherapy for back pain, neck pain, sciatica, sports injuries and rehabilitation. Book an appointment at PainFix Physiotherapy Clinic.",
      intro: [
        "Dr. Zain Ul Abideen PT is a Doctor of Physical Therapy (DPT) and one of the leading physiotherapists in Multan. At PainFix Physiotherapy Clinic he leads patient care with a focus on evidence-based physiotherapy, personalized rehabilitation and long-term recovery.",
        "Whether you are dealing with persistent back pain, a sports injury or recovering after surgery, Dr. Zain designs individualized treatment plans that target the root cause of your condition — helping you move better and live pain-free.",
      ],
      qualifications: [
        "Doctor of Physical Therapy (DPT)",
        "Certified in Manual Therapy techniques",
        "Trained in Sports Injury Rehabilitation",
        "Experienced in Home Physiotherapy delivery",
      ],
      expertise: [
        "Evidence-Based Physiotherapy",
        "Manual Therapy",
        "Sports Rehabilitation",
        "Musculoskeletal Rehabilitation",
        "Post-Surgical Rehabilitation",
        "Home Physiotherapy",
      ],
      conditionsTreated: [
        "Lower back pain & disc issues (Kamar dard)",
        "Neck pain & cervical problems (Gardan dard)",
        "Sciatica & nerve pain",
        "Sports injuries & muscle strains",
        "Frozen shoulder & joint stiffness",
        "Post-operative & fracture rehabilitation",
      ],
      approach: [
        "Every treatment begins with a detailed assessment to understand the true source of your pain, not just the symptoms. From there, Dr. Zain builds a tailored plan combining manual therapy, targeted exercise therapy and patient education.",
        "The goal is lasting recovery — restoring strength, mobility and confidence so you can return to the activities you love without recurring pain.",
      ],
    },
  },
  {
    name: "Dr. Jalal Ud Din",
    fullName: "Dr. Jalal Ud Din PT",
    role: "Clinical Physiotherapist",
    title: "Physiotherapist in Multan | DPT",
    credentials: "DPT (Doctor of Physical Therapy)",
    bio: "Dr. Jalal Ud Din specialises in rehabilitation and recovery, designing individualized treatment plans that target the root cause of each patient's condition for long-term results.",
    seoBio:
      "Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan offering evidence-based physiotherapy and rehabilitation. He treats back pain, neck pain, sciatica, neurological and orthopaedic conditions with individualized, patient-focused care.",
    specialties: [
      "Exercise Therapy",
      "Neurological Rehabilitation",
      "Orthopaedic Rehabilitation",
      "Pain Management",
    ],
    tags: [
      "Back Pain",
      "Neck Pain",
      "Sciatica",
      "Neuro Rehab",
      "Orthopaedic Rehab",
      "Pain Management",
    ],
    initials: "JD",
    slug: "dr-jalal-ud-din-pt-multan",
    photo: drJalalImg,
    phoneDisplay: "0317-0356265",
    whatsapp: "923170356265",
    profile: {
      metaTitle: "Dr. Jalal Ud Din PT — Physiotherapist in Multan | DPT",
      metaDescription:
        "Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan providing evidence-based physiotherapy for back pain, neck pain, sciatica, neurological and orthopaedic rehabilitation. Book an appointment at PainFix Physiotherapy Clinic.",
      intro: [
        "Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan and a Doctor of Physical Therapy (DPT). At PainFix Physiotherapy Clinic he specialises in rehabilitation and recovery, designing individualized treatment plans that address the root cause of each patient's condition.",
        "From neurological rehabilitation to orthopaedic recovery and pain management, Dr. Jalal is committed to evidence-based physiotherapy that delivers real, long-term results for patients across Multan.",
      ],
      qualifications: [
        "Doctor of Physical Therapy (DPT)",
        "Clinical Physiotherapist",
        "Trained in Neurological Rehabilitation",
        "Experienced in Orthopaedic Rehabilitation",
      ],
      expertise: [
        "Exercise Therapy",
        "Neurological Rehabilitation",
        "Orthopaedic Rehabilitation",
        "Pain Management",
        "Post-Injury Rehabilitation",
        "Musculoskeletal Rehabilitation",
      ],
      conditionsTreated: [
        "Lower back & neck pain (Kamar & gardan dard)",
        "Sciatica & nerve-related pain",
        "Stroke & neurological conditions",
        "Post-fracture & orthopaedic recovery",
        "Joint pain & arthritis",
        "Chronic pain management",
      ],
      approach: [
        "Dr. Jalal focuses on individualized, patient-centred care. Each plan starts with a thorough evaluation, followed by a structured combination of exercise therapy, hands-on treatment and clear patient education.",
        "By targeting the underlying cause rather than just symptoms, he helps patients regain function, reduce pain and achieve durable recovery.",
      ],
    },
  },
];

export const trustPoints = [
  {
    title: "Evidence-Based Treatment",
    description: "Care grounded in the latest physiotherapy research and proven techniques.",
  },
  {
    title: "Personalized Care Plans",
    description: "Every treatment plan is tailored to your body, condition and goals.",
  },
  {
    title: "Patient Education",
    description: "We help you understand your condition so you can recover with confidence.",
  },
  {
    title: "Modern Rehabilitation",
    description: "Up-to-date equipment and methods for effective, comfortable treatment.",
  },
  {
    title: "Home Visits Available",
    description: "Professional physiotherapy delivered in the comfort of your home.",
  },
  {
    title: "Experienced Physiotherapists",
    description: "Qualified, caring clinicians committed to your long-term recovery.",
  },
];

export const teamMap = Object.fromEntries(team.map((m) => [m.initials, m]));

export function getTeamMember(key: string): TeamMember | undefined {
  return teamMap[key];
}

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return team.find((m) => m.slug === slug);
}
