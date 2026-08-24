import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, ClipboardList, Settings, User, Plus } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSubjects } from "@/hooks/useSubjects";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { QuickCreateModal } from "@/components/home/QuickCreateModal";
import { triggerHomeRefresh } from "@/lib/refreshBus";

// Deliberately NOT importing BottomTabBarProps from @react-navigation/bottom-tabs
// — it's a transitive dep of expo-router, not a direct one in package.json,
// so pinning to its exact type is a version-drift risk. This is a narrower
// structural subset of what Tabs actually passes; TS is structural, so
// spreading the real props into this still type-checks.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: string; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
};

const ICONS: Record<string, { label: string; icon: typeof Home }> = {
  index: { label: "Home", icon: Home },
  exams: { label: "Exams", icon: ClipboardList },
  settings: { label: "Settings", icon: Settings },
  profile: { label: "Profile", icon: User },
};

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const paper = useThemeColor("#F7F5F1", "#211D1A");
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const rule = useThemeColor("#E4DED4", "#3A332C");

  const [showQuickCreate, setShowQuickCreate] = useState(false);

  // Independent fetch from Home's own useSubjects() — this bar is mounted
  // once for the whole Tabs navigator, not per-screen.
  const { subjects } = useSubjects();
  const { notification, showNotification } = useNotification();

  const handleCreated = (label: string) => {
    showNotification(label);
    triggerHomeRefresh();
  };

  const press = (routeName: string, isFocused: boolean) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const renderTab = (routeName: string) => {
    const def = ICONS[routeName];
    if (!def) return null;
    const Icon = def.icon;
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    const isFocused = state.index === routeIndex;

    return (
      <Pressable
        key={routeName}
        onPress={() => press(routeName, isFocused)}
        style={{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 4 }}
      >
        <Icon size={22} color={isFocused ? ink : inkFaint} strokeWidth={isFocused ? 2 : 1.75} />
        <Text style={{ fontSize: 11, color: isFocused ? ink : inkFaint }}>{def.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: paper,
          borderTopWidth: 1,
          borderTopColor: rule,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
        }}
      >
        {renderTab("index")}
        {renderTab("exams")}
        <View style={{ width: 64 }} />
        {renderTab("settings")}
        {renderTab("profile")}
      </View>

      <Pressable
        onPress={() => setShowQuickCreate(true)}
        style={{
          position: "absolute",
          alignSelf: "center",
          top: -15,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#2A2724",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Plus size={26} color="#F7F5F1" strokeWidth={2} />
      </Pressable>

      {showQuickCreate && (
        <QuickCreateModal
          subjects={subjects}
          onClose={() => setShowQuickCreate(false)}
          onFolderCreated={() => handleCreated("Folder created")}
          onQuestionCreated={() => handleCreated("Question created")}
        />
      )}
      <Notification message={notification} />
    </View>
  );
}