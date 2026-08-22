import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { vars, useColorScheme as useNativeWindColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";
import { varsFor, ColorScheme } from "@/lib/theme";

type Preference = "light" | "dark" | "system";

type ThemeState = {
  scheme: ColorScheme;
  themeVars: ReturnType<typeof vars>;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);
const PREF_KEY = "korasa_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreference] = useState<Preference>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(PREF_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreference(stored);
      }
      setLoaded(true);
    })();
  }, []);

  const scheme: ColorScheme = preference === "system" ? (systemScheme ?? "light") : preference;

  useEffect(() => {
    if (!loaded) return;
    // Keeps NativeWind's own `dark:` variant, if you use it anywhere,
    // in sync with the CSS-variable scheme driving our color classes.
    setColorScheme(scheme);
  }, [scheme, loaded, setColorScheme]);

  const toggle = useCallback(() => {
    const next: Preference = scheme === "dark" ? "light" : "dark";
    setPreference(next);
    SecureStore.setItemAsync(PREF_KEY, next);
  }, [scheme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ scheme, themeVars: vars(varsFor(scheme)), toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}