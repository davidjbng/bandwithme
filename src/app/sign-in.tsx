import { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useConvex, useConvexAuth, useQuery } from "convex/react";
import {
  useSignInWithEmailPassword,
  useSignUpWithEmailPassword,
  useStartPasswordRecovery,
} from "@convex-dev/auth/methods/email-password/react";
import { api } from "../../convex/_generated/api";
import { Action, Copy, Meta, Page } from "@/components/tour-ui";
import { UsernameForm } from "@/components/username-form";
import { useTourTheme } from "@/constants/tour-theme";
import { authErrorMessage } from "@/lib/auth-errors";
import {
  inviteDestination,
  readInviteDestination,
  saveInviteDestination,
} from "@/lib/invite-destination";
import { readPendingSignup, savePendingSignup } from "@/lib/pending-signup";

function SignInForm({ next }: { next?: string }) {
  const convex = useConvex();
  const { colors } = useTourTheme();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const login = useSignInWithEmailPassword({
    signInWithEmailPassword: api.auth.signInWithIdentifier,
  });
  const registration = useSignUpWithEmailPassword(api.auth);
  const recovery = useStartPasswordRecovery(api.auth);
  const [submitting, setSubmitting] = useState(false);
  const busy = submitting || login.pending || registration.pending || recovery.pending;
  const fieldStyle = {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 17,
  };
  function changeMode(value: typeof mode) {
    setMode(value);
    setError(null);
    setMessage(null);
    setPassword("");
    if (!identifier.includes("@")) setIdentifier("");
  }
  async function submit() {
    if (busy) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "register" && !/^[a-zA-Z0-9_.-]{3,30}$/.test(username.trim())) {
        setError(
          "Wähle einen Benutzernamen mit 3–30 Zeichen: a–z, Zahlen, Punkt, Bindestrich oder Unterstrich.",
        );
        return;
      }
      // Keep an existing invitation through retries and email round trips.
      if (inviteDestination(next)) await saveInviteDestination(next, convex.url);
      const email = identifier.trim().toLowerCase();
      if (mode === "register") {
        await savePendingSignup({ email, username: username.trim() }, convex.url);
        const result = await registration.signUp({ email, password });
        if (result.success) {
          setPassword("");
          setMessage(
            "Prüfe dein Postfach und bestätige deine E-Mail-Adresse auf diesem Gerät in derselben App bzw. demselben Browser. Danach bestätigst du deinen Benutzernamen; er wird erst dann reserviert.",
          );
        } else {
          await savePendingSignup(null, convex.url);
          setError(authErrorMessage(result.userError));
        }
      } else if (mode === "recover") {
        const result = await recovery.startPasswordRecovery({ email });
        if (result.success)
          setMessage(
            "Der Link zum Zurücksetzen ist unterwegs. Öffne ihn auf diesem Gerät in derselben App bzw. demselben Browser.",
          );
        else setError(authErrorMessage(result.userError));
      } else {
        const result = await login.signIn({ email: identifier.trim(), password });
        if (result.status === "error") setError(authErrorMessage(result.userError));
        else setPassword("");
      }
    } catch {
      setError("Das hat nicht geklappt. Bitte prüfe deine Verbindung und versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View style={{ gap: 20, width: "100%", maxWidth: 440, alignSelf: "center" }}>
      <Copy accessibilityRole="header" style={{ fontSize: 30, lineHeight: 36, fontWeight: "700" }}>
        {mode === "register"
          ? "Dein Konto für die Band"
          : mode === "recover"
            ? "Neues Passwort"
            : "Willkommen bei deiner Band"}
      </Copy>
      <Meta>
        {mode === "register"
          ? "Wähle deinen Benutzernamen. Deine E-Mail-Adresse brauchst du zur Bestätigung und falls du dein Passwort vergisst."
          : mode === "recover"
            ? "Gib die bestätigte E-Mail-Adresse deines Kontos ein."
            : "Melde dich an oder registriere dich, um mit deiner Band zu planen."}
      </Meta>
      {mode === "register" && (
        <View style={{ gap: 8 }}>
          <Copy>Benutzername</Copy>
          <TextInput
            accessibilityLabel="Benutzername"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            maxLength={30}
            editable={!busy}
            placeholder="z. B. bass.david"
            placeholderTextColor={colors.secondary}
            style={fieldStyle}
          />
          <Meta>3–30 Zeichen: a–z, Zahlen, Punkt, Bindestrich oder Unterstrich.</Meta>
        </View>
      )}
      <View style={{ gap: 8 }}>
        <Copy>{mode === "login" ? "Benutzername oder E-Mail-Adresse" : "E-Mail-Adresse"}</Copy>
        <TextInput
          accessibilityLabel={
            mode === "login" ? "Benutzername oder E-Mail-Adresse" : "E-Mail-Adresse"
          }
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={mode === "login" ? "username" : "email"}
          inputMode={mode === "login" ? "text" : "email"}
          editable={!busy}
          placeholder={mode === "login" ? "Dein Benutzername oder deine E-Mail" : "du@beispiel.de"}
          placeholderTextColor={colors.secondary}
          style={fieldStyle}
        />
      </View>
      {mode !== "recover" && (
        <View style={{ gap: 8 }}>
          <Copy>Passwort</Copy>
          <TextInput
            accessibilityLabel="Passwort"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            secureTextEntry
            editable={!busy}
            placeholder={mode === "register" ? "Mindestens 10 Zeichen" : "Dein Passwort"}
            placeholderTextColor={colors.secondary}
            style={fieldStyle}
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        </View>
      )}
      {error && <Copy accessibilityRole="alert">{error}</Copy>}
      {message && <Copy accessibilityLiveRegion="polite">{message}</Copy>}
      <Action
        label={
          mode === "register"
            ? "Account erstellen"
            : mode === "recover"
              ? "Link anfordern"
              : "Anmelden"
        }
        disabled={busy}
        onPress={() => void submit()}
      />
      <Action
        label={mode === "login" ? "Registrieren" : "Zur Anmeldung"}
        secondary
        disabled={busy}
        onPress={() => changeMode(mode === "login" ? "register" : "login")}
      />
      {mode === "login" && (
        <Action
          label="Passwort vergessen?"
          secondary
          disabled={busy}
          onPress={() => changeMode("recover")}
        />
      )}
      {busy && <ActivityIndicator accessibilityLabel="Bitte warten" />}
    </View>
  );
}

