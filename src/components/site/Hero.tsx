import { CalendarDays, Clock3, MapPin, Video } from "lucide-react";
import painfixSign960 from "@/assets/hero-960.webp";
import painfixSign1800 from "@/assets/hero.webp";

const SIGN_SRCSET = `${painfixSign960} 960w, ${painfixSign1800} 1800w`;

export function Hero() {
  return (
    <section id="home" aria-labelledby="home-heading" className="home-hero scroll-mt-24">
      <img
        className="home-hero__background"
        src={painfixSign1800}
        srcSet={SIGN_SRCSET}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        width={853}
        height={1280}
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
      <div className="home-hero__inner">
        <h1 id="home-heading" className="home-hero__heading home-hero__heading--top">
          Physiotherapist in <span className="home-hero__accent">Multan.</span>
        </h1>
        <div className="home-hero__content">
          <p className="home-hero__description">
            Looking for a physiotherapist in Multan or a physiotherapy clinic near you? PainFix
            provides assessment-led physiotherapy for back pain, sciatica, knee pain, injuries and
            rehabilitation, with clinic appointments and home physiotherapy visits across Multan.
          </p>
          <p className="home-hero__tagline">Move Better. Recover Faster. Live Pain-Free.</p>
          <div className="home-hero__actions">
            <a
              href="/book-appointment?city=multan&service=clinic"
              className="home-hero__appointment"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Multan clinic appointment
            </a>
            <a
              href="/book-appointment?city=rahim-yar-khan&service=online"
              className="home-hero__appointment home-hero__appointment--secondary"
            >
              <Video className="h-4 w-4 shrink-0" aria-hidden="true" /> Rahim Yar Khan · Online
            </a>
            <a
              href="/book-appointment?city=multan&service=home_visit"
              className="home-hero__home-visit"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" /> Need a home visit in Multan?
            </a>
          </div>

          <div className="home-hero__details">
            <span>
              <MapPin className="home-hero__detail-icon h-4 w-4 shrink-0" aria-hidden="true" />
              Shalimar Colony, Multan
            </span>
            <span>
              <Clock3 className="home-hero__detail-icon h-4 w-4 shrink-0" aria-hidden="true" />
              Mon–Sat, 11:00 AM–4:00 PM
            </span>
          </div>
          <p className="home-hero__hours-note">Sunday by appointment</p>
        </div>
      </div>
    </section>
  );
}
