import { useConvexAuth } from '@convex-dev/auth/react';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <ThemedView
            style={[styles.heroIcon, { backgroundColor: theme.backgroundSelected }]}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'music.note.house.fill', web: 'music_note' }}
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

        {/* Quick Actions */}
        <View style={styles.actions}>
          {!isLoading && isAuthenticated ? (
            <>
              <Pressable
                onPress={() => router.push('/termine')}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                  <View style={styles.actionIconRow}>
                    <SymbolView
                      tintColor={theme.text}
                      name={{ ios: 'calendar', web: 'calendar_today' }}
                      size={24}
                    />
                    <ThemedText type="smallBold">Termine</ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Nächste Proben & Auftritte anzeigen
                  </ThemedText>
                </ThemedView>
              </Pressable>

              <Pressable
                onPress={() => router.push('/termine/create')}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                  <View style={styles.actionIconRow}>
                    <SymbolView
                      tintColor={theme.text}
                      name={{ ios: 'plus.circle.fill', web: 'add_circle' }}
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
                onPress={() => router.push('/user')}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.actionCardInner}>
                  <View style={styles.actionIconRow}>
                    <SymbolView
                      tintColor={theme.text}
                      name={{ ios: 'person.crop.circle', web: 'person' }}
                      size={24}
                    />
                    <ThemedText type="smallBold">Profil</ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Profil & Band-Einstellungen
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </>
          ) : !isLoading ? (
            <ThemedView type="backgroundElement" style={styles.welcomeCard}>
              <ThemedText type="smallBold" style={styles.centerText}>
                Willkommen!
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Logg dich ein, um deine Band zu verwalten.
              </ThemedText>
              <Pressable
                onPress={() => router.push('/user')}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed, { backgroundColor: theme.text }]}>
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Zum Login
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : null}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.five,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    maxWidth: 480,
  },
  actions: {
    gap: Spacing.two,
  },
  actionCard: {
    borderRadius: Spacing.four,
  },
  actionCardInner: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Spacing.four,
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  welcomeCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  loginButton: {
    minHeight: 44,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  pressed: {
    opacity: 0.75,
  },
});