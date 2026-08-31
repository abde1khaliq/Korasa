import { View, Text, Pressable, Modal } from "react-native";

interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onCancel: () => void;
  cancelLabel?: string;
}

export function ActionSheet({
  visible,
  title,
  options,
  onCancel,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(42,39,36,0.4)" }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl bg-paper px-4 pb-8 pt-3"
        >
          {title ? (
            <Text className="px-2 pb-3 pt-2 text-center text-[13px] tracking-widest text-ink-faint uppercase">
              {title}
            </Text>
          ) : null}

          <View className="overflow-hidden rounded-2xl border border-rule">
            {options.map((opt, i) => (
              <Pressable
                key={opt.label}
                onPress={opt.onPress}
                className="items-center py-4"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#E4DED4",
                }}
              >
                <Text className={`text-[16px] ${opt.destructive ? "text-hard" : "text-ink"}`}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onCancel}
            className="mt-2 items-center rounded-2xl border border-rule py-4"
          >
            <Text className="text-[16px] text-ink" style={{ fontWeight: "500" }}>
              {cancelLabel}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}