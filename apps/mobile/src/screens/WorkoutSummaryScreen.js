import { Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import tokens from '../theme/tokens';

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Same calculation as RunTracker.native.js's formatPace — min:sec per km.
function formatPace(elapsedS, distanceM) {
  if (distanceM < 10) return '--:--';
  const minPerKm = elapsedS / 60 / (distanceM / 1000);
  if (!isFinite(minPerKm) || minPerKm <= 0) return '--:--';
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

// Matches design/WorkoutSummary.html (post-run recap for the "Today's Quest" flow).
export default function WorkoutSummaryScreen({ navigation, route }) {
  const { distanceM, elapsedS, xpEarned, coinsEarned } = route.params;
  const km = (distanceM / 1000).toFixed(2);
  const pace = formatPace(elapsedS, distanceM);

  const onShare = () => {
    Share.share({
      message: `I just ran ${km} km in ${formatDuration(elapsedS)} (${pace}/km) on FitQuest and earned +${xpEarned} XP and +${coinsEarned} coins!`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-6">
      <Text className="text-2xl font-headline text-on-background uppercase">Workout Summary</Text>

      <ChibiSurface className="w-full max-w-sm p-6 gap-6">
        <View className="flex-row justify-end -mt-2 -mr-2">
          <ChibiButton className="w-10 h-10 rounded-full" onPress={onShare}>
            <MaterialIcons name="share" size={18} color={tokens.colors['on-primary-container']} />
          </ChibiButton>
        </View>

        <View>
          <Text className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-1">Distance</Text>
          <Text className="text-4xl font-headline text-on-background">{km} km</Text>
        </View>
        <View>
          <Text className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-1">Time</Text>
          <Text className="text-2xl font-headline text-on-background">{formatDuration(elapsedS)}</Text>
        </View>
        <View>
          <Text className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-1">Pace</Text>
          <Text className="text-2xl font-headline text-on-background">{pace} /km</Text>
        </View>
        <View className="flex-row gap-6">
          <Text className="font-headline text-primary">+{xpEarned} XP</Text>
          <Text className="font-headline text-tertiary">+{coinsEarned} coins</Text>
        </View>
      </ChibiSurface>

      <ChibiButton className="w-full max-w-sm py-4" onPress={() => navigation.popToTop()}>
        <Text className="font-headline uppercase text-on-primary-container">Done</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
