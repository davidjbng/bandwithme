import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Slot, usePathname, useRouter } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ConvexProvider } from "@/lib/convex";
import { api } from "../../convex/_generated/api";

function AuthGuard() {
  const { isAuthenticated, isLoading: _isLoading } = useConvexAuth();
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const pathname = usePathname();
  const router = useRouter();

  const needsProfile = isAuthenticated && user !== undefined && user !== null && !user.name;
  const isOnboarding = pathname === "/onboarding/profile";

  useEffect(() => {
    if (needsProfile && !isOnboarding) {
      router.replace("/onboarding/profile");
    }
  }, [needsProfile, isOnboarding, router]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <ConvexProvider>
          <AnimatedSplashOverlay />
          <AuthGuard />
        </ConvexProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
