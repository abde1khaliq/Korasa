import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/Calendar/CalendarView";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppLayoutShell
      title="Calendar & Lessons"
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Calendar" },
      ]}
    >
      <CalendarView />
    </AppLayoutShell>
  );
}
