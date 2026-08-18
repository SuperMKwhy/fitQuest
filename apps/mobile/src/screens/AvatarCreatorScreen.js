import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

const HAIR_STYLES = [
  { id: 'bald', label: 'Bald', asset: null },
  { id: 'short', label: 'Short', asset: require('../../assets/character/hair_short.png') },
  { id: 'long', label: 'Long', asset: require('../../assets/character/hair_long.png') },
  { id: 'spiky', label: 'Spiky', asset: require('../../assets/character/hair_spiky.png') },
  { id: 'mohawk', label: 'Mohawk', asset: require('../../assets/character/hair_mohawk.png') },
];

const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelain', swatch: '#ffe0bd', asset: require('../../assets/character/body_porcelain.png') },
  { id: 'fair', label: 'Fair', swatch: '#f1c296', asset: require('../../assets/character/body_fair.png') },
  { id: 'olive', label: 'Olive', swatch: '#e0ac69', asset: require('../../assets/character/body_olive.png') },
  { id: 'tan', label: 'Tan', swatch: '#c68642', asset: require('../../assets/character/body_tan.png') },
  { id: 'brown', label: 'Brown', swatch: '#8d5524', asset: require('../../assets/character/body_brown.png') },
  { id: 'deep', label: 'Deep', swatch: '#5c3317', asset: require('../../assets/character/body_deep.png') },
];

// Matches design/AvatarCreator.html — step 3 of 3, finishes onboarding.
export default function AvatarCreatorScreen({ route }) {
  const { goal, heightCm, weightKg } = route.params;
  const [hairIndex, setHairIndex] = useState(1);
  const [skinIndex, setSkinIndex] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const finish = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        goal,
        heightCm,
        weightKg,
        hairStyle: HAIR_STYLES[hairIndex].id,
        skinTone: SKIN_TONES[skinIndex].id,
      });
      // status flips to 'ready' in the store, RootNavigator swaps to MainTabs.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-margin-mobile pt-md">
      <OnboardingStepper step={3} totalSteps={3} />
      <Text className="text-2xl font-headline text-on-background mb-4">Create Your Avatar</Text>

      <ChibiSurface className="h-64 items-center justify-center mb-4 overflow-hidden">
        <View className="w-40 h-52">
          <Image source={SKIN_TONES[skinIndex].asset} className="absolute inset-0 w-full h-full" resizeMode="contain" />
          {HAIR_STYLES[hairIndex].asset && (
            <Image source={HAIR_STYLES[hairIndex].asset} className="absolute inset-0 w-full h-full" resizeMode="contain" />
          )}
        </View>
      </ChibiSurface>

      <ChibiSurface className="p-4 mb-4">
        <Text className="font-label text-xs uppercase text-on-surface-variant mb-3">
          Hairstyle — {HAIR_STYLES[hairIndex].label}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {HAIR_STYLES.map((h, i) => {
            const selected = i === hairIndex;
            return (
              <TouchableOpacity key={h.id} onPress={() => setHairIndex(i)} activeOpacity={0.8}>
                <View
                  className={`w-16 h-16 rounded-lg border-[3px] border-ink items-center justify-center overflow-hidden ${
                    selected ? 'bg-primary-container' : 'bg-surface-container-lowest'
                  }`}
                >
                  {h.asset ? (
                    <Image source={h.asset} className="w-10 h-10" resizeMode="contain" />
                  ) : (
                    <MaterialIcons name="face" size={28} color={tokens.colors['on-surface-variant']} />
                  )}
                  {selected && (
                    <View
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary items-center justify-center border-[2px] border-ink"
                    >
                      <MaterialIcons name="check" size={10} color={tokens.colors['on-primary']} />
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-center font-label text-on-surface-variant mt-1">
                  {h.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ChibiSurface>

      <ChibiSurface className="p-4 mb-4">
        <Text className="font-label text-xs uppercase text-on-surface-variant mb-3">
          Skin Tone — {SKIN_TONES[skinIndex].label}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {SKIN_TONES.map((s, i) => {
            const selected = i === skinIndex;
            return (
              <TouchableOpacity key={s.id} onPress={() => setSkinIndex(i)} activeOpacity={0.8}>
                <View
                  className="w-14 h-14 rounded-full border-[3px] border-ink items-center justify-center overflow-hidden"
                  style={{ backgroundColor: s.swatch }}
                >
                  {selected && (
                    <View
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center border-[2px] border-ink"
                    >
                      <MaterialIcons name="check" size={12} color={tokens.colors['on-primary']} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ChibiSurface>

      <View className="flex-1" />

      <ChibiButton className="py-4 mb-6" onPress={finish} disabled={submitting}>
        <Text className="font-headline uppercase text-on-primary-container">
          {submitting ? 'Saving…' : "Let's go!"}
        </Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
