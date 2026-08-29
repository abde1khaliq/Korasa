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
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      router.push({
        pathname: "/(auth)/verify-reset",
        params: { email },
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
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
            Forgot password
          </Text>
          <Text className="font-display mt-3 text-[40px] leading-tight text-ink">
            Reset password
          </Text>
          <Text className="mt-3 text-[17px] text-ink-soft">
            Enter your email and we'll send you a code to reset your password.
          </Text>

          {error ? (
            <Text className="mt-4 text-red-500 text-sm">{error}</Text>
          ) : null}

          <Text className="mt-6 text-[14px] tracking-widest text-ink-faint uppercase">
            Email
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoFocus
              className="text-[18px] text-ink py-3"
            />
          </View>

          <Pressable
            onPress={handleSendCode}
            disabled={loading}
            className="mt-8 flex-row items-center justify-center rounded-full bg-onyx py-4"
            style={{ gap: 8, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-[17px] text-paper">Send reset code</Text>
                <ArrowRight size={20} color="#F7F5F1" strokeWidth={1.75} />
              </>
            )}
          </Pressable>

          <View className="mt-6 items-center">
            <Pressable onPress={() => router.back()}>
              <Text className="text-ink-faint text-sm">← Back to sign in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
