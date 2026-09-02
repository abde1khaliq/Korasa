import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { FolderQuestions } from "@/components/FolderQuestions/FolderQuestions";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface FolderPageProps {
  params: Promise<{ id: string; folderId: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id, folderId } = await params;

  return (
    <AppLayoutShell
      breadcrumbs={[
        { label: "Subjects", href: "/app" },
        { label: "Subject", href: `/subject/${id}` },
        { label: "Questions" },
      ]}
    >
      <FolderQuestions subjectId={id} folderId={folderId} />
    </AppLayoutShell>
  );
}
