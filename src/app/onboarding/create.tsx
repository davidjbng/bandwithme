import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../../convex/_generated/api";

export default function CreateBandScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.user.current);
  const createBand = useMutation(api.bands.create);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  async function handleCreate() {
    setError("");
    if (!name.trim()) {
      setError("Gib deiner Band einen Namen.");
      return;
    }
    setSubmitting(true);
    try {
      await createBand({ userId: user!.id as never, name: name.trim() });
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Fehler beim Erstellen der Band.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Lädt…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Bitte zuerst einloggen.
        </ThemedText>
        <Pressable onPress={() => router.push("/user")}>
          <ThemedText type="linkPrimary">Zum Login</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Band erstellen" }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <SymbolView tintColor={theme.text} name={{ ios: "music.mic", web: "mic" }} size={40} />
            <ThemedText type="subtitle">Neue Band gründen</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
              Gib deiner Band einen Namen. Du wirst automatisch Admin.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText type="smallBold">Bandname</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: error ? "#ef4444" : theme.backgroundSelected,
                },
              ]}
              placeholder="z. B. Die Kellerkinder"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              editable={!submitting}
            />
            {error ? (
              <ThemedText type="small" style={{ color: "#ef4444" }}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              onPress={handleCreate}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                { backgroundColor: theme.text, opacity: submitting ? 0.5 : 1 },
              ]}
            >
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                {submitting ? "Wird erstellt…" : "Band erstellen"}
              </ThemedText>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.cancelButton}>
              <ThemedText type="small" themeColor="textSecondary">
                Abbrechen
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.two },
  scrollView: { flex: 1 },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  container: { width: "100%", maxWidth: MaxContentWidth, gap: Spacing.five },
  header: { alignItems: "center", gap: Spacing.two },
  centerText: { textAlign: "center" },
  form: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitButton: {
    minHeight: 48,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  cancelButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: { opacity: 0.75 },
});
