import { ConvexAuthProvider, type TokenStorage } from '@convex-dev/auth/react';
import { useRouter, type Href } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL. Run `pnpm exec convex dev` and expose the deployment URL to Expo.');
}

const convex = new ConvexReactClient(convexUrl);

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
      storage={Platform.OS === 'web' ? undefined : secureStore}
      replaceURL={(relativeUrl) => router.replace(relativeUrl as Href)}>
      {children}
    </ConvexAuthProvider>
  );
}
