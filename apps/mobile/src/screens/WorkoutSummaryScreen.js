import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Matches design/WorkoutSummary.html (post-run recap for the "Today's Quest" flow).
export default function WorkoutSummaryScreen({ navigation, route }) {
  const { distanceM, elapsedS, xpEarned, coinsEarned } = route.params;
  const km = (distanceM / 1000).toFixed(2);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-6">
      <Text className="text-2xl font-bold text-on-background uppercase">Workout Summary</Text>

      <ChibiSurface className="w-full max-w-sm p-6 gap-6">
        <View>
          <Text className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Distance</Text>
          <Text className="text-4xl font-bold text-on-background">{km} km</Text>
        </View>
        <View>
          <Text className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Time</Text>
          <Text className="text-2xl font-bold text-on-background">{formatDuration(elapsedS)}</Text>
        </View>
        <View className="flex-row gap-6">
          <Text className="font-bold text-primary">+{xpEarned} XP</Text>
          <Text className="font-bold text-tertiary">+{coinsEarned} coins</Text>
        </View>
      </ChibiSurface>

      <ChibiButton className="w-full max-w-sm py-4" onPress={() => navigation.popToTop()}>
        <Text className="font-bold uppercase text-on-primary-container">Done</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
