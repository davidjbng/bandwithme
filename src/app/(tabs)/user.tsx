import { Button, Column, Host } from "@expo/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  useSignInWithEmailPassword,
  useSignUpWithEmailPassword,
  useStartPasswordRecovery,
} from "@convex-dev/auth/methods/email-password/react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ThemedText } from "@/components/themed-text";
import IdeaForm from "@/components/idea-form";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authErrorMessage } from "@/lib/auth-errors";
import {
  inviteDestination,
  readInviteDestination,
  saveInviteDestination,
} from "@/lib/invite-destination";

function SignInForm({ next }: { next?: string }) {
  const convex = useConvex();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const login = useSignInWithEmailPassword(api.auth);
  const registration = useSignUpWithEmailPassword(api.auth);
  const recovery = useStartPasswordRecovery(api.auth);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = login.pending || registration.pending || recovery.pending;

  async function authenticate(signUp: boolean) {
    setError(null);
    setMessage(null);
    try {
      await saveInviteDestination(next, convex.url);
    } catch {
      setError("Deine Einladung konnte nicht gespeichert werden. Bitte versuche es erneut.");
      return;
    }
    const credentials = { email: email.trim().toLowerCase(), password: password };
    if (signUp) {
      const result = await registration.signUp(credentials);
      if (result.success) {
        setPassword("");
        setMessage(
          "Prüfe dein Postfach und bestätige deine E-Mail-Adresse. Öffne den Link auf diesem Gerät in derselben App bzw. demselben Browser.",
        );
      } else setError(authErrorMessage(result.userError));
    } else {
      const result = await login.signIn(credentials);
      if (result.status === "error") setError(authErrorMessage(result.userError));
      else setPassword("");
    }
  }

  async function recover() {
    setError(null);
    setMessage(null);
    try {
      await saveInviteDestination(next, convex.url);
    } catch {
      setError("Deine Einladung konnte nicht gespeichert werden. Bitte versuche es erneut.");
      return;
    }
    const result = await recovery.startPasswordRecovery({
      email: email.trim().toLowerCase(),
    });
    if (result.success)
      setMessage(
        "Der Link zum Zurücksetzen ist unterwegs. Öffne ihn auf diesem Gerät in derselben App bzw. demselben Browser.",
      );
    else setError(authErrorMessage(result.userError));
  }

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="subtitle">Willkommen bei deiner Band</ThemedText>
      <ThemedText themeColor="textSecondary">
        Melde dich an oder erstelle ein neues Konto mit bestätigter E-Mail-Adresse.
      </ThemedText>
      <View style={{ gap: 12 }}>
        <TextInput
          accessibilityLabel="E-Mail-Adresse"
          placeholder="du@beispiel.de"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="username"
          inputMode="email"
          editable={!busy}
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
        <TextInput
          accessibilityLabel="Passwort"
          placeholder="Dein Passwort"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          secureTextEntry
          editable={!busy}
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
          <Column spacing={12} style={{ width: "100%" }}>
            <Button disabled={busy} onPress={() => void authenticate(false)} label="Anmelden" />
            <Button
              disabled={busy}
              variant="outlined"
              onPress={() => void authenticate(true)}
              label="Account erstellen"
            />
            <Button
              disabled={busy}
              variant="text"
              onPress={() => void recover()}
              label="Passwort vergessen?"
            />
          </Column>
        </Host>
      </View>
      {busy && <ActivityIndicator />}
      {message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
      {error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
    </View>
  );
}

function Profile({ user }: { user: { id: Id<"users">; name: string | null } }) {
  const [name, setName] = useState(user.name ?? "");
  const theme = useTheme();
  const updateProfile = useMutation(api.user.updateProfile);
  const { signOut } = useAuthActions();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function saveOrSignOut(save: boolean) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (save) {
        const trimmed = name.trim();
        if (!trimmed) {
          setMessage("Bitte gib einen Namen ein.");
          return;
        }
        await updateProfile({ userId: user.id, name: trimmed });
        setMessage("Name gespeichert.");
      } else await signOut();
    } catch {
      setMessage("Das hat nicht geklappt. Bitte versuche es erneut.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 20 }}>
      <ThemedText type="subtitle">Dein Profil</ThemedText>
      <View style={{ gap: 12 }}>
        <TextInput
          accessibilityLabel="Dein Name"
          value={name}
          onChangeText={setName}
          placeholder="Dein Name"
          editable={!busy}
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
          <Column spacing={12} style={{ width: "100%" }}>
            <Button
              disabled={busy}
              onPress={() => void saveOrSignOut(true)}
              label="Name speichern"
            />
            <Button
              disabled={busy}
              variant="outlined"
              onPress={() => void saveOrSignOut(false)}
              label="Abmelden"
            />
          </Column>
        </Host>
      </View>
      {message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
      <IdeaForm />
    </View>
  );
}

export default function UserScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const convex = useConvex();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const { next } = useLocalSearchParams<{ next?: string }>();
  const router = useRouter();
  const theme = useTheme();
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const destination = inviteDestination(next) ?? (await readInviteDestination(convex.url));
        if (cancelled || !destination) return;
        await saveInviteDestination(null, convex.url);
        if (!cancelled) router.replace(destination);
      } catch {
        if (!cancelled) setInviteError("Bitte öffne deine Bandeinladung erneut, um beizutreten.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, next, router, convex]);
  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{
        padding: Spacing.four,
        paddingBottom: BottomTabInset + Spacing.five,
        alignItems: "center",
      }}
    >
      <Stack.Screen options={{ title: "Profil" }} />
      <View style={{ width: "100%", maxWidth: MaxContentWidth }}>
        {inviteError && <ThemedText accessibilityRole="alert">{inviteError}</ThemedText>}
        {isLoading || (isAuthenticated && user === undefined) ? (
          <ActivityIndicator />
        ) : isAuthenticated && user ? (
          <Profile key={user.id} user={user} />
        ) : (
          <SignInForm next={next} />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
