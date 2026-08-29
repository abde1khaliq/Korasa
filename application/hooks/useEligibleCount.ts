import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Difficulty } from "@/components/misc/Screen";

const apiDifficulty: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

// Debounced so toggling three difficulty chips in a row doesn't fire three
// requests — same shape of problem the folder-loading effect in
// QuickCreateModal doesn't have to deal with because it's not driven by
// rapid taps on multiple independent toggles.
export function useEligibleCount(
  scopeType: "subject" | "folder" | null,
  scopeId: number | null,
  difficulties: Difficulty[],
) {
  const { accessToken } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !scopeType || !scopeId || difficulties.length === 0) {
      setCount(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const handle = setTimeout(() => {
      const apiDiffs = difficulties.map((d) => apiDifficulty[d]).join(",");
      apiFetch(
        `/api/exams/eligible-count?scope_type=${scopeType}&scope_id=${scopeId}&difficulties=${apiDiffs}`,
        { token: accessToken },
      )
        .then((data: { count: number }) => {
          if (!cancelled) setCount(data.count);
        })
        .catch(() => {
          if (!cancelled) setCount(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, scopeType, scopeId, difficulties.join(",")]);

  return { count, isLoading };
}