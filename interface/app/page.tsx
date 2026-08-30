import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/Landing/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app");
  }

  return <LandingPage />;
}