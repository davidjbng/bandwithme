import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatDateTime, repeatLabels, useEvents } from '@/lib/events';
import { useTheme } from '@/hooks/use-theme';

export default function TermineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const events = useEvents();

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => left.dateTime.localeCompare(right.dateTime)),
    [events]
  );

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="smallBold">Alle Termine</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {events.length === 0 ? 'Noch nichts geplant' : `${events.length} geplant`}
                </ThemedText>
              </View>
            </View>

            {sortedEvents.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.background }]}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                    size={28}
                  />
                </View>
                <ThemedText type="smallBold" style={styles.centerText}>
                  Deine Bühne ist noch frei
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
                  Erstelle deinen ersten Termin – zum Beispiel eine wöchentliche Probe – und er erscheint hier als einfache Liste.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/termine/create')}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView style={[styles.emptyButton, { backgroundColor: theme.text }]}>
                    <SymbolView
                      tintColor={theme.background}
                      name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add' }}
                      size={18}
                    />
                    <ThemedText type="smallBold" style={{ color: theme.background }}>
                      Termin erstellen
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </ThemedView>
            ) : (
              <View style={styles.eventList}>
                {sortedEvents.map((event) => (
                  <ThemedView key={event.id} type="backgroundElement" style={styles.eventCard}>
                    <View style={[styles.eventDateBadge, { backgroundColor: theme.background }]}>
                      <SymbolView
                        tintColor={theme.text}
                        name={{ ios: 'calendar', android: 'event', web: 'event' }}
                        size={20}
                      />
                    </View>
                    <View style={styles.eventBody}>
                      <ThemedText selectable type="smallBold">
                        {event.name}
                      </ThemedText>
                      <ThemedText selectable type="small" themeColor="textSecondary">
                        {formatDateTime(event.dateTime)} · {event.location}
                      </ThemedText>
                      <ThemedText selectable type="code" themeColor="textSecondary">
                        {repeatLabels[event.repeat]}
                      </ThemedText>
                    </View>
                  </ThemedView>
                ))}
              </View>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <Stack.Screen
        options={{
          title: 'Termine',
          headerRight: () => (
            <Pressable
              accessibilityLabel="Termin erstellen"
              onPress={() => router.push('/termine/create')}
              style={({ pressed }) => [styles.toolbarButton, pressed && styles.pressed]}>
              <SymbolView
                tintColor={theme.text}
                name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add' }}
                size={24}
              />
            </Pressable>
          ),
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centerText: {
    textAlign: 'center',
  },
  listSection: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    textAlign: 'center',
    maxWidth: 520,
  },
  emptyButton: {
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  eventList: {
    gap: Spacing.two,
  },
  eventCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    alignItems: 'center',
  },
  eventDateBadge: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBody: {
    flex: 1,
    gap: Spacing.half,
  },
});
