import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ForgotPassword } from "@/components/Auth/ForgotPassword";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Forgot Password",
  description: "Reset your Korasa account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return <ForgotPassword />;
}
