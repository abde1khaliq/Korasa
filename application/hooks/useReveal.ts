import { useState } from "react";

export function useReveal() {
  const [revealed, setRevealed] = useState(false);
  const toggleReveal = () => setRevealed(true);
  const resetReveal = () => setRevealed(false);
  return { revealed, toggleReveal, resetReveal };
}