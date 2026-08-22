import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Subject } from "@/types/subject";
import { FolderItem } from "@/types/folder";

export function useSubjectFolders(subjectID: string | undefined) {
  const { accessToken } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!accessToken || !subjectID) return;
    setIsLoading(true);
    setError(null);
    try {
      const [subjectData, foldersData] = await Promise.all([
        apiFetch(`/api/subjects/${subjectID}`, { token: accessToken }),
        apiFetch(`/api/subjects/${subjectID}/folders`, { token: accessToken }),
      ]);
      setSubject(subjectData);
      setFolders(foldersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const addFolder = (newFolder: FolderItem) => setFolders((prev) => [...prev, newFolder]);

  useEffect(() => {
    if (accessToken && subjectID) fetchData();
  }, [accessToken, subjectID]);

  return { subject, folders, isLoading, error, fetchData, addFolder };
}