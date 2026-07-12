import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_TEL } from "@/components/site/constants";

const UPDATED = "2026-07-11";

export const Route = createFileRoute("/terms")({
  head: () => {
    const path = "/terms";
    return {
      meta: pageMeta({
        title: "Terms of Service & Medical Disclaimer — PainFix Physiotherapy",
        description:
          "The terms governing your use of the PainFix Physiotherapy Clinic website, including our medical disclaimer and limitations of liability.",
        path,
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Terms of Service", path },
        ]),
      ],
    };
  },
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function TermsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our website."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Terms of Service", path: "/terms" },
        ]}
        showActions={false}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date(UPDATED).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <Section title="Acceptance of terms">
          <p>
            By accessing and using the PainFix Physiotherapy Clinic website, you agree to these
            Terms of Service. If you do not agree, please do not use the site.
          </p>
        </Section>

        <Section title="Medical disclaimer">
          <p>
            The content on this website is provided for general educational purposes only and is not
            a substitute for professional medical advice, diagnosis or treatment. Always seek the
            advice of a qualified physiotherapist or physician regarding a medical condition. Never
            disregard professional advice or delay seeking it because of something you read on this
            site.
          </p>
          <p>In a medical emergency, contact your local emergency services immediately.</p>
        </Section>

        <Section title="Appointments & bookings">
          <p>
            Requests submitted through our website (including contact forms, home-visit requests and
            scheduling links) are enquiries and are confirmed only once our team contacts you.
            Availability is not guaranteed until confirmed.
          </p>
        </Section>

        <Section title="Use of the website">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Do not misuse the site, attempt to disrupt it, or submit false or malicious
              information.
            </li>
            <li>
              Content, branding and materials on this site remain the property of PainFix
              Physiotherapy Clinic.
            </li>
          </ul>
        </Section>

        <Section title="Limitation of liability">
          <p>
            We strive to keep information accurate and up to date but make no warranties as to its
            completeness. We are not liable for any loss arising from reliance on website content.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Email:{" "}
            <a href={EMAIL_HREF} className="font-medium text-primary hover:underline">
              {EMAIL}
            </a>
            <br />
            Phone:{" "}
            <a href={PHONE_TEL} className="font-medium text-primary hover:underline">
              {PHONE_DISPLAY}
            </a>
          </p>
        </Section>
      </article>

      <PageCTA />
    </PageLayout>
  );
}
