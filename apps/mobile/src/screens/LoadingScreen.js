import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import tokens from '../theme/tokens';

// Matches design/Loading.html's pixel-art splash: a bordered "logo card"
// (translated here into a mascot emoji since no image asset exists) plus
// Press Start 2P branding/status text.
export default function LoadingScreen() {
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-8 gap-10">
      <View className="relative">
        <View
          className="absolute rounded-3xl bg-ink"
          style={{ top: 8, left: 8, right: -8, bottom: -8 }}
        />
        <View className="w-56 h-56 items-center justify-center rounded-3xl border-4 border-ink bg-surface-container-lowest">
          <Text className="text-8xl">🏋️</Text>
        </View>
      </View>

      <View className="items-center gap-4">
        <Text className="font-pixel text-xl text-on-background text-center">FitQuest</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-primary-container">✦</Text>
          <Text className="font-pixel text-[10px] text-primary-container tracking-widest">LOADING...</Text>
          <Text className="text-primary-container">✦</Text>
        </View>
        <ActivityIndicator color={tokens.colors.primary} />
      </View>
    </View>
  );
}
