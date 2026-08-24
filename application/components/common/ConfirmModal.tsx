import { View, Text, Pressable, Modal } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Replaces Alert.alert(title, message, [{Cancel}, {Delete, destructive}])
// call sites. Same two-choice shape, rendered as an in-app card instead of
// the native OS dialog.
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: "rgba(42,39,36,0.4)" }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full rounded-2xl bg-paper p-6"
        >
          <Text className="text-[18px] text-ink" style={{ fontWeight: "600" }}>
            {title}
          </Text>
          <Text className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {message}
          </Text>

          <View className="mt-6 flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={onCancel}
              className="flex-1 items-center rounded-xl border border-rule py-3"
            >
              <Text className="text-[15px] text-ink">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 items-center rounded-xl py-3 ${destructive ? "bg-hard" : "bg-onyx"}`}
            >
              <Text className="text-[15px] text-paper">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}