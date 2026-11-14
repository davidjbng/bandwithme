import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type PendingSignup = { email: string; username: string };
function key(url: string) {
  return `bandwithme_signup_${url.replace(/[^a-zA-Z0-9]/g, "")}`;
}
export async function savePendingSignup(value: PendingSignup | null, url: string) {
  if (Platform.OS === "web") {
    if (value) window.localStorage.setItem(key(url), JSON.stringify(value));
    else window.localStorage.removeItem(key(url));
  } else if (value) await SecureStore.setItemAsync(key(url), JSON.stringify(value));
  else await SecureStore.deleteItemAsync(key(url));
}
export async function readPendingSignup(url: string): Promise<PendingSignup | null> {
  const raw =
    Platform.OS === "web"
      ? window.localStorage.getItem(key(url))
      : await SecureStore.getItemAsync(key(url));
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      "email" in value &&
      "username" in value &&
      typeof value.email === "string" &&
      typeof value.username === "string"
    )
      return { email: value.email, username: value.username };
  } catch {
    /* An interrupted registration must not prevent email sign-in. */
  }
  return null;
}
