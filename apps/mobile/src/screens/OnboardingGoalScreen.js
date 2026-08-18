import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';

const GOALS = [
  { id: 'build_muscle', label: 'Build Muscle', subtitle: 'Get stronger and build muscle.', icon: 'fitness-center' },
  { id: 'lose_weight', label: 'Lose Weight', subtitle: 'Lose weight and feel lighter.', icon: 'monitor-weight' },
  { id: 'improve_health', label: 'Improve Health', subtitle: 'Feel better and be healthier.', icon: 'favorite' },
];

// Matches design/OnboardingQuestionnaire.html — step 1 of 3.
export default function OnboardingGoalScreen({ navigation }) {
  const [goal, setGoal] = useState('build_muscle');

  return (
    <SafeAreaView className="flex-1 bg-background px-margin-mobile pt-md">
      <OnboardingStepper step={1} totalSteps={3} />
      <Text className="text-2xl font-headline text-on-background mb-1 uppercase">What's your main goal?</Text>
      <Text className="font-body text-on-surface-variant mb-6">We'll tailor your quests around it.</Text>

      <View className="gap-3">
        {GOALS.map((g) => {
          const selected = goal === g.id;
          return (
            <Pressable key={g.id} onPress={() => setGoal(g.id)} accessibilityRole="button">
              <ChibiSurface className={`p-4 ${selected ? 'bg-primary-container' : ''}`}>
                <View className="flex-row items-center gap-4">
                  <View className="w-11 h-11 rounded-lg border-[3px] border-ink bg-surface-container-lowest items-center justify-center">
                    <MaterialIcons
                      name={g.icon}
                      size={22}
                      color={selected ? tokens.colors['on-primary-container'] : tokens.colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-label text-on-background uppercase mb-0.5">{g.label}</Text>
                    <Text className="font-body text-[13px] text-on-surface-variant leading-tight">{g.subtitle}</Text>
                  </View>
                </View>
              </ChibiSurface>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" />

      <ChibiButton
        className="py-4 mb-6"
        onPress={() => navigation.navigate('OnboardingStats', { goal })}
      >
        <Text className="font-headline uppercase text-on-primary-container">Continue</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
