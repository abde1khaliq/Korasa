"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function createSubject(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${backendUrl}/api/subjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${(session as any).accessToken}`
    },
    body: JSON.stringify({ Name: name }),
  });

  const text = await res.text();
  
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Failed to parse JSON. Response: ${text.slice(0, 100)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to create subject");
  }

  revalidatePath("/");
  return data;
}
