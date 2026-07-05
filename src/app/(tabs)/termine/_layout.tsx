import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function TermineLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Termine" }} />
      <Stack.Screen name="create" options={{ title: "Neuer Termin", headerLargeTitle: false }} />
    </Stack>
  );
}
