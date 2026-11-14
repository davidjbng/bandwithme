import { Button, Host } from "@expo/ui";
import { requireOptionalNativeModule } from "expo";
import type { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { ThemedText } from "./themed-text";
import type { IdeaVoiceInputProps } from "./idea-voice-input";

const speech =
  requireOptionalNativeModule<typeof ExpoSpeechRecognitionModule>("ExpoSpeechRecognition");

export default function IdeaVoiceInput({
  disabled,
  onTranscript,
  onRecordingChange,
}: IdeaVoiceInputProps) {
  const [phase, setPhase] = useState<"idle" | "starting" | "recording" | "stopping">("idle");
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const locked = useRef(false);
  const listening = useRef(false);
  const callbacks = useRef({ onTranscript, onRecordingChange });
  useEffect(() => {
    callbacks.current = { onTranscript, onRecordingChange };
  });

  const finish = useCallback(() => {
    locked.current = false;
    listening.current = false;
    setPhase("idle");
    callbacks.current.onRecordingChange(false);
  }, []);

  useEffect(() => {
    if (!speech) return undefined;
    const result = speech.addListener("result", (event) => {
      if (listening.current) callbacks.current.onTranscript(event.results[0]?.transcript ?? "");
    });
    const end = speech.addListener("end", finish);
    const failure = speech.addListener("error", (event) => {
      if (event.error !== "aborted")
        setError("Die lokale Spracherkennung ist nicht verfügbar. Du kannst deine Idee eintippen.");
      finish();
    });
    const appState = AppState.addEventListener("change", (state) => {
      if ((state === "background" || (state !== "active" && listening.current)) && locked.current) {
        generation.current += 1;
        if (listening.current) {
          listening.current = false;
          setPhase("stopping");
          speech.abort();
        } else finish();
      }
    });
    return () => {
      generation.current += 1;
      listening.current = false;
      result.remove();
      end.remove();
      failure.remove();
      appState.remove();
      speech.abort();
      callbacks.current.onRecordingChange(false);
    };
  }, [finish]);

  const stop = useCallback(() => {
    if (!listening.current) {
      generation.current += 1;
      finish();
    } else {
      // Keep accepting final words and prevent submitting until the native end event.
      setPhase("stopping");
      speech?.stop();
    }
  }, [finish]);

  useEffect(() => {
    if (phase !== "recording" && phase !== "stopping") return undefined;
    const timeout = setTimeout(
      () => {
        if (phase === "recording") stop();
        else {
          speech?.abort();
          finish();
        }
      },
      phase === "recording" ? 60_000 : 5_000,
    );
    return () => clearTimeout(timeout);
  }, [phase, stop, finish]);

  async function start() {
    if (!speech || locked.current || disabled) return;
    const attempt = ++generation.current;
    locked.current = true;
    setPhase("starting");
    onRecordingChange(true);
    setError(null);
    try {
      if (!speech.supportsOnDeviceRecognition()) throw new Error("unavailable");
      if (Platform.OS === "android") {
        const { installedLocales } = await speech.getSupportedLocales({});
        if (
          !installedLocales.some((locale) => locale.replace("_", "-").toLowerCase() === "de-de")
        ) {
          throw new Error("missing German model");
        }
      }
      if (attempt !== generation.current) return;
      const permission = await speech.requestMicrophonePermissionsAsync();
      if (attempt !== generation.current) return;
      if (!permission.granted || AppState.currentState === "background")
        throw new Error("microphone unavailable");
      listening.current = true;
      setPhase("recording");
      speech.start({
        lang: "de-DE",
        requiresOnDeviceRecognition: true,
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        recordingOptions: { persist: false },
      });
    } catch {
      if (attempt !== generation.current) return;
      finish();
      setError(
        "Lokale Spracheingabe benötigt Mikrofonzugriff und ein deutsches Sprachmodell auf deinem Gerät. Bitte nutze sonst das Textfeld.",
      );
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <Host matchContents>
        <Button
          disabled={!speech || disabled || phase === "stopping"}
          variant="outlined"
          onPress={() => (phase === "idle" ? void start() : stop())}
          label={
            phase === "idle"
              ? "Idee einsprechen"
              : phase === "stopping"
                ? "Text wird übernommen …"
                : "Aufnahme beenden"
          }
        />
      </Host>
      <ThemedText type="small" themeColor="textSecondary">
        {phase === "recording"
          ? "Ich höre zu … maximal 60 Sekunden."
          : "Deutsch · Erkennung nur auf deinem Gerät. Audio wird nicht gespeichert oder hochgeladen."}
      </ThemedText>
      {error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
    </View>
  );
}
