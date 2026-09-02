import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Difficulty } from "@/components/misc/Screen";

const apiDifficulty: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export function useEligibleCount(
  scopeType: "subject" | "folder" | null,
  scopeId: number | null,
  difficulties: Difficulty[],
) {
  const { data: session } = useSession();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      !session?.accessToken ||
      !scopeType ||
      !scopeId ||
      difficulties.length === 0
    ) {
      setCount(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    const handle = setTimeout(() => {
      const apiDiffs = difficulties.map((d) => apiDifficulty[d]).join(",");
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/eligible-count?scope_type=${scopeType}&scope_id=${scopeId}&difficulties=${apiDiffs}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      )
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch count");
          return res.json();
        })
        .then((data: { count: number }) => {
          if (!cancelled) setCount(data.count);
        })
        .catch(() => {
          if (!cancelled) setCount(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [session?.accessToken, scopeType, scopeId, difficulties]);

  return { count, isLoading };
}
