import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, LogOut, Moon, Sun, Menu, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { scheme, toggle } = useTheme();

  const userEmail = user?.email ?? "";
  const userName = user?.username ?? "";
  const canGoBack = router.canGoBack();

  const handleSignOut = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-paper">
      {/* Reduced padding top from pt-2 to pt-1 or 0 to minimize gap */}
      <View className="flex-row items-center justify-between px-6 py-1">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {canGoBack && (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={22} color="#2B2724" strokeWidth={1.75} />
            </Pressable>
          )}
          <Text className="font-display text-2xl text-ink">K</Text>
        </View>

        <Pressable
          onPress={() => setShowUserMenu(true)}
          className="items-center justify-center rounded-full"
          style={{ width: 36, height: 36 }}
          hitSlop={8}
        >
          <Menu size={20} color="white" strokeWidth={1.75} />
        </Pressable>
      </View>

      <Modal transparent visible={showUserMenu} animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
        <Pressable className="flex-1" onPress={() => setShowUserMenu(false)}>
          <View
            className="absolute right-6 rounded-2xl border border-rule bg-paper overflow-hidden"
            style={{ top: 50, width: 224, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="px-4 py-3 border-b border-rule">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "rgba(42,39,36,0.1)" }}>
                    <User size={20} color="#6E655C" strokeWidth={1.75} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-[15px] text-ink" numberOfLines={1}>
                      {userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}
                    </Text>
                    <Text className="text-[12px] text-ink-faint" numberOfLines={1}>{userEmail}</Text>
                  </View>
                </View>
              </View>

              <View className="p-2">
                <Pressable
                  onPress={handleSignOut}
                  className="flex-row items-center rounded-xl px-3 py-2.5"
                  style={{ gap: 12 }}
                >
                  <LogOut size={16} color="#A34A34" strokeWidth={1.75} />
                  <Text className="text-[14px]" style={{ color: "#A34A34" }}>Sign out</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowUserMenu(false);
                    toggle();
                  }}
                  className="flex-row items-center rounded-xl px-3 py-2.5"
                  style={{ gap: 12 }}
                >
                  {scheme === "dark" ? (
                    <Sun size={16} color="#2B2724" strokeWidth={1.75} />
                  ) : (
                    <Moon size={16} color="#2B2724" strokeWidth={1.75} />
                  )}
                  <Text className="text-[14px] text-ink">
                    {scheme === "dark" ? "Light mode" : "Dark mode"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}