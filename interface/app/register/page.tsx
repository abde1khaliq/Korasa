import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Register } from "@/components/Auth/Register";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Create Account",
  description:
    "Join Korasa for free. Organize your study materials, capture questions, and generate practice exams.",
  path: "/register",
});

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return <Register />;
}