import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { useAppStore } from '../state/useAppStore';

// No login/signup screen exists in design/*.html — the 18 mockups assume an
// already-authenticated user. Styled to match the app's chibi design system,
// but this specific layout wasn't design-reviewed; see todo.md.
export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Text className="text-3xl font-bold text-center text-on-background mb-1">FitQuest</Text>
          <Text className="text-center text-on-surface-variant mb-8">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Text>

          <ChibiSurface className="p-4 mb-4">
            {mode === 'register' && (
              <TextInput
                placeholder="Display name"
                value={displayName}
                onChangeText={setDisplayName}
                className="border-b-2 border-outline-variant py-2 mb-3 text-on-background"
                autoCapitalize="words"
              />
            )}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="border-b-2 border-outline-variant py-2 mb-3 text-on-background"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              className="py-2 text-on-background"
              secureTextEntry
            />
          </ChibiSurface>

          {error && <Text className="text-error text-center mb-4">{error}</Text>}

          <ChibiButton className="py-4" onPress={submit} disabled={submitting}>
            <Text className="font-bold uppercase text-on-primary-container">
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </Text>
          </ChibiButton>

          <Text
            className="text-center text-primary mt-6"
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
