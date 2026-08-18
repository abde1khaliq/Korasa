import { useState } from "react";
import { View, TextInput, Text, Pressable, ActivityIndicator } from "react-native";
import { useAuth } from "@/auth/authContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>Sign in</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 14 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 14 }}
      />

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: "#1a1a1a", borderRadius: 999, padding: 16, alignItems: "center" }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Sign in</Text>}
      </Pressable>
    </View>
  );
}