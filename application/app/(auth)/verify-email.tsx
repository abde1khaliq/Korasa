import { useEffect, useRef, useState } from "react";
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
import { Check, RefreshCw, ArrowRight } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { pendingVerification, verifyEmail, resendVerification, clearPendingVerification } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Nothing to verify — either a cold start on this route, or the app
    // was killed mid-flow and the in-memory credentials are gone. Same
    // failure mode as the web version losing sessionStorage.
    if (!pendingVerification) {
      router.replace("/(auth)/register");
      return;
    }
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pendingVerification) return null;

  const handleVerify = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await verifyEmail(code);
      setSuccess("Email verified successfully! Logging you in...");
      // No manual navigation — root layout's redirect effect moves us
      // to (app) once isAuthenticated flips true.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await resendVerification();
      setSuccess("New verification code sent to your email!");
      startTimer();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="px-6 pt-6">
          <Text className="font-display text-2xl text-ink">Korasa</Text>
        </View>

        <View className="flex-1 px-6 pt-10 pb-16">
          <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
            Verify your email
          </Text>
          <Text className="font-display mt-3 text-[40px] leading-tight text-ink">
            Check your inbox
          </Text>
          <Text className="mt-3 text-[17px] text-ink-soft">
            We sent a 6-digit verification code to{" "}
            <Text className="text-ink" style={{ fontWeight: "500" }}>
              {pendingVerification.email}
            </Text>
          </Text>

          {error ? <Text className="mt-4 text-red-500 text-sm">{error}</Text> : null}
          {success ? (
            <View
              className="mt-4 flex-row items-center rounded-xl border border-green-200 bg-green-50 px-3 py-3"
              style={{ gap: 8 }}
            >
              <Check size={16} color="#16a34a" />
              <Text className="text-green-600 text-sm" style={{ flex: 1 }}>
                {success}
              </Text>
            </View>
          ) : null}

          <Text className="mt-6 text-[14px] tracking-widest text-ink-faint uppercase">
            Verification code
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={code}
              onChangeText={handleCodeChange}
              placeholder="000000"
              keyboardType="number-pad"
              editable={!loading}
              maxLength={6}
              autoFocus
              className="text-[24px] text-ink py-3 text-center"
              style={{ letterSpacing: 6 }}
            />
          </View>
          <Text className="mt-2 text-[15px] text-ink-faint text-center">
            Enter the code sent to your email address
          </Text>

          <Pressable
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            className="mt-8 flex-row items-center justify-center rounded-full bg-onyx py-4"
            style={{ gap: 8, opacity: loading || code.length !== 6 ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-[17px] text-paper">Verify email</Text>
                <ArrowRight size={20} color="#F7F5F1" strokeWidth={1.75} />
              </>
            )}
          </Pressable>

          <View className="mt-6 items-center" style={{ gap: 16 }}>
            {canResend ? (
              <Pressable
                onPress={handleResend}
                disabled={resending}
                className="flex-row items-center"
                style={{ gap: 8, opacity: resending ? 0.5 : 1 }}
              >
                <RefreshCw size={16} color="#A8703F" />
                <Text className="text-brand text-sm" style={{ fontWeight: "500" }}>
                  {resending ? "Sending..." : "Resend verification code"}
                </Text>
              </Pressable>
            ) : (
              <Text className="text-ink-faint text-sm">Resend available in {timer} seconds</Text>
            )}

            <Pressable
              onPress={() => {
                clearPendingVerification();
                router.replace("/(auth)/register");
              }}
            >
              <Text className="text-ink-faint text-sm">← Back to registration</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}