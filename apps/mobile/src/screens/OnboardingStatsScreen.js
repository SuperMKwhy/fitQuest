import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';

// Matches design/Personal.html used as onboarding step 2 of 3 ("Your Stats").
export default function OnboardingStatsScreen({ navigation, route }) {
  const { goal } = route.params;
  const [heightCm, setHeightCm] = useState('165');
  const [weightKg, setWeightKg] = useState('60');

  return (
    <SafeAreaView className="flex-1 bg-background px-margin-mobile pt-md">
      <Text className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Step 2 of 3</Text>
      <Text className="text-2xl font-bold text-on-background mb-1">Your Stats</Text>
      <Text className="text-on-surface-variant mb-6">Used to estimate calories burned.</Text>

      <ChibiSurface className="p-4 mb-4">
        <Text className="text-on-surface-variant mb-1">Height (cm)</Text>
        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="numeric"
          className="text-2xl font-bold text-on-background border-b-2 border-outline-variant pb-2 mb-4"
        />
        <Text className="text-on-surface-variant mb-1">Weight (kg)</Text>
        <TextInput
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="numeric"
          className="text-2xl font-bold text-on-background"
        />
      </ChibiSurface>

      <View className="flex-1" />

      <ChibiButton
        className="py-4 mb-6"
        onPress={() =>
          navigation.navigate('AvatarCreator', {
            goal,
            heightCm: Number(heightCm) || null,
            weightKg: Number(weightKg) || null,
          })
        }
      >
        <Text className="font-bold uppercase text-on-primary-container">Continue</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
