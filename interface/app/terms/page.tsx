import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { LegalPageLayout } from "@/components/Legal/LegalPageLayout";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing your use of the Korasa study companion and practice exam platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="September 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, or using Korasa (&quot;the Service&quot;),
          you agree to be bound by these Terms of Service. If you do not agree
          to these terms, please do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of the Service</h2>
        <p>
          Korasa provides an online study companion, question bank organizer,
          and practice exam generator designed to help students capture questions
          and test their knowledge.
        </p>
      </section>

      <section>
        <h2>3. User Accounts and Responsibility</h2>
        <p>
          To access the features of Korasa, you must create an account. You
          agree to:
        </p>
        <ul>
          <li>Provide accurate and current information during registration.</li>
          <li>
            Maintain the confidentiality and security of your account password.
          </li>
          <li>
            Be fully responsible for all activities and content created under
            your account.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable Use and Content Standards</h2>
        <p>You agree not to use Korasa to:</p>
        <ul>
          <li>
            Upload unlawful, harassing, infringing, or harmful material.
          </li>
          <li>
            Attempt to probe, scan, or breach the security or authentication
            mechanisms of the Service.
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Service or servers.
          </li>
          <li>
            Reverse-engineer, scrape, or extract unauthorized data from the
            platform.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property Rights</h2>
        <p>
          <strong>Your Content:</strong> You retain ownership of the study
          questions, notes, and photos you upload to your account. By saving
          content, you grant Korasa a license to store, process, and display
          that content solely to provide the study features to you.
        </p>
        <p>
          <strong>Korasa Property:</strong> The Korasa software, branding, logos,
          UI design, and code are the exclusive property of Korasa and are
          protected by intellectual property laws.
        </p>
      </section>

      <section>
        <h2>6. Disclaimer and Limitation of Liability</h2>
        <p>
          Korasa is provided &quot;as is&quot; without warranties of any kind, whether
          express or implied. We do not guarantee that the Service will be
          uninterrupted, error-free, or completely secure. In no event shall
          Korasa be liable for any indirect, incidental, or consequential
          damages resulting from your use of the platform.
        </p>
      </section>

      <section>
        <h2>7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you
          violate these Terms or engage in activities that compromise the
          security or reliability of the Service. You may also delete your
          account at any time.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          For questions regarding these Terms of Service, please reach out to{" "}
          <a href="mailto:support@korasa.study">support@korasa.study</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
