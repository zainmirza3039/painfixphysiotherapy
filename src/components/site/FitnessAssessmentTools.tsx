import { useMemo, useState } from "react";
import { Percent, MessageCircle } from "lucide-react";
import { type Sex, calcBmi, estimateBodyFat } from "@/lib/health-calc";
import { WHATSAPP_URL } from "./constants";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted-foreground";

/* --------------------------- Body Fat Estimator --------------------------- */
export function BodyFatEstimator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const bmi = calcBmi(parseFloat(weight) || 0, parseFloat(height) || 0);
    if (!bmi) return null;
    const bf = estimateBodyFat(sex, bmi.bmi, parseFloat(age) || 0);
    return bf === null ? null : { bf };
  }, [sex, age, height, weight]);

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Percent className="h-5 w-5" />
        </span>
        Body Fat Estimation
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <span className={labelClass}>Sex</span>
          <div
            role="group"
            aria-label="Sex"
            className="inline-flex rounded-xl border border-border bg-background p-1"
          >
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                aria-pressed={sex === s}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  sex === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="bf-age" className={labelClass}>
            Age
          </label>
          <input
            id="bf-age"
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputClass}
            placeholder="30"
          />
        </div>
        <div>
          <label htmlFor="bf-w" className={labelClass}>
            Weight (kg)
          </label>
          <input
            id="bf-w"
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputClass}
            placeholder="68"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="bf-h" className={labelClass}>
            Height (cm)
          </label>
          <input
            id="bf-h"
            type="number"
            min={0}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={inputClass}
            placeholder="170"
          />
        </div>
      </div>
      <div
        aria-live="polite"
        className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed text-foreground"
      >
        {result ? (
          <>
            Estimated body fat: <strong className="font-heading text-lg">{result.bf}%</strong>. This
            is a statistical estimate from height, weight, age and sex — not a measurement. For
            accurate body composition, a professional assessment is recommended.
          </>
        ) : (
          "Enter your details for an estimated body-fat percentage."
        )}
      </div>
    </div>
  );
}

/* ------------------------ Fitness Goal Questionnaire ---------------------- */
const GOALS = [
  "Lose weight",
  "Build strength / muscle",
  "Improve mobility & flexibility",
  "Reduce or manage pain",
  "Recover from an injury",
  "Improve general fitness",
  "Sports performance",
  "Posture correction",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function FitnessGoalForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [level, setLevel] = useState("Beginner");
  const [notes, setNotes] = useState("");

  const toggle = (g: string) =>
    setSelected((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const waUrl = useMemo(() => {
    const msg =
      `Hi PainFix, I'd like a fitness consultation.\n` +
      `Goals: ${selected.length ? selected.join(", ") : "—"}\n` +
      `Current level: ${level}` +
      (notes.trim() ? `\nNotes: ${notes.trim()}` : "");
    return `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`;
  }, [selected, level, notes]);

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
      <h3 className="font-heading text-lg font-bold text-foreground">Fitness Goal Questionnaire</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Tell us your goals and we'll build a safe, personalised plan. Sends securely via WhatsApp —
        no data stored here.
      </p>

      <fieldset className="mt-5">
        <legend className={labelClass}>What are your goals? (select all that apply)</legend>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = selected.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggle(g)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  on
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={labelClass}>Current fitness level</legend>
        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              aria-pressed={level === l}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                level === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="fg-notes" className={labelClass}>
          Anything else? (injuries, conditions, preferences)
        </label>
        <textarea
          id="fg-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={3}
          className={inputClass}
          placeholder="e.g. previous knee injury, prefer home workouts"
        />
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.02]"
      >
        <MessageCircle className="h-4 w-4" /> Send my goals on WhatsApp
      </a>
    </div>
  );
}
