import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ActivityIndicator, Image, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import * as ImageManipulator from "expo-image-manipulator";
import { Check, X } from "lucide-react-native";

const HANDLE_SIZE = 26;
const MIN_CROP = 48;
const HORIZONTAL_PADDING = 24;
const MAX_HEIGHT_RATIO = 0.65;

export type CroppedImage = { uri: string; width: number; height: number };

export function ImageCropModal({
  imageUri,
  imageWidth,
  imageHeight,
  onCancel,
  onCropped,
}: {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  onCancel: () => void;
  onCropped: (image: CroppedImage) => void;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isProcessing, setIsProcessing] = useState(false);

  // Displayed size computed from the image's own aspect ratio (not left to
  // <Image resizeMode="contain">'s letterboxing) so the on-screen box maps
  // back to source pixels with a single uniform scale factor — no guessing
  // where letterbox bars start.
  const { containerWidth, containerHeight } = useMemo(() => {
    const maxWidth = screenWidth - HORIZONTAL_PADDING * 2;
    const maxHeight = screenHeight * MAX_HEIGHT_RATIO;
    const aspect = imageWidth / imageHeight;
    let w = maxWidth;
    let h = w / aspect;
    if (h > maxHeight) {
      h = maxHeight;
      w = h * aspect;
    }
    return { containerWidth: w, containerHeight: h };
  }, [screenWidth, screenHeight, imageWidth, imageHeight]);

  const left = useSharedValue(containerWidth * 0.15);
  const top = useSharedValue(containerHeight * 0.15);
  const right = useSharedValue(containerWidth * 0.85);
  const bottom = useSharedValue(containerHeight * 0.85);

  const clampX = (v: number) => Math.min(Math.max(0, v), containerWidth);
  const clampY = (v: number) => Math.min(Math.max(0, v), containerHeight);

  const topLeftGesture = Gesture.Pan().onChange((e) => {
    "worklet";
    left.value = Math.min(clampX(left.value + e.changeX), right.value - MIN_CROP);
    top.value = Math.min(clampY(top.value + e.changeY), bottom.value - MIN_CROP);
  });
  const topRightGesture = Gesture.Pan().onChange((e) => {
    "worklet";
    right.value = Math.max(clampX(right.value + e.changeX), left.value + MIN_CROP);
    top.value = Math.min(clampY(top.value + e.changeY), bottom.value - MIN_CROP);
  });
  const bottomLeftGesture = Gesture.Pan().onChange((e) => {
    "worklet";
    left.value = Math.min(clampX(left.value + e.changeX), right.value - MIN_CROP);
    bottom.value = Math.max(clampY(bottom.value + e.changeY), top.value + MIN_CROP);
  });
  const bottomRightGesture = Gesture.Pan().onChange((e) => {
    "worklet";
    right.value = Math.max(clampX(right.value + e.changeX), left.value + MIN_CROP);
    bottom.value = Math.max(clampY(bottom.value + e.changeY), top.value + MIN_CROP);
  });
  const moveGesture = Gesture.Pan().onChange((e) => {
    "worklet";
    const w = right.value - left.value;
    const h = bottom.value - top.value;
    const newLeft = Math.min(Math.max(0, left.value + e.changeX), containerWidth - w);
    const newTop = Math.min(Math.max(0, top.value + e.changeY), containerHeight - h);
    left.value = newLeft;
    top.value = newTop;
    right.value = newLeft + w;
    bottom.value = newTop + h;
  });

  const topOverlay = useAnimatedStyle(() => ({
    position: "absolute", left: 0, top: 0, width: containerWidth, height: top.value,
    backgroundColor: "rgba(0,0,0,0.6)",
  }));
  const bottomOverlay = useAnimatedStyle(() => ({
    position: "absolute", left: 0, top: bottom.value, width: containerWidth,
    height: containerHeight - bottom.value, backgroundColor: "rgba(0,0,0,0.6)",
  }));
  const leftOverlay = useAnimatedStyle(() => ({
    position: "absolute", left: 0, top: top.value, width: left.value,
    height: bottom.value - top.value, backgroundColor: "rgba(0,0,0,0.6)",
  }));
  const rightOverlay = useAnimatedStyle(() => ({
    position: "absolute", left: right.value, top: top.value,
    width: containerWidth - right.value, height: bottom.value - top.value,
    backgroundColor: "rgba(0,0,0,0.6)",
  }));
  const boxStyle = useAnimatedStyle(() => ({
    position: "absolute", left: left.value, top: top.value,
    width: right.value - left.value, height: bottom.value - top.value,
    borderWidth: 2, borderColor: "#F7F5F1",
  }));
  const topLeftHandleStyle = useAnimatedStyle(() => ({
    position: "absolute", left: left.value - HANDLE_SIZE / 2, top: top.value - HANDLE_SIZE / 2,
  }));
  const topRightHandleStyle = useAnimatedStyle(() => ({
    position: "absolute", left: right.value - HANDLE_SIZE / 2, top: top.value - HANDLE_SIZE / 2,
  }));
  const bottomLeftHandleStyle = useAnimatedStyle(() => ({
    position: "absolute", left: left.value - HANDLE_SIZE / 2, top: bottom.value - HANDLE_SIZE / 2,
  }));
  const bottomRightHandleStyle = useAnimatedStyle(() => ({
    position: "absolute", left: right.value - HANDLE_SIZE / 2, top: bottom.value - HANDLE_SIZE / 2,
  }));

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Uniform scale because containerWidth/Height were derived from the
      // same aspect ratio as the source image — no letterbox offset to
      // correct for.
      const scaleX = imageWidth / containerWidth;
      const scaleY = imageHeight / containerHeight;

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{
          crop: {
            originX: Math.round(left.value * scaleX),
            originY: Math.round(top.value * scaleY),
            width: Math.round((right.value - left.value) * scaleX),
            height: Math.round((bottom.value - top.value) * scaleY),
          },
        }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      onCropped({ uri: result.uri, width: result.width, height: result.height });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
          <Pressable onPress={onCancel} hitSlop={8}>
            <X size={24} color="#F7F5F1" strokeWidth={1.75} />
          </Pressable>
          <Text className="text-[16px] text-paper">Crop question</Text>
          <Pressable onPress={handleConfirm} disabled={isProcessing} hitSlop={8}>
            {isProcessing ? <ActivityIndicator color="#F7F5F1" /> : <Check size={24} color="#F7F5F1" strokeWidth={1.75} />}
          </Pressable>
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: containerWidth, height: containerHeight }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: containerWidth, height: containerHeight }}
              resizeMode="contain"
            />
            <GestureDetector gesture={moveGesture}>
              <Animated.View style={boxStyle} />
            </GestureDetector>
            <Animated.View style={topOverlay} pointerEvents="none" />
            <Animated.View style={bottomOverlay} pointerEvents="none" />
            <Animated.View style={leftOverlay} pointerEvents="none" />
            <Animated.View style={rightOverlay} pointerEvents="none" />

            <GestureDetector gesture={topLeftGesture}>
              <Animated.View style={[topLeftHandleStyle, { width: HANDLE_SIZE, height: HANDLE_SIZE }]} hitSlop={12}>
                <View style={{ flex: 1, borderRadius: HANDLE_SIZE / 2, backgroundColor: "#F7F5F1", borderWidth: 2, borderColor: "#2B2724" }} />
              </Animated.View>
            </GestureDetector>
            <GestureDetector gesture={topRightGesture}>
              <Animated.View style={[topRightHandleStyle, { width: HANDLE_SIZE, height: HANDLE_SIZE }]} hitSlop={12}>
                <View style={{ flex: 1, borderRadius: HANDLE_SIZE / 2, backgroundColor: "#F7F5F1", borderWidth: 2, borderColor: "#2B2724" }} />
              </Animated.View>
            </GestureDetector>
            <GestureDetector gesture={bottomLeftGesture}>
              <Animated.View style={[bottomLeftHandleStyle, { width: HANDLE_SIZE, height: HANDLE_SIZE }]} hitSlop={12}>
                <View style={{ flex: 1, borderRadius: HANDLE_SIZE / 2, backgroundColor: "#F7F5F1", borderWidth: 2, borderColor: "#2B2724" }} />
              </Animated.View>
            </GestureDetector>
            <GestureDetector gesture={bottomRightGesture}>
              <Animated.View style={[bottomRightHandleStyle, { width: HANDLE_SIZE, height: HANDLE_SIZE }]} hitSlop={12}>
                <View style={{ flex: 1, borderRadius: HANDLE_SIZE / 2, backgroundColor: "#F7F5F1", borderWidth: 2, borderColor: "#2B2724" }} />
              </Animated.View>
            </GestureDetector>
          </View>
        </View>

        <Text className="px-6 pb-10 text-center text-[13px] text-ink-faint">
          Drag the corners or the box to select just the question.
        </Text>
      </View>
    </Modal>
  );
}