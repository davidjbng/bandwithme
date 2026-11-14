import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export function inviteDestination(value: unknown): `/invite/${string}` | null {
  if (typeof value !== "string") return null;
  const token =
    /^\/invite\/([a-zA-Z0-9_-]+)$/.exec(value)?.[1] ??
    /^\/invite\?token=([a-zA-Z0-9_-]+)$/.exec(value)?.[1];
  return token ? `/invite/${token}` : null;
}

function storageKey(deploymentUrl: string) {
  return `bandwithme_pending_invite_${deploymentUrl.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export async function saveInviteDestination(value: unknown, deploymentUrl: string) {
  const destination = inviteDestination(value);
  const key = storageKey(deploymentUrl);
  if (Platform.OS === "web") {
    if (destination) window.localStorage.setItem(key, destination);
    else window.localStorage.removeItem(key);
  } else if (destination) await SecureStore.setItemAsync(key, destination);
  else await SecureStore.deleteItemAsync(key);
}

export async function readInviteDestination(deploymentUrl: string) {
  const key = storageKey(deploymentUrl);
  const value =
    Platform.OS === "web" ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
  return inviteDestination(value);
}
