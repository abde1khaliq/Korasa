import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Home, Calendar, ClipboardList, User, Plus } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSubjects } from "@/hooks/useSubjects";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { QuickCreateModal } from "@/components/home/QuickCreateModal";
import { triggerHomeRefresh } from "@/lib/refreshBus";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TABS: { name: string; label: string; icon: typeof Home }[] = [
  { name: "index", label: "Home", icon: Home },
  { name: "calendar", label: "Calendar", icon: Calendar },
  { name: "exams", label: "Exams", icon: ClipboardList },
  { name: "profile", label: "Profile", icon: User },
];

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const glassBg = useThemeColor("rgba(247, 245, 241, 0.92)", "rgba(33, 29, 26, 0.92)");
  const glassBorder = useThemeColor("rgba(228, 222, 212, 0.8)", "rgba(58, 51, 44, 0.8)");
  const onyxBg = useThemeColor("#2A2724", "#F1EFEC");
  const onyxIcon = useThemeColor("#F7F5F1", "#211D1A");

  const { subjects } = useSubjects();
  const { notification, showNotification } = useNotification();

  const handleCreated = (label: string) => {
    showNotification(label);
    triggerHomeRefresh();
  };

  const press = (routeName: string, isFocused: boolean) => {
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}

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

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 14),
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        zIndex: 50,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 64,
          borderRadius: 32,
          backgroundColor: glassBg,
          borderColor: glassBorder,
          borderWidth: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          return (
            <TabItem
              key={tab.name}
              tab={tab}
              isFocused={isFocused}
              onPress={() => press(tab.name, isFocused)}
            />
          );
        })}
      </View>

      <QuickAddButton
        onyxBg={onyxBg}
        onyxIcon={onyxIcon}
        onPress={() => setShowQuickCreate(true)}
      />

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

function TabItem({
  tab,
  isFocused,
  onPress,
}: {
  tab: { name: string; label: string; icon: typeof Home };
  isFocused: boolean;
  onPress: () => void;
}) {
  const Icon = tab.icon;
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const activePillBg = useThemeColor(
    "rgba(156, 144, 134, 0.22)",
    "rgba(241, 239, 236, 0.12)"
  );

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 14, stiffness: 220 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 8,
          borderRadius: 24,
          backgroundColor: isFocused ? activePillBg : "transparent",
          gap: 3,
        }}
      >
        <Icon
          size={20}
          color={isFocused ? ink : inkFaint}
          strokeWidth={isFocused ? 2.2 : 1.75}
        />
        <Text
          style={{
            fontSize: 11,
            fontWeight: isFocused ? "600" : "400",
            color: isFocused ? ink : inkFaint,
          }}
        >
          {tab.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function QuickAddButton({
  onyxBg,
  onyxIcon,
  onPress,
}: {
  onyxBg: string;
  onyxIcon: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 12, stiffness: 240 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 240 });
  };

  const handlePress = () => {
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={{
          width: 54,
          height: 54,
          borderRadius: 32,
          backgroundColor: onyxBg,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        <Plus size={24} color={onyxIcon} strokeWidth={2.25} />
      </Pressable>
    </Animated.View>
  );
}
