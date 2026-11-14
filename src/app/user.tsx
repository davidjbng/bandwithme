import { Action } from "@/components/tour-ui";
import { Button, Column, Host } from "@expo/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ThemedText } from "@/components/themed-text";
import IdeaForm from "@/components/idea-form";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { UsernameForm } from "@/components/username-form";
import {
  inviteDestination,
  readInviteDestination,
  saveInviteDestination,
} from "@/lib/invite-destination";

function Profile({
  user,
}: {
  user: { id: Id<"users">; name: string | null; instrument?: string; username?: string | null };
}) {
  const [name, setName] = useState(user.name ?? "");
  const [instrument, setInstrument] = useState(user.instrument ?? "");
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
        await updateProfile({ userId: user.id, name: trimmed, instrument });
        setMessage("Profil gespeichert.");
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
        <ThemedText type="smallBold">Instrument / Rolle in der Band</ThemedText>
        <TextInput
          accessibilityLabel="Instrument"
          value={instrument}
          onChangeText={setInstrument}
          maxLength={100}
          editable={!busy}
          placeholder="z. B. Gitarre & Gesang"
          placeholderTextColor={theme.textSecondary}
          style={{
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
              label="Profil speichern"
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
      <UsernameForm initialValue={user.username ?? ""} />
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
          <View style={{ gap: 20 }}>
            <Action label="Zur Bandübersicht" onPress={() => router.replace("/")} secondary />
            <Profile key={user.id} user={user} />
          </View>
        ) : (
          <Redirect href={next ? { pathname: "/sign-in", params: { next } } : "/sign-in"} />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
