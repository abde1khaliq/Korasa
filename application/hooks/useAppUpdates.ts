import { useCallback, useEffect, useRef, useState } from "react";
import * as Updates from "expo-updates";

export type UpdateStatus =
  | "checking"
  | "downloading"
  | "ready"
  | "up-to-date"
  | "error";

export function useAppUpdates() {
  const [status, setStatus] = useState<UpdateStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const checkAndUpdate = useCallback(async () => {
    // In development builds expo-updates is disabled — skip gracefully.
    if (__DEV__ || !Updates.isEnabled) {
      setStatus("up-to-date");
      return;
    }

    try {
      setStatus("checking");
      setError(null);

      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        setStatus("up-to-date");
        return;
      }

      setStatus("downloading");
      await Updates.fetchUpdateAsync();
      setStatus("ready");

      // Brief pause so the user sees the "ready" state before reload.
      await new Promise((r) => setTimeout(r, 800));
      await Updates.reloadAsync();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    checkAndUpdate();
  }, [checkAndUpdate]);

  return { status, error, retry: checkAndUpdate };
}
