import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ResetPassword } from "@/components/Auth/ResetPassword";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Reset Password",
  description: "Set a new password for your Korasa account.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
