import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { onboardingSlides, OnboardingSlide } from "@/lib/onboardingSlides";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";

export function Onboarding() {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const transparentBg = useThemeColor("rgba(245,244,241,0)", "rgba(0,0,0,0)");

  // Your exact app background color
  const bgColor = useThemeColor("#F5F4F1", "#000000");

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
      {/* Skip Button
      <View
        className="z-10 flex-row justify-end px-6 absolute top-0 right-0 w-full"
        style={{ height: 40, marginTop: 40 }}
      >
        {!isLast && (
          <Pressable onPress={() => completeOnboarding()} hitSlop={8}>
            <Text className="text-[15px] font-medium text-ink-faint">Skip</Text>
          </Pressable>
        )}
      </View> */}

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
          <View style={{ width }} className="flex-1">
            {/* Padded Image Section with Gradient Fade */}
            <View className="relative w-full h-[80%] px-6 pt-20">
              {/* Inner container to clip the image with rounded corners */}
              <View className="w-full h-full overflow-hidden rounded-[32px]">
                <Image
                  source={item.image}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>

              {/* The gradient still sits perfectly over the bottom to fade it out */}
              <LinearGradient
                colors={[transparentBg, bgColor]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "45%",
                }}
              />
            </View>

            {/* Text Section */}
            <View className="flex-1 items-center px-10 pt-8">
              <Text className="font-display text-[28px] leading-[34px] text-ink text-center">
                {item.title}
              </Text>
              <Text className="mt-4 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Dots Indicator */}
      <View
        className="flex-row items-center justify-center px-6 pb-4"
        style={{ gap: 8 }}
      >
        {onboardingSlides.map((slide, i) => (
          <View
            key={slide.key}
            className="rounded-full bg-onyx"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              opacity: i === index ? 1 : 0.25,
            }}
          />
        ))}
      </View>

      {/* Next / Get Started Button */}
      <View className="px-6">
        <Pressable
          onPress={handleNext}
          className="flex-row items-center justify-center rounded-full bg-onyx py-4"
          style={{ gap: 8 }}
        >
          <Text className="text-[16px] text-paper">
            {isLast ? "Get started" : "Next"}
          </Text>
          <ArrowRight size={18} color={ink} strokeWidth={1.75} />
        </Pressable>
      </View>
    </View>
  );
}
