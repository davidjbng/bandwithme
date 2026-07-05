import { Slot } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ConvexProvider } from "@/lib/convex";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <ConvexProvider>
          <AnimatedSplashOverlay />
          <Slot />
        </ConvexProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
