import { Button, Host } from "@expo/ui";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
  if (isLoading || (isAuthenticated && user === undefined)) {
    return (
      <ThemedView style={styles.root}>
        <ThemedText type="small" themeColor="textSecondary">
          Lädt…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/user" />;
  }

  async function handleSave() {
    setError("");
    if (!name.trim()) {
      setError("Gib deinen Namen ein.");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({ userId: user!.id, name: name.trim() });
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
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Spacing.four}
        contentContainerStyle={[
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
            accessibilityLabel="Dein Name"
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: error ? "#ef4444" : theme.backgroundSelected,
                color: theme.text,
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

          <Host matchContents>
            <Button
              onPress={handleSave}
              disabled={submitting}
              label={submitting ? "Wird gespeichert…" : "Weiter"}
            />
          </Host>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
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
});
