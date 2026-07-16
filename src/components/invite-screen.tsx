import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../convex/_generated/api";

type InviteScreenProps = { token?: string };

export function InviteScreen({ token }: InviteScreenProps) {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated } = useConvexAuth();
  const invite = useQuery(api.bands.previewInvite, token ? { token } : "skip");
  const acceptInvite = useMutation(api.bands.acceptInvite);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  async function handleJoin() {
    if (!token) return;

    setError("");
    setJoining(true);
    try {
      await acceptInvite({ token });
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bandbeitritt fehlgeschlagen.");
    } finally {
      setJoining(false);
    }
  }

  function handleLogin() {
    if (!token) return;
    router.push(
      `/user?next=${encodeURIComponent(`/invite?token=${encodeURIComponent(token)}`)}` as never,
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Band beitreten" }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedView style={styles.container}>
          {invite === undefined ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Einladungslink wird geprüft…
            </ThemedText>
          ) : !invite ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <SymbolView
                tintColor={theme.textSecondary}
                name={{ ios: "exclamationmark.triangle", web: "link_off" }}
                size={36}
              />
              <ThemedText type="subtitle">Link nicht gefunden</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Dieser Einladungslink ist ungültig oder die Band wurde gelöscht.
              </ThemedText>
              <Pressable onPress={() => router.replace("/")} style={styles.secondaryButton}>
                <ThemedText type="smallBold">Zur Startseite</ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.card}>
              <SymbolView
                tintColor={theme.text}
                name={{ ios: "music.mic", web: "mic" }}
                size={40}
              />
              <ThemedText type="subtitle">{invite.bandName}</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
                Du wurdest eingeladen, dieser Band bei Band With Me beizutreten.
              </ThemedText>
              {isAuthenticated ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={joining}
                  onPress={handleJoin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    { backgroundColor: theme.text, opacity: joining ? 0.5 : 1 },
                  ]}
                >
                  <ThemedText type="smallBold" style={{ color: theme.background }}>
                    {joining ? "Du trittst bei…" : "Band beitreten"}
                  </ThemedText>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    { backgroundColor: theme.text },
                  ]}
                >
                  <ThemedText type="smallBold" style={{ color: theme.background }}>
                    Einloggen und beitreten
                  </ThemedText>
                </Pressable>
              )}
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
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
  container: { width: "100%", maxWidth: MaxContentWidth },
  card: {
    alignItems: "center",
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: { textAlign: "center" },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: Spacing.three,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.four,
  },
  secondaryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: Spacing.three },
  pressed: { opacity: 0.75 },
  error: { color: "#ef4444", textAlign: "center" },
});
