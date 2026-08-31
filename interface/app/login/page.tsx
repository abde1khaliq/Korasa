import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Login } from "@/components/Auth/Login";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Log In",
  description:
    "Sign in to your Korasa account to access your subjects, folders, and practice exams.",
  path: "/login",
});

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return <Login />;
}
