import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAppStore } from '../state/useAppStore';

export default function LoadingScreen() {
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <View className="flex-1 items-center justify-center bg-background gap-4">
      <Text className="text-4xl">🏋️</Text>
      <Text className="text-2xl font-bold text-on-background">FitQuest</Text>
      <ActivityIndicator color="#006b55" />
    </View>
  );
}
