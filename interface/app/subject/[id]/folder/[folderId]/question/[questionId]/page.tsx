import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { QuestionDetail } from "@/components/QuestionDetail/QuestionDetail";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface QuestionDetailPageProps {
  params: Promise<{ id: string; folderId: string; questionId: string }>;
}

export default async function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id, folderId, questionId } = await params;

  return (
    <AppLayoutShell
      breadcrumbs={[
        { label: "Subjects", href: "/app" },
        { label: "Subject", href: `/subject/${id}` },
        { label: "Folder", href: `/subject/${id}/folder/${folderId}` },
        { label: "Flashcard" },
      ]}
    >
      <QuestionDetail
        subjectId={id}
        folderId={folderId}
        questionId={questionId}
      />
    </AppLayoutShell>
  );
}
