import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Register } from "@/components/Register";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/");
  }

  return <Register/>
}