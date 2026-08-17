import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/GameOverScreen.html.
export default function GameOverScreen({ navigation, route }) {
  const { score, xpEarned, coinsEarned } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-6">
      <Text className="text-3xl font-bold text-on-background uppercase">Game Over</Text>

      <ChibiSurface className="w-full max-w-sm p-6 items-center gap-2">
        <Text className="text-xs text-on-surface-variant uppercase tracking-wider">Score</Text>
        <Text className="text-5xl font-bold text-on-background">{score}</Text>
        <View className="flex-row gap-6 mt-4">
          <Text className="font-bold text-primary">+{xpEarned} XP</Text>
          <Text className="font-bold text-tertiary">+{coinsEarned} coins</Text>
        </View>
      </ChibiSurface>

      <ChibiButton
        className="w-full max-w-sm py-4"
        onPress={() => navigation.replace('QuestGame')}
      >
        <Text className="font-bold uppercase text-on-primary-container">Play Again</Text>
      </ChibiButton>

      <ChibiButton
        className="w-full max-w-sm py-4"
        onPress={() => navigation.navigate('Main', { screen: 'Social' })}
      >
        <Text className="font-bold uppercase text-on-primary-container">View Rank</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
