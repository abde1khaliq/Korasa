import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { HomeSubjects } from "@/components/HomeSubjects/HomeSubjects";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

export default async function AppHome() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppLayoutShell title="Subjects">
      <HomeSubjects />
    </AppLayoutShell>
  );
}
