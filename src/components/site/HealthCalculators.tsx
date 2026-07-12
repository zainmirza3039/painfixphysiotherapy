import { useMemo, useState } from "react";
import { Flame, Scale, Beef, Droplets } from "lucide-react";
import {
  ACTIVITY_FACTORS,
  type ActivityLevel,
  type Sex,
  calcBmr,
  calcTdee,
  idealWeightRange,
  proteinRange,
  waterLitres,
} from "@/lib/health-calc";
import { Reveal } from "./Reveal";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted-foreground";

function CalcCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-live="polite"
      className="mt-auto rounded-xl bg-surface p-4 text-sm leading-relaxed text-foreground"
    >
      {children}
    </div>
  );
}

/* ------------------------------- Calorie ---------------------------------- */
function CalorieCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [level, setLevel] = useState<ActivityLevel>("moderate");

  const tdee = useMemo(() => {
    const bmr = calcBmr(
      sex,
      parseFloat(weight) || 0,
      parseFloat(height) || 0,
      parseFloat(age) || 0,
    );
    if (!bmr) return null;
    return calcTdee(bmr, level);
  }, [sex, weight, height, age, level]);

  return (
    <CalcCard icon={<Flame className="h-5 w-5" />} title="Daily Calorie Calculator">
      <div className="grid grid-cols-2 gap-3">
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
          <label htmlFor="cal-age" className={labelClass}>
            Age
          </label>
          <input
            id="cal-age"
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputClass}
            placeholder="30"
          />
        </div>
        <div>
          <label htmlFor="cal-w" className={labelClass}>
            Weight (kg)
          </label>
          <input
            id="cal-w"
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputClass}
            placeholder="68"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="cal-h" className={labelClass}>
            Height (cm)
          </label>
          <input
            id="cal-h"
            type="number"
            min={0}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={inputClass}
            placeholder="170"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="cal-act" className={labelClass}>
            Activity level
          </label>
          <select
            id="cal-act"
            value={level}
            onChange={(e) => setLevel(e.target.value as ActivityLevel)}
            className={inputClass}
          >
            {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ResultBox>
        {tdee ? (
          <>
            <span className="font-heading text-2xl font-extrabold text-foreground">
              {tdee.toLocaleString()}
            </span>{" "}
            kcal/day to maintain your weight. For gradual, healthy weight loss aim for roughly{" "}
            <strong>{(tdee - 500).toLocaleString()}</strong> kcal/day.
          </>
        ) : (
          "Enter your details to estimate your daily calorie needs."
        )}
      </ResultBox>
    </CalcCard>
  );
}

/* ----------------------------- Ideal Weight ------------------------------- */
function IdealWeightCalculator() {
  const [height, setHeight] = useState("");
  const range = useMemo(() => idealWeightRange(parseFloat(height) || 0), [height]);
  return (
    <CalcCard icon={<Scale className="h-5 w-5" />} title="Ideal Weight Calculator">
      <label htmlFor="iw-h" className={labelClass}>
        Height (cm)
      </label>
      <input
        id="iw-h"
        type="number"
        min={0}
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        className={inputClass}
        placeholder="e.g. 170"
      />
      <ResultBox>
        {range ? (
          <>
            A healthy weight range for your height is{" "}
            <strong className="font-heading">
              {range.min}–{range.max} kg
            </strong>{" "}
            (based on the WHO healthy BMI band of 18.5–24.9).
          </>
        ) : (
          "Enter your height to see a healthy weight range."
        )}
      </ResultBox>
    </CalcCard>
  );
}

/* ------------------------------- Protein ---------------------------------- */
function ProteinCalculator() {
  const [weight, setWeight] = useState("");
  const [active, setActive] = useState(false);
  const range = useMemo(() => proteinRange(parseFloat(weight) || 0, active), [weight, active]);
  return (
    <CalcCard icon={<Beef className="h-5 w-5" />} title="Daily Protein Calculator">
      <label htmlFor="pr-w" className={labelClass}>
        Weight (kg)
      </label>
      <input
        id="pr-w"
        type="number"
        min={0}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className={inputClass}
        placeholder="e.g. 68"
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        I train / strength train regularly
      </label>
      <ResultBox>
        {range ? (
          <>
            Aim for roughly{" "}
            <strong className="font-heading">
              {range.min}–{range.max} g
            </strong>{" "}
            of protein per day{active ? " to support training and recovery" : ""}.
          </>
        ) : (
          "Enter your weight to estimate daily protein needs."
        )}
      </ResultBox>
    </CalcCard>
  );
}

/* -------------------------------- Water ----------------------------------- */
function WaterCalculator() {
  const [weight, setWeight] = useState("");
  const litres = useMemo(() => waterLitres(parseFloat(weight) || 0), [weight]);
  return (
    <CalcCard icon={<Droplets className="h-5 w-5" />} title="Daily Water Intake Calculator">
      <label htmlFor="wa-w" className={labelClass}>
        Weight (kg)
      </label>
      <input
        id="wa-w"
        type="number"
        min={0}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className={inputClass}
        placeholder="e.g. 68"
      />
      <ResultBox>
        {litres ? (
          <>
            Aim for around <strong className="font-heading">{litres} litres</strong> of water per
            day ({Math.round(litres * 4)} glasses). Increase this in hot weather or with heavy
            exercise.
          </>
        ) : (
          "Enter your weight to estimate your daily water needs."
        )}
      </ResultBox>
    </CalcCard>
  );
}

const CALCULATORS = [CalorieCalculator, IdealWeightCalculator, ProteinCalculator, WaterCalculator];

export function HealthCalculators() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {CALCULATORS.map((C, i) => (
        <Reveal key={i} anim="up" delay={(i % 2) * 70}>
          <C />
        </Reveal>
      ))}
    </div>
  );
}
