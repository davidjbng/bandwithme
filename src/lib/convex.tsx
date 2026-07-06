import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { useRouter, type Href } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { ConvexReactClient } from "convex/react";

const PRODUCTION_URL = "https://blissful-spaniel-445.eu-west-1.convex.cloud";

function getConvexUrl(): string {
  const env = process.env.EXPO_PUBLIC_CONVEX_URL;

  // EAS Hosting: always use production Convex
  if (
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
  const router = useRouter();

  return (
    <ConvexAuthProvider
      client={convex}
      storage={Platform.OS === "web" ? undefined : secureStore}
      replaceURL={(relativeUrl) => router.replace(relativeUrl as Href)}
    >
      {children}
    </ConvexAuthProvider>
  );
}
