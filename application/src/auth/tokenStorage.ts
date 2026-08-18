import * as SecureStore from "expo-secure-store";
import type { AuthTokens } from "@/types/api";

// Deliberately NOT AsyncStorage — that's plaintext on disk. SecureStore
// backs onto Keychain (iOS) / Keystore (Android). This is the mobile
// equivalent of the "never localStorage/sessionStorage for tokens" rule
// in security.md.

const ACCESS_KEY = "korasa.accessToken";
const REFRESH_KEY = "korasa.refreshToken";

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}