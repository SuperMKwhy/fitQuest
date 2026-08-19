import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';

const GOALS = [
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    subtitle: 'I want to get stronger and build muscle.',
    icon: 'fitness-center',
    sparkleClassName: 'text-tertiary-container',
  },
  {
    id: 'lose_weight',
    label: 'Lose Weight',
    subtitle: 'I want to lose weight and feel lighter.',
    icon: 'monitor-weight',
    sparkleClassName: 'text-primary-container',
  },
  {
    id: 'improve_health',
    label: 'Improve Health',
    subtitle: 'I want to feel better and be healthier.',
    icon: 'favorite',
    sparkleClassName: 'text-secondary-container',
  },
];

// Matches design/OnboardingQuestionnaire.html — step 1 of 3.
export default function OnboardingGoalScreen({ navigation }) {
  const [goal, setGoal] = useState('build_muscle');
  const selectedGoal = GOALS.find((g) => g.id === goal);

  const continueOnboarding = () => navigation.navigate('OnboardingStats', { goal });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Nav & progress */}
      <View className="flex-row items-center px-margin-mobile pt-md pb-2">
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <ChibiSurface className="w-12 h-12 items-center justify-center">
            <MaterialIcons name="arrow-back" size={22} color={tokens.colors.primary} />
          </ChibiSurface>
        </Pressable>
        <View className="flex-1 px-2">
          <OnboardingStepper step={1} totalSteps={3} />
        </View>
        <Pressable onPress={continueOnboarding} accessibilityRole="button">
          <ChibiSurface className="w-12 h-12 items-center justify-center">
            <MaterialIcons name="arrow-forward" size={22} color={tokens.colors.primary} />
          </ChibiSurface>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-margin-mobile pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header text */}
        <View className="items-center mb-4 px-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-primary-container text-xl">✦</Text>
            <Text className="font-headline text-2xl text-on-background uppercase text-center">
              What's your main goal?
            </Text>
            <Text className="text-primary-container text-xl">✦</Text>
          </View>
          <Text className="font-body text-on-surface-variant text-center">
            Choose the goal that motivates you the most!
          </Text>
        </View>

        {/* Hero card */}
        <ChibiSurface className="p-2 mb-4">
          <View className="rounded-lg border-2 border-ink bg-primary-container/20 aspect-[4/3] items-center justify-center overflow-hidden">
            <MaterialIcons name={selectedGoal.icon} size={72} color={tokens.colors.primary} />
          </View>
          <View className="flex-row justify-center gap-2 mt-3 mb-1">
            {GOALS.map((g) => (
              <View
                key={g.id}
                className={`w-2 h-2 rounded-full border-[2px] border-ink ${
                  g.id === goal ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              />
            ))}
          </View>
        </ChibiSurface>

        {/* Options */}
        <View className="gap-3">
          {GOALS.map((g) => {
            const selected = g.id === goal;
            return (
              <Pressable key={g.id} onPress={() => setGoal(g.id)} accessibilityRole="button">
                <ChibiSurface className={`p-4 ${selected ? 'bg-surface-container' : ''}`}>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-1">
                      <Text className="font-label text-on-background uppercase mb-1">{g.label}</Text>
                      <Text className="font-body text-[14px] text-on-surface-variant leading-tight">
                        {g.subtitle}
                      </Text>
                    </View>
                    <Text className={`text-2xl ${g.sparkleClassName}`}>✦</Text>
                  </View>
                </ChibiSurface>
              </Pressable>
            );
          })}
        </View>

        {/* Mascot tip */}
        <View className="flex-row items-end gap-2 mt-4 px-1">
          <View className="w-14 h-14 rounded-full border-[3px] border-ink bg-primary-container overflow-hidden">
            <Image
              source={require('../../assets/onboarding/goal-mascot.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <ChibiSurface className="flex-1 p-3">
            <Text className="font-body text-[13px] leading-snug">
              There's <Text className="font-headline-medium text-primary">no wrong answer!</Text> You can always
              adjust your goals later. ❤️
            </Text>
          </ChibiSurface>
        </View>
      </ScrollView>

      <View className="px-margin-mobile pb-6 pt-2">
        <ChibiButton className="py-4" onPress={continueOnboarding}>
          <Text className="font-headline uppercase text-on-primary-container">Continue</Text>
        </ChibiButton>
      </View>
    </SafeAreaView>
  );
}
