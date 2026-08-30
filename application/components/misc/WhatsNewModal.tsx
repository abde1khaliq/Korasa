import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
  History,
  Check,
} from "lucide-react-native";
import { useWhatsNew } from "@/context/WhatsNewContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  ChangelogFeature,
  FeatureBadgeType,
  ICON_MAP,
} from "@/lib/changelog";

export function WhatsNewModal() {
  const {
    isOpen,
    activeRelease,
    allReleases,
    selectRelease,
    markLatestAsSeen,
    closeWhatsNew,
  } = useWhatsNew();

  const { height: screenHeight } = useWindowDimensions();
  const [showHistorySelector, setShowHistorySelector] = useState(false);

  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const brandColor = useThemeColor("#A8703F", "#C99A66");
  const modalBg = useThemeColor("#F7F5F1", "#211D1A");
  const cardBg = useThemeColor("#FBFAF8", "#272220");
  const ruleColor = useThemeColor("#E4DED4", "#3A332C");

  if (!isOpen) return null;

  const handleDismiss = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
    await markLatestAsSeen();
  };

  const handleClose = () => {
    closeWhatsNew();
  };

  const hasMultipleReleases = allReleases.length > 1;
  const features = activeRelease.features;
  const hasFeatures = Array.isArray(features) && features.length > 0;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 items-center justify-center px-5 py-8"
        style={{ backgroundColor: "rgba(30, 27, 24, 0.65)" }}
      >
        {/* Backdrop Tap to close */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={handleClose}
        />

        {/* Flexible Height Modal Card */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl"
          style={{
            maxHeight: Math.min(screenHeight * 0.85, 720),
            backgroundColor: modalBg,
            borderColor: ruleColor,
          }}
        >
          {/* Header Bar */}
          <View
            className={`px-6 pt-6 ${hasFeatures ? "pb-4 border-b" : "pb-6"}`}
            style={{ borderColor: ruleColor }}
          >
            <View className="flex-row items-center justify-between">
              {/* Badge & Version */}
              <View className="flex-row items-center gap-2">
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: "rgba(168, 112, 63, 0.12)" }}
                >
                  <Sparkles size={13} color={brandColor} strokeWidth={2} />
                  <Text
                    className="font-mono text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: brandColor }}
                  >
                    {"What's New"}
                  </Text>
                </View>

                <View
                  className="rounded-full border px-2.5 py-0.5"
                  style={{ borderColor: ruleColor, backgroundColor: cardBg }}
                >
                  <Text className="font-mono text-[11px] text-ink-faint">
                    {activeRelease.version}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <Pressable
                onPress={handleClose}
                className="items-center justify-center rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(156, 144, 134, 0.12)",
                }}
                hitSlop={8}
              >
                <X size={18} color={ink} strokeWidth={1.75} />
              </Pressable>
            </View>

            {/* Title & Subtitle */}
            <View className="mt-3">
              <Text className="font-display text-[26px] leading-[32px] text-ink">
                {activeRelease.title}
              </Text>
              {activeRelease.subtitle && (
                <Text className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {activeRelease.subtitle}
                </Text>
              )}
            </View>

            {/* Release Version Selector Toggle if multiple releases available */}
            {hasMultipleReleases && (
              <View className="mt-3 flex-row items-center justify-between">
                <Pressable
                  onPress={() => setShowHistorySelector(!showHistorySelector)}
                  className="flex-row items-center gap-1.5 rounded-lg py-1 px-2 -ml-2"
                  style={{
                    backgroundColor: showHistorySelector
                      ? "rgba(156, 144, 134, 0.15)"
                      : "transparent",
                  }}
                >
                  <History size={13} color={inkFaint} strokeWidth={1.75} />
                  <Text className="font-mono text-[12px] text-ink-faint">
                    {showHistorySelector ? "Hide past updates" : "Past versions"}
                  </Text>
                  <ChevronRight
                    size={12}
                    color={inkFaint}
                    style={{
                      transform: [
                        { rotate: showHistorySelector ? "90deg" : "0deg" },
                      ],
                    }}
                  />
                </Pressable>
                <Text className="font-mono text-[11px] text-ink-faint">
                  {activeRelease.date}
                </Text>
              </View>
            )}

            {/* Dropdown list of past releases */}
            {showHistorySelector && hasMultipleReleases && (
              <View
                className="mt-2 rounded-2xl border overflow-hidden p-1.5"
                style={{ backgroundColor: cardBg, borderColor: ruleColor }}
              >
                {allReleases.map((rel) => {
                  const isSelected = rel.id === activeRelease.id;
                  return (
                    <Pressable
                      key={rel.id}
                      onPress={() => {
                        selectRelease(rel.id);
                        setShowHistorySelector(false);
                      }}
                      className="flex-row items-center justify-between rounded-xl px-3 py-2"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(168, 112, 63, 0.12)"
                          : "transparent",
                      }}
                    >
                      <View className="flex-row items-center gap-2">
                        <Text
                          className={`font-mono text-[13px] ${
                            isSelected ? "font-bold text-brand" : "text-ink"
                          }`}
                        >
                          {rel.version}
                        </Text>
                        <Text
                          className="text-[12px] text-ink-soft"
                          numberOfLines={1}
                        >
                          {rel.title}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="font-mono text-[11px] text-ink-faint">
                          {rel.date}
                        </Text>
                        {isSelected && (
                          <Check
                            size={14}
                            color={brandColor}
                            strokeWidth={2}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Optional Features Scrollable Body with Flexible Height */}
          {hasFeatures && (
            <ScrollView
              showsVerticalScrollIndicator={true}
              bounces={false}
              style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingVertical: 16,
                gap: 14,
              }}
            >
              {features.map((feature, idx) => (
                <FeatureItem
                  key={`${feature.title}-${idx}`}
                  feature={feature}
                />
              ))}
            </ScrollView>
          )}

          {/* Bottom Action Footer */}
          <View
            className="border-t px-6 py-4"
            style={{ borderColor: ruleColor, backgroundColor: cardBg }}
          >
            <Pressable
              onPress={handleDismiss}
              className="flex-row items-center justify-center rounded-2xl bg-onyx py-3.5 px-6 shadow-sm"
              style={{ gap: 8 }}
            >
              <Text className="text-[16px] font-medium text-paper">
                Got it, continue
              </Text>
              <ArrowRight size={18} color="#F1EFEC" strokeWidth={1.75} />
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

function FeatureItem({ feature }: { feature: ChangelogFeature }) {
  const cardBg = useThemeColor("#FBFAF8", "#272220");
  const ruleColor = useThemeColor("#E4DED4", "#3A332C");
  const brandColor = useThemeColor("#A8703F", "#C99A66");

  // Determine Icon component
  let IconComponent = Sparkles;
  if (feature.icon) {
    if (typeof feature.icon === "string") {
      IconComponent = ICON_MAP[feature.icon.toLowerCase()] || Sparkles;
    } else {
      IconComponent = feature.icon;
    }
  }

  return (
    <View
      className="flex-row items-start rounded-2xl border p-4"
      style={{
        backgroundColor: cardBg,
        borderColor: ruleColor,
        gap: 14,
      }}
    >
      {/* Icon Pill */}
      <View
        className="items-center justify-center rounded-xl p-2.5"
        style={{
          backgroundColor: "rgba(168, 112, 63, 0.1)",
        }}
      >
        <IconComponent size={20} color={brandColor} strokeWidth={1.75} />
      </View>

      {/* Feature Details */}
      <View className="flex-1" style={{ gap: 4 }}>
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <Text className="text-[16px] font-semibold text-ink">
            {feature.title}
          </Text>
          {feature.badge && (
            <BadgeChip
              label={feature.badge}
              badgeType={feature.badgeType ?? "new"}
            />
          )}
        </View>

        <Text className="text-[14px] leading-relaxed text-ink-soft">
          {feature.description}
        </Text>
      </View>
    </View>
  );
}

function BadgeChip({
  label,
  badgeType,
}: {
  label: string;
  badgeType: FeatureBadgeType;
}) {
  let bgClass = "bg-easy-soft";
  let textClass = "text-easy";

  switch (badgeType) {
    case "improved":
      bgClass = "bg-medium-soft";
      textClass = "text-medium";
      break;
    case "fix":
      bgClass = "bg-hard-soft";
      textClass = "text-hard";
      break;
    case "highlight":
      bgClass = "bg-tag";
      textClass = "text-brand";
      break;
    case "new":
    default:
      bgClass = "bg-easy-soft";
      textClass = "text-easy";
      break;
  }

  return (
    <View className={`rounded-full px-2 py-0.5 ${bgClass}`}>
      <Text
        className={`font-mono text-[10px] font-bold uppercase tracking-wider ${textClass}`}
      >
        {label}
      </Text>
    </View>
  );
}
