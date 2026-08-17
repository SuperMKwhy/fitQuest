import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/client';

const TOKEN_KEY = 'fitquest_token';

export const useAppStore = create((set, get) => ({
  status: 'loading', // loading | signed-out | onboarding | ready
  token: null,
  profile: null,
  error: null,

  async bootstrap() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      set({ status: 'signed-out' });
      return;
    }
    setAuthToken(token);
    try {
      const profile = await api.getMe();
      set({
        token,
        profile,
        status: profile.onboardingCompletedAt ? 'ready' : 'onboarding',
      });
    } catch {
      // Token expired/invalid — fall back to signed-out rather than getting stuck.
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthToken(null);
      set({ status: 'signed-out', token: null, profile: null });
    }
  },

  async register(email, password, displayName) {
    set({ error: null });
    const { token, profile } = await api.register(email, password, displayName);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    set({ token, profile, status: 'onboarding' });
  },

  async login(email, password) {
    set({ error: null });
    const { token, profile } = await api.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    set({ token, profile, status: profile.onboardingCompletedAt ? 'ready' : 'onboarding' });
  },

  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    set({ token: null, profile: null, status: 'signed-out' });
  },

  async updateProfile(fields) {
    const profile = await api.updateMe(fields);
    set({ profile });
    return profile;
  },

  async completeOnboarding(fields) {
    const profile = await api.updateMe({ ...fields, completeOnboarding: true });
    set({ profile, status: 'ready' });
    return profile;
  },

  async submitActivity(activity) {
    const { profile, activity: recorded } = await api.submitActivity(activity);
    set({ profile });
    return recorded; // includes the server-computed xpEarned/coinsEarned
  },
}));
