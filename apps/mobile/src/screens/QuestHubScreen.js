import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton } from '../components/Chibi';

export default function QuestHubScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-background px-margin-mobile pt-md gap-4">
      <Text className="text-2xl font-bold text-on-background mb-2">Quests</Text>

      <ChibiButton className="p-4 items-start" onPress={() => navigation.navigate('PreGameReady', { mode: 'run' })}>
        <Text className="text-lg font-bold text-on-primary-container">🗡️ Today's Quest</Text>
        <Text className="text-on-primary-container">Track a run with live GPS, distance, and pace</Text>
      </ChibiButton>

      <ChibiButton className="p-4 items-start" onPress={() => navigation.navigate('PreGameReady', { mode: 'quest_game' })}>
        <Text className="text-lg font-bold text-on-primary-container">🏆 Rank Match</Text>
        <Text className="text-on-primary-container">Arm-swing arcade — compete for XP on the leaderboard</Text>
      </ChibiButton>

      <View className="flex-1" />
    </SafeAreaView>
  );
}
