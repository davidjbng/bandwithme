import { Button, Host } from "@expo/ui";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useRef, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "./themed-text";
import IdeaVoiceInput from "./idea-voice-input";

export default function IdeaForm() {
  const submitIdea = useMutation(api.ideas.submit);
  const ideas = useQuery(api.ideas.mine, {});
  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ text: string; id: string } | null>(null);
  const recordingBase = useRef("");
  const theme = useTheme();

  async function submit() {
    const text = draft.trim();
    if (saving || recording || text.length < 10 || text.length > 4000) return;
    if (request.current?.text !== text) {
      request.current = { text, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await submitIdea({ text, requestId: request.current.id });
      setDraft("");
      request.current = null;
      setMessage("Danke! Deine Idee wurde privat gespeichert.");
    } catch (caught) {
      setError(
        caught instanceof ConvexError
          ? String(caught.data)
          : "Speichern fehlgeschlagen. Dein Text bleibt erhalten; versuche es erneut.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="subtitle">Deine Idee für Band With Me</ThemedText>
      <ThemedText themeColor="textSecondary">
        Was würde euren Bandalltag leichter machen? Deine Idee geht privat an die App-Entwicklung
        und wird nicht auf GitHub veröffentlicht.
      </ThemedText>
      {/* RN inputs expose focus to Keyboard Controller; Compose/SwiftUI fields do not. */}
      <TextInput
        accessibilityLabel="Deine App-Idee"
        value={draft}
        onChangeText={setDraft}
        multiline
        numberOfLines={7}
        maxLength={4000}
        editable={!saving && !recording}
        placeholder="Ich wünsche mir …"
        placeholderTextColor={theme.textSecondary}
        textAlignVertical="top"
        style={{
          color: theme.text,
          fontSize: 17,
          height: 200,
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.backgroundSelected,
        }}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {draft.length} / 4.000 Zeichen · mindestens 10
      </ThemedText>
      <IdeaVoiceInput
        disabled={saving}
        onRecordingChange={(active) => {
          if (active) recordingBase.current = draft;
          setRecording(active);
        }}
        onTranscript={(transcript) => {
          const text = [recordingBase.current, transcript].filter(Boolean).join(" ").slice(0, 4000);
          setDraft(text);
        }}
      />
      <ThemedText type="small" themeColor="textSecondary">
        Prüfe deinen Text vor dem Senden. Bitte teile keine Passwörter oder vertraulichen Banddaten.
      </ThemedText>
      <Host matchContents>
        <Button
          onPress={() => void submit()}
          disabled={saving || recording || draft.trim().length < 10}
          label={saving ? "Wird gespeichert …" : "Idee privat senden"}
        />
      </Host>
      {message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
      {error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <ThemedText type="smallBold">Deine letzten Ideen</ThemedText>
      {ideas === undefined ? (
        <ActivityIndicator />
      ) : ideas.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Hier findest du deine Ideen, sobald du die erste sendest.
        </ThemedText>
      ) : (
        ideas.map((idea) => (
          <View key={idea._id} style={{ paddingVertical: 8, gap: 4 }}>
            <ThemedText selectable>{idea.text}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Privat gespeichert · {new Date(idea._creationTime).toLocaleDateString("de-DE")}
            </ThemedText>
          </View>
        ))
      )}
    </View>
  );
}
