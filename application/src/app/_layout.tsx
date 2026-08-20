import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/authContext";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    // Fallback safely if segments is undefined
    const inAuthGroup = (segments || [])[0] === "(auth)";
    
    // Give the router a tiny tick to be ready (Expo Router quirk)
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        router.replace("/");
      }
    }, 1);
    
    return () => clearTimeout(timeout);
  }, [isLoading, isAuthenticated, segments]);

  if (isLoading) {
    return null;
  }
  
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Slot />
      </RouteGuard>
    </AuthProvider>
  );
}
