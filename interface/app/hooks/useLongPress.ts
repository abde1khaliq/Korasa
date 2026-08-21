import { useState, useRef } from "react";
import { Subject } from "@/types/subject";

export function useLongPress() {
  const [longPressSubjectId, setLongPressSubjectId] = useState<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isLongPressRef = useRef(false);

  const handlePointerDown = (
    subject: Subject,
    e: React.PointerEvent,
    onLongPress: (subject: Subject) => void
  ) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isLongPressRef.current = false;
    setLongPressSubjectId(subject.id);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress(subject);
      setLongPressSubjectId(null);
    }, 1000);
  };

  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
    setLongPressSubjectId(null);
  };

  const resetLongPress = () => {
    isLongPressRef.current = false;
  };

  return {
    longPressSubjectId,
    isLongPressRef,
    handlePointerDown,
    handlePointerUpOrCancel,
    resetLongPress,
  };
}