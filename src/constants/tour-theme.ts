import { useColorScheme } from "react-native";

export const palettes = {
  light: {
    background: "#EAF0ED",
    surface: "#F8FAF8",
    text: "#202E2D",
    secondary: "#526562",
    tint: "#164D4F",
    line: "#C7D4CE",
    accent: "#AD4937",
    soft: "#F3DCD4",
    hero: "#164D4F",
    onHero: "#F8FAF8",
    heroMuted: "#C8DFD7",
  },
  dark: {
    background: "#141F1F",
    surface: "#1F302F",
    text: "#EEF4F0",
    secondary: "#B0C4BC",
    tint: "#B6DCD0",
    line: "#3B514D",
    accent: "#F0AA95",
    soft: "#54372F",
    hero: "#214C4D",
    onHero: "#F8FAF8",
    heroMuted: "#C8DFD7",
  },
};

export function useTourTheme() {
  const dark = useColorScheme() === "dark";
  return { colors: palettes[dark ? "dark" : "light"], dark };
}
