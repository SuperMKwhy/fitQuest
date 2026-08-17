import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
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
      <Text className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Step 3 of 3</Text>
      <Text className="text-2xl font-bold text-on-background mb-4">Create Your Avatar</Text>

      <ChibiSurface className="h-64 items-center justify-center mb-4 overflow-hidden">
        <View className="w-40 h-52">
          <Image source={SKIN_TONES[skinIndex].asset} className="absolute inset-0 w-full h-full" resizeMode="contain" />
          {HAIR_STYLES[hairIndex].asset && (
            <Image source={HAIR_STYLES[hairIndex].asset} className="absolute inset-0 w-full h-full" resizeMode="contain" />
          )}
        </View>
      </ChibiSurface>

      <ChibiSurface className="p-4 mb-4">
        <Text className="font-bold text-on-background mb-2">Hairstyle: {HAIR_STYLES[hairIndex].label}</Text>
        <Slider
          minimumValue={0}
          maximumValue={HAIR_STYLES.length - 1}
          step={1}
          value={hairIndex}
          onValueChange={setHairIndex}
          minimumTrackTintColor="#006b55"
          maximumTrackTintColor="#e5e2e1"
          thumbTintColor="#006b55"
        />
      </ChibiSurface>

      <ChibiSurface className="p-4 mb-4">
        <Text className="font-bold text-on-background mb-2">Skin Tone: {SKIN_TONES[skinIndex].label}</Text>
        <View className="flex-row gap-3 flex-wrap">
          {SKIN_TONES.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSkinIndex(i)}
              className="w-10 h-10 rounded-full border-2"
              style={{ backgroundColor: s.swatch, borderColor: i === skinIndex ? '#1c1b1b' : 'transparent' }}
            />
          ))}
        </View>
      </ChibiSurface>

      <View className="flex-1" />

      <ChibiButton className="py-4 mb-6" onPress={finish} disabled={submitting}>
        <Text className="font-bold uppercase text-on-primary-container">
          {submitting ? 'Saving…' : "Let's go!"}
        </Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
