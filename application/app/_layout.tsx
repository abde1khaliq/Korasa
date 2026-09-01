import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import "react-native-reanimated";
import "../global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { WhatsNewProvider } from "@/context/WhatsNewContext";
import { WhatsNewModal } from "@/components/misc/WhatsNewModal";
import { useAppUpdates } from "@/hooks/useAppUpdates";
import { UpdateSplash } from "@/components/misc/UpdateSplash";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
    if (isAuthenticated && !user?.has_completed_onboarding && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (
      isAuthenticated &&
      user?.has_completed_onboarding &&
      (inAuthGroup || inOnboarding)
    ) {
      router.replace("/(app)" as any);
    }
  }, [isAuthenticated, isLoading, segments, user?.has_completed_onboarding]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

function AppWithUpdateCheck() {
  const { scheme, themeVars } = useTheme();
  const { status, error, retry } = useAppUpdates();
  const [dismissed, setDismissed] = useState(false);

  const showSplash = !dismissed && status !== "up-to-date";

  return (
    <View style={[{ flex: 1 }, themeVars]}>
      {showSplash ? (
        <UpdateSplash
          status={status as Exclude<typeof status, "up-to-date">}
          error={error}
          onRetry={retry}
          onDismiss={() => setDismissed(true)}
        />
      ) : (
        <>
          <RootNavigator />
          <WhatsNewModal />
        </>
      )}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <WhatsNewProvider>
          <AppWithUpdateCheck />
        </WhatsNewProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
