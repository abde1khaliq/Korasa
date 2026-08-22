import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";
import "react-native-reanimated";
import "../global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

function ThemedRoot() {
  const { scheme, themeVars } = useTheme();
  return (
    <View style={[{ flex: 1 }, themeVars]}>
      <RootNavigator />
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
        <ThemedRoot />
      </ThemeProvider>
    </AuthProvider>
  );
}