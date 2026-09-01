import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  CHANGELOG,
  ChangelogRelease,
  getLatestRelease,
  getReleaseById,
} from "@/lib/changelog";

const LAST_SEEN_CHANGELOG_KEY = "korasa_last_seen_changelog_id";

type WhatsNewContextType = {
  /** Whether the What's New modal is currently visible */
  isOpen: boolean;
  /** Whether there is a new release that the user has not seen yet */
  hasUnseen: boolean;
  /** The release currently selected for viewing in the modal */
  activeRelease: ChangelogRelease;
  /** All releases configured in the changelog */
  allReleases: ChangelogRelease[];
  /** Open the modal (optionally for a specific release ID, defaults to latest) */
  openWhatsNew: (releaseId?: string) => void;
  /** Close the modal without marking as seen (or after viewing past versions) */
  closeWhatsNew: () => void;
  /** Mark the current latest release as seen and close the modal */
  markLatestAsSeen: () => Promise<void>;
  /** Switch the active release displayed in the modal */
  selectRelease: (releaseId: string) => void;
  /** Reset seen state (useful for testing/debugging) */
  resetSeenState: () => Promise<void>;
};

const WhatsNewContext = createContext<WhatsNewContextType | null>(null);

export function WhatsNewProvider({ children }: { children: React.ReactNode }) {
  const latestRelease = getLatestRelease();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [activeRelease, setActiveRelease] =
    useState<ChangelogRelease>(latestRelease);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const lastSeenId = await SecureStore.getItemAsync(
          LAST_SEEN_CHANGELOG_KEY,
        );
        if (!isMounted) return;

        if (lastSeenId !== latestRelease.id) {
          setHasUnseen(true);
          setActiveRelease(latestRelease);
          setIsOpen(true);
        } else {
          setHasUnseen(false);
        }
      } catch (e) {
        if (isMounted) {
          setHasUnseen(false);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [latestRelease.id]);

  const openWhatsNew = useCallback((releaseId?: string) => {
    if (releaseId) {
      const target = getReleaseById(releaseId);
      if (target) {
        setActiveRelease(target);
      } else {
        setActiveRelease(getLatestRelease());
      }
    } else {
      setActiveRelease(getLatestRelease());
    }
    setIsOpen(true);
  }, []);

  const closeWhatsNew = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markLatestAsSeen = useCallback(async () => {
    setIsOpen(false);
    setHasUnseen(false);
    try {
      await SecureStore.setItemAsync(LAST_SEEN_CHANGELOG_KEY, latestRelease.id);
    } catch (e) {
      console.warn("Failed to persist seen changelog ID", e);
    }
  }, [latestRelease.id]);

  const selectRelease = useCallback((releaseId: string) => {
    const target = getReleaseById(releaseId);
    if (target) {
      setActiveRelease(target);
    }
  }, []);

  const resetSeenState = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(LAST_SEEN_CHANGELOG_KEY);
      setHasUnseen(true);
      setActiveRelease(latestRelease);
      setIsOpen(true);
    } catch (e) {
      console.warn("Failed to reset seen changelog ID", e);
    }
  }, [latestRelease]);

  return (
    <WhatsNewContext.Provider
      value={{
        isOpen,
        hasUnseen,
        activeRelease,
        allReleases: CHANGELOG,
        openWhatsNew,
        closeWhatsNew,
        markLatestAsSeen,
        selectRelease,
        resetSeenState,
      }}
    >
      {children}
    </WhatsNewContext.Provider>
  );
}

export function useWhatsNew() {
  const ctx = useContext(WhatsNewContext);
  if (!ctx) {
    throw new Error("useWhatsNew must be used within a WhatsNewProvider");
  }
  return ctx;
}
