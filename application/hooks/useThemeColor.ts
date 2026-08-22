import { useTheme } from "@/context/ThemeContext";

/**
 * Returns a hex color based on the current theme.
 * @param lightHex The color to use in light mode.
 * @param darkHex The color to use in dark mode.
 */
export function useThemeColor(lightHex: string, darkHex: string) {
  const { scheme } = useTheme();
  
  // Default to lightHex if scheme is somehow undefined
  return scheme === "dark" ? darkHex : lightHex;
}