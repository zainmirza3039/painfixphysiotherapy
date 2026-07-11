import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { PageHero } from "@/components/site/PageHero";
import { PageCTA } from "@/components/site/PageCTA";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_TEL, CLINIC_ADDRESS } from "@/components/site/constants";

const UPDATED = "2026-07-11";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const path = "/privacy";
    return {
      meta: pageMeta({
        title: "Privacy & Cookie Policy — PainFix Physiotherapy Clinic, Multan",
        description:
          "How PainFix Physiotherapy Clinic collects, uses, stores and protects your personal and health information, including cookies and your data rights.",
        path,
      }),
      links: canonical(path),
      scripts: [
        breadcrumbLd([
          { label: "Home", path: "/" },
          { label: "Privacy Policy", path },
        ]),
      ],
    };
  },
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Legal"
        title="Privacy & Cookie Policy"
        subtitle="Your privacy and the confidentiality of your health information matter to us."
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Privacy Policy", path: "/privacy" },
        ]}
        showActions={false}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date(UPDATED).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <Section title="Who we are">
          <p>
            This Privacy Policy explains how PainFix Physiotherapy Clinic ("we", "us", "our"), located at{" "}
            {CLINIC_ADDRESS}, handles information collected through our website.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            We only collect the information you choose to provide through our contact and home-visit request forms. This
            may include your name, phone number, email address, home address, and any health details or medical reports
            you share so that we can respond to your request.
          </p>
        </Section>

        <Section title="How we use your information">
          <ul className="list-disc space-y-2 pl-5">
            <li>To respond to enquiries and schedule appointments or home visits.</li>
            <li>To provide, personalize and improve our physiotherapy care.</li>
            <li>To contact you about your request via phone, WhatsApp or email.</li>
          </ul>
          <p>We do not sell your personal or health information to any third party.</p>
        </Section>

        <Section title="Health information & confidentiality">
          <p>
            Any medical details or reports you submit are treated as confidential and used solely for assessment and
            treatment planning. Access is limited to our clinical team on a need-to-know basis.
          </p>
        </Section>

        <Section title="Data storage & security">
          <p>
            Form submissions and uploaded reports are stored securely with our backend provider using access controls
            and encryption in transit (HTTPS). We retain data only as long as necessary to provide care and meet legal
            obligations.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Our website uses essential cookies required for the site to function and may use privacy-friendly analytics
            to understand how the site is used. You can control or delete cookies through your browser settings; blocking
            essential cookies may affect site functionality.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            We use trusted services such as Google Maps (for directions), WhatsApp and Calendly (for scheduling). These
            providers process data under their own privacy policies.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You may request access to, correction of, or deletion of your personal information at any time. To exercise
            these rights, contact us using the details below.
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
