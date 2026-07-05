export type EventKind = "rehearsal" | "performance";
export type RepeatOption = "none" | "weekly" | "biweekly" | "monthly";
export type RsvpStatus = "yes" | "maybe" | "no";

export const eventKindOptions: { value: EventKind; label: string; hint: string }[] = [
  { value: "rehearsal", label: "Probe", hint: "regelmäßig, probieren, vorbereiten" },
  { value: "performance", label: "Auftritt", hint: "Gig, Konzert, Show, Bühnenzeit" },
];

export const eventKindLabels: Record<EventKind, string> = {
  rehearsal: "Probe",
  performance: "Auftritt",
};

export const repeatOptions: { value: RepeatOption; label: string }[] = [
  { value: "none", label: "Einmalig" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "biweekly", label: "Alle 2 Wochen" },
  { value: "monthly", label: "Monatlich" },
];

export const repeatLabels: Record<RepeatOption, string> = {
  none: "Keine Wiederholung",
  weekly: "Jede Woche",
  biweekly: "Alle 2 Wochen",
  monthly: "Jeden Monat",
};

export const rsvpOptions: { value: RsvpStatus; label: string; summaryLabel: string }[] = [
  { value: "yes", label: "Dabei", summaryLabel: "dabei" },
  { value: "maybe", label: "Vielleicht", summaryLabel: "vielleicht" },
  { value: "no", label: "Kann nicht", summaryLabel: "absage" },
];

export function getInitialFormDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);

  const dateValue = date.toISOString().slice(0, 10);
  const timeValue = date.toTimeString().slice(0, 5);

  return { dateValue, timeValue };
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "BW";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
