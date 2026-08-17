import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/MoodTracker.html — needs a mood-log data model + calendar
// history endpoint on the backend before it can be built. See todo.md.
export default function MoodTrackerScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-4">
      <Text className="text-4xl">🙂</Text>
      <Text className="text-xl font-bold text-on-background">Mood Tracker</Text>
      <ChibiSurface className="p-4">
        <Text className="text-on-surface-variant text-center">Coming soon.</Text>
      </ChibiSurface>
      <ChibiButton className="px-8 py-3" onPress={() => navigation.goBack()}>
        <Text className="font-bold uppercase text-on-primary-container">Back</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
