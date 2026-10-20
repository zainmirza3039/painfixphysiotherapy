import type { Faq } from "./services";

export interface Condition {
  slug: string;
  title: string;
  summary: string; // short description for cards
  icon: string; // emoji marker for lightweight rendering
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  whenToSee: string[];
  howWeTreat: string[];
  recovery: string;
  faqs: Faq[];
  relatedServices: string[];
}

export const conditions: Condition[] = [
  {
    slug: "back-pain",
    title: "Back Pain",
    summary: "Relief from aching, stiffness and pain that limits everyday movement.",
    icon: "🩺",
    metaTitle: "Back Pain Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Effective back pain treatment in Multan. Understand causes, symptoms and how our evidence-based physiotherapy relieves back pain and restores movement.",
    intro: [
      "Back pain is one of the most common reasons people seek physiotherapy. It can range from a dull, constant ache to a sudden, sharp sensation, and may affect your ability to work, sleep and move comfortably.",
      "Most back pain responds very well to physiotherapy that addresses the underlying cause — restoring movement, building strength and preventing recurrence.",
    ],
    symptoms: [
      "Aching or stiffness along the spine",
      "Sharp or shooting pain",
      "Pain that worsens with bending or lifting",
      "Muscle tightness or spasm",
      "Reduced flexibility or range of motion",
    ],
    causes: [
      "Muscle or ligament strain",
      "Poor posture and prolonged sitting",
      "Disc problems",
      "Heavy or incorrect lifting",
      "Weak core and back muscles",
    ],
    riskFactors: [
      "Sedentary lifestyle",
      "Being overweight",
      "Occupations involving lifting or sitting",
      "Age-related changes",
      "Previous back injury",
    ],
    whenToSee: [
      "Pain lasting more than a few days",
      "Pain that radiates into the legs",
      "Numbness, tingling or weakness",
      "Pain that disturbs sleep",
      "Difficulty with daily activities",
    ],
    howWeTreat: [
      "Detailed assessment to identify the cause",
      "Manual therapy to relieve pain and stiffness",
      "Personalized core and back strengthening",
      "Posture and ergonomic correction",
      "Education to prevent future episodes",
    ],
    recovery:
      "Most patients experience meaningful relief within a few weeks of consistent physiotherapy, with a full programme designed to prevent recurrence.",
    faqs: [
      {
        q: "Should I rest or stay active with back pain?",
        a: "Gentle activity is usually better than bed rest. We guide you on safe movement.",
      },
      {
        q: "Do I need an MRI?",
        a: "Most back pain does not require imaging. We advise you if further investigation is needed.",
      },
    ],
    relatedServices: ["manual-therapy", "exercise-therapy", "pain-management"],
  },
  {
    slug: "neck-pain",
    title: "Neck Pain",
    summary: "Ease stiffness, headaches and pain caused by posture, strain or injury.",
    icon: "🦴",
    metaTitle: "Neck Pain Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Neck pain treatment in Multan. Relieve stiffness, headaches and pain from poor posture or injury with evidence-based physiotherapy at PainFix.",
    intro: [
      "Neck pain often results from poor posture, prolonged screen use or muscle strain. It can cause stiffness, headaches and limited movement.",
      "Physiotherapy is highly effective at relieving neck pain by treating its root cause and correcting the habits that trigger it.",
    ],
    symptoms: [
      "Stiffness and reduced neck movement",
      "Aching or sharp neck pain",
      "Headaches starting at the base of the skull",
      "Pain radiating to the shoulders",
      "Muscle tightness",
    ],
    causes: [
      "Poor posture and forward head position",
      "Prolonged screen or phone use",
      "Muscle strain",
      "Sleeping in awkward positions",
      "Whiplash or injury",
    ],
    riskFactors: [
      "Desk-based work",
      "Frequent device use",
      "Stress and tension",
      "Previous neck injury",
      "Poor sleep posture",
    ],
    whenToSee: [
      "Persistent pain beyond a few days",
      "Pain spreading to the arm or hand",
      "Numbness or tingling",
      "Recurring headaches",
      "Reduced ability to turn the head",
    ],
    howWeTreat: [
      "Manual therapy and mobilization",
      "Posture correction and ergonomic advice",
      "Targeted neck and shoulder exercises",
      "Electrotherapy for pain relief",
      "Guidance to prevent recurrence",
    ],
    recovery:
      "Neck pain often improves within a few sessions, with lasting relief when posture and strength are addressed together.",
    faqs: [
      {
        q: "Can my phone cause neck pain?",
        a: "Yes — prolonged looking down ('text neck') is a very common cause we help correct.",
      },
      {
        q: "Will the pain come back?",
        a: "With posture correction and strengthening, most patients avoid recurring neck pain.",
      },
    ],
    relatedServices: ["manual-therapy", "posture-ergonomic-assessment", "pain-management"],
  },
  {
    slug: "sciatica",
    title: "Sciatica",
    summary: "Calm nerve pain radiating from the lower back down into the leg.",
    icon: "⚡",
    metaTitle: "Sciatica Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Sciatica treatment in Multan. Relieve nerve pain radiating from the back into the leg with targeted, evidence-based physiotherapy at PainFix.",
    intro: [
      "Sciatica is pain that travels along the sciatic nerve — from the lower back through the buttock and down the leg. It is usually caused by irritation or compression of the nerve.",
      "Physiotherapy relieves sciatica by reducing nerve irritation, restoring movement and strengthening the supporting muscles.",
    ],
    symptoms: [
      "Pain radiating from the back into the leg",
      "Burning or shooting sensation",
      "Numbness or tingling in the leg or foot",
      "Weakness in the affected leg",
      "Pain worsened by sitting",
    ],
    causes: [
      "Herniated or bulging disc",
      "Spinal narrowing (stenosis)",
      "Piriformis muscle tightness",
      "Poor posture",
      "Prolonged sitting",
    ],
    riskFactors: [
      "Sedentary lifestyle",
      "Heavy lifting",
      "Being overweight",
      "Age-related disc changes",
      "Previous back problems",
    ],
    whenToSee: [
      "Leg pain lasting more than a week",
      "Numbness or weakness in the leg",
      "Pain that limits walking or sitting",
      "Symptoms worsening over time",
      "Difficulty with daily activities",
    ],
    howWeTreat: [
      "Assessment to locate the source of irritation",
      "Manual therapy to reduce nerve compression",
      "Nerve mobility and stretching exercises",
      "Core and back strengthening",
      "Posture and activity modification",
    ],
    recovery:
      "Many patients feel progressive relief within a few weeks, with a structured programme to prevent recurrence.",
    faqs: [
      {
        q: "Is surgery needed for sciatica?",
        a: "Most cases resolve with physiotherapy and rarely require surgery.",
      },
      {
        q: "Should I keep moving?",
        a: "Yes — guided, gentle movement usually helps more than rest.",
      },
    ],
    relatedServices: ["manual-therapy", "exercise-therapy", "pain-management"],
  },
  {
    slug: "frozen-shoulder",
    title: "Frozen Shoulder",
    summary: "Restore movement and reduce the stiffness of a frozen shoulder.",
    icon: "💪",
    metaTitle: "Frozen Shoulder Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Frozen shoulder treatment in Multan. Restore shoulder movement and relieve stiffness and pain with expert physiotherapy at PainFix.",
    intro: [
      "Frozen shoulder (adhesive capsulitis) causes pain and progressive stiffness that limits shoulder movement, often making daily tasks difficult.",
      "Physiotherapy is central to recovery — reducing pain and gradually restoring the shoulder's range of motion and strength.",
    ],
    symptoms: [
      "Gradual loss of shoulder movement",
      "Stiffness that worsens over time",
      "Pain, especially at night",
      "Difficulty reaching or dressing",
      "Reduced strength",
    ],
    causes: [
      "Inflammation of the shoulder capsule",
      "Prolonged immobility",
      "After injury or surgery",
      "Unknown (idiopathic)",
      "Diabetes-related changes",
    ],
    riskFactors: [
      "Diabetes",
      "Age 40–60",
      "Shoulder injury or surgery",
      "Prolonged immobilisation",
      "Thyroid disorders",
    ],
    whenToSee: [
      "Increasing shoulder stiffness",
      "Pain disturbing sleep",
      "Difficulty with overhead tasks",
      "Movement not improving",
      "Loss of function",
    ],
    howWeTreat: [
      "Pain relief with manual therapy and electrotherapy",
      "Gentle mobilization to restore movement",
      "Progressive stretching and strengthening",
      "Home exercise programme",
      "Guidance through each recovery stage",
    ],
    recovery:
      "Frozen shoulder recovers in stages; consistent physiotherapy shortens the process and restores function.",
    faqs: [
      {
        q: "How long does frozen shoulder last?",
        a: "It varies, but physiotherapy speeds recovery and reduces pain at every stage.",
      },
      {
        q: "Can I prevent stiffness?",
        a: "Early movement and a guided exercise programme help prevent worsening stiffness.",
      },
    ],
    relatedServices: ["manual-therapy", "exercise-therapy", "electrotherapy"],
  },
  {
    slug: "knee-pain",
    title: "Knee Pain",
    summary: "Rebuild strength and mobility after injury, arthritis or overuse.",
    icon: "🦵",
    metaTitle: "Knee Pain Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Knee pain treatment in Multan. Relieve pain from injury, arthritis or overuse and restore strength and mobility with physiotherapy at PainFix.",
    intro: [
      "Knee pain can result from injury, overuse, arthritis or muscle imbalance, and it can significantly affect walking, stairs and daily activities.",
      "Physiotherapy relieves knee pain and restores strength, stability and confident movement.",
    ],
    symptoms: [
      "Pain during walking or stairs",
      "Swelling or stiffness",
      "Instability or giving way",
      "Reduced range of motion",
      "Difficulty kneeling or squatting",
    ],
    causes: [
      "Ligament or cartilage injury",
      "Osteoarthritis",
      "Overuse and repetitive strain",
      "Muscle weakness or imbalance",
      "Poor movement mechanics",
    ],
    riskFactors: [
      "Being overweight",
      "Sports and high impact activity",
      "Previous knee injury",
      "Age-related wear",
      "Weak thigh muscles",
    ],
    whenToSee: [
      "Persistent pain or swelling",
      "Instability while walking",
      "Reduced movement",
      "Pain limiting daily activity",
      "Difficulty bearing weight",
    ],
    howWeTreat: [
      "Assessment of the knee and movement patterns",
      "Manual therapy to reduce pain and stiffness",
      "Strengthening for the thigh and hip muscles",
      "Balance and functional training",
      "Load and activity guidance",
    ],
    recovery:
      "With targeted strengthening and treatment, most patients see steady improvement over several weeks.",
    faqs: [
      {
        q: "Is exercise safe with knee pain?",
        a: "Yes — the right exercises reduce pain and strengthen the knee. We guide you safely.",
      },
      {
        q: "Can physiotherapy help arthritis knees?",
        a: "Yes, it is one of the most effective ways to manage knee osteoarthritis.",
      },
    ],
    relatedServices: ["exercise-therapy", "manual-therapy", "pain-management"],
  },
  {
    slug: "osteoarthritis",
    title: "Osteoarthritis",
    summary: "Reduce joint pain and stiffness and stay active for longer.",
    icon: "🦴",
    metaTitle: "Osteoarthritis Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Osteoarthritis physiotherapy in Multan. Reduce joint pain and stiffness and improve mobility and quality of life with evidence-based care at PainFix.",
    intro: [
      "Osteoarthritis is a common condition where joint cartilage wears down, causing pain, stiffness and reduced movement — most often in the knees, hips and hands.",
      "Physiotherapy is a proven, first-line treatment that reduces pain and keeps you active and independent.",
    ],
    symptoms: [
      "Joint pain and stiffness",
      "Stiffness after rest",
      "Reduced range of motion",
      "Swelling around the joint",
      "Weakness and reduced function",
    ],
    causes: [
      "Age-related cartilage wear",
      "Previous joint injury",
      "Joint overload",
      "Genetic factors",
      "Muscle weakness",
    ],
    riskFactors: [
      "Older age",
      "Being overweight",
      "Previous joint injury",
      "Repetitive joint stress",
      "Family history",
    ],
    whenToSee: [
      "Ongoing joint pain and stiffness",
      "Difficulty with daily activities",
      "Reduced mobility",
      "Pain affecting sleep",
      "Loss of independence",
    ],
    howWeTreat: [
      "Personalized exercise to strengthen the joint",
      "Manual therapy to improve movement",
      "Pain-relief modalities",
      "Weight and activity guidance",
      "Education for long-term self-management",
    ],
    recovery:
      "Osteoarthritis is managed rather than cured, and physiotherapy significantly reduces pain and improves function long-term.",
    faqs: [
      {
        q: "Will exercise damage my joints?",
        a: "No — appropriate exercise protects joints and reduces arthritis pain.",
      },
      {
        q: "Can I avoid surgery?",
        a: "Many people manage well with physiotherapy and delay or avoid surgery.",
      },
    ],
    relatedServices: ["exercise-therapy", "pain-management", "manual-therapy"],
  },
  {
    slug: "plantar-fasciitis",
    title: "Plantar Fasciitis",
    summary: "Relieve stubborn heel and arch pain and walk comfortably again.",
    icon: "🦶",
    metaTitle: "Plantar Fasciitis Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Plantar fasciitis treatment in Multan. Relieve heel pain and restore comfortable walking with targeted physiotherapy at PainFix.",
    intro: [
      "Plantar fasciitis is a common cause of heel pain, resulting from inflammation of the tissue that supports the arch of the foot. Pain is often worst with the first steps in the morning.",
      "Physiotherapy relieves the pain and addresses the causes to prevent it returning.",
    ],
    symptoms: [
      "Sharp heel pain",
      "Pain worst in the morning",
      "Pain after rest or long standing",
      "Tenderness under the heel",
      "Discomfort while walking",
    ],
    causes: [
      "Overuse and repetitive strain",
      "Tight calf muscles",
      "Poor footwear",
      "High or flat arches",
      "Sudden increase in activity",
    ],
    riskFactors: [
      "Prolonged standing",
      "Being overweight",
      "Running and high impact activity",
      "Unsupportive shoes",
      "Tight calves",
    ],
    whenToSee: [
      "Persistent heel pain",
      "Pain limiting walking",
      "Morning pain not improving",
      "Recurring symptoms",
      "Pain affecting daily life",
    ],
    howWeTreat: [
      "Assessment of the foot and walking pattern",
      "Manual therapy and soft-tissue release",
      "Calf and foot stretching and strengthening",
      "Footwear and load advice",
      "Electrotherapy for pain relief",
    ],
    recovery:
      "Most patients improve within a few weeks of consistent treatment and home exercises.",
    faqs: [
      {
        q: "Do I need special insoles?",
        a: "Sometimes — we assess and advise on footwear and support if needed.",
      },
      {
        q: "Can I keep walking?",
        a: "We guide you on safe activity levels while the tissue heals.",
      },
    ],
    relatedServices: ["manual-therapy", "electrotherapy", "exercise-therapy"],
  },
  {
    slug: "sports-injuries",
    title: "Sports Injuries",
    summary: "Recover safely and return to your sport stronger than before.",
    icon: "🏅",
    metaTitle: "Sports Injury Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Sports injury treatment in Multan. Recover from sprains, strains and tears and return to sport safely with expert physiotherapy at PainFix.",
    intro: [
      "Sports injuries range from sprains and strains to ligament and muscle tears. Prompt, structured rehabilitation is key to a safe and complete return to activity.",
      "We combine hands-on treatment with progressive, sport-specific rehabilitation to get you back to peak performance.",
    ],
    symptoms: [
      "Pain during or after activity",
      "Swelling and bruising",
      "Reduced strength or range",
      "Instability",
      "Difficulty returning to sport",
    ],
    causes: [
      "Sudden trauma or impact",
      "Overuse and repetitive strain",
      "Inadequate warm-up",
      "Muscle imbalance",
      "Fatigue and overtraining",
    ],
    riskFactors: [
      "Frequent sport participation",
      "Poor conditioning",
      "Previous injury",
      "Inadequate recovery",
      "Improper technique",
    ],
    whenToSee: [
      "Pain that limits activity",
      "Swelling or instability",
      "Slow or stalled recovery",
      "Recurring injuries",
      "Reduced performance",
    ],
    howWeTreat: [
      "Accurate injury assessment",
      "Pain and swelling management",
      "Progressive strengthening",
      "Sport-specific rehabilitation",
      "Return-to-sport testing",
    ],
    recovery:
      "Recovery depends on the injury, but a structured programme ensures a safe, confident return to sport.",
    faqs: [
      {
        q: "When can I play again?",
        a: "We use objective criteria to ensure your return is safe and reduces re-injury risk.",
      },
      {
        q: "Do you help prevent injuries?",
        a: "Yes — prevention and conditioning are part of every plan.",
      },
    ],
    relatedServices: ["sports-rehabilitation", "exercise-therapy", "manual-therapy"],
  },
  {
    slug: "stroke-rehabilitation",
    title: "Stroke Rehabilitation",
    summary: "Regain movement, strength and independence after a stroke.",
    icon: "🧠",
    metaTitle: "Stroke Rehabilitation: Symptoms & Recovery in Multan | PainFix",
    metaDescription:
      "Stroke rehabilitation in Multan. Regain movement, balance and independence after stroke with specialised neuro-physiotherapy at PainFix.",
    intro: [
      "After a stroke, physiotherapy helps rebuild movement, balance, coordination and independence. Early and consistent rehabilitation gives the best outcomes.",
      "Our neuro-focused programmes retrain the body through task-specific practice, strengthening and balance training — in clinic or at home.",
    ],
    symptoms: [
      "Weakness on one side",
      "Balance and walking difficulty",
      "Loss of coordination",
      "Muscle tightness",
      "Reduced hand or arm function",
    ],
    causes: [
      "Interrupted blood supply to the brain",
      "Ischaemic stroke",
      "Haemorrhagic stroke",
      "Transient ischaemic attack (TIA)",
    ],
    riskFactors: [
      "High blood pressure",
      "Diabetes",
      "Smoking",
      "High cholesterol",
      "Previous stroke or heart disease",
    ],
    whenToSee: [
      "As soon as medically stable",
      "Difficulty moving or walking",
      "Balance problems",
      "Loss of independence",
      "Muscle stiffness",
    ],
    howWeTreat: [
      "Detailed neurological assessment",
      "Task-specific movement retraining",
      "Balance and gait training",
      "Strengthening and mobility work",
      "Independence and daily-activity training",
    ],
    recovery:
      "Recovery is gradual and individual; consistent rehabilitation over months achieves the greatest gains.",
    faqs: [
      {
        q: "When should stroke rehab start?",
        a: "As early as it is safe — early rehabilitation improves recovery.",
      },
      {
        q: "Can it be done at home?",
        a: "Yes, we provide home-based neuro rehabilitation for patients who cannot travel.",
      },
    ],
    relatedServices: ["stroke-rehabilitation", "home-physiotherapy", "exercise-therapy"],
  },
  {
    slug: "cervical-radiculopathy",
    title: "Cervical Radiculopathy",
    summary: "Settle nerve pain, tingling and weakness spreading from the neck into the arm.",
    icon: "⚡",
    metaTitle: "Cervical Radiculopathy Treatment in Multan | PainFix",
    metaDescription:
      "Cervical radiculopathy treatment in Multan. Relieve pinched-nerve pain radiating from the neck into the arm with expert physiotherapy at PainFix.",
    intro: [
      "Cervical radiculopathy occurs when a nerve in the neck is compressed or irritated, causing pain, numbness or weakness that radiates into the shoulder, arm or hand.",
      "Physiotherapy relieves nerve pressure, reduces symptoms and restores neck and arm function.",
    ],
    symptoms: [
      "Pain radiating into the arm",
      "Numbness or tingling",
      "Arm or hand weakness",
      "Neck stiffness",
      "Pain worsened by neck movement",
    ],
    causes: [
      "Disc herniation",
      "Age-related spinal changes",
      "Bony narrowing of nerve openings",
      "Poor posture",
      "Neck injury",
    ],
    riskFactors: [
      "Desk-based work",
      "Poor posture",
      "Age-related changes",
      "Previous neck injury",
      "Repetitive strain",
    ],
    whenToSee: [
      "Arm pain, numbness or tingling",
      "Weakness in the arm or hand",
      "Symptoms not improving",
      "Pain affecting sleep or work",
      "Worsening neurological signs",
    ],
    howWeTreat: [
      "Assessment to identify the affected nerve",
      "Manual therapy to reduce compression",
      "Nerve mobility exercises",
      "Postural correction and strengthening",
      "Pain-relief modalities",
    ],
    recovery:
      "Most cases improve with physiotherapy over several weeks, avoiding the need for surgery.",
    faqs: [
      {
        q: "Is surgery necessary?",
        a: "Most patients recover well with physiotherapy without needing surgery.",
      },
      {
        q: "Why does my arm feel numb?",
        a: "Nerve irritation in the neck can refer symptoms into the arm; treatment relieves the pressure.",
      },
    ],
    relatedServices: ["manual-therapy", "posture-ergonomic-assessment", "pain-management"],
  },
  {
    slug: "balance-disorders",
    title: "Balance Disorders",
    summary: "Improve stability, reduce dizziness and lower your risk of falls.",
    icon: "🌀",
    metaTitle: "Balance Disorder Treatment in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Balance and dizziness physiotherapy in Multan. Improve stability, reduce fall risk and regain confidence with targeted balance rehabilitation at PainFix.",
    intro: [
      "Balance disorders cause unsteadiness, dizziness and an increased risk of falls, affecting confidence and independence — especially in older adults and after neurological conditions.",
      "Physiotherapy improves balance, strength and stability, helping you move safely and confidently again.",
    ],
    symptoms: [
      "Unsteadiness or dizziness",
      "Frequent stumbling or falls",
      "Difficulty walking on uneven ground",
      "Fear of falling",
      "Reduced confidence in movement",
    ],
    causes: [
      "Inner ear (vestibular) problems",
      "Muscle weakness",
      "Neurological conditions",
      "Age-related decline",
      "Medication side effects",
    ],
    riskFactors: [
      "Older age",
      "Previous falls",
      "Neurological conditions",
      "Muscle weakness",
      "Reduced activity",
    ],
    whenToSee: [
      "Frequent unsteadiness or falls",
      "Dizziness affecting daily life",
      "Fear of falling",
      "Difficulty walking safely",
      "Loss of confidence in movement",
    ],
    howWeTreat: [
      "Balance and fall-risk assessment",
      "Targeted balance training",
      "Strength and mobility exercises",
      "Vestibular rehabilitation where relevant",
      "Home safety and confidence building",
    ],
    recovery:
      "With consistent balance training, most patients gain noticeable stability and confidence within weeks.",
    faqs: [
      {
        q: "Can balance be improved at any age?",
        a: "Yes — targeted training improves balance and reduces fall risk at any age.",
      },
      {
        q: "Do you offer home visits for this?",
        a: "Yes, balance rehabilitation is available at home for patients who cannot travel.",
      },
    ],
    relatedServices: ["exercise-therapy", "home-physiotherapy", "stroke-rehabilitation"],
  },
  {
    slug: "post-surgical-rehabilitation",
    title: "Post Surgical Rehabilitation",
    summary: "Restore strength, movement and function safely after surgery.",
    icon: "🩹",
    metaTitle: "Post Surgical Rehabilitation in Multan | Physiotherapy — PainFix",
    metaDescription:
      "Post-surgical rehabilitation in Multan. Recover strength, movement and function after surgery with safe, guided physiotherapy at PainFix.",
    intro: [
      "Rehabilitation after surgery restores strength, movement and function while protecting the healing tissue. A structured programme helps you recover fully and avoid complications.",
      "We progress your recovery in stages, aligned with your surgeon's protocol and your individual progress.",
    ],
    symptoms: [
      "Pain and swelling after surgery",
      "Stiffness and reduced movement",
      "Muscle weakness",
      "Difficulty with daily activities",
      "Reduced confidence in movement",
    ],
    causes: [
      "Tissue trauma from surgery",
      "Immobilisation during healing",
      "Protective muscle inhibition",
      "Scar tissue formation",
    ],
    riskFactors: [
      "Prolonged immobility",
      "Delayed rehabilitation",
      "Poor pre-surgery conditioning",
      "Complex procedures",
    ],
    whenToSee: [
      "As advised by your surgeon",
      "Persistent stiffness or weakness",
      "Difficulty regaining movement",
      "Slow recovery",
      "Trouble returning to activity",
    ],
    howWeTreat: [
      "Staged, surgeon-aligned rehabilitation",
      "Pain and swelling management",
      "Range-of-motion restoration",
      "Progressive strengthening",
      "Return-to-function training",
    ],
    recovery:
      "Recovery timelines vary by procedure; we set clear milestones and progress you safely at each stage.",
    faqs: [
      {
        q: "When should I start rehab after surgery?",
        a: "Often within days, guided by your surgeon. Early, safe movement improves outcomes.",
      },
      {
        q: "Can you visit me at home after surgery?",
        a: "Yes — home physiotherapy is ideal in the early stages after surgery.",
      },
    ],
    relatedServices: ["post-surgical-rehabilitation", "exercise-therapy", "home-physiotherapy"],
  },
];

export const conditionMap = Object.fromEntries(conditions.map((c) => [c.slug, c]));

export function getCondition(slug: string): Condition | undefined {
  return conditionMap[slug];
}
