import { Button, Host } from "@expo/ui";
import { useCompletePasswordRecovery } from "@convex-dev/auth/methods/email-password/react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { api } from "../../convex/_generated/api";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { authErrorMessage } from "@/lib/auth-errors";

function Recovery({ code }: { code: string }) {
  const state = useCompletePasswordRecovery(api.auth, { emailCode: code });
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  if (state.status === "loading") return <ActivityIndicator />;
  if (state.status === "complete") return <Redirect href="/sign-in" />;
  if (state.status === "error")
    return <ThemedText accessibilityRole="alert">{authErrorMessage(state.userError)}</ThemedText>;
  async function complete() {
    if (state.status !== "ready") return;
    const result = await state.completePasswordRecovery({ newPassword: password });
    if (result.status === "error") setError(authErrorMessage(result.userError));
  }
  return (
    <>
      <View style={{ gap: 12 }}>
        <TextInput
          accessibilityLabel="Neues Passwort"
          value={password}
          onChangeText={setPassword}
          placeholder="Neues Passwort"
          autoComplete="new-password"
          secureTextEntry
          editable={!state.pending}
          placeholderTextColor={theme.textSecondary}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.backgroundSelected,
            color: theme.text,
            fontSize: 17,
          }}
        />
        <Host matchContents>
          <Button
            disabled={state.pending}
            onPress={() => void complete()}
            label="Neues Passwort speichern"
          />
        </Host>
      </View>
      {error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
    </>
  );
}

export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      <ThemedText type="title">Passwort zurücksetzen</ThemedText>
      {code ? (
        <Recovery key={code} code={code} />
      ) : (
        <ThemedText>Bitte fordere bei der Anmeldung einen neuen Link an.</ThemedText>
      )}
      <Host matchContents>
        <Button variant="text" onPress={() => router.replace("/sign-in")} label="Zur Anmeldung" />
      </Host>
    </KeyboardAwareScrollView>
  );
}
