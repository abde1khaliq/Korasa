import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const userName = user?.username ?? "";
  const userEmail = user?.email ?? "";

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <View className="px-6 pt-6">
        <Text className="font-display text-[34px] text-ink">Profile</Text>
      </View>

      <View className="mt-8 items-center px-6">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            backgroundColor: "rgba(42,39,36,0.1)",
          }}
        >
          <UserIcon size={32} color="#2B2724" strokeWidth={1.5} />
        </View>
        <Text className="mt-4 text-[20px] text-ink">
          {userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}
        </Text>
        <Text className="mt-1 text-[14px] text-ink-faint">{userEmail}</Text>
      </View>

      <View className="mt-10 px-6">
        <Pressable
          onPress={() => setConfirmingLogout(true)}
          className="flex-row items-center justify-center gap-2.5 rounded-xl border border-rule py-3.5"
        >
          <LogOut size={16} color="#A34A34" strokeWidth={1.75} />
          <Text className="text-[15px]" style={{ color: "#A34A34" }}>
            Sign out
          </Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={confirmingLogout}
        title="Sign out"
        message="You'll need to sign in again to access your subjects."
        confirmLabel="Sign out"
        onConfirm={() => {
          setConfirmingLogout(false);
          logout();
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </SafeAreaView>
  );
}
