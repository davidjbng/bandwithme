import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { ConvexProvider } from "@/lib/convex";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <ConvexProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </ConvexProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
