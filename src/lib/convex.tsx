import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

const PRODUCTION_URL = "https://blissful-spaniel-445.eu-west-1.convex.cloud";

function getConvexUrl(): string {
  const env = process.env.EXPO_PUBLIC_CONVEX_URL;

  // EAS Hosting: always use production Convex
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    (window.location.hostname.includes("expo.app") || window.location.hostname === "bandwithme.de")
  ) {
    return PRODUCTION_URL;
  }

  // Local dev: use env var (set by convex dev to localhost)
  return env || PRODUCTION_URL;
}

const convex = new ConvexReactClient(getConvexUrl());

const secureStore: TokenStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export function ConvexProvider({ children }: PropsWithChildren) {
  return (
    <ConvexAuthProvider
      client={convex}
      api={api.auth}
      storageNamespace={`bandwithme-auth-v2-${convex.url}`}
      ambientSignIns={[]}
      storage={Platform.OS === "web" ? undefined : secureStore}
    >
      {children}
    </ConvexAuthProvider>
  );
}
