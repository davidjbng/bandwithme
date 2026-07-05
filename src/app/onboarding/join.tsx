import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function JoinBandScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Band beitreten' }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <SymbolView tintColor={theme.text} name={{ ios: 'link', web: 'link' }} size={40} />
            <ThemedText type="subtitle">Band beitreten</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
              Du brauchst einen Einladungslink von einem Bandmitglied.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.placeholder}>
            <SymbolView tintColor={theme.textSecondary} name={{ ios: 'link.badge.plus', web: 'add_link' }} size={32} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Der Beitritt über einen Einladungslink wird in Kürze verfügbar sein. Bitte frage ein Bandmitglied nach dem Link.
            </ThemedText>
          </ThemedView>

          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="small" themeColor="textSecondary">Zurück</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  container: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.five },
  header: { alignItems: 'center', gap: Spacing.two },
  centerText: { textAlign: 'center' },
  placeholder: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});