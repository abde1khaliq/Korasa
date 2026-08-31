import type { Metadata } from "next";
import { VerifyEmailPage } from "@/components/Auth/Verify";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Verify Email",
  description: "Verify your email address to continue to Korasa.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerificationPage() {
  return <VerifyEmailPage />;
}