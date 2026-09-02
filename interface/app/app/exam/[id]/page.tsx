import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ExamDetail } from "@/components/Exams/ExamDetail";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
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
        { label: "Exam Overview" },
      ]}
    >
      <ExamDetail examId={id} />
    </AppLayoutShell>
  );
}
