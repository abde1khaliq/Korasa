import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MoveUpRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";
import { Subject } from "@/types/subject";
import { getSubjectMeta } from "@/lib/subjectUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const LONG_PRESS_DURATION = 1000;
const CORNER_RADIUS = 24;
const STROKE_WIDTH = 3;

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
  onOpenMenu: () => void;
}

export function SubjectCard({
  subject,
  onPress,
  onOpenMenu,
}: SubjectCardProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredRef = useRef(false);

  const brandColor = useThemeColor("#A8703F", "#C99A66");
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const cardBg = useThemeColor("rgba(251, 250, 248, 0.92)", "rgba(39, 34, 32, 0.92)");
  const cardBorder = useThemeColor("rgba(228, 222, 212, 0.85)", "rgba(58, 51, 44, 0.85)");

  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  const { code, chip } = getSubjectMeta(subject.id, subject.name);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const width = dimensions?.width ?? 0;
  const height = dimensions?.height ?? 0;

  const strokeRadius = Math.max(0, CORNER_RADIUS - STROKE_WIDTH / 2);
  const rectWidth = Math.max(0, width - STROKE_WIDTH);
  const rectHeight = Math.max(0, height - STROKE_WIDTH);

  const perimeter =
    width > 0 && height > 0
      ? 2 * (rectWidth + rectHeight - 4 * strokeRadius) + 2 * Math.PI * strokeRadius
      : 500;

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: perimeter * (1 - progress.value),
    };
  });

  const animatedSvgStyle = useAnimatedStyle(() => {
    return {
      opacity: borderOpacity.value,
    };
  });

  const cardScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    hasTriggeredRef.current = false;
    scale.value = withSpring(0.95, { damping: 14, stiffness: 220 });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    cancelAnimation(progress);
    cancelAnimation(borderOpacity);
    progress.value = 0;
    borderOpacity.value = 0;

    timerRef.current = setTimeout(async () => {
      hasTriggeredRef.current = true;
      try {
        if (Platform.OS !== "web") {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch {}

      borderOpacity.value = withTiming(1, { duration: 100 });
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      }, () => {
        borderOpacity.value = withTiming(0, { duration: 250 }, () => {
          progress.value = 0;
        });
      });

      onOpenMenu();
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!hasTriggeredRef.current) {
      cancelAnimation(progress);
      cancelAnimation(borderOpacity);
      borderOpacity.value = withTiming(0, { duration: 150 });
      progress.value = 0;
    }
  };

  const handlePress = () => {
    if (hasTriggeredRef.current) {
      hasTriggeredRef.current = false;
      return;
    }
    onPress();
  };

  return (
    <Animated.View style={[{ width: "48%", height: 195 }, cardScaleStyle]}>
      <Pressable
        onLayout={onLayout}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={{
          flex: 1,
          borderRadius: CORNER_RADIUS,
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: 1,
          padding: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View
            className="self-start rounded-xl px-3 py-1.5"
            style={{ backgroundColor: chip.bg }}
          >
            <Text style={{ color: chip.text, fontSize: 12, letterSpacing: 1, fontWeight: "700" }}>
              {code}
            </Text>
          </View>

          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 28,
              height: 28,
              backgroundColor: "rgba(156, 144, 134, 0.14)",
            }}
          >
            <MoveUpRight size={14} color={inkFaint} strokeWidth={2} />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Text
          className="font-display text-[25px] leading-[29px] text-ink"
          numberOfLines={1}
        >
          {subject.name}
        </Text>

        <View className="mt-3 flex-row items-center gap-1.5">
          <Text className="text-[13px] text-ink-soft font-medium">
            {subject.folder_count || 0} folders
          </Text>
          <Text className="text-[12px] text-ink-faint">·</Text>
          <Text className="text-[13px] text-ink-soft font-medium">
            {subject.question_count || 0} questions
          </Text>
        </View>

        {dimensions && width > 0 && height > 0 && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -1,
                left: -1,
                right: -1,
                bottom: -1,
              },
              animatedSvgStyle,
            ]}
            pointerEvents="none"
          >
            <Svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <AnimatedRect
                x={STROKE_WIDTH / 2}
                y={STROKE_WIDTH / 2}
                width={rectWidth}
                height={rectHeight}
                rx={strokeRadius}
                ry={strokeRadius}
                fill="none"
                stroke={brandColor}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${perimeter} ${perimeter}`}
                animatedProps={animatedProps}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}
