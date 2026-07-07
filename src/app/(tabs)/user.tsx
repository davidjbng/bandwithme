import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { devProfile, isDevProfileEnabled } from "@/lib/dev-profile";

const availableInstruments = [
  "Vocals",
  "Guitar",
  "Bass",
  "Drums",
  "Keys",
  "Saxophone",
  "Trumpet",
  "Violin",
];

export default function UserScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const { code, email: callbackEmail } = useLocalSearchParams<{ code?: string; email?: string }>();
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileName, setProfileName] = useState(devProfile.name);
  const [pictureUrl, setPictureUrl] = useState(devProfile.pictureUrl);
  const [selectedInstruments, setSelectedInstruments] = useState(devProfile.instruments);
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const insets = {
    top: safeAreaInsets.top,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  useEffect(() => {
    if (!code) {
      return;
    }

    void (async () => {
      setIsSubmitting(true);
      setError(null);
      setStatus("Finishing sign in...");

      try {
        if (!callbackEmail) {
          throw new Error("Missing email for magic link sign in.");
        }
        await signIn("ahasend", { code, email: callbackEmail });
        router.replace("/user");
        setStatus(null);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Could not finish signing in.",
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [callbackEmail, code, router, signIn]);

  async function sendMagicLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await signIn("ahasend", {
        email: trimmedEmail,
        redirectTo: `/user?email=${encodeURIComponent(trimmedEmail)}`,
      });
      setStatus("Magic link sent. Check your email to finish signing in.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not send magic link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await signOut();
      setEmail("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not sign out.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleInstrument(instrument: string) {
    setSelectedInstruments((current) =>
      current.includes(instrument)
        ? current.filter((selectedInstrument) => selectedInstrument !== instrument)
        : [...current, instrument],
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Profil" }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.content}
          >
            <ThemedView style={styles.header}>
              <ThemedText type="subtitle">Profil</ThemedText>
              <ThemedText style={styles.centerText} themeColor="textSecondary">
                Verwalte dein Dev-Profil und melde dich optional mit deinem Account an.
              </ThemedText>
            </ThemedView>

            {isDevProfileEnabled && (
              <ThemedView type="backgroundElement" style={styles.card}>
                <View style={styles.profileHeader}>
                  <Image source={pictureUrl} contentFit="cover" style={styles.avatar} />
                  <View style={styles.profileSummary}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Dev-Profil
                    </ThemedText>
                    <ThemedText selectable type="smallBold">
                      {profileName || "Unbenannt"}
                    </ThemedText>
                    <ThemedText selectable type="small" themeColor="textSecondary">
                      {selectedInstruments.length === 0
                        ? "Keine Instrumente ausgewählt"
                        : selectedInstruments.join(", ")}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Name</ThemedText>
                  <TextInput
                    onChangeText={setProfileName}
                    placeholder="Dein Name"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      { borderColor: theme.backgroundSelected, color: theme.text },
                    ]}
                    value={profileName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Bild-URL</ThemedText>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    inputMode="url"
                    onChangeText={setPictureUrl}
                    placeholder="https://example.com/profile.jpg"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      { borderColor: theme.backgroundSelected, color: theme.text },
                    ]}
                    value={pictureUrl}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Instrumente</ThemedText>
                  <View style={styles.chipList}>
                    {availableInstruments.map((instrument) => {
                      const isSelected = selectedInstruments.includes(instrument);

                      return (
                        <Pressable
                          key={instrument}
                          onPress={() => toggleInstrument(instrument)}
                          style={({ pressed }) => [pressed && styles.pressed]}
                        >
                          <ThemedView
                            type={isSelected ? undefined : "backgroundSelected"}
                            style={[styles.chip, isSelected && { backgroundColor: theme.text }]}
                          >
                            <ThemedText
                              type="smallBold"
                              style={isSelected && { color: theme.background }}
                            >
                              {instrument}
                            </ThemedText>
                          </ThemedView>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Aktuelle Bands</ThemedText>
                  <View style={styles.bandList}>
                    {devProfile.bands.map((band) => (
                      <ThemedView
                        key={`${band.name}-${band.role ?? "member"}`}
                        style={styles.bandRow}
                      >
                        <ThemedText selectable type="smallBold">
                          {band.name}
                        </ThemedText>
                        {band.role && (
                          <ThemedText selectable type="small" themeColor="textSecondary">
                            {band.role}
                          </ThemedText>
                        )}
                      </ThemedView>
                    ))}
                  </View>
                </View>

                <ThemedText type="small" themeColor="textSecondary">
                  Dev-only: Änderungen bleiben lokal bis zum nächsten Reload.
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView type="backgroundElement" style={styles.card}>
              {isLoading || (isAuthenticated && user === undefined) ? (
                <ActivityIndicator color={theme.text} />
              ) : isAuthenticated ? (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    Angemeldet als
                  </ThemedText>
                  <ThemedText type="smallBold">
                    {user?.email ?? user?.name ?? "Kein Name"}
                  </ThemedText>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={handleSignOut}
                    style={({ pressed }) => [
                      styles.button,
                      { backgroundColor: theme.text },
                      pressed && styles.pressed,
                      isSubmitting && styles.disabled,
                    ]}
                  >
                    <ThemedText style={[styles.buttonText, { color: theme.background }]}>
                      Abmelden
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    Sign in with a one-time link sent to your email.
                  </ThemedText>
                  <ThemedText type="smallBold">Email address</ThemedText>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    inputMode="email"
                    onChangeText={setEmail}
                    onSubmitEditing={sendMagicLink}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      { borderColor: theme.backgroundSelected, color: theme.text },
                    ]}
                    value={email}
                  />
                  <Pressable
                    disabled={isSubmitting}
                    onPress={sendMagicLink}
                    style={({ pressed }) => [
                      styles.button,
                      { backgroundColor: theme.text },
                      pressed && styles.pressed,
                      isSubmitting && styles.disabled,
                    ]}
                  >
                    <ThemedText style={[styles.buttonText, { color: theme.background }]}>
                      Send magic link
                    </ThemedText>
                  </Pressable>
                </>
              )}

              {isSubmitting && <ActivityIndicator color={theme.text} />}
              {status && (
                <ThemedText type="small" themeColor="textSecondary">
                  {status}
                </ThemedText>
              )}
              {error && (
                <ThemedText type="small" style={styles.error}>
                  {error}
                </ThemedText>
              )}
            </ThemedView>
          </KeyboardAvoidingView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  container: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  content: {
    gap: Spacing.five,
  },
  header: {
    alignItems: "center",
    gap: Spacing.three,
  },
  centerText: {
    textAlign: "center",
  },
  card: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  profileSummary: {
    flex: 1,
    gap: Spacing.half,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  button: {
    alignItems: "center",
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 700,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  bandList: {
    gap: Spacing.two,
  },
  bandRow: {
    borderRadius: Spacing.three,
    gap: Spacing.half,
    padding: Spacing.three,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: "#d92d20",
  },
  pressed: {
    opacity: 0.7,
  },
});
