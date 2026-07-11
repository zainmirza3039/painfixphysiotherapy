import { Sparkles, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

interface QuickAnswerProps {
  answer: string;
  takeaways?: string[];
}

/**
 * AEO / GEO block: a concise "Quick Answer" plus "Key Takeaways" formatted for
 * AI search engines (ChatGPT, Gemini, Perplexity, Copilot) and Google AI Overviews.
 */
export function QuickAnswer({ answer, takeaways = [] }: QuickAnswerProps) {
  return (
    <Reveal anim="up">
      <div className="rounded-[1.75rem] border border-secondary/30 bg-secondary/5 p-7 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-secondary" /> Quick Answer
        </h2>
        <p className="mt-3 text-base leading-relaxed text-foreground/90">{answer}</p>

        {takeaways.length > 0 && (
          <>
            <h3 className="mt-6 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Key Takeaways
            </h3>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {takeaways.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {t}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Reveal>
  );
}
