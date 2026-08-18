// src/app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/authContext";
// keep your existing imports below (theme, color scheme, etc.)

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, segments]);

  if (isLoading) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  // Whatever your current RootLayout body does — theme providers,
  // font loading, etc. — goes here unchanged.
  return (
    <AuthProvider>
      <RouteGuard>
        {/* your existing provider tree / Stack / Slot goes here, unchanged */}
        <Slot />
      </RouteGuard>
    </AuthProvider>
  );
}