import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

export function Notification({ message }: { message: string | null }) {
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 20, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setDisplayMessage(null));
    }
  }, [message]);

  if (!displayMessage) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity }}
      className="absolute bottom-24 self-center rounded-full bg-onyx px-5 py-3.5"
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-paper text-[15px]">{displayMessage}</Text>
      </View>
    </Animated.View>
  );
}