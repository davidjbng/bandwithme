import DateTimePicker from "@expo/ui/community/datetime-picker";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import {
  eventKindLabels,
  eventKindOptions,
  getInitialFormDate,
  repeatOptions,
  type EventKind,
  type RepeatOption,
} from "@/lib/events";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../../../convex/_generated/api";

function getInitialEventDate() {
  const { dateValue, timeValue } = getInitialFormDate();

  return new Date(`${dateValue}T${timeValue}:00`);
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTimeInput(date: Date) {
  return date.toTimeString().slice(0, 5);
}

function updateDatePart(currentDate: Date, dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return currentDate;
  }

  const nextDate = new Date(currentDate);
  nextDate.setFullYear(year, month - 1, day);

  return Number.isNaN(nextDate.getTime()) ? currentDate : nextDate;
}

function updateTimePart(currentDate: Date, timeValue: string) {
  const [hours, minutes] = timeValue.split(":").map(Number);

  if (hours === undefined || minutes === undefined || hours > 23 || minutes > 59) {
    return currentDate;
  }

  const nextDate = new Date(currentDate);
  nextDate.setHours(hours, minutes, 0, 0);

  return Number.isNaN(nextDate.getTime()) ? currentDate : nextDate;
}

export default function CreateTermineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const initialDate = useMemo(() => getInitialEventDate(), []);
  const { isAuthenticated } = useConvexAuth();
  const createEvent = useMutation(api.termine.create);

  const [kind, setKind] = useState<EventKind>("rehearsal");
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(initialDate);
  const [location, setLocation] = useState("");
  const [repeat, setRepeat] = useState<RepeatOption>("weekly");
  const [androidPickerMode, setAndroidPickerMode] = useState<"date" | "time" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  function handleNativeDateChange(mode: "date" | "time", selectedDate: Date) {
    setEventDate((currentDate) => {
      if (mode === "date") {
        const nextDate = new Date(currentDate);
        nextDate.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
        return nextDate;
      }

      const nextDate = new Date(currentDate);
      nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      return nextDate;
    });
  }

  async function handleCreateEvent() {
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!isAuthenticated) {
      setError("Bitte logge dich erst ein, bevor du Termine anlegst.");
      return;
    }

    if (!trimmedName) {
      setError("Bitte gib dem Termin einen Namen.");
      return;
    }

    if (Number.isNaN(eventDate.getTime())) {
      setError("Bitte wähle ein gültiges Datum und eine gültige Uhrzeit.");
      return;
    }

    if (!trimmedLocation) {
      setError("Bitte füge einen Ort hinzu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createEvent({
        kind,
        name: trimmedName,
        dateTime: eventDate.toISOString(),
        location: trimmedLocation,
        repeat: kind === "performance" ? "none" : repeat,
      });
      router.back();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Termin konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
      bottomOffset={Spacing.four}
      extraKeyboardSpace={Spacing.three}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.container}>
        <ThemedView type="backgroundElement" style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={[styles.formIcon, { backgroundColor: theme.background }]}>
              <SymbolView
                tintColor={theme.text}
                name={{ ios: "calendar.badge.plus", android: "event_repeat", web: "event_repeat" }}
                size={30}
              />
            </View>
            <View style={styles.formHeaderText}>
              <ThemedText type="smallBold">Neuen Termin erstellen</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Starte mit einer Probe oder einem Auftritt und sammle danach direkt Zusagen.
              </ThemedText>
            </View>
          </View>

          {!isAuthenticated ? (
            <ThemedView style={[styles.noticeCard, { backgroundColor: theme.background }]}>
              <ThemedText type="smallBold">Login nötig</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Für echte Termine und Zusagen brauchst du einen Account. Melde dich im Profil an.
              </ThemedText>
              <Pressable
                onPress={() => router.push("/user")}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView style={[styles.noticeButton, { backgroundColor: theme.text }]}>
                  <ThemedText type="smallBold" style={{ color: theme.background }}>
                    Zum Profil
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Typ</ThemedText>
            <View style={styles.kindGrid}>
              {eventKindOptions.map((option) => {
                const selected = option.value === kind;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setKind(option.value)}
                    style={({ pressed }) => [
                      styles.kindCard,
                      {
                        backgroundColor: selected ? theme.text : theme.background,
                        borderColor: selected ? theme.text : theme.backgroundSelected,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? theme.background : theme.text }}
                    >
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: selected ? theme.background : theme.textSecondary }}
                    >
                      {option.hint}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Name *</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={
                kind === "performance" ? "z. B. Sommerfest 2026" : "z. B. Mittwochsprobe"
              }
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              returnKeyType="next"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.rowItem]}>
              <ThemedText type="smallBold">Datum</ThemedText>
              {Platform.OS === "ios" ? (
                <View style={[styles.nativePickerContainer, { backgroundColor: theme.background }]}>
                  <DateTimePicker
                    value={eventDate}
                    mode="date"
                    display="compact"
                    onValueChange={(_event, selectedDate) =>
                      handleNativeDateChange("date", selectedDate)
                    }
                  />
                </View>
              ) : Platform.OS === "android" ? (
                <Pressable
                  onPress={() => setAndroidPickerMode("date")}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    style={[
                      styles.pickerButton,
                      { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
                    ]}
                  >
                    <ThemedText type="smallBold">{formatDateInput(eventDate)}</ThemedText>
                  </ThemedView>
                </Pressable>
              ) : (
                <TextInput
                  value={formatDateInput(eventDate)}
                  onChangeText={(value) =>
                    setEventDate((currentDate) => updateDatePart(currentDate, value))
                  }
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.backgroundSelected,
                    },
                  ]}
                />
              )}
            </View>
            <View style={[styles.inputGroup, styles.rowItem]}>
              <ThemedText type="smallBold">Uhrzeit</ThemedText>
              {Platform.OS === "ios" ? (
                <View style={[styles.nativePickerContainer, { backgroundColor: theme.background }]}>
                  <DateTimePicker
                    value={eventDate}
                    mode="time"
                    display="compact"
                    onValueChange={(_event, selectedDate) =>
                      handleNativeDateChange("time", selectedDate)
                    }
                  />
                </View>
              ) : Platform.OS === "android" ? (
                <Pressable
                  onPress={() => setAndroidPickerMode("time")}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    style={[
                      styles.pickerButton,
                      { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
                    ]}
                  >
                    <ThemedText type="smallBold">{formatTimeInput(eventDate)}</ThemedText>
                  </ThemedView>
                </Pressable>
              ) : (
                <TextInput
                  value={formatTimeInput(eventDate)}
                  onChangeText={(value) =>
                    setEventDate((currentDate) => updateTimePart(currentDate, value))
                  }
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.backgroundSelected,
                    },
                  ]}
                />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold">Ort</ThemedText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder={kind === "performance" ? "Venue, Bühne, Stadt" : "Proberaum, Studio 2"}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              returnKeyType="done"
            />
          </View>

          {kind === "rehearsal" ? (
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
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={{ color: selected ? theme.background : theme.text }}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <ThemedView style={[styles.noticeCard, { backgroundColor: theme.background }]}>
              <ThemedText type="smallBold">Auftritte bleiben vorerst einmalig</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Wiederholung ist in dieser ersten Umsetzung nur für Proben aktiviert.
              </ThemedText>
            </ThemedView>
          )}

          {error ? (
            <ThemedText selectable type="smallBold" style={styles.errorText}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable onPress={handleCreateEvent} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView
              style={[
                styles.createButton,
                { backgroundColor: theme.text, opacity: isSubmitting ? 0.6 : 1 },
              ]}
            >
              <SymbolView
                tintColor={theme.background}
                name={{
                  ios: "checkmark.circle.fill",
                  android: "check_circle",
                  web: "check_circle",
                }}
                size={18}
              />
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                {isSubmitting
                  ? `${eventKindLabels[kind]} wird gespeichert...`
                  : `${eventKindLabels[kind]} speichern`}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      </ThemedView>

      {Platform.OS === "android" && androidPickerMode ? (
        <DateTimePicker
          key={androidPickerMode}
          value={eventDate}
          mode={androidPickerMode}
          display={androidPickerMode === "date" ? "calendar" : "clock"}
          presentation="dialog"
          is24Hour
          onDismiss={() => setAndroidPickerMode(null)}
          onValueChange={(_event, selectedDate) => {
            handleNativeDateChange(androidPickerMode, selectedDate);
            setAndroidPickerMode(null);
          }}
        />
      ) : null}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  container: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  formCard: {
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  formHeaderText: {
    flex: 1,
    gap: Spacing.half,
  },
  formIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeCard: {
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  noticeButton: {
    minHeight: 40,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    alignSelf: "flex-start",
  },
  inputGroup: {
    gap: Spacing.two,
  },
  kindGrid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  kindCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  row: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  nativePickerContainer: {
    minHeight: 48,
    borderRadius: Spacing.three,
    justifyContent: "center",
  },
  pickerButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  repeatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  repeatPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  errorText: {
    color: "#D92D20",
  },
  pressed: {
    opacity: 0.75,
  },
  createButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.two,
  },
});
