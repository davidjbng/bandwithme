import { readFileSync } from "node:fs";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

const native = vi.hoisted(() => {
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  const appListeners = new Set<(state: string) => void>();
  return {
    listeners,
    appListeners,
    platform: { OS: "ios" },
    appState: {
      currentState: "active",
      addEventListener: vi.fn((_event: string, listener: (state: string) => void) => {
        appListeners.add(listener);
        return { remove: () => appListeners.delete(listener) };
      }),
    },
    speech: {
      supportsOnDeviceRecognition: vi.fn(() => true),
      getSupportedLocales: vi.fn(async () => ({ installedLocales: ["de-DE"] })),
      requestMicrophonePermissionsAsync: vi.fn(async () => ({ granted: true })),
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      addListener: vi.fn((event: string, listener: (payload: unknown) => void) => {
        const group = listeners.get(event) ?? new Set();
        group.add(listener);
        listeners.set(event, group);
        return { remove: () => group.delete(listener) };
      }),
    },
  };
});

vi.mock("expo", () => ({ requireOptionalNativeModule: () => native.speech }));
vi.mock("react-native", () => ({
  AppState: native.appState,
  Platform: native.platform,
  View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@expo/ui", () => ({
  Host: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({
    label,
    disabled,
    onPress,
  }: {
    label: string;
    disabled: boolean;
    onPress: () => void;
  }) => (
    <button disabled={disabled} onClick={onPress}>
      {label}
    </button>
  ),
}));
vi.mock("../src/components/themed-text", () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

import IdeaVoiceInput from "../src/components/idea-voice-input.native";

let container: HTMLDivElement;
let root: Root;
let mounted: boolean;
const onTranscript = vi.fn();
const onRecordingChange = vi.fn();

beforeEach(async () => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  native.listeners.clear();
  native.appListeners.clear();
  native.platform.OS = "ios";
  native.appState.currentState = "active";
  native.speech.supportsOnDeviceRecognition.mockReturnValue(true);
  native.speech.getSupportedLocales.mockResolvedValue({ installedLocales: ["de-DE"] });
  native.speech.requestMicrophonePermissionsAsync.mockResolvedValue({ granted: true });
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  mounted = true;
  await act(async () => {
    root.render(
      <IdeaVoiceInput
        disabled={false}
        onTranscript={onTranscript}
        onRecordingChange={onRecordingChange}
      />,
    );
  });
});

afterEach(async () => {
  if (mounted) await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
});

function button() {
  const element = container.querySelector("button");
  if (!element) throw new Error("Missing voice input button");
  return element;
}

async function press() {
  await act(async () => button().click());
}

async function emit(event: string, payload: unknown = {}) {
  await act(async () => {
    for (const listener of native.listeners.get(event) ?? []) listener(payload);
  });
}

async function background() {
  await act(async () => {
    native.appState.currentState = "background";
    for (const listener of native.appListeners) listener("background");
  });
}

