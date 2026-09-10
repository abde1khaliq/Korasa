import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { LegalPageLayout } from "@/components/Legal/LegalPageLayout";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Korasa collects, uses, and safeguards your personal data, study questions, and account information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="September 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to Korasa (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed
          to protecting your privacy and ensuring that your personal information
          is handled safely and responsibly. This Privacy Policy explains what
          information we collect, how we use and store it, and your rights
          regarding your data.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>A. Account Information</h3>
        <p>
          When you register for a Korasa account, we collect your username,
          email address, and a secure hash of your password. We never store
          plain-text passwords.
        </p>

        <h3>B. User-Generated Study Content</h3>
        <p>
          To deliver our study tools, we store the subjects, chapter folders,
          questions, solution notes, difficulty ratings, and practice exam
          attempts that you create or save.
        </p>

        <h3>C. Photos and Camera Uploads</h3>
        <p>
          If you use our photo capture or OCR features to record questions, we
          store the images you upload securely to provide question review and
          exam generation features within your account.
        </p>

        <h3>D. Technical & Session Data</h3>
        <p>
          We collect essential session authentication tokens to keep you logged
          in securely. We do not sell your personal data or track your browsing
          across third-party websites.
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use your information exclusively to:</p>
        <ul>
          <li>Provide, maintain, and improve the Korasa platform.</li>
          <li>
            Organize your question banks and generate tailored practice exams.
          </li>
          <li>Authenticate your identity and secure your account.</li>
          <li>Send account verification and essential security notifications.</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Storage and Security</h2>
        <p>
          We employ industry-standard security practices, including encrypted
          communications (TLS/HTTPS), salted password hashing, and restricted
          database access to protect your personal information against
          unauthorized access, alteration, or disclosure.
        </p>
      </section>

      <section>
        <h2>5. Data Sharing and Third Parties</h2>
        <p>
          We do not sell, rent, or trade your personal information. We may only
          share data with trusted service providers who assist us in operating
          our application (such as cloud hosting, image storage, and email
          delivery), strictly under confidential and data protection agreements.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Update or correct your account information.</li>
          <li>Delete your questions, folders, subjects, or complete account at any time.</li>
          <li>Export or request a copy of your study data.</li>
        </ul>
      </section>

      <section>
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy
          Policy, please contact us at{" "}
          <a href="mailto:support@korasa.study">support@korasa.study</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
