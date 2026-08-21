import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      // Your backend flow requires email verification — that screen
      // doesn't exist in RN yet. For now this just goes back to login.
      router.replace("/(auth)/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create account.");
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
          <Text className="text-2xl text-ink" style={{ fontWeight: "600" }}>
            Korasa
          </Text>
        </View>

        <View className="flex-1 px-6 pt-10 pb-16">
          <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
            Get started
          </Text>
          <Text className="mt-3 text-[40px] leading-tight text-ink" style={{ fontWeight: "600" }}>
            Create account
          </Text>

          {error ? <Text className="mt-4 text-red-500 text-sm">{error}</Text> : null}

          <Text className="mt-6 text-[14px] tracking-widest text-ink-faint uppercase">
            Username
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              autoCapitalize="none"
              editable={!loading}
              className="text-[18px] text-ink py-3"
            />
          </View>

          <Text className="mt-7 text-[14px] tracking-widest text-ink-faint uppercase">
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
              className="text-[18px] text-ink py-3"
            />
          </View>

          <Text className="mt-7 text-[14px] tracking-widest text-ink-faint uppercase">
            Password
          </Text>
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card px-5">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading}
              className="text-[18px] text-ink py-3"
            />
          </View>
          <Text className="mt-2 text-[14px] text-ink-faint">At least 8 characters.</Text>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="mt-8 rounded-full bg-onyx py-4 items-center"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[17px] text-paper" style={{ fontWeight: "600" }}>
                Create account
              </Text>
            )}
          </Pressable>

          <View className="mt-auto pt-12 flex-row justify-center">
            <Text className="text-[17px] text-ink-soft">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-[17px] text-brand">Sign in</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}