import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { AvatarCanvas, DEFAULT_SELECTION, PARTS } from '../components/Avatar';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

function PartSwatch({ option, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        className={`w-16 h-16 rounded-xl overflow-hidden items-center justify-center ${
          selected ? 'border-[3px] border-primary-container bg-surface-container-lowest' : 'border-2 border-outline-variant bg-surface-container-lowest'
        }`}
      >
        <Image source={option.asset} className="w-14 h-14" resizeMode="contain" fadeDuration={0} />
      </View>
      <Text className="text-[10px] text-center font-label text-on-surface-variant mt-1 uppercase">{option.label}</Text>
    </TouchableOpacity>
  );
}

// Matches design/AvatarCreator.html — step 3 of 3, finishes onboarding.
export default function AvatarCreatorScreen({ navigation, route }) {
  const { goal, heightCm, weightKg } = route.params;
  const [activePart, setActivePart] = useState('body');
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const pick = (partKey, optionId) => {
    if (selection[partKey] === optionId) return;
    setPast((p) => [...p, selection]);
    setFuture([]);
    setSelection((s) => ({ ...s, [partKey]: optionId }));
  };

  const undo = () => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [selection, ...f]);
    setSelection(prev);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, selection]);
    setSelection(next);
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        goal,
        heightCm,
        weightKg,
        // Server only persists hairStyle/skinTone today (shirt/pant/shoe
        // equip isn't wired up yet, see todo.md) — send everything anyway so
        // it's a no-op change on the client once the backend catches up.
        skinTone: selection.body,
        hairStyle: selection.hair,
        shirt: selection.shirt,
        pant: selection.pant,
        shoe: selection.shoe,
      });
      // status flips to 'ready' in the store, RootNavigator swaps to MainTabs.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Nav & progress */}
      <View className="flex-row items-center px-margin-mobile pt-md pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <ChibiSurface className="w-12 h-12 items-center justify-center">
            <MaterialIcons name="arrow-back" size={22} color={tokens.colors.primary} />
          </ChibiSurface>
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="font-headline text-lg text-on-background uppercase">Create Your Avatar</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-primary-container text-[10px]">✦</Text>
            <Text className="font-label text-[10px] tracking-widest text-primary uppercase">
              Build your legend. Be you.
            </Text>
            <Text className="text-primary-container text-[10px]">✦</Text>
          </View>
        </View>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-margin-mobile pb-6" showsVerticalScrollIndicator={false}>
        <OnboardingStepper step={3} totalSteps={3} />

        {/* Character canvas */}
        <ChibiSurface className="aspect-square items-center justify-center mb-4 overflow-hidden">
          <View className="absolute inset-0 pointer-events-none">
            <Text className="absolute text-primary-container text-2xl" style={{ top: '18%', left: '12%' }}>
              ✦
            </Text>
            <Text className="absolute text-tertiary-container text-xl" style={{ top: '38%', right: '10%' }}>
              ✦
            </Text>
            <Text className="absolute text-tertiary-container text-lg" style={{ bottom: '28%', left: '22%' }}>
              ✦
            </Text>
          </View>
          <AvatarCanvas selection={selection} className="w-[55%] aspect-[260/505]" />
          <View className="absolute bottom-3 left-3 right-3 flex-row justify-between">
            <TouchableOpacity onPress={undo} disabled={!past.length} accessibilityRole="button">
              <ChibiSurface className={`w-12 h-12 items-center justify-center ${!past.length ? 'opacity-40' : ''}`}>
                <MaterialIcons name="undo" size={20} color={tokens.colors.primary} />
              </ChibiSurface>
            </TouchableOpacity>
            <TouchableOpacity onPress={redo} disabled={!future.length} accessibilityRole="button">
              <ChibiSurface className={`w-12 h-12 items-center justify-center ${!future.length ? 'opacity-40' : ''}`}>
                <MaterialIcons name="redo" size={20} color={tokens.colors.primary} />
              </ChibiSurface>
            </TouchableOpacity>
          </View>
        </ChibiSurface>

        {/* Category tabs */}
        <ChibiSurface className="p-0 mb-4 overflow-hidden">
          <View className="flex-row divide-x-[3px] divide-ink">
            {PARTS.map((p) => {
              const selected = p.key === activePart;
              return (
                <TouchableOpacity
                  key={p.key}
                  className={`flex-1 py-3 items-center justify-center gap-1 ${selected ? 'bg-primary-container' : 'bg-surface-container-lowest'}`}
                  onPress={() => setActivePart(p.key)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={p.icon}
                    size={20}
                    color={selected ? tokens.colors['on-primary-container'] : tokens.colors['on-surface-variant']}
                  />
                  <Text
                    className={`text-[10px] font-label uppercase ${
                      selected ? 'text-on-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ChibiSurface>

        {/* Variant options — every category's row stays mounted (just hidden)
            so its swatch thumbnails are already decoded before you tab to it. */}
        <ChibiSurface className="p-4 mb-4">
          {PARTS.map((p) => (
            <View key={p.key} style={{ display: p.key === activePart ? 'flex' : 'none' }}>
              <View className="flex-row items-center justify-center gap-2 mb-3">
                <Text className="text-primary-container font-label text-sm">✦</Text>
                <Text className="font-label text-[13px] uppercase text-on-surface">{p.label}</Text>
                <Text className="text-primary-container font-label text-sm">✦</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
                {p.options.map((option) => (
                  <PartSwatch
                    key={option.id}
                    option={option}
                    selected={selection[p.key] === option.id}
                    onPress={() => pick(p.key, option.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ))}
        </ChibiSurface>

        <ChibiButton className="py-4 flex-row gap-1 mb-4" onPress={finish} disabled={submitting}>
          <Text className="font-headline uppercase text-on-primary-container">
            {submitting ? 'Saving…' : "Let's go!"}
          </Text>
          {!submitting && <MaterialIcons name="chevron-right" size={22} color={tokens.colors['on-primary-container']} />}
        </ChibiButton>

        {/* Tip card */}
        <View className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-3 flex-row items-center gap-3">
          <View className="w-8 h-8 rounded bg-tertiary-container border-[2px] border-ink items-center justify-center">
            <MaterialIcons name="star" size={16} color={tokens.colors['on-tertiary-container']} />
          </View>
          <Text className="font-body text-[13px] text-on-surface-variant flex-1">
            Tip: You can change your avatar later in{' '}
            <Text className="text-primary font-bold">profile settings</Text>!
          </Text>
          <Text className="text-tertiary-container text-lg">✦</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
