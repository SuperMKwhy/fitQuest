import { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';

const CM_PER_FT = 30.48;
const KG_PER_LB = 0.453592;

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'High';
}

// Small pill toggle for a unit pair, e.g. "cm / ft" — matches Personal.html's
// `.toggle-switch` (a chibi-bordered capsule with the active side filled).
function UnitToggle({ options, value, onChange }) {
  return (
    <View className="bg-surface-container-high rounded-full border-[3px] border-ink flex-row p-1 w-16 h-10 items-center">
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className={`w-6 h-6 rounded-full items-center justify-center ${selected ? 'bg-primary-container border-[3px] border-ink' : ''}`}
          >
            <Text
              className={`font-label text-[10px] uppercase ${
                selected ? 'text-on-primary-container' : 'text-on-surface-variant'
              }`}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// A labeled numeric field with an icon + unit toggle, matching Personal.html's
// height/weight rows.
function StatField({ icon, label, value, onChangeText, unit, unitOptions, onUnitChange }) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-1">
          <MaterialIcons name={icon} size={16} color={tokens.colors['primary-container']} />
          <Text className="font-label text-[12px] uppercase text-on-background">{label}</Text>
        </View>
        <Text className="font-label text-[10px] text-outline uppercase">({unit})</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="bg-surface-container-lowest rounded-lg border-[3px] border-ink px-2 flex-1 h-11 justify-center">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            className="text-xl font-headline text-on-background text-center"
          />
        </View>
        <UnitToggle options={unitOptions} value={unit} onChange={onUnitChange} />
      </View>
    </View>
  );
}

// Matches design/Personal.html used as onboarding step 2 of 3 ("Your Stats").
export default function OnboardingStatsScreen({ navigation, route }) {
  const { goal } = route.params;
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(60);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');

  const heightDisplay =
    heightUnit === 'cm' ? String(heightCm) : (heightCm / CM_PER_FT).toFixed(1);
  const weightDisplay =
    weightUnit === 'kg' ? String(weightKg) : (weightKg / KG_PER_LB).toFixed(1);

  const onChangeHeight = (text) => {
    const n = Number(text);
    if (Number.isNaN(n)) return;
    setHeightCm(heightUnit === 'cm' ? n : n * CM_PER_FT);
  };
  const onChangeWeight = (text) => {
    const n = Number(text);
    if (Number.isNaN(n)) return;
    setWeightKg(weightUnit === 'kg' ? n : n * KG_PER_LB);
  };

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmiValid = Number.isFinite(bmi) && bmi > 0;

  const continueOnboarding = () =>
    navigation.navigate('AvatarCreator', {
      goal,
      heightCm: Math.round(heightCm) || null,
      weightKg: Math.round(weightKg) || null,
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Nav & progress */}
            <View className="flex-row items-center px-margin-mobile pt-md pb-2">
              <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
                <ChibiSurface className="w-12 h-12 items-center justify-center">
                  <MaterialIcons name="arrow-back" size={22} color={tokens.colors.primary} />
                </ChibiSurface>
              </Pressable>
              <View className="flex-1 px-2">
                <OnboardingStepper step={2} totalSteps={3} />
              </View>
              <Pressable onPress={continueOnboarding} accessibilityRole="button">
                <ChibiSurface className="w-12 h-12 items-center justify-center">
                  <MaterialIcons name="arrow-forward" size={22} color={tokens.colors.primary} />
                </ChibiSurface>
              </Pressable>
            </View>

            <View className="flex-1 px-margin-mobile">
              {/* Header text */}
              <View className="items-center mb-2 px-2">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-primary-container text-lg">✦</Text>
                  <Text className="font-headline text-2xl text-on-background uppercase text-center">
                    Your Stats
                  </Text>
                  <Text className="text-primary-container text-lg">✦</Text>
                </View>
                <Text className="font-body text-on-surface-variant text-center">
                  Let's get to know you better!
                </Text>
              </View>

              {/* Character + inputs */}
              <View className="flex-row items-start gap-2 mb-3">
                <Image
                  source={require('../../assets/onboarding/stats-trainer.png')}
                  className="w-[35%] aspect-[197/316] mt-2"
                  resizeMode="contain"
                />
                <View className="flex-1 gap-3">
                  <StatField
                    icon="accessibility-new"
                    label="Height"
                    value={heightDisplay}
                    onChangeText={onChangeHeight}
                    unit={heightUnit}
                    unitOptions={['cm', 'ft']}
                    onUnitChange={setHeightUnit}
                  />
                  <StatField
                    icon="monitor-weight"
                    label="Weight"
                    value={weightDisplay}
                    onChangeText={onChangeWeight}
                    unit={weightUnit}
                    unitOptions={['kg', 'lb']}
                    onUnitChange={setWeightUnit}
                  />
                </View>
              </View>

              {/* BMI teaser card */}
              <ChibiSurface className="p-3">
                <View className="flex-row items-center justify-center gap-2 mb-3">
                  <View className="w-6 h-6 rounded-full bg-primary-container items-center justify-center">
                    <MaterialIcons name="calculate" size={14} color={tokens.colors['on-primary-container']} />
                  </View>
                  <Text className="font-headline-medium text-[16px] uppercase text-center">
                    We'll do the math for you!
                  </Text>
                </View>
                <View className="bg-surface-container-low border-2 border-surface-variant rounded-lg p-2 flex-row items-center justify-between">
                  <View className="flex-1 items-center">
                    <Text className="font-label text-[12px] uppercase mb-1">BMI</Text>
                    <View className="rounded-lg px-4 py-1 bg-surface-container-lowest border-2 border-outline-variant">
                      <Text className="font-headline text-primary-container tracking-widest text-2xl">
                        {bmiValid ? bmi.toFixed(1) : '- - . -'}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="arrow-forward" size={20} color={tokens.colors['primary-container']} />
                  <View className="flex-1 items-center px-2">
                    <Text className="text-[10px] text-on-surface font-body text-center leading-tight">
                      {bmiValid ? `${bmiCategory(bmi)} range` : 'Get a personalized plan!'}
                    </Text>
                  </View>
                </View>
              </ChibiSurface>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View className="px-margin-mobile pb-2 pt-2">
        <ChibiButton className="py-3 flex-row gap-1" onPress={continueOnboarding}>
          <Text className="font-headline uppercase text-on-primary-container">Continue</Text>
          <MaterialIcons name="chevron-right" size={22} color={tokens.colors['on-primary-container']} />
        </ChibiButton>
        <View className="flex-row items-center justify-center gap-1 mt-2 mb-4">
          <Text className="text-primary-container text-[10px]">✦</Text>
          <Text className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
            You can change this later
          </Text>
          <Text className="text-primary-container text-[10px]">✦</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
