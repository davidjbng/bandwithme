import { useConvexAuth } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  eventKindLabels,
  formatDateTime,
  getInitials,
  repeatLabels,
  rsvpOptions,
  type RsvpStatus,
} from '@/lib/events';
import { useTheme } from '@/hooks/use-theme';
import { api } from '../../../../convex/_generated/api';

function AvatarStack({
  names,
  theme,
}: {
  names: string[];
  theme: ReturnType<typeof useTheme>;
}) {
  if (names.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        noch niemand
      </ThemedText>
    );
  }

  return (
    <View style={styles.avatarRow}>
      {names.slice(0, 4).map((name, index) => (
        <View
          key={`${name}-${index}`}
          style={[
            styles.avatar,
            {
              marginLeft: index === 0 ? 0 : -10,
              backgroundColor: theme.background,
              borderColor: theme.backgroundElement,
            },
          ]}>
          <ThemedText type="smallBold">{getInitials(name)}</ThemedText>
        </View>
      ))}
      {names.length > 4 ? (
        <View style={[styles.avatar, styles.avatarCount, { backgroundColor: theme.backgroundSelected }]}> 
          <ThemedText type="smallBold">+{names.length - 4}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

export default function TermineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const events = useQuery(api.termine.list, {}) ?? [];
  const setResponse = useMutation(api.termine.setResponse);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  async function handleResponse(eventId: string, status: RsvpStatus) {
    await setResponse({ eventId: eventId as never, status });
  }

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
              <View style={styles.sectionTitleWrap}>
                <ThemedText type="smallBold">Nächste Termine</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {events.length === 0 ? 'Noch nichts geplant' : `${events.length} Termine mit echten Zusagen`}
                </ThemedText>
              </View>
            </View>

            {!isAuthenticated && !isLoading ? (
              <ThemedView type="backgroundElement" style={styles.signInCard}>
                <View style={styles.signInCopy}>
                  <ThemedText type="smallBold">Login für Zusagen</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Du kannst die Termine schon sehen. Für echte Zusagen und neue Termine loggst du dich im Profil ein.
                  </ThemedText>
                </View>
                <Pressable onPress={() => router.push('/user')} style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView style={[styles.signInButton, { backgroundColor: theme.text }]}>
                    <ThemedText type="smallBold" style={{ color: theme.background }}>
                      Zum Profil
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </ThemedView>
            ) : null}

            {events.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.background }]}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'calendar.badge.plus', android: 'event_available', web: 'event_available' }}
                    size={28}
                  />
                </View>
                <ThemedText type="smallBold" style={styles.centerText}>
                  Noch keine Probe und noch kein Auftritt
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
                  Lege den ersten Termin an. Danach können Bandmitglieder direkt zusagen oder absagen.
                </ThemedText>
                <Pressable
                  onPress={() => (isAuthenticated ? router.push('/termine/create') : router.push('/user'))}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView style={[styles.emptyButton, { backgroundColor: theme.text }]}>
                    <SymbolView
                      tintColor={theme.background}
                      name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add' }}
                      size={18}
                    />
                    <ThemedText type="smallBold" style={{ color: theme.background }}>
                      {isAuthenticated ? 'Termin erstellen' : 'Einloggen und starten'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </ThemedView>
            ) : (
              <View style={styles.eventList}>
                {events.map((event) => {
                  const participantNames = {
                    yes: event.participants.yes.map((participant) => participant.name),
                    maybe: event.participants.maybe.map((participant) => participant.name),
                    no: event.participants.no.map((participant) => participant.name),
                  };

                  return (
                    <ThemedView key={event.id} type="backgroundElement" style={styles.eventCard}>
                      <View style={styles.eventTopRow}>
                        <View style={styles.eventTitleWrap}>
                          <ThemedText selectable type="smallBold">
                            {event.name}
                          </ThemedText>
                          <ThemedText selectable type="small" themeColor="textSecondary">
                            {formatDateTime(event.dateTime)} · {event.location}
                          </ThemedText>
                        </View>
                        <ThemedView style={[styles.kindBadge, { backgroundColor: theme.background }]}>
                          <ThemedText type="smallBold">{eventKindLabels[event.kind]}</ThemedText>
                        </ThemedView>
                      </View>

                      <View style={styles.metaRow}>
                        <ThemedText type="code" themeColor="textSecondary">
                          {repeatLabels[event.repeat]}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {event.responseCounts.yes + event.responseCounts.maybe + event.responseCounts.no} Rückmeldungen
                        </ThemedText>
                      </View>

                      <View style={styles.responseSummary}>
                        {rsvpOptions.map((option) => (
                          <View key={option.value} style={styles.responseLane}>
                            <View style={styles.responseLaneHeader}>
                              <ThemedText type="smallBold">{option.label}</ThemedText>
                              <ThemedText type="small" themeColor="textSecondary">
                                {event.responseCounts[option.value]}
                              </ThemedText>
                            </View>
                            <AvatarStack names={participantNames[option.value]} theme={theme} />
                          </View>
                        ))}
                      </View>

                      <View style={styles.rsvpSection}>
                        <View style={styles.rsvpHeader}>
                          <ThemedText type="smallBold">Deine Zusage</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {event.viewerResponse
                              ? `Du bist aktuell auf „${rsvpOptions.find((option) => option.value === event.viewerResponse)?.label ?? ''}“`
                              : 'Noch keine Antwort'}
                          </ThemedText>
                        </View>
                        <View style={styles.rsvpActions}>
                          {rsvpOptions.map((option) => {
                            const selected = event.viewerResponse === option.value;
                            return (
                              <Pressable
                                key={option.value}
                                disabled={!isAuthenticated}
                                onPress={() => handleResponse(event.id, option.value)}
                                style={({ pressed }) => [
                                  styles.rsvpButton,
                                  {
                                    backgroundColor: selected ? theme.text : theme.background,
                                    borderColor: selected ? theme.text : theme.backgroundSelected,
                                    opacity: !isAuthenticated ? 0.45 : pressed ? 0.75 : 1,
                                  },
                                ]}>
                                <ThemedText type="smallBold" style={{ color: selected ? theme.background : theme.text }}>
                                  {option.label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </ThemedView>
                  );
                })}
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
              onPress={() => (isAuthenticated ? router.push('/termine/create') : router.push('/user'))}
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
  sectionTitleWrap: {
    gap: Spacing.half,
  },
  signInCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signInCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  signInButton: {
    minHeight: 40,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
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
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  eventTopRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitleWrap: {
    flex: 1,
    gap: Spacing.half,
  },
  kindBadge: {
    minHeight: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  responseSummary: {
    gap: Spacing.two,
  },
  responseLane: {
    gap: Spacing.one,
  },
  responseLaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCount: {
    marginLeft: Spacing.one,
    width: 34,
  },
  rsvpSection: {
    gap: Spacing.two,
  },
  rsvpHeader: {
    gap: Spacing.half,
  },
  rsvpActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  rsvpButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
