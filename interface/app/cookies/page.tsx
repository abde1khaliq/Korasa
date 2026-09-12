import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { LegalPageLayout } from "@/components/Legal/LegalPageLayout";

export const metadata: Metadata = constructMetadata({
  title: "Cookie Policy",
  description:
    "Understand how Korasa uses essential cookies and local storage to provide a secure and personalized study experience.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="September 2026">
      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that websites place on your device when you
          visit them. They are widely used to make web applications work
          efficiently, maintain secure login sessions, and remember your
          preferences.
        </p>
      </section>

      <section>
        <h2>2. How Korasa Uses Cookies</h2>
        <p>
          Korasa takes a privacy-first approach. We strictly use{" "}
          <strong>essential cookies</strong> necessary for the core operation and
          security of the website. <strong>We do not use advertising, marketing, or
          cross-site tracking cookies.</strong>
        </p>

        <h3>A. Essential Authentication Cookies</h3>
        <p>
          When you sign in to your Korasa account, secure session tokens are set to authenticate your requests and keep
          you signed in as you navigate between your subjects, folders, and
          exams.
        </p>

        <h3>B. Local Storage Preferences</h3>
        <p>
          We use your browser&apos;s <code>localStorage</code> to store non-sensitive UI
          preferences, such as:
        </p>
        <ul>
          <li>Your theme preference (Light / Dark / System mode).</li>
          <li>Your language selection (English / Arabic).</li>
          <li>Your cookie consent acknowledgment status.</li>
        </ul>
      </section>

      <section>
        <h2>3. Managing Your Cookies</h2>
        <p>
          You can choose to disable or block cookies through your browser
          settings. However, please note that blocking essential authentication
          cookies will prevent you from signing in and accessing your private
          question bank and exams.
        </p>
      </section>

      <section>
        <h2>4. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in technology or legal requirements. Any updates will be posted on
          this page with an updated revision date.
        </p>
      </section>

      <section>
        <h2>5. Contact Us</h2>
        <p>
          If you have questions about our use of cookies or local storage, please
          contact us at{" "}
          <a href="mailto:support@korasa.study">support@korasa.study</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
