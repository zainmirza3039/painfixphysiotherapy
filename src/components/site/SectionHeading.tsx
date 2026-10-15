import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }: Props) {
  return (
    <Reveal
      anim="up"
      className={
        align === "center"
          ? "section-heading mx-auto max-w-3xl text-center"
          : "section-heading max-w-3xl"
      }
    >
      <p className="home-eyebrow">
        <span aria-hidden="true" /> {eyebrow}
      </p>
      <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
