import { Button, Host } from "@expo/ui";
import { useCompleteSignUpWithEmailPassword } from "@convex-dev/auth/methods/email-password/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { ActivityIndicator, ScrollView } from "react-native";
import { api } from "../../convex/_generated/api";
import { ThemedText } from "@/components/themed-text";
import { authErrorMessage } from "@/lib/auth-errors";
import { readInviteDestination } from "@/lib/invite-destination";

function Verification({
  code,
  destination,
}: {
  code: string;
  destination: `/invite/${string}` | null;
}) {
  const state = useCompleteSignUpWithEmailPassword(api.auth, { emailCode: code });
  const router = useRouter();
  useEffect(() => {
    if (state.status === "complete")
      router.replace(destination ? { pathname: "/user", params: { next: destination } } : "/user");
  }, [state.status, router, destination]);
  return state.status === "loading" ? (
    <ActivityIndicator />
  ) : (
    <ThemedText accessibilityLiveRegion="polite">
      {state.status === "complete"
        ? "Deine E-Mail-Adresse ist bestätigt. Du bist angemeldet."
        : authErrorMessage(state.userError)}
    </ThemedText>
  );
}

export default function ValidateEmailScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const convex = useConvex();
  const [destination, setDestination] = useState<`/invite/${string}` | null>();
  useEffect(() => {
    let cancelled = false;
    void readInviteDestination(convex.url).then(
      (saved) => {
        if (!cancelled) setDestination(saved);
      },
      () => {
        if (!cancelled) setDestination(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [convex]);
  const router = useRouter();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      <ThemedText type="title">E-Mail bestätigen</ThemedText>
      {destination === undefined ? (
        <ActivityIndicator />
      ) : code ? (
        <Verification key={code} code={code} destination={destination} />
      ) : (
        <ThemedText>Dieser Link enthält keinen Bestätigungscode.</ThemedText>
      )}
      <Host matchContents>
        <Button onPress={() => router.replace("/user")} label="Zum Profil" />
      </Host>
    </ScrollView>
  );
}
