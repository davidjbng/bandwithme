import { Button, Host, Text as NativeText } from "@expo/ui";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { PropsWithChildren, ComponentProps } from "react";
import { StyleSheet, Text, View, type TextProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTourTheme } from "@/constants/tour-theme";

export function Copy({ style, ...props }: TextProps) {
  const { colors } = useTourTheme();
  return <Text selectable {...props} style={[s.body, { color: colors.text }, style]} />;
}
export function Meta({ style, ...props }: TextProps) {
  const { colors } = useTourTheme();
  return <Copy {...props} style={[s.meta, { color: colors.secondary }, style]} />;
}
export function Icon({
  name,
  color,
  size = 20,
}: {
  name: ComponentProps<typeof SymbolView>["name"];
  color?: string;
  size?: number;
}) {
  const { colors } = useTourTheme();
  return <SymbolView name={name} tintColor={color ?? colors.tint} size={size} />;
}
export function Action({
  label,
  onPress,
  secondary = false,
  testID,
  disabled = false,
  hero = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  testID?: string;
  disabled?: boolean;
  hero?: boolean;
}) {
  const { colors, dark } = useTourTheme();
  return (
    <Host
      matchContents
      colorScheme={hero || dark ? "dark" : "light"}
      seedColor={hero ? colors.heroMuted : colors.tint}
      style={{ minHeight: 48 }}
    >
      <Button
        onPress={onPress}
        variant={secondary ? "outlined" : "filled"}
        disabled={disabled}
        testID={testID}
        style={{ height: 48, paddingHorizontal: 16 }}
      >
        <NativeText
          textStyle={{
            color: secondary
              ? hero
                ? colors.onHero
                : colors.tint
              : hero
                ? colors.hero
                : colors.background,
          }}
        >
          {label}
        </NativeText>
      </Button>
    </Host>
  );
}
export function Page({ children }: PropsWithChildren) {
  const { colors } = useTourTheme();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.page}
    >
      <SafeAreaView edges={["left", "right"]} style={s.content}>
        {children}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
export function TourSection({ title, large = true }: { title: string; large?: boolean }) {
  const { colors } = useTourTheme();
  return (
    <Stack
      screenOptions={{
        title,
        headerLargeTitleEnabled: large,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerLargeStyle: { backgroundColor: colors.background },
        headerTintColor: colors.tint,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
export function SectionHeading({ children, aside }: PropsWithChildren<{ aside?: string }>) {
  return (
    <View style={s.sectionHeading}>
      <Copy accessibilityRole="header" style={s.heading}>
        {children}
      </Copy>
      {aside && <Meta>{aside}</Meta>}
    </View>
  );
}
export const s = StyleSheet.create({
  page: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120, alignItems: "center" },
  content: { width: "100%", maxWidth: 760, gap: 28 },
  body: { fontSize: 17, lineHeight: 25 },
  meta: { fontSize: 14, lineHeight: 21 },
  display: { fontSize: 34, lineHeight: 39, letterSpacing: -0.8, fontWeight: "700" },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.35 },
  intro: { gap: 10 },
  hero: { padding: 24, borderRadius: 16, borderCurve: "continuous", gap: 18 },
  heroDate: { fontSize: 15, lineHeight: 21, fontWeight: "500" },
  heroTitle: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6, fontWeight: "700" },
  people: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#243A35", fontSize: 12, fontWeight: "700" },
  rsvp: { gap: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  textAction: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  sectionHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  date: { width: 48, alignItems: "center", gap: 2 },
  day: { fontSize: 30, lineHeight: 34, fontWeight: "600", fontVariant: ["tabular-nums"] },
  month: { fontSize: 12, fontWeight: "600" },
  rowContent: { flex: 1, gap: 4, minWidth: 0 },
  rowTitle: { fontWeight: "600", fontSize: 18, lineHeight: 25 },
  inline: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  songTeaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 22,
    borderRadius: 16,
    borderCurve: "continuous",
  },
  footnote: { textAlign: "center", fontSize: 12 },
  segment: { minHeight: 44 },
  search: {
    fontSize: 17,
    padding: 14,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  songRow: { paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  songTop: { flexDirection: "row", gap: 16, alignItems: "center" },
  vote: {
    minWidth: 64,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  voteCount: { fontWeight: "600", fontVariant: ["tabular-nums"] },
  link: { fontSize: 15, fontWeight: "600" },
  empty: { paddingVertical: 28, gap: 12 },
  eventIntro: { padding: 24, borderRadius: 16, borderCurve: "continuous", gap: 12 },
  setlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trackNumber: { fontSize: 20, fontWeight: "500", width: 28, fontVariant: ["tabular-nums"] },
  reorder: { flexDirection: "row" },
  iconAction: { minWidth: 44, minHeight: 48, alignItems: "center", justifyContent: "center" },
  bandIntro: { padding: 24, borderRadius: 16, gap: 18 },
  memberRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
