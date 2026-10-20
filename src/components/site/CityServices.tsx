import { ArrowUpRight, Home, MapPin, Video } from "lucide-react";

const cardClassName =
  "group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-card focus-within:outline-none focus-within:ring-2 focus-within:ring-primary sm:p-6";

export function CityServices() {
  return (
    <section
      id="city-services"
      aria-labelledby="city-services-heading"
      className="home-section scroll-mt-24 bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="home-eyebrow home-eyebrow--light">
            <span aria-hidden="true" /> Care where you need it
          </p>
          <h2
            id="city-services-heading"
            className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Physiotherapy in Multan and Rahim Yar Khan
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/75 sm:text-base">
            Choose the right way to start care. Multan patients can visit our clinic or request a
            home visit; Rahim Yar Khan patients can connect with Ariba Babar DPT for online
            physiotherapy.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className={`${cardClassName} text-foreground`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Multan
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-primary">
                  Clinic and home physiotherapy
                </h3>
              </div>
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#00A859]/10 text-[#00A859]"
                aria-hidden="true"
              >
                <MapPin className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
              Book an in-person appointment at PainFix in Shalimar Colony, or choose a physiotherapy
              home visit across Multan.
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <a
                href="/book-appointment?city=multan&service=clinic"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Book clinic visit <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="/book-appointment?city=multan&service=home_visit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Request home visit <Home className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>

          <article className={`${cardClassName} text-foreground`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Rahim Yar Khan
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-primary">
                  Online physiotherapy
                </h3>
              </div>
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#00A859]/10 text-[#00A859]"
                aria-hidden="true"
              >
                <Video className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
              Rahim Yar Khan appointments are online only with Ariba Babar DPT. Get personalised
              physiotherapy guidance from your own home. No clinic visit or local home visit is
              offered.
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <a
                href="/book-appointment?city=rahim-yar-khan&service=online"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Enquire about online care <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="/ariba-babar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Meet Ariba Babar DPT
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
