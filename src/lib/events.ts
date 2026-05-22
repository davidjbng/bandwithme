import { useSyncExternalStore } from 'react';

export type RepeatOption = 'none' | 'weekly' | 'biweekly' | 'monthly';

export type EventItem = {
  id: string;
  name: string;
  dateTime: string;
  location: string;
  repeat: RepeatOption;
};

export const repeatOptions: { value: RepeatOption; label: string }[] = [
  { value: 'none', label: 'Einmalig' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Alle 2 Wochen' },
  { value: 'monthly', label: 'Monatlich' },
];

export const repeatLabels: Record<RepeatOption, string> = {
  none: 'Keine Wiederholung',
  weekly: 'Jede Woche',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Jeden Monat',
};

let events: EventItem[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return events;
}

export function useEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addEvent(event: Omit<EventItem, 'id'>) {
  events = [
    ...events,
    {
      ...event,
      id: `${Date.now()}-${event.name}`,
    },
  ];
  emitChange();
}

export function getInitialFormDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);

  const dateValue = date.toISOString().slice(0, 10);
  const timeValue = date.toTimeString().slice(0, 5);

  return { dateValue, timeValue };
}

export function createDateTime(dateValue: string, timeValue: string) {
  const parsedDate = new Date(`${dateValue}T${timeValue}:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
