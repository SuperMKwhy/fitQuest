import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';

// Matches design/Personal.html used as onboarding step 2 of 3 ("Your Stats").
export default function OnboardingStatsScreen({ navigation, route }) {
  const { goal } = route.params;
  const [heightCm, setHeightCm] = useState('165');
  const [weightKg, setWeightKg] = useState('60');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-margin-mobile pt-md">
            <OnboardingStepper step={2} totalSteps={3} />
            <Text className="text-2xl font-headline text-on-background mb-1 uppercase text-center">Your Stats</Text>
            <Text className="font-body text-on-surface-variant mb-6 text-center">
              Used to estimate calories burned.
            </Text>

            <ChibiSurface className="p-4 mb-4">
              <View className="flex-row items-center gap-1 mb-1">
                <MaterialIcons name="accessibility-new" size={16} color={tokens.colors['primary-container']} />
                <Text className="font-label text-[12px] uppercase text-on-surface-variant">Height (cm)</Text>
              </View>
              <View className="rounded-lg border-[3px] border-ink bg-surface-container-lowest px-3 h-14 justify-center mb-4">
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  className="text-2xl font-headline text-on-background text-center"
                />
              </View>
              <View className="flex-row items-center gap-1 mb-1">
                <MaterialIcons name="monitor-weight" size={16} color={tokens.colors['primary-container']} />
                <Text className="font-label text-[12px] uppercase text-on-surface-variant">Weight (kg)</Text>
              </View>
              <View className="rounded-lg border-[3px] border-ink bg-surface-container-lowest px-3 h-14 justify-center">
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  className="text-2xl font-headline text-on-background text-center"
                />
              </View>
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
              <Text className="font-headline uppercase text-on-primary-container">Continue</Text>
            </ChibiButton>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