function AfterSignIn({ next }: { next?: string }) {
  const convex = useConvex();
  const user = useQuery(api.user.current);
  const router = useRouter();
  const [pending, setPending] = useState<Awaited<ReturnType<typeof readPendingSignup>>>();
  const [destination, setDestination] = useState<`/invite/${string}` | "/">();
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void Promise.all([readPendingSignup(convex.url), readInviteDestination(convex.url)])
      .then(([signup, invite]) => {
        if (!cancelled) {
          setPending(signup);
          setDestination(inviteDestination(next) ?? invite ?? "/");
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [convex, next]);
  async function finish() {
    await savePendingSignup(null, convex.url);
    // The invite screen owns joining; keep its destination until it is reached.
    router.replace(destination ?? "/");
  }
  if (error)
    return (
      <View style={{ gap: 16 }}>
        <Copy accessibilityRole="alert">
          Du bist angemeldet, aber deine gespeicherte Einladung oder dein gewünschter Benutzername
          konnte nicht geladen werden. Öffne die Einladung erneut oder ergänze den Benutzernamen im
          Profil.
        </Copy>
        <Action label="Zur Bandübersicht" onPress={() => router.replace("/")} />
      </View>
    );
  if (user === undefined || pending === undefined || !destination) return <ActivityIndicator />;
  if (pending && user?.email?.toLowerCase() === pending.email && !user.username)
    return (
      <View style={{ gap: 20 }}>
        <Copy>Deine E-Mail-Adresse ist bestätigt. Bestätige jetzt deinen Benutzernamen.</Copy>
        <UsernameForm initialValue={pending.username} onSaved={finish} />
      </View>
    );
  return <Redirect href={destination} />;
}
export default function SignInScreen() {
  const { isAuthenticated } = useConvexAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();
  return <Page>{isAuthenticated ? <AfterSignIn next={next} /> : <SignInForm next={next} />}</Page>;
}
