import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/Settings/SettingsView";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppLayoutShell
      title="Settings"
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Settings" },
      ]}
    >
      <SettingsView />
    </AppLayoutShell>
  );
}
