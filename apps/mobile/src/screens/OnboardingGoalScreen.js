import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

const GOALS = [
  { id: 'build_muscle', label: 'Build Muscle' },
  { id: 'lose_weight', label: 'Lose Weight' },
  { id: 'improve_health', label: 'Improve Health' },
];

// Matches design/OnboardingQuestionnaire.html — step 1 of 3.
export default function OnboardingGoalScreen({ navigation }) {
  const [goal, setGoal] = useState('build_muscle');

  return (
    <SafeAreaView className="flex-1 bg-background px-margin-mobile pt-md">
      <Text className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Step 1 of 3</Text>
      <Text className="text-2xl font-bold text-on-background mb-1">What's your main goal?</Text>
      <Text className="text-on-surface-variant mb-6">We'll tailor your quests around it.</Text>

      <View className="gap-3">
        {GOALS.map((g) => (
          <ChibiSurface key={g.id} className={`p-4 ${goal === g.id ? 'bg-primary-container' : ''}`}>
            <Text className="text-lg font-bold text-on-background" onPress={() => setGoal(g.id)}>
              {g.label}
            </Text>
          </ChibiSurface>
        ))}
      </View>

      <View className="flex-1" />

      <ChibiButton
        className="py-4 mb-6"
        onPress={() => navigation.navigate('OnboardingStats', { goal })}
      >
        <Text className="font-bold uppercase text-on-primary-container">Continue</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
