import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  BMI_BANDS,
  BMI_GAUGE_MAX,
  BMI_GAUGE_MIN,
  calcBmi,
  feetInchesToCm,
} from "@/lib/health-calc";
import { WHATSAPP_CONSULT_URL } from "./constants";

type Unit = "cm" | "ft";

/**
 * Accessible, lightweight BMI calculator with a colour-coded WHO gauge.
 * Pure client maths — no charting library — so it never affects page weight.
 */
export function BmiCalculator({ compact = false }: { compact?: boolean }) {
  const [unit, setUnit] = useState<Unit>("cm");
  const [cm, setCm] = useState("");
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [weight, setWeight] = useState("");

  const heightCm = useMemo(() => {
    if (unit === "cm") return parseFloat(cm) || 0;
    return feetInchesToCm(parseFloat(ft) || 0, parseFloat(inch) || 0);
  }, [unit, cm, ft, inch]);

  const result = useMemo(() => calcBmi(parseFloat(weight) || 0, heightCm), [weight, heightCm]);

  // Gauge marker position (0–100%) clamped to the visible scale.
  const markerPct = result
    ? Math.min(
        100,
        Math.max(0, ((result.bmi - BMI_GAUGE_MIN) / (BMI_GAUGE_MAX - BMI_GAUGE_MIN)) * 100),
      )
    : null;

  const activeColor = result ? BMI_BANDS.find((b) => b.key === result.category)?.color : undefined;

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div
      className={`rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8 ${
        compact ? "" : "mx-auto max-w-3xl"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">BMI Calculator</h3>
        <div
          role="group"
          aria-label="Height unit"
          className="inline-flex rounded-xl border border-border bg-background p-1"
        >
          {(["cm", "ft"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {u === "cm" ? "cm" : "ft / in"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {unit === "cm" ? (
          <div>
            <label htmlFor="bmi-cm" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Height (cm)
            </label>
            <input
              id="bmi-cm"
              type="number"
              inputMode="decimal"
              min={0}
              value={cm}
              onChange={(e) => setCm(e.target.value)}
              placeholder="e.g. 170"
              className={inputClass}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bmi-ft" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Height (ft)
              </label>
              <input
                id="bmi-ft"
                type="number"
                inputMode="numeric"
                min={0}
                value={ft}
                onChange={(e) => setFt(e.target.value)}
                placeholder="5"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bmi-in" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Inches
              </label>
              <input
                id="bmi-in"
                type="number"
                inputMode="numeric"
                min={0}
                value={inch}
                onChange={(e) => setInch(e.target.value)}
                placeholder="7"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="bmi-weight" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Weight (kg)
          </label>
          <input
            id="bmi-weight"
            type="number"
            inputMode="decimal"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 68"
            className={inputClass}
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-6" aria-live="polite">
        {result ? (
          <>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your BMI
                </p>
                <p className="font-heading text-4xl font-extrabold text-foreground">{result.bmi}</p>
              </div>
              <span
                className="rounded-full px-4 py-1.5 text-sm font-bold text-white"
                style={{ backgroundColor: activeColor }}
              >
                {result.label}
              </span>
            </div>

            {/* Colour-coded gauge */}
            <div className="mt-5">
              <div className="relative h-3 w-full overflow-hidden rounded-full">
                <div className="flex h-full w-full">
                  {BMI_BANDS.map((b) => (
                    <div key={b.key} className="h-full flex-1" style={{ backgroundColor: b.color }} />
                  ))}
                </div>
              </div>
              {markerPct !== null && (
                <div className="relative">
                  <div
                    className="absolute -top-[1.15rem] -translate-x-1/2 transition-all"
                    style={{ left: `${markerPct}%` }}
                    aria-hidden="true"
                  >
                    <div className="mx-auto h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-foreground" />
                  </div>
                </div>
              )}
              <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
                {BMI_BANDS.map((b) => (
                  <span key={b.key} className="flex-1 text-center">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted-foreground">
              BMI (Body Mass Index) is a screening estimate based on height and weight using the World
              Health Organisation categories. It does not measure body fat, muscle mass or overall
              health, and can read high for muscular or athletic builds. Use it as a general guide, not
              a diagnosis. For a personalised assessment, speak to our physiotherapists.
            </p>

            <a
              href={WHATSAPP_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-card transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" /> Discuss your result on WhatsApp
            </a>
          </>
        ) : (
          <p className="rounded-xl bg-surface p-4 text-sm text-muted-foreground">
            Enter your height and weight to calculate your BMI and see your WHO category.
          </p>
        )}
      </div>
    </div>
  );
}
