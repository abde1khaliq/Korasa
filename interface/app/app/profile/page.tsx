import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/Settings/ProfileView";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppLayoutShell
      title="Profile"
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Profile" },
      ]}
    >
      <ProfileView />
    </AppLayoutShell>
  );
}
