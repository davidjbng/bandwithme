import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../../convex/_generated/api";

export default function ProfileOnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const updateProfile = useMutation(api.user.updateProfile);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already has a name
  useEffect(() => {
    if (user?.name) {
      router.replace("/");
    }
  }, [user?.name, router]);

  // Show spinner while auth is loading or user data not yet available
  if (isLoading || user === undefined) {
    return (
      <ThemedView style={styles.root}>
        <ThemedText type="small" themeColor="textSecondary">
          Lädt…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace("/");
    return null;
  }

  async function handleSave() {
    setError("");
    if (!name.trim()) {
      setError("Gib deinen Namen ein.");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({ userId: user!.id as never, name: name.trim() });
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Fehler beim Speichern.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView
        style={[
          styles.root,
          {
            paddingTop: safeAreaInsets.top + Spacing.six,
            paddingBottom: safeAreaInsets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.title}>
            Willkommen bei Band With Me! 🎸
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.sub}>
            Wie heißt du? Dein Name wird für deine Bandmitglieder angezeigt.
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: error ? "#ef4444" : theme.backgroundSelected,
              },
            ]}
            placeholder="Dein Name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            editable={!submitting}
            onSubmitEditing={handleSave}
          />

          {error ? (
            <ThemedText type="small" style={{ color: "#ef4444" }}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handleSave}
            disabled={submitting}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              { backgroundColor: theme.text, opacity: submitting ? 0.5 : 1 },
            ]}
          >
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {submitting ? "Wird gespeichert…" : "Weiter"}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  title: {
    textAlign: "center",
  },
  sub: {
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 18,
  },
  button: {
    minHeight: 52,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
