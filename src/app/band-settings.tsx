import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../../convex/_generated/api";

export default function BandSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { isAuthenticated } = useConvexAuth();

  const band = useQuery(api.bands.myBand);
  const members = useQuery(api.bands.listMembers);
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const leaveBand = useMutation(api.bands.leave);
  const removeMember = useMutation(api.bands.removeMember);
  const deleteBand = useMutation(api.bands.deleteBand);
  const createInvite = useMutation(api.bands.createInvite);

  const [deleteName, setDeleteName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [actionError, setActionError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  async function handleLeave() {
    setActionError("");
    try {
      await leaveBand({ userId: user!.id as never });
      router.replace("/");
    } catch (e: any) {
      setActionError(e?.message ?? "Fehler");
    }
  }

  async function handleRemove(membershipId: string) {
    setActionError("");
    try {
      await removeMember({ userId: user!.id as never, membershipId: membershipId as never });
    } catch (e: any) {
      setActionError(e?.message ?? "Fehler");
    }
  }

  async function handleDelete() {
    setActionError("");
    try {
      await deleteBand({ userId: user!.id as never, nameConfirmation: deleteName });
      router.replace("/");
    } catch (e: any) {
      setActionError(e?.message ?? "Fehler");
    }
  }

  async function handleCreateInvite() {
    setActionError("");
    setInviteStatus("");
    setCreatingInvite(true);
    try {
      const invite = await createInvite({});
      setInviteLink(`https://bandwithme.de/invite/${invite.token}`);
    } catch (e: any) {
      setActionError(e?.message ?? "Einladungslink konnte nicht erstellt werden.");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function handleCopyInvite() {
    if (!inviteLink) return;

    setActionError("");
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
        setInviteStatus("Link kopiert.");
      } else {
        await Share.share({ message: `Tritt ${band!.name} bei: ${inviteLink}` });
        setInviteStatus("Einladungslink geteilt.");
      }
    } catch (e: any) {
      setActionError(e?.message ?? "Link konnte nicht kopiert werden.");
    }
  }

  if (!isAuthenticated || !band) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          {!isAuthenticated ? "Bitte einloggen." : "Keine Band gefunden."}
        </ThemedText>
      </ThemedView>
    );
  }

  const isAdmin = band.role === "admin";

  return (
    <>
      <Stack.Screen options={{ title: "Band-Einstellungen" }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedView style={styles.container}>
          {/* Band Info */}
          <View style={styles.section}>
            <ThemedText type="subtitle">{band.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {isAdmin ? "Admin" : "Mitglied"}
            </ThemedText>
          </View>

          {isAdmin && (
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Band einladen
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Erstelle einen Link und leite ihn an neue Bandmitglieder weiter.
              </ThemedText>
              <Pressable
                accessibilityLabel="Einladungslink erstellen"
                accessibilityRole="button"
                disabled={creatingInvite}
                onPress={handleCreateInvite}
                style={({ pressed }) => [
                  styles.inviteButton,
                  pressed && styles.pressed,
                  { backgroundColor: theme.text, opacity: creatingInvite ? 0.5 : 1 },
                ]}
              >
                <SymbolView
                  tintColor={theme.background}
                  name={{ ios: "link.badge.plus", web: "add_link" }}
                  size={18}
                />
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  {creatingInvite ? "Wird erstellt…" : "Einladungslink erstellen"}
                </ThemedText>
              </Pressable>
              {inviteLink ? (
                <ThemedView type="backgroundElement" style={styles.inviteCard}>
                  <ThemedText type="smallBold">Einladungslink</ThemedText>
                  <TextInput
                    accessibilityLabel="Einladungslink"
                    editable={false}
                    selectTextOnFocus
                    style={[
                      styles.inviteInput,
                      {
                        color: theme.text,
                        backgroundColor: theme.background,
                        borderColor: theme.backgroundSelected,
                      },
                    ]}
                    value={inviteLink}
                  />
                  <Pressable
                    accessibilityLabel="Link kopieren"
                    accessibilityRole="button"
                    onPress={handleCopyInvite}
                    style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
                  >
                    <SymbolView
                      tintColor={theme.text}
                      name={{ ios: "doc.on.doc", web: "content_copy" }}
                      size={18}
                    />
                    <ThemedText type="smallBold">
                      {Platform.OS === "web" ? "Link kopieren" : "Link teilen"}
                    </ThemedText>
                  </Pressable>
                  {inviteStatus ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {inviteStatus}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              ) : null}
            </View>
          )}

          {/* Mitglieder */}
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Mitglieder ({members?.length ?? 0})
            </ThemedText>
            <View style={styles.memberList}>
              {members?.map((m) => (
                <ThemedView key={m.id} type="backgroundElement" style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <ThemedView
                      style={[styles.memberAvatar, { backgroundColor: theme.backgroundSelected }]}
                    >
                      <ThemedText type="smallBold">{(m.name ?? "?")[0].toUpperCase()}</ThemedText>
                    </ThemedView>
                    <View>
                      <ThemedText type="smallBold">{m.name}</ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">
                        {m.role === "admin" ? "Admin" : "Mitglied"} {m.email ? `· ${m.email}` : ""}
                      </ThemedText>
                    </View>
                  </View>
                  {isAdmin && m.userId !== (band as any).userId && (
                    <Pressable
                      onPress={() => handleRemove(m.id)}
                      style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                    >
                      <SymbolView
                        tintColor="#ef4444"
                        name={{ ios: "xmark.circle.fill", web: "cancel" }}
                        size={22}
                      />
                    </Pressable>
                  )}
                </ThemedView>
              ))}
            </View>
          </View>

          {/* Aktionen */}
          <View style={styles.section}>
            <Pressable
              onPress={() =>
                Alert.alert("Band verlassen", "Möchtest du die Band wirklich verlassen?", [
                  { text: "Abbrechen", style: "cancel" },
                  { text: "Verlassen", style: "destructive", onPress: handleLeave },
                ])
              }
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
                { borderColor: "#ef4444" },
              ]}
            >
              <SymbolView
                tintColor="#ef4444"
                name={{ ios: "arrow.right.square", web: "logout" }}
                size={18}
              />
              <ThemedText type="smallBold" style={{ color: "#ef4444" }}>
                Band verlassen
              </ThemedText>
            </Pressable>

            {isAdmin && !showDelete && (
              <Pressable
                onPress={() => setShowDelete(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView tintColor="#ef4444" name={{ ios: "trash", web: "delete" }} size={18} />
                <ThemedText type="smallBold" style={{ color: "#ef4444" }}>
                  Band löschen
                </ThemedText>
              </Pressable>
            )}

            {showDelete && (
              <ThemedView type="backgroundElement" style={styles.deleteConfirm}>
                <ThemedText type="smallBold" style={{ color: "#ef4444" }}>
                  Band endgültig löschen
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Gib den Namen der Band ein um zu bestätigen:
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.background,
                      borderColor: theme.backgroundSelected,
                    },
                  ]}
                  placeholder={band.name}
                  placeholderTextColor={theme.textSecondary}
                  value={deleteName}
                  onChangeText={setDeleteName}
                  autoFocus
                />
                {actionError ? (
                  <ThemedText type="small" style={{ color: "#ef4444" }}>
                    {actionError}
                  </ThemedText>
                ) : null}
                <View style={styles.deleteActions}>
                  <Pressable
                    onPress={() => {
                      setShowDelete(false);
                      setDeleteName("");
                      setActionError("");
                    }}
                    style={({ pressed }) => [styles.cancelDelete, pressed && styles.pressed]}
                  >
                    <ThemedText type="smallBold">Abbrechen</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleDelete}
                    disabled={deleteName !== band.name}
                    style={({ pressed }) => [
                      styles.confirmDelete,
                      pressed && styles.pressed,
                      {
                        backgroundColor:
                          deleteName === band.name ? "#ef4444" : theme.backgroundSelected,
                      },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: deleteName === band.name ? "#fff" : theme.textSecondary }}
                    >
                      Löschen bestätigen
                    </ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollView: { flex: 1 },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  container: { width: "100%", maxWidth: MaxContentWidth, gap: Spacing.five },
  section: { gap: Spacing.two },
  sectionTitle: { marginBottom: Spacing.one },
  inviteButton: {
    alignItems: "center",
    borderRadius: Spacing.three,
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  inviteCard: { borderRadius: Spacing.three, gap: Spacing.two, padding: Spacing.three },
  inviteInput: { borderRadius: Spacing.two, borderWidth: 1, fontSize: 14, padding: Spacing.two },
  copyButton: {
    alignItems: "center",
    borderRadius: Spacing.two,
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "center",
    minHeight: 44,
  },
  memberList: { gap: Spacing.one },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.two,
    borderRadius: Spacing.three,
  },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.two, flex: 1 },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: { padding: Spacing.one },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: "transparent",
  },
  deleteButton: { borderColor: "#ef4444" },
  deleteConfirm: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 14,
  },
  deleteActions: { flexDirection: "row", gap: Spacing.two, marginTop: Spacing.one },
  cancelDelete: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDelete: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.75 },
});
