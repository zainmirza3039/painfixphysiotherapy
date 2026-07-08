import {
  Hand,
  Dumbbell,
  Zap,
  Trophy,
  Home,
  ShieldPlus,
  Brain,
  Activity,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  overview: string[];
  conditionsTreated: string[];
  benefits: string[];
  process: ProcessStep[];
  equipment?: string[];
  faqs: Faq[];
  related: string[];
}

export const services: Service[] = [
  {
    slug: "manual-therapy",
    title: "Manual Therapy",
    shortTitle: "Manual Therapy",
    icon: Hand,
    tagline: "Hands-on techniques to restore movement and relieve pain",
    metaTitle: "Manual Therapy in Multan | Hands-On Physiotherapy — PainFix",
    metaDescription:
      "Expert manual therapy in Multan — joint mobilization, soft-tissue release and manipulation to relieve pain and restore mobility. Book your assessment at PainFix.",
    overview: [
      "Manual therapy is a specialised, hands-on approach to assessing and treating pain and stiffness in the muscles, joints and soft tissues. Our physiotherapists use skilled techniques to reduce pain, improve range of motion and restore natural movement.",
      "Every session begins with a detailed assessment so treatment is precisely targeted to the source of your problem — not just the symptoms. Manual therapy is often combined with exercise and education for lasting results.",
    ],
    conditionsTreated: [
      "Neck and back pain",
      "Frozen shoulder",
      "Joint stiffness",
      "Muscle tension and spasm",
      "Sciatica",
      "Headaches of cervical origin",
    ],
    benefits: [
      "Immediate reduction in pain and stiffness",
      "Improved joint mobility and flexibility",
      "Better posture and movement patterns",
      "Faster recovery from injury",
      "Drug-free, non-invasive pain relief",
    ],
    process: [
      { title: "Assessment", description: "A thorough evaluation of posture, movement and the affected joints or tissues." },
      { title: "Hands-On Treatment", description: "Targeted mobilization, manipulation and soft-tissue techniques." },
      { title: "Home Guidance", description: "Simple self-care and mobility advice to maintain your progress." },
      { title: "Review", description: "We track your response and adjust the plan for continued improvement." },
    ],
    equipment: ["Treatment couches", "Mobilization wedges & belts", "Massage and myofascial tools"],
    faqs: [
      { q: "Is manual therapy painful?", a: "Techniques are gentle and adjusted to your comfort. Mild soreness afterwards is normal and settles quickly." },
      { q: "How many sessions will I need?", a: "Most patients notice improvement within 3–6 sessions, though this depends on your condition and goals." },
      { q: "Can it be combined with exercise?", a: "Yes — manual therapy works best alongside a personalized exercise programme for long-term results." },
    ],
    related: ["exercise-therapy", "pain-management", "post-surgical-rehabilitation"],
  },
  {
    slug: "exercise-therapy",
    title: "Exercise Therapy",
    shortTitle: "Exercise Therapy",
    icon: Dumbbell,
    tagline: "Personalized exercise programmes that rebuild strength and function",
    metaTitle: "Exercise Therapy in Multan | Rehabilitation Programmes — PainFix",
    metaDescription:
      "Personalized exercise therapy in Multan to rebuild strength, mobility and endurance. Evidence-based rehabilitation programmes at PainFix Physiotherapy Clinic.",
    overview: [
      "Exercise therapy uses carefully prescribed movements to restore strength, flexibility, balance and endurance. It is one of the most effective, evidence-based ways to recover from injury and prevent recurrence.",
      "Your programme is tailored to your body, your goals and your daily life — progressed safely as you improve so you build lasting resilience, not just short-term relief.",
    ],
    conditionsTreated: [
      "Post-injury weakness",
      "Chronic low back pain",
      "Arthritis and joint pain",
      "Post-surgical deconditioning",
      "Balance and mobility problems",
      "Postural dysfunction",
    ],
    benefits: [
      "Rebuilds strength and stability",
      "Improves flexibility and endurance",
      "Reduces the risk of re-injury",
      "Supports long-term independence",
      "Empowers you to self-manage",
    ],
    process: [
      { title: "Functional Assessment", description: "We measure your strength, range and movement quality." },
      { title: "Programme Design", description: "A graded, personalized exercise plan matched to your goals." },
      { title: "Supervised Training", description: "Guided sessions to ensure correct technique and safe progression." },
      { title: "Progression & Review", description: "We advance your programme as your strength and function improve." },
    ],
    equipment: ["Resistance bands & weights", "Balance & stability trainers", "Exercise mats & gym ball", "Parallel bars"],
    faqs: [
      { q: "Do I need to be fit to start?", a: "No. Programmes start at your current level and build up gradually and safely." },
      { q: "Can I do the exercises at home?", a: "Yes — we provide a clear home programme with guidance so you can continue between sessions." },
      { q: "How soon will I see results?", a: "Most patients feel stronger within 2–4 weeks of consistent training." },
    ],
    related: ["manual-therapy", "sports-rehabilitation", "post-surgical-rehabilitation"],
  },
  {
    slug: "electrotherapy",
    title: "Electrotherapy",
    shortTitle: "Electrotherapy",
    icon: Zap,
    tagline: "Modern modalities to accelerate healing and control pain",
    metaTitle: "Electrotherapy in Multan | TENS, Ultrasound & More — PainFix",
    metaDescription:
      "Advanced electrotherapy in Multan — TENS, ultrasound and electrical stimulation to relieve pain and speed up tissue healing. Book at PainFix Physiotherapy Clinic.",
    overview: [
      "Electrotherapy uses controlled electrical energy and ultrasound to relieve pain, reduce inflammation and stimulate the body's natural healing. It is a valuable addition to hands-on therapy and exercise.",
      "Our clinicians select the right modality and dosage for your condition, ensuring safe, comfortable and effective treatment as part of your overall recovery plan.",
    ],
    conditionsTreated: [
      "Acute and chronic pain",
      "Muscle spasm",
      "Soft-tissue injuries",
      "Nerve pain",
      "Swelling and inflammation",
      "Slow-healing injuries",
    ],
    benefits: [
      "Effective, drug-free pain relief",
      "Reduced inflammation and swelling",
      "Faster tissue healing",
      "Improved muscle activation",
      "Comfortable and non-invasive",
    ],
    process: [
      { title: "Assessment", description: "We confirm electrotherapy is safe and suitable for your condition." },
      { title: "Modality Selection", description: "The right technique and dosage is chosen for your goals." },
      { title: "Treatment", description: "A comfortable, targeted session applied to the affected area." },
      { title: "Integration", description: "Combined with manual therapy and exercise for the best outcome." },
    ],
    equipment: ["TENS units", "Therapeutic ultrasound", "Electrical muscle stimulation (EMS)", "Interferential therapy (IFT)"],
    faqs: [
      { q: "Does electrotherapy hurt?", a: "No. You feel a mild tingling or warmth, and intensity is always kept comfortable." },
      { q: "Is it safe?", a: "Yes, when applied by trained physiotherapists after screening for contraindications." },
      { q: "Will it cure my problem alone?", a: "It works best as part of a complete plan that includes exercise and manual therapy." },
    ],
    related: ["pain-management", "manual-therapy", "sports-rehabilitation"],
  },
  {
    slug: "sports-rehabilitation",
    title: "Sports Rehabilitation",
    shortTitle: "Sports Rehab",
    icon: Trophy,
    tagline: "Return to sport stronger, safer and more confident",
    metaTitle: "Sports Rehabilitation in Multan | Injury Recovery — PainFix",
    metaDescription:
      "Sports rehabilitation in Multan for athletes and active people. Recover from injury, restore performance and prevent recurrence with PainFix Physiotherapy Clinic.",
    overview: [
      "Sports rehabilitation helps athletes and active individuals recover from injury, regain performance and reduce the risk of future problems. We combine hands-on treatment, progressive strengthening and sport-specific training.",
      "Whether you are a weekend runner or a competitive athlete, we build a return-to-sport plan around your sport, position and goals.",
    ],
    conditionsTreated: [
      "Sprains and strains",
      "Ligament and tendon injuries",
      "Muscle tears",
      "Overuse injuries",
      "Post-operative sports injuries",
      "Recurrent injuries",
    ],
    benefits: [
      "Safe, structured return to sport",
      "Restored strength and power",
      "Improved movement efficiency",
      "Reduced risk of re-injury",
      "Performance-focused conditioning",
    ],
    process: [
      { title: "Injury Assessment", description: "We diagnose the injury and understand your sport demands." },
      { title: "Recovery Phase", description: "Pain control, mobility and early loading of the injured tissue." },
      { title: "Strength & Power", description: "Progressive, sport-specific strengthening and conditioning." },
      { title: "Return to Sport", description: "Testing and drills to confirm you're ready to compete safely." },
    ],
    equipment: ["Resistance & plyometric equipment", "Agility and balance trainers", "Functional testing tools"],
    faqs: [
      { q: "How long until I can return to sport?", a: "It depends on the injury, but we use objective criteria to make sure your return is safe." },
      { q: "Do you treat non-professional athletes?", a: "Absolutely — programmes are tailored to every level, from beginners to competitors." },
      { q: "Can you help prevent future injuries?", a: "Yes, prevention and conditioning are a core part of every plan." },
    ],
    related: ["exercise-therapy", "manual-therapy", "post-surgical-rehabilitation"],
  },
  {
    slug: "home-physiotherapy",
    title: "Home Physiotherapy",
    shortTitle: "Home Physio",
    icon: Home,
    tagline: "Professional physiotherapy in the comfort of your home",
    metaTitle: "Home Physiotherapy in Multan | Home Visits — PainFix",
    metaDescription:
      "Home physiotherapy in Multan. Licensed physiotherapists provide assessment, treatment and rehabilitation at your home. Ideal for elderly and post-surgical patients.",
    overview: [
      "Home physiotherapy brings expert, one-on-one treatment directly to you — ideal for elderly patients, those recovering from surgery, and anyone who finds travel difficult.",
      "You receive the same personalized assessment, treatment and rehabilitation you would at the clinic, delivered with full attention in a familiar, comfortable environment.",
    ],
    conditionsTreated: [
      "Post-surgical recovery",
      "Stroke and neurological rehabilitation",
      "Elderly mobility and balance",
      "Chronic pain and arthritis",
      "Bed-bound and reduced-mobility patients",
      "Post-fracture rehabilitation",
    ],
    benefits: [
      "No travel or waiting rooms",
      "One-to-one focused care",
      "Comfortable, familiar surroundings",
      "Family can be involved in care",
      "Ideal for reduced mobility",
    ],
    process: [
      { title: "Request a Visit", description: "Share your details and needs through our home-visit form or WhatsApp." },
      { title: "Home Assessment", description: "A physiotherapist evaluates you and your home environment." },
      { title: "Treatment Plan", description: "A personalized plan delivered in the comfort of your home." },
      { title: "Ongoing Care", description: "Scheduled visits with progress tracking and family guidance." },
    ],
    equipment: ["Portable therapy equipment", "Mobility & transfer aids", "Home exercise tools"],
    faqs: [
      { q: "Which areas do you cover?", a: "We serve Multan city and nearby areas. Contact us to confirm coverage for your location." },
      { q: "How long is a home session?", a: "A typical home session lasts 45–60 minutes depending on your treatment needs." },
      { q: "Do you bring the equipment?", a: "Yes — our physiotherapists bring the portable equipment required for your treatment." },
    ],
    related: ["post-surgical-rehabilitation", "stroke-rehabilitation", "exercise-therapy"],
  },
  {
    slug: "post-surgical-rehabilitation",
    title: "Post Surgical Rehabilitation",
    shortTitle: "Post-Surgical Rehab",
    icon: ShieldPlus,
    tagline: "Guided recovery to help you heal fully after surgery",
    metaTitle: "Post Surgical Rehabilitation in Multan | Post-Op Physio — PainFix",
    metaDescription:
      "Post-surgical rehabilitation in Multan. Safe, guided recovery after orthopaedic and joint surgery to restore strength, movement and function. Book at PainFix.",
    overview: [
      "Post-surgical rehabilitation is essential to regain strength, movement and function after an operation. A structured programme helps you heal safely, avoid complications and return to your normal life sooner.",
      "We work in stages — protecting the healing tissue, restoring range of motion, and progressively rebuilding strength — always guided by your surgeon's protocol and your progress.",
    ],
    conditionsTreated: [
      "Joint replacement (knee, hip)",
      "Ligament reconstruction (ACL)",
      "Fracture fixation recovery",
      "Spinal surgery rehabilitation",
      "Shoulder and rotator cuff surgery",
      "Tendon repair recovery",
    ],
    benefits: [
      "Faster, safer recovery",
      "Reduced pain and swelling",
      "Restored range of motion",
      "Rebuilt strength and function",
      "Lower risk of complications",
    ],
    process: [
      { title: "Protection Phase", description: "Gentle movement and pain control to protect the healing tissue." },
      { title: "Mobility Phase", description: "Restoring range of motion and reducing stiffness safely." },
      { title: "Strengthening Phase", description: "Progressive loading to rebuild strength and stability." },
      { title: "Functional Phase", description: "Return to daily activities, work and sport with confidence." },
    ],
    equipment: ["CPM & mobility aids", "Resistance & balance equipment", "Electrotherapy for pain & swelling"],
    faqs: [
      { q: "When should I start rehab after surgery?", a: "Often within days, following your surgeon's guidance. Early, safe movement improves outcomes." },
      { q: "Do you follow my surgeon's protocol?", a: "Yes — we align your programme with your surgeon's instructions and your recovery stage." },
      { q: "How long does recovery take?", a: "It varies by procedure, but we set clear milestones and progress you safely at each stage." },
    ],
    related: ["exercise-therapy", "manual-therapy", "home-physiotherapy"],
  },
  {
    slug: "stroke-rehabilitation",
    title: "Stroke Rehabilitation",
    shortTitle: "Stroke Rehab",
    icon: Brain,
    tagline: "Neurological rehabilitation to rebuild movement and independence",
    metaTitle: "Stroke Rehabilitation in Multan | Neuro Physiotherapy — PainFix",
    metaDescription:
      "Stroke rehabilitation in Multan. Specialised neuro-physiotherapy to restore movement, balance and independence after stroke. Clinic and home visits at PainFix.",
    overview: [
      "Stroke rehabilitation helps patients regain movement, balance, coordination and independence after a stroke. Early, consistent and specialised physiotherapy is key to maximising recovery.",
      "Our neuro-focused programmes retrain the brain and body through repetitive, task-specific practice, strengthening and balance work — available both in clinic and at home.",
    ],
    conditionsTreated: [
      "Weakness on one side (hemiplegia)",
      "Balance and walking difficulty",
      "Loss of coordination",
      "Muscle tightness (spasticity)",
      "Reduced hand and arm function",
      "Fall risk and mobility loss",
    ],
    benefits: [
      "Improved movement and control",
      "Better balance and walking",
      "Greater independence in daily life",
      "Reduced risk of falls",
      "Support for patients and families",
    ],
    process: [
      { title: "Neuro Assessment", description: "A detailed evaluation of movement, tone, balance and function." },
      { title: "Task-Specific Training", description: "Repetitive practice of real-life movements to retrain control." },
      { title: "Strength & Balance", description: "Targeted work to improve stability and reduce fall risk." },
      { title: "Independence Training", description: "Building the skills needed for daily activities and mobility." },
    ],
    equipment: ["Balance & gait trainers", "Parallel bars", "Functional rehab tools", "Mobility aids"],
    faqs: [
      { q: "When should stroke rehab begin?", a: "As early as it is medically safe. Early rehabilitation leads to better recovery." },
      { q: "Can rehab be done at home?", a: "Yes — we offer home-based neuro rehabilitation for patients who cannot travel." },
      { q: "How long does recovery take?", a: "Recovery is gradual and individual; consistent therapy over months gives the best results." },
    ],
    related: ["home-physiotherapy", "exercise-therapy", "manual-therapy"],
  },
  {
    slug: "pain-management",
    title: "Pain Management",
    shortTitle: "Pain Management",
    icon: Activity,
    tagline: "Lasting relief through evidence-based, drug-free physiotherapy",
    metaTitle: "Pain Management in Multan | Chronic Pain Physiotherapy — PainFix",
    metaDescription:
      "Drug-free pain management in Multan for acute and chronic pain. Evidence-based physiotherapy to relieve pain and restore function at PainFix Physiotherapy Clinic.",
    overview: [
      "Our pain management approach treats the root cause of your pain, not just the symptoms. We combine manual therapy, exercise, electrotherapy and education to provide lasting, drug-free relief.",
      "Whether your pain is recent or long-standing, we build a personalized plan that helps you move better, feel better and return to the activities you enjoy.",
    ],
    conditionsTreated: [
      "Chronic back and neck pain",
      "Arthritis and joint pain",
      "Nerve pain and sciatica",
      "Muscle and postural pain",
      "Persistent post-injury pain",
      "Headaches of musculoskeletal origin",
    ],
    benefits: [
      "Targets the cause, not just symptoms",
      "Drug-free, non-invasive relief",
      "Improved movement and function",
      "Better sleep and quality of life",
      "Long-term self-management skills",
    ],
    process: [
      { title: "Pain Assessment", description: "We identify the source and drivers of your pain." },
      { title: "Multimodal Treatment", description: "A blend of manual therapy, electrotherapy and exercise." },
      { title: "Education", description: "Understanding your pain to reduce fear and improve recovery." },
      { title: "Self-Management", description: "Strategies and exercises to keep pain under control long-term." },
    ],
    equipment: ["Electrotherapy modalities", "Manual therapy tools", "Exercise equipment"],
    faqs: [
      { q: "Can physiotherapy really reduce chronic pain?", a: "Yes — evidence shows active, personalized physiotherapy is highly effective for chronic pain." },
      { q: "Will I become dependent on treatment?", a: "No. Our goal is to give you the tools to manage your pain independently." },
      { q: "Do I need a referral?", a: "No referral is needed — you can book an assessment directly with us." },
    ],
    related: ["manual-therapy", "electrotherapy", "posture-ergonomic-assessment"],
  },
  {
    slug: "posture-ergonomic-assessment",
    title: "Posture & Ergonomic Assessment",
    shortTitle: "Posture & Ergonomics",
    icon: PersonStanding,
    tagline: "Correct posture and workspace habits to prevent pain",
    metaTitle: "Posture & Ergonomic Assessment in Multan — PainFix Physiotherapy",
    metaDescription:
      "Posture and ergonomic assessment in Multan. Identify and correct posture and workplace habits that cause pain. Practical, personalized advice at PainFix.",
    overview: [
      "Poor posture and workstation setup are among the most common causes of neck, back and shoulder pain. Our posture and ergonomic assessment identifies the habits and positions driving your discomfort.",
      "You receive practical, personalized recommendations — from workstation adjustments to targeted exercises — to reduce strain and prevent recurring pain.",
    ],
    conditionsTreated: [
      "Neck and shoulder pain",
      "Upper and lower back pain",
      "Work-related strain injuries",
      "Tension headaches",
      "Rounded shoulders & forward head posture",
      "Repetitive strain injuries",
    ],
    benefits: [
      "Identifies the cause of postural pain",
      "Practical workstation improvements",
      "Reduced strain during work and study",
      "Targeted corrective exercises",
      "Prevents recurring problems",
    ],
    process: [
      { title: "Postural Analysis", description: "We assess your standing, sitting and working posture." },
      { title: "Ergonomic Review", description: "Evaluation of your workstation and daily positions." },
      { title: "Correction Plan", description: "Personalized adjustments and corrective exercises." },
      { title: "Follow-Up", description: "We review your changes and refine your programme." },
    ],
    equipment: ["Postural assessment tools", "Corrective exercise equipment"],
    faqs: [
      { q: "Who needs a posture assessment?", a: "Anyone with recurring neck, back or shoulder pain, or who works long hours at a desk." },
      { q: "Can better posture really reduce pain?", a: "Yes — correcting posture and workstation habits significantly reduces strain and pain." },
      { q: "Do you assess home offices?", a: "Yes, we provide guidance for home, office and study setups." },
    ],
    related: ["pain-management", "exercise-therapy", "manual-therapy"],
  },
];

export const serviceMap = Object.fromEntries(services.map((s) => [s.slug, s]));

export function getService(slug: string): Service | undefined {
  return serviceMap[slug];
}
