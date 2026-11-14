import { Button, Host } from "@expo/ui";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { Redirect, Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const createBand = useMutation(api.bands.create);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || (isAuthenticated && user === undefined)) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="small" themeColor="textSecondary">
          Lädt…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated || !user) return <Redirect href="/user" />;

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
      await createBand({ userId: user!.id, name: name.trim() });
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Fehler beim Erstellen der Band.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Band erstellen" }} />
      <KeyboardAwareScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
        bottomOffset={Spacing.four}
        keyboardShouldPersistTaps="handled"
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
              accessibilityLabel="Bandname"
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: error ? "#ef4444" : theme.backgroundSelected,
                  color: theme.text,
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

            <Host matchContents>
              <Button
                onPress={handleCreate}
                disabled={submitting}
                label={submitting ? "Wird erstellt…" : "Band erstellen"}
              />
            </Host>

            <Host matchContents>
              <Button variant="text" onPress={() => router.back()} label="Abbrechen" />
            </Host>
          </View>
        </ThemedView>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
});
