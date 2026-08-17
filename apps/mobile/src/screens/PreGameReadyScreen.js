import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton } from '../components/Chibi';

const TITLES = {
  run: "TODAY'S QUEST",
  quest_game: 'RANK MATCH',
};

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
      <Text className="text-on-surface-variant uppercase tracking-widest mb-4">{TITLES[mode]}</Text>
      {count > 0 ? (
        <Text className="text-8xl font-bold text-secondary-container">{count}</Text>
      ) : (
        <>
          <Text className="text-3xl font-bold text-on-background mb-8">Ready?</Text>
          <ChibiButton className="px-10 py-4" onPress={start}>
            <Text className="text-xl font-bold text-on-primary-container">START!</Text>
          </ChibiButton>
        </>
      )}
      <Text className="text-on-surface-variant mt-10" onPress={() => navigation.goBack()}>
        Cancel
      </Text>
    </SafeAreaView>
  );
}
