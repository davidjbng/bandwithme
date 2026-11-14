import { useState } from "react";
import { ConvexError } from "convex/values";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useConvexAuth } from "convex/react";
import { ActivityIndicator, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useTourTheme } from "@/constants/tour-theme";
import { Action, Copy, Meta, Page } from "@/components/tour-ui";
import { ConvexProvider } from "@/lib/convex";

export const unstable_settings = { anchor: "(tabs)" };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <ConvexProvider>
          <AnimatedSplashOverlay />
          <AppNavigation />
        </ConvexProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <Page>
      <Copy style={{ fontSize: 24, fontWeight: "700" }}>
        Deine Band konnte nicht geladen werden.
      </Copy>
      <Meta>
        {error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Prüfe deine Verbindung und versuche es erneut. Falls das Problem bleibt, kontaktiere den Support."}
      </Meta>
      <Action
        label="Erneut versuchen"
        onPress={() => {
          void retry();
        }}
      />
    </Page>
  );
}

function AppNavigation() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { colors } = useTourTheme();
  const [settled, setSettled] = useState({ ready: false, authenticated: false });
  if (!isLoading && (!settled.ready || settled.authenticated !== isAuthenticated)) {
    setSettled({ ready: true, authenticated: isAuthenticated });
  }
  // Auth link redemption sets loading again; keep its screen and hook mounted.
  if (isLoading && !settled.ready)
    return (
      <ActivityIndicator
        accessibilityLabel="Anmeldung wird geprüft"
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.tint,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Protected guard={isLoading ? settled.authenticated : isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="event" options={{ title: "Termin" }} />
        <Stack.Screen name="song-create" options={{ title: "Song vorschlagen" }} />
        <Stack.Screen name="band-settings" options={{ title: "Band verwalten" }} />
      </Stack.Protected>
      <Stack.Screen name="sign-in" options={{ title: "Band With Me", headerBackVisible: false }} />
      <Stack.Screen name="user" options={{ title: "Profil & Ideen" }} />
      <Stack.Screen name="prototype" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ title: "Passwort zurücksetzen" }} />
      <Stack.Screen name="validate-email" options={{ title: "E-Mail bestätigen" }} />
    </Stack>
  );
}
