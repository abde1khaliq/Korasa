import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { onboardingSlides, OnboardingSlide } from "@/lib/onboardingSlides";
import { useThemeColor } from "@/hooks/useThemeColor";

export function Onboarding() {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const ink = useThemeColor("#F1EFEC", "#2B2724");

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const isLast = index === onboardingSlides.length - 1;

  const goToIndex = (i: number) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      goToIndex(index + 1);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-end px-6 pt-2" style={{ height: 40 }}>
        {!isLast && (
          <Pressable onPress={() => completeOnboarding()} hitSlop={8}>
            <Text className="text-[15px] text-ink-faint">Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={onboardingSlides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-10"
          >
            <Text className="font-display mt-10 text-[28px] leading-[34px] text-ink text-center">
              {item.title}
            </Text>
            <Text className="mt-4 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
              {item.description}
            </Text>
          </View>
        )}
      />

      <View className="flex-row items-center justify-center px-6 pb-4">
        {onboardingSlides.map((slide, i) => (
          <View
            key={slide.key}
            className="rounded-full bg-onyx"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              opacity: i === index ? 1 : 0.25,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      <View className="px-6">
        <Pressable
          onPress={handleNext}
          className="flex-row items-center justify-center rounded-full bg-onyx py-4"
        >
          <Text className="text-[16px] text-paper">
            {isLast ? "Get started" : "Next"}
          </Text>
          <View style={{ marginLeft: 8 }}>
            <ArrowRight size={18} color={ink} strokeWidth={1.75} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
