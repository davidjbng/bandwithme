import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RepeatOption = 'none' | 'weekly' | 'biweekly' | 'monthly';

type EventItem = {
  id: string;
  name: string;
  dateTime: string;
  location: string;
  repeat: RepeatOption;
};

const repeatOptions: { value: RepeatOption; label: string }[] = [
  { value: 'none', label: 'Einmalig' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Alle 2 Wochen' },
  { value: 'monthly', label: 'Monatlich' },
];

const repeatLabels: Record<RepeatOption, string> = {
  none: 'Keine Wiederholung',
  weekly: 'Jede Woche',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Jeden Monat',
};

function getInitialFormDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);

  const dateValue = date.toISOString().slice(0, 10);
  const timeValue = date.toTimeString().slice(0, 5);

  return { dateValue, timeValue };
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function createDateTime(dateValue: string, timeValue: string) {
  const parsedDate = new Date(`${dateValue}T${timeValue}:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export default function TermineScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const initialDate = useMemo(() => getInitialFormDate(), []);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [name, setName] = useState('');
  const [dateValue, setDateValue] = useState(initialDate.dateValue);
  const [timeValue, setTimeValue] = useState(initialDate.timeValue);
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState<RepeatOption>('weekly');
  const [error, setError] = useState<string | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => left.dateTime.localeCompare(right.dateTime)),
    [events]
  );

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  function handleCreateEvent() {
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const dateTime = createDateTime(dateValue.trim(), timeValue.trim());

    if (!trimmedName) {
      setError('Bitte gib dem Termin einen Namen.');
      return;
    }

    if (!dateTime) {
      setError('Bitte nutze ein gültiges Datum und eine gültige Uhrzeit.');
      return;
    }

    if (!trimmedLocation) {
      setError('Bitte füge einen Ort hinzu.');
      return;
    }

    setEvents((currentEvents) => [
      ...currentEvents,
      {
        id: `${Date.now()}-${trimmedName}`,
        name: trimmedName,
        dateTime: dateTime.toISOString(),
        location: trimmedLocation,
        repeat,
      },
    ]);
    setName('');
    setLocation('');
    setError(null);
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={[styles.heroIcon, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'calendar.badge.plus', android: 'event_upcoming', web: 'event_upcoming' }}
              size={34}
            />
          </View>
          <ThemedText type="subtitle" style={styles.centerText}>
            Termine
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroCopy}>
            Plane Proben, Auftritte oder Treffen und halte wiederkehrende Termine an einem Ort fest.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText type="smallBold">Neuen Termin erstellen</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Name, Datum, Uhrzeit, Ort und Wiederholung
              </ThemedText>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Bandprobe"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected },
              ]}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.rowItem]}>
              <ThemedText type="smallBold">Datum</ThemedText>
              <TextInput
                value={dateValue}
                onChangeText={setDateValue}
                placeholder="2026-05-22"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected },
                ]}
              />
            </View>
            <View style={[styles.inputGroup, styles.rowItem]}>
              <ThemedText type="smallBold">Uhrzeit</ThemedText>
              <TextInput
                value={timeValue}
                onChangeText={setTimeValue}
                placeholder="19:30"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected },
                ]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Ort</ThemedText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Proberaum, Studio 2"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Wiederholung</ThemedText>
            <View style={styles.repeatGrid}>
              {repeatOptions.map((option) => {
                const selected = option.value === repeat;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setRepeat(option.value)}
                    style={({ pressed }) => [
                      styles.repeatPill,
                      {
                        backgroundColor: selected ? theme.text : theme.background,
                        borderColor: selected ? theme.text : theme.backgroundSelected,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? theme.background : theme.text }}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? (
            <ThemedText selectable type="smallBold" style={styles.errorText}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable onPress={handleCreateEvent} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView style={[styles.createButton, { backgroundColor: theme.text }]}>
              <SymbolView
                tintColor={theme.background}
                name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add' }}
                size={18}
              />
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                Termin hinzufügen
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

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
    gap: Spacing.four,
  },
  heroCard: {
    borderRadius: Spacing.five,
    overflow: 'hidden',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  heroGlow: {
    position: 'absolute',
    top: -64,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7C3AED33',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  heroCopy: {
    textAlign: 'center',
    maxWidth: 520,
  },
  formCard: {
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowItem: {
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '600',
  },
  repeatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  repeatPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  errorText: {
    color: '#D92D20',
  },
  pressed: {
    opacity: 0.75,
  },
  createButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  listSection: {
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
