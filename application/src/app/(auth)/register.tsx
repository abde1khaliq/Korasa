import { useState } from "react";
import { View, TextInput, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "@/auth/authContext";
import { apiFetch } from "@/api/client";
import { ArrowRight, Check } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ username, email, password }),
      });

      // Automatically sign in
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6">
            <Text className="font-bold text-2xl leading-none">K</Text>
          </View>

          <View className="flex-1 px-6 pt-10 pb-16">
            <Text className="text-[13px] tracking-[2px] text-gray-500 uppercase">
              Get started
            </Text>
            <Text className="mt-3 text-[48px] leading-[50px] font-bold text-black">
              Create account
            </Text>
            <Text className="mt-3 text-[17px] text-gray-600">
              Subjects, folders and questions all in one quiet place.
            </Text>

            {error && <Text className="mt-4 text-red-500 text-sm">{error}</Text>}

            <View className="mt-6">
              <Text className="text-[14px] tracking-[2px] text-gray-500 uppercase mb-3">
                Username
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-1">
                <TextInput
                  placeholder="Your username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  editable={!loading}
                  className="w-full text-[18px] text-black py-3"
                />
              </View>

              <Text className="mt-7 text-[14px] tracking-[2px] text-gray-500 uppercase mb-3">
                Email
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-1">
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  className="w-full text-[18px] text-black py-3"
                />
              </View>

              <Text className="mt-7 text-[14px] tracking-[2px] text-gray-500 uppercase mb-3">
                Password
              </Text>
              <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 focus:border-blue-500 bg-gray-50 px-5 py-1">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  className="flex-1 text-[20px] text-black tracking-widest py-3"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} disabled={loading} className="ml-2">
                  <Text className="text-[14px] tracking-[1.5px] text-gray-500 uppercase">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              <Text className="mt-2 text-[15px] text-gray-400">
                At least 8 characters.
              </Text>

              <Pressable 
                className="mt-7 flex-row items-start gap-3" 
                onPress={() => !loading && setAgreed(!agreed)}
              >
                <View className={`mt-0.5 w-6 h-6 items-center justify-center rounded-md border ${agreed ? "bg-black border-black" : "border-gray-300 bg-gray-50"}`}>
                  {agreed && <Check size={16} color="#fff" strokeWidth={2.25} />}
                </View>
                <Text className="text-[16px] leading-snug text-gray-600 flex-1">
                  I agree to the <Text className="text-blue-500">Terms</Text> and <Text className="text-blue-500">Privacy Policy</Text>.
                </Text>
              </Pressable>

              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className="mt-8 flex-row items-center justify-center gap-3 rounded-full bg-black px-8 py-4 opacity-100 disabled:opacity-50"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-[17px] text-white">Create account</Text>
                    <ArrowRight size={20} color="#fff" strokeWidth={1.75} />
                  </>
                )}
              </Pressable>
            </View>

            <View className="mt-12 items-center flex-row justify-center">
              <Text className="text-[17px] text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-[17px] text-blue-500">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
