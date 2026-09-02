import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ExamsList } from "@/components/Exams/ExamsList";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppLayoutShell
      title="Exams & Quizzes"
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Exams" },
      ]}
    >
      <ExamsList />
    </AppLayoutShell>
  );
}
