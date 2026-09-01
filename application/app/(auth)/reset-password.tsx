import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!email || !code) {
    // Guard: if someone navigates here directly without params, redirect.
    router.replace("/(auth)/forgot-password");
    return null;
  }

  const handleReset = async () => {
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
      setSuccess(true);
      // Brief pause to let the user see the success state before navigating.
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to reset password. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-6 pt-6">
          <Text className="font-display text-2xl text-ink">Korasa</Text>
        </View>

        <View className="flex-1 px-6 pt-10 pb-16">
          <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
            Final step
          </Text>
          <Text className="font-display mt-3 text-[40px] leading-tight text-ink">
            New password
          </Text>
          <Text className="mt-3 text-[17px] text-ink-soft">
            Choose a new password for your account.
          </Text>

          {error ? (
            <Text className="mt-4 text-red-500 text-sm">{error}</Text>
          ) : null}
          {success ? (
            <View
              className="mt-4 flex-row items-center rounded-xl border border-green-200 bg-green-50 px-3 py-3"
              style={{ gap: 8 }}
            >
              <Check size={16} color="#16a34a" />
              <Text className="text-green-600 text-sm" style={{ flex: 1 }}>
                Password reset! Redirecting to sign in…
              </Text>
            </View>
          ) : null}

          <Text className="mt-6 text-[14px] tracking-widest text-ink-faint uppercase">
            New password
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading && !success}
              autoFocus
              className="text-[18px] text-ink py-3"
            />
          </View>
          <Text className="mt-2 text-[14px] text-ink-faint">
            At least 8 characters.
          </Text>

          <Text className="mt-7 text-[14px] tracking-widest text-ink-faint uppercase">
            Confirm password
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading && !success}
              className="text-[18px] text-ink py-3"
            />
          </View>

          <Pressable
            onPress={handleReset}
            disabled={loading || success}
            className="mt-8 rounded-full bg-onyx py-4 items-center"
            style={{ opacity: loading || success ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[17px] text-paper">
                {success ? "Done!" : "Reset password"}
              </Text>
            )}
          </Pressable>

          <View className="mt-6 items-center">
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              disabled={loading}
            >
              <Text className="text-ink-faint text-sm">← Back to sign in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
