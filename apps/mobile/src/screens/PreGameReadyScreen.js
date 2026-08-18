import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton } from '../components/Chibi';

const TITLES = {
  run: "TODAY'S QUEST",
  quest_game: 'RANK MATCH',
};

// Decorative "arcade viewfinder" grid overlay behind the countdown —
// approximates design/Pre-GameReadyScreen.html's `.grid-bg` repeating
// CSS background with a handful of absolutely-positioned hairlines.
function GridOverlay() {
  const cols = Array.from({ length: 6 });
  const rows = Array.from({ length: 8 });
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden opacity-30">
      <View className="absolute inset-0 flex-row justify-between">
        {cols.map((_, i) => (
          <View key={`v${i}`} style={{ width: 1 }} className="h-full bg-outline" />
        ))}
      </View>
      <View className="absolute inset-0 justify-between">
        {rows.map((_, i) => (
          <View key={`h${i}`} style={{ height: 1 }} className="w-full bg-outline" />
        ))}
      </View>
    </View>
  );
}

// Matches design/Pre-GameReadyScreen.html — shared countdown screen for both
// activity types (mode: 'run' -> RunTracker, 'quest_game' -> QuestGame).
export default function PreGameReadyScreen({ navigation, route }) {
  const { mode } = route.params;
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [count]);

  const start = () => {
    navigation.replace(mode === 'run' ? 'RunTracker' : 'QuestGame');
  };

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-margin-mobile">
      <Text className="text-on-surface-variant uppercase tracking-widest mb-4 font-label">{TITLES[mode]}</Text>

      <View className="w-full flex-1 max-h-96 items-center justify-center relative">
        <GridOverlay />
        {count > 0 ? (
          <View className="items-center justify-center">
            <Text
              className="text-9xl font-headline text-ink absolute"
              style={{ top: 6, left: 6 }}
            >
              {count}
            </Text>
            <Text className="text-9xl font-headline text-secondary-container">{count}</Text>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-3xl font-headline text-on-background mb-8">Ready?</Text>
            <ChibiButton className="px-10 py-4" onPress={start}>
              <Text className="text-xl font-headline text-on-primary-container">START!</Text>
            </ChibiButton>
          </View>
        )}
      </View>

      <Text className="text-on-surface-variant mt-10 font-body-medium" onPress={() => navigation.goBack()}>
        Cancel
      </Text>
    </SafeAreaView>
  );
}
