import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function UserScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const { code, email: callbackEmail } = useLocalSearchParams<{ code?: string; email?: string }>();
  const user = useQuery(api.user.current, isAuthenticated ? {} : 'skip');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web' || !code) {
      return;
    }

    void (async () => {
      setIsSubmitting(true);
      setError(null);
      setStatus('Finishing sign in...');

      try {
        if (!callbackEmail) {
          throw new Error('Missing email for magic link sign in.');
        }
        await signIn('resend', { code, email: callbackEmail });
        router.replace('/user');
        setStatus(null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Could not finish signing in.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [callbackEmail, code, router, signIn]);

  async function sendMagicLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await signIn('resend', {
        email: trimmedEmail,
        redirectTo: `/user?email=${encodeURIComponent(trimmedEmail)}`,
      });
      setStatus('Magic link sent. Check your email to finish signing in.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not send magic link.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await signOut();
      setEmail('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not sign out.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">User</ThemedText>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Sign in with a one-time link sent to your email.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            {isLoading ? (
              <ActivityIndicator color={theme.text} />
            ) : isAuthenticated ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Signed in as
                </ThemedText>
                <ThemedText type="smallBold">{user?.email ?? user?.name ?? 'Loading account...'}</ThemedText>
                <Pressable
                  disabled={isSubmitting}
                  onPress={handleSignOut}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.text },
                    pressed && styles.pressed,
                    isSubmitting && styles.disabled,
                  ]}>
                  <ThemedText style={[styles.buttonText, { color: theme.background }]}>Log out</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText type="smallBold">Email address</ThemedText>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  inputMode="email"
                  onChangeText={setEmail}
                  onSubmitEditing={sendMagicLink}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
                  value={email}
                />
                <Pressable
                  disabled={isSubmitting}
                  onPress={sendMagicLink}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.text },
                    pressed && styles.pressed,
                    isSubmitting && styles.disabled,
                  ]}>
                  <ThemedText style={[styles.buttonText, { color: theme.background }]}>Send magic link</ThemedText>
                </Pressable>
              </>
            )}

            {isSubmitting && <ActivityIndicator color={theme.text} />}
            {status && (
              <ThemedText type="small" themeColor="textSecondary">
                {status}
              </ThemedText>
            )}
            {error && (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  button: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 700,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: '#d92d20',
  },
  pressed: {
    opacity: 0.7,
  },
});
