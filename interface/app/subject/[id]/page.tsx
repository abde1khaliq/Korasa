import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SubjectFolders } from "@/components/SubjectFolders/SubjectFolders";
import { AppLayoutShell } from "@/components/Navigation/AppLayoutShell";

interface SubjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await params;

  return (
    <AppLayoutShell
      breadcrumbs={[
        { label: "Subjects", href: "/app" },
        { label: "Folders" },
      ]}
    >
      <SubjectFolders />
    </AppLayoutShell>
  );
}
