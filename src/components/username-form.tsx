import { useState } from "react";
import { TextInput, View } from "react-native";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../convex/_generated/api";
import { Action, Copy, Meta } from "./tour-ui";
import { useTourTheme } from "@/constants/tour-theme";

export function UsernameForm({
  initialValue,
  onSaved,
}: {
  initialValue: string;
  onSaved?: () => Promise<void>;
}) {
  const [username, setUsername] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const save = useMutation(api.user.setUsername);
  const { colors } = useTourTheme();
  async function submit() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await save({ username });
      if (onSaved) await onSaved();
      else setMessage("Benutzername gespeichert.");
    } catch (error) {
      setMessage(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Speichern fehlgeschlagen. Bitte versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 12 }}>
      <Copy>Dein Benutzername</Copy>
      <Meta>
        3–30 Zeichen: a–z, Zahlen, Punkt, Bindestrich oder Unterstrich. Groß- und Kleinschreibung
        spielen beim Anmelden keine Rolle.
      </Meta>
      <TextInput
        accessibilityLabel="Benutzername"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        maxLength={30}
        editable={!busy}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: colors.line,
          color: colors.text,
          fontSize: 17,
        }}
      />
      <Action
        label={onSaved ? "Benutzername speichern & weiter" : "Benutzername speichern"}
        disabled={busy}
        onPress={() => void submit()}
      />
      {message && <Copy accessibilityLiveRegion="polite">{message}</Copy>}
    </View>
  );
}
