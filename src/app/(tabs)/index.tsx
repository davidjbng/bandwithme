import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../../convex/_generated/api";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const band = useQuery(api.bands.myBand);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const showDashboard = isAuthenticated && band !== undefined && band !== null && band.id;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <ThemedView style={[styles.heroIcon, { backgroundColor: theme.backgroundSelected }]}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: "music.note.house.fill", web: "music_note" }}
              size={36}
            />
          </ThemedView>
          <ThemedText type="title" style={styles.heroTitle}>
            Band With Me
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.heroSubtitle}>
            Proben planen, Songs voten, Auftritte organisieren — alles an einem Ort für deine Band.
          </ThemedText>
        </View>

        {/* Content area */}
        {authLoading || band === undefined ? (
          <ThemedView type="backgroundElement" style={styles.loadingCard}>
            <ThemedText type="small" themeColor="textSecondary">
              Lädt…
            </ThemedText>
          </ThemedView>
        ) : showDashboard ? (
          /* Authenticated with band — dashboard */
          <View style={styles.actions}>
            <View style={styles.bandBanner}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Aktive Band
              </ThemedText>
              <ThemedText type="subtitle">{band.name}</ThemedText>
            </View>

            <Pressable
              onPress={() => router.push("/termine")}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            >
              <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                <View style={styles.actionIconRow}>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: "calendar", web: "calendar_today" }}
                    size={24}
                  />
                  <ThemedText type="smallBold">Termine</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Nächste Proben & Auftritte
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              onPress={() => router.push("/termine/create")}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            >
              <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                <View style={styles.actionIconRow}>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: "plus.circle.fill", web: "add_circle" }}
                    size={24}
                  />
                  <ThemedText type="smallBold">Neuer Termin</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Probe oder Auftritt anlegen
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              onPress={() => router.push("/band-settings")}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            >
              <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                <View style={styles.actionIconRow}>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: "gearshape.fill", web: "settings" }}
                    size={24}
                  />
                  <ThemedText type="smallBold">Band-Einstellungen</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Mitglieder, Einstellungen & mehr
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              onPress={() => router.push("/user")}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            >
              <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                <View style={styles.actionIconRow}>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: "person.crop.circle", web: "person" }}
                    size={24}
                  />
                  <ThemedText type="smallBold">Profil</ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Dein persönliches Profil
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        ) : isAuthenticated ? (
          /* Authenticated but no band — onboarding */
          <View style={styles.onboarding}>
            <ThemedView type="backgroundElement" style={styles.onboardingCard}>
              <SymbolView
                tintColor={theme.text}
                name={{ ios: "music.mic", web: "mic" }}
                size={32}
              />
              <ThemedText type="smallBold" style={styles.centerText}>
                Willkommen bei Band With Me!
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Erstelle eine neue Band oder tritt einer bestehenden bei.
              </ThemedText>

              <Pressable
                onPress={() => router.push("/onboarding/create")}
                style={({ pressed }) => [
                  styles.onboardingButton,
                  pressed && styles.pressed,
                  { backgroundColor: theme.text },
                ]}
              >
                <SymbolView
                  tintColor={theme.background}
                  name={{ ios: "plus", web: "add" }}
                  size={18}
                />
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Band erstellen
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => router.push("/onboarding/join")}
                style={({ pressed }) => [
                  styles.onboardingButton,
                  styles.onboardingButtonSecondary,
                  pressed && styles.pressed,
                  { borderColor: theme.backgroundSelected },
                ]}
              >
                <SymbolView tintColor={theme.text} name={{ ios: "link", web: "link" }} size={18} />
                <ThemedText type="smallBold">Band beitreten</ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        ) : (
          /* Not authenticated — welcome */
          <View style={styles.actions}>
            <ThemedView type="backgroundElement" style={styles.welcomeCard}>
              <ThemedText type="smallBold" style={styles.centerText}>
                Willkommen!
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Logg dich ein, um deine Band zu verwalten.
              </ThemedText>
              <Pressable
                onPress={() => router.push("/user")}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.pressed,
                  { backgroundColor: theme.text },
                ]}
              >
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Zum Login
                </ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
  },
  container: { width: "100%", maxWidth: MaxContentWidth, gap: Spacing.five },
  hero: { alignItems: "center", gap: Spacing.three, paddingVertical: Spacing.four },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { textAlign: "center" },
  heroSubtitle: { textAlign: "center", maxWidth: 480 },
  loadingCard: { padding: Spacing.four, borderRadius: Spacing.four, alignItems: "center" },
  bandBanner: { gap: Spacing.one, paddingVertical: Spacing.two },
  actions: { gap: Spacing.two },
  actionCard: { borderRadius: Spacing.four },
  actionCardInner: { padding: Spacing.three, gap: Spacing.one, borderRadius: Spacing.four },
  actionIconRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  onboarding: { gap: Spacing.two },
  onboardingCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignItems: "center",
  },
  onboardingButton: {
    minHeight: 48,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    gap: Spacing.two,
    alignSelf: "stretch",
  },
  onboardingButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  welcomeCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignItems: "center",
  },
  centerText: { textAlign: "center" },
  loginButton: {
    minHeight: 44,
    borderRadius: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
  },
  pressed: { opacity: 0.75 },
});
