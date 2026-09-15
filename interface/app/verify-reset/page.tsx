import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { VerifyReset } from "@/components/Auth/VerifyReset";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Verify Reset Code",
  description: "Verify your password reset code.",
  path: "/verify-reset",
  noIndex: true,
});

export default async function VerifyResetPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return (
    <Suspense>
      <VerifyReset />
    </Suspense>
  );
}
