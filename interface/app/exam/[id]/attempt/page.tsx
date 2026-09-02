import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ExamAttemptRunner } from "@/components/Exams/ExamAttemptRunner";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface ExamAttemptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamAttemptPage({ params }: ExamAttemptPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <AppLayoutShell
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Exams", href: "/app/exams" },
        { label: "Exam Run" },
      ]}
    >
      <ExamAttemptRunner examId={id} />
    </AppLayoutShell>
  );
}
