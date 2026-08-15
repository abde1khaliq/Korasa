import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SubjectFolders } from "@/components/SubjectFolder/SubjectFolders";

export default async function SubjectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <SubjectFolders/>;
}
