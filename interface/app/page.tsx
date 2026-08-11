import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { HomeSubjects } from "@/components/HomeSubjects";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  let subjects = [];

  try {
    const res = await fetch(`${backendUrl}/api/subjects`, {
      headers: {
        Authorization: `Bearer ${(session as any).accessToken}`,
      },
    });

    if (res.ok) {
      subjects = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
  }

  return <HomeSubjects initialSubjects={subjects} />
}
