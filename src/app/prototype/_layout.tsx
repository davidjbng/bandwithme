import { Redirect, Stack } from "expo-router";
import { DemoProvider, useDemo } from "@/components/design-demo";

function PrototypeStack() {
  const { colors } = useDemo();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.tint,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="event"
        options={{ title: "Termin", headerBackButtonDisplayMode: "minimal" }}
      />
    </Stack>
  );
}
export default function PrototypeLayout() {
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <DemoProvider>
      <PrototypeStack />
    </DemoProvider>
  );
}
