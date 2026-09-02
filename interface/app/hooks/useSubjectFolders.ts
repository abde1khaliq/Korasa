import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Subject } from "@/types/subject";
import { FolderItem } from "@/types/folder";

export function useSubjectFolders(subjectID: string | string[] | undefined) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchData = async () => {
    if (!session || !subjectID) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${session?.accessToken}` };

      const [subjectRes, foldersRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}`,
          { headers },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders`,
          { headers },
        ),
      ]);

      if (!subjectRes.ok) {
        throw new Error(`Failed to load subject (${subjectRes.status})`);
      }
      if (!foldersRes.ok) {
        throw new Error(`Failed to load folders (${foldersRes.status})`);
      }

      const subjectData: Subject = await subjectRes.json();
      const foldersData: FolderItem[] = await foldersRes.json();

      setSubject(subjectData);
      setFolders(foldersData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch subject data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addFolder = (newFolder: FolderItem) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  const updateFolderState = (updated: FolderItem) => {
    setFolders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const deleteFolder = async (folderId: number) => {
    if (!session?.accessToken || !subjectID) throw new Error("Not authenticated");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders/${folderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to delete folder (${res.status})`);
    }

    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    return { success: true };
  };

  useEffect(() => {
    if (session && subjectID) {
      fetchData();
    }
  }, [session, subjectID]);

  return {
    subject,
    folders,
    setFolders,
    isLoading,
    error,
    fetchData,
    addFolder,
    updateFolderState,
    deleteFolder,
  };
}