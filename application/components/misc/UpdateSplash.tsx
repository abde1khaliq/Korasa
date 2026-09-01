import { View, Text, Pressable } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { Pulse } from "@/components/common/Pulse";
import type { UpdateStatus } from "@/hooks/useAppUpdates";

const statusCopy: Record<
  Exclude<UpdateStatus, "up-to-date">,
  { label: string; message: string }
> = {
  checking: {
    label: "Checking for updates",
    message: "One moment while we see if anything's new.",
  },
  downloading: {
    label: "Downloading update",
    message: "A fresh version is on its way.",
  },
  ready: {
    label: "Almost there",
    message: "Restarting with the latest changes…",
  },
  error: {
    label: "Update failed",
    message: "We couldn't reach the update server.",
  },
};

export function UpdateSplash({
  status,
  error,
  onRetry,
  onDismiss,
}: {
  status: Exclude<UpdateStatus, "up-to-date">;
  error: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const copy = statusCopy[status];
  const isError = status === "error";

  return (
    <View
      className="flex-1 items-center justify-center bg-paper px-8"
      style={{ gap: 24 }}
    >
      <View
        style={{ width: 120, height: 120, position: "relative" }}
        pointerEvents="none"
      >
        {[52, 38, 24].map((r) => (
          <View
            key={r}
            style={{
              position: "absolute",
              left: 60 - r,
              top: 60 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              borderWidth: 1,
              borderColor: isError ? "#A34A34" : "#E4DED4",
              opacity: isError ? 0.35 : 0.6,
            }}
          />
        ))}
        {!isError && (
          <Pulse
            style={{
              position: "absolute",
              left: 54,
              top: 54,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#A8703F",
            }}
          />
        )}
        {isError && (
          <View
            style={{
              position: "absolute",
              left: 54,
              top: 54,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#A34A34",
            }}
          />
        )}
      </View>

      {/* Label chip — mono uppercase like the rest of the app */}
      <Text className="font-mono text-[13px] tracking-widest text-ink-faint uppercase">
        {copy.label}
      </Text>

      {/* Headline */}
      <Text className="font-display text-[28px] leading-[34px] text-ink text-center -mt-2">
        Korasa
      </Text>

      {/* Status message */}
      <Text className="max-w-[19rem] text-center text-[17px] leading-relaxed text-ink-soft -mt-2">
        {copy.message}
      </Text>

      {/* Progress bar (checking / downloading) */}
      {(status === "checking" || status === "downloading") && (
        <View
          className="overflow-hidden rounded-full bg-rule"
          style={{ width: 200, height: 4 }}
        >
          <Pulse
            style={{
              width: status === "downloading" ? "66%" : "33%",
              height: 4,
              borderRadius: 2,
              backgroundColor: "#A8703F",
            }}
          />
        </View>
      )}

      {/* Error actions */}
      {isError && (
        <View style={{ gap: 12 }}>
          <Pressable
            onPress={onRetry}
            className="flex-row items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4"
          >
            <RefreshCw size={18} color="#F1EFEC" strokeWidth={1.75} />
            <Text className="text-[17px] text-paper">Try again</Text>
          </Pressable>
          <Pressable onPress={onDismiss} className="items-center py-3">
            <Text className="text-[15px] text-ink-faint">Continue anyway</Text>
          </Pressable>
        </View>
      )}

      {/* Subtle error detail */}
      {isError && error && (
        <Text className="mt-4 max-w-[18rem] text-center text-[13px] text-ink-faint">
          {error}
        </Text>
      )}
    </View>
  );
}
