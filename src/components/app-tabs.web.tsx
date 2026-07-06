import {
  Tabs,
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, View, StyleSheet } from "react-native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { MaxContentWidth, Spacing } from "@/constants/theme";

export default function AppTabs() {
  return (
    <Tabs>
      <View style={styles.root}>
        <TabSlot style={styles.tabSlot} />
      </View>
      <TabList asChild>
        <TabBar>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="termine" href="/termine" asChild>
            <TabButton>Termine</TabButton>
          </TabTrigger>
          <TabTrigger name="user" href="/user" asChild>
            <TabButton>Profil</TabButton>
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.tabBarWrapper}>
      <ThemedView type="backgroundElement" style={styles.tabBarInner}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Band With Me
        </ThemedText>
        <View style={styles.tabButtons}>{children}</View>
      </ThemedView>
    </View>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? "backgroundSelected" : "backgroundElement"}
        style={styles.tabButtonView}
      >
        <ThemedText type="small" themeColor={isFocused ? "text" : "textSecondary"}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return <View {...props} />;
}

const TAB_BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabSlot: {
    flex: 1,
    paddingBottom: TAB_BAR_HEIGHT + Spacing.three * 2 + Spacing.one,
  },
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
    alignItems: "center",
  },
  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
  brandText: {
    marginRight: "auto",
  },
  tabButtons: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