function permission() {
  let resolve!: (value: { granted: boolean }) => void;
  const promise = new Promise<{ granted: boolean }>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test("unsupported on-device recognition never requests audio or falls back to cloud", async () => {
  native.speech.supportsOnDeviceRecognition.mockReturnValue(false);
  await press();
  expect(native.speech.requestMicrophonePermissionsAsync).not.toHaveBeenCalled();
  expect(native.speech.start).not.toHaveBeenCalled();
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  expect(container.textContent).toContain("Bitte nutze sonst das Textfeld");
});

test("Android requires an installed German model before requesting audio", async () => {
  native.platform.OS = "android";
  native.speech.getSupportedLocales.mockResolvedValue({ installedLocales: ["en-US"] });
  await press();
  expect(native.speech.getSupportedLocales).toHaveBeenCalled();
  expect(native.speech.requestMicrophonePermissionsAsync).not.toHaveBeenCalled();
  expect(native.speech.start).not.toHaveBeenCalled();
});

test("denied microphone permission leaves text input available", async () => {
  native.speech.requestMicrophonePermissionsAsync.mockResolvedValue({ granted: false });
  await press();
  expect(native.speech.start).not.toHaveBeenCalled();
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  expect(button().textContent).toBe("Idee einsprechen");
});

test("stopping a pending permission request cannot start or cancel a later attempt", async () => {
  const oldPermission = permission();
  const newPermission = permission();
  native.speech.requestMicrophonePermissionsAsync
    .mockReturnValueOnce(oldPermission.promise)
    .mockReturnValueOnce(newPermission.promise);
  await press();
  await press();
  await press();
  await act(async () => oldPermission.resolve({ granted: true }));
  expect(native.speech.start).not.toHaveBeenCalled();
  expect(onRecordingChange.mock.calls.map(([active]) => active)).toEqual([true, false, true]);
  await act(async () => newPermission.resolve({ granted: true }));
  expect(native.speech.start).toHaveBeenCalledExactlyOnceWith({
    lang: "de-DE",
    requiresOnDeviceRecognition: true,
    interimResults: true,
    continuous: false,
    maxAlternatives: 1,
    recordingOptions: { persist: false },
  });
});

test("stop accepts final words and keeps submission locked until the native end event", async () => {
  await press();
  await emit("result", { results: [{ transcript: "Eine Idee" }] });
  await press();
  expect(native.speech.stop).toHaveBeenCalledOnce();
  expect(button().disabled).toBe(true);
  expect(onRecordingChange).toHaveBeenLastCalledWith(true);
  await emit("result", { results: [{ transcript: "Eine Idee für die nächste Probe" }] });
  expect(onTranscript).toHaveBeenLastCalledWith("Eine Idee für die nächste Probe");
  await emit("end");
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  expect(button().disabled).toBe(false);
  await emit("result", { results: [{ transcript: "Verspätetes Ergebnis" }] });
  expect(onTranscript).toHaveBeenCalledTimes(2);
});

test("backgrounding aborts recording and ignores subsequent audio results", async () => {
  await press();
  await background();
  expect(native.speech.abort).toHaveBeenCalledOnce();
  await emit("result", { results: [{ transcript: "Nicht übernehmen" }] });
  expect(onTranscript).not.toHaveBeenCalled();
  await emit("end");
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
});

test("backgrounding during permission cannot start recording after approval", async () => {
  const pending = permission();
  native.speech.requestMicrophonePermissionsAsync.mockReturnValueOnce(pending.promise);
  await press();
  await background();
  await act(async () => pending.resolve({ granted: true }));
  expect(native.speech.start).not.toHaveBeenCalled();
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
});

test("unmount removes listeners and invalidates pending permission", async () => {
  const pending = permission();
  native.speech.requestMicrophonePermissionsAsync.mockReturnValueOnce(pending.promise);
  await press();
  await act(async () => root.unmount());
  mounted = false;
  await act(async () => pending.resolve({ granted: true }));
  expect(native.speech.abort).toHaveBeenCalledOnce();
  expect(native.speech.start).not.toHaveBeenCalled();
  expect([...native.listeners.values()].every((group) => group.size === 0)).toBe(true);
  expect(native.appListeners.size).toBe(0);
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
});

test("recording times out and recovers when native stop never emits end", async () => {
  await press();
  await act(async () => vi.advanceTimersByTime(60_000));
  expect(native.speech.stop).toHaveBeenCalledOnce();
  expect(button().disabled).toBe(true);
  await act(async () => vi.advanceTimersByTime(5_000));
  expect(native.speech.abort).toHaveBeenCalledOnce();
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  expect(button().disabled).toBe(false);
});

test("installed iOS recognizer fails closed before microphone setup for unsupported locales", () => {
  const source = readFileSync(
    "node_modules/expo-speech-recognition/ios/ExpoSpeechRecognizer.swift",
    "utf8",
  );
  const start = source.slice(source.indexOf("private func startRecognizer("));
  const guard = start.indexOf(
    "guard !options.requiresOnDeviceRecognition || recognizer.supportsOnDeviceRecognition else",
  );
  expect(guard).toBeGreaterThan(0);
  expect(guard).toBeLessThan(start.indexOf("try prepareMicrophoneRecognition("));
  const failClosed = start.slice(guard, start.indexOf("do {", guard));
  expect(failClosed).toContain("errorHandler(RecognizerError.recognizerIsUnavailable)");
  expect(failClosed).toContain("return");
  expect(source).toContain(
    "request.requiresOnDeviceRecognition = options.requiresOnDeviceRecognition",
  );
  expect(source).not.toContain("if recognizer.supportsOnDeviceRecognition {");
});
