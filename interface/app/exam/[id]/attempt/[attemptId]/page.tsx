import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AttemptSummaryScreen } from "@/components/Exams/AttemptSummaryScreen";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface AttemptSummaryPageProps {
  params: Promise<{ id: string; attemptId: string }>;
}

export default async function AttemptSummaryPage({
  params,
}: AttemptSummaryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  return (
    <AppLayoutShell
      breadcrumbs={[
        { label: "Home", href: "/app" },
        { label: "Exams", href: "/app/exams" },
        { label: "Attempt Summary" },
      ]}
    >
      <AttemptSummaryScreen examId={id} attemptId={attemptId} />
    </AppLayoutShell>
  );
}
