import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { OnboardingStepper } from '../components/OnboardingStepper';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

// `apps/mobile/assets/character/<part>/` is organized one subfolder per part
// (body/, hair/, shirt/, pant/). body/ and hair/ have real sprites now — see
// todo-asset.md. shirt/ and pant/ don't have art yet, so those two stay
// flat-color silhouettes standing in for the real thing. Once a sprite lands,
// add `asset: require('../../assets/character/<part>/<name>.png')`; PartLayer
// and PartSwatch below already prefer `asset` over the placeholder shape, so
// nothing else has to change.
const PARTS = [
  {
    key: 'body',
    label: 'Body',
    icon: 'person',
    options: [
      { id: 'porcelain', label: 'Porcelain', asset: require('../../assets/character/body/porcelain.png'), color: '#ffe0bd' },
      { id: 'fair', label: 'Fair', asset: require('../../assets/character/body/fair.png'), color: '#f1c296' },
      { id: 'olive', label: 'Olive', asset: require('../../assets/character/body/olive.png'), color: '#e0ac69' },
      { id: 'tan', label: 'Tan', asset: require('../../assets/character/body/tan.png'), color: '#c68642' },
      { id: 'brown', label: 'Brown', asset: require('../../assets/character/body/brown.png'), color: '#8d5524' },
      { id: 'deep', label: 'Deep', asset: require('../../assets/character/body/deep.png'), color: '#5c3317' },
    ],
  },
  {
    key: 'hair',
    label: 'Hair',
    icon: 'content-cut',
    options: [
      { id: 'bald', label: 'Bald', asset: require('../../assets/character/hair/bald.png'), color: '#2b2b2b' },
      { id: 'short', label: 'Short', asset: require('../../assets/character/hair/short.png'), color: '#2b2b2b' },
      { id: 'long', label: 'Long', asset: require('../../assets/character/hair/long.png'), color: '#6b4423' },
      { id: 'spiky', label: 'Spiky', asset: require('../../assets/character/hair/spiky.png'), color: '#c9a227' },
      { id: 'mohawk', label: 'Mohawk', asset: require('../../assets/character/hair/mohawk.png'), color: '#a83232' },
    ],
  },
  {
    key: 'shirt',
    label: 'Shirt',
    icon: 'checkroom',
    options: [
      { id: 'shirt_1', label: 'Mint', asset: null, color: '#3ecfaa' },
      { id: 'shirt_2', label: 'Coral', asset: null, color: '#ff6b6b' },
      { id: 'shirt_3', label: 'Blue', asset: null, color: '#4a90d9' },
      { id: 'shirt_4', label: 'Gold', asset: null, color: '#e0b331' },
    ],
  },
  {
    key: 'pant',
    label: 'Pant',
    icon: 'checkroom',
    options: [
      { id: 'pant_1', label: 'Black', asset: null, color: '#1c1b1b' },
      { id: 'pant_2', label: 'Charcoal', asset: null, color: '#4a4a4a' },
      { id: 'pant_3', label: 'Navy', asset: null, color: '#3b5b8c' },
      { id: 'pant_4', label: 'Brown', asset: null, color: '#6b4423' },
    ],
  },
];

// Fractional paper-doll geometry, shared by the big canvas and the small
// swatch previews so a part reads the same silhouette at either size.
const SHAPE = {
  head: { top: '2%', left: '30%', width: '40%', height: '22%', borderRadius: 999 },
  torso: { top: '22%', left: '20%', width: '60%', height: '38%', borderRadius: 14 },
  sleeveL: { top: '24%', left: '7%', width: '16%', height: '22%', borderRadius: 10 },
  sleeveR: { top: '24%', left: '77%', width: '16%', height: '22%', borderRadius: 10 },
  legL: { top: '58%', left: '24%', width: '20%', height: '40%', borderRadius: 10 },
  legR: { top: '58%', left: '56%', width: '20%', height: '40%', borderRadius: 10 },
  hair: { top: '-2%', left: '26%', width: '48%', height: '17%', borderRadius: 999 },
};

function Block({ shape, color }) {
  return <View className="absolute border-[2px] border-ink" style={{ ...shape, backgroundColor: color }} />;
}

// One layer of the paper doll. Renders the real sprite once `asset` is set,
// otherwise falls back to a flat-color placeholder shape for that part.
function PartLayer({ partKey, option, detail = true }) {
  if (!option) return null;
  if (option.asset) {
    return <Image source={option.asset} className="absolute inset-0 w-full h-full" resizeMode="contain" />;
  }
  switch (partKey) {
    case 'body':
      return (
        <>
          <Block shape={SHAPE.head} color={option.color} />
          <Block shape={SHAPE.torso} color={option.color} />
          <Block shape={SHAPE.legL} color={option.color} />
          <Block shape={SHAPE.legR} color={option.color} />
          {/* stand-ins for eyes, so "body" reads as body + face bundled together —
              skipped at swatch-thumbnail scale, where the fixed dot size overlaps
              into a blob against such a small head */}
          {detail && (
            <>
              <View className="absolute w-1.5 h-1.5 rounded-full bg-ink" style={{ top: '10%', left: '42%' }} />
              <View className="absolute w-1.5 h-1.5 rounded-full bg-ink" style={{ top: '10%', left: '54%' }} />
            </>
          )}
        </>
      );
    case 'shirt':
      return (
        <>
          <Block shape={SHAPE.torso} color={option.color} />
          <Block shape={SHAPE.sleeveL} color={option.color} />
          <Block shape={SHAPE.sleeveR} color={option.color} />
        </>
      );
    case 'pant':
      return (
        <>
          <Block shape={SHAPE.legL} color={option.color} />
          <Block shape={SHAPE.legR} color={option.color} />
        </>
      );
    case 'hair':
      return <Block shape={SHAPE.hair} color={option.color} />;
    default:
      return null;
  }
}

// Overlays body -> pant -> shirt -> hair, in that stacking order, into one canvas.
function AvatarCanvas({ selection, className = '' }) {
  return (
    <View className={`relative ${className}`}>
      <PartLayer partKey="body" option={PARTS[0].options[selection.body]} />
      <PartLayer partKey="pant" option={PARTS[3].options[selection.pant]} />
      <PartLayer partKey="shirt" option={PARTS[2].options[selection.shirt]} />
      <PartLayer partKey="hair" option={PARTS[1].options[selection.hair]} />
    </View>
  );
}

// A single selectable swatch, isolating just that one part's shape.
function PartSwatch({ partKey, option, number, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        className={`w-16 h-16 rounded-lg border-[3px] border-ink overflow-hidden ${
          selected ? 'bg-primary-container' : 'bg-surface-container-lowest'
        }`}
      >
        <View className="relative flex-1 m-2">
          <PartLayer partKey={partKey} option={option} detail={false} />
        </View>
        {selected && (
          <View className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary items-center justify-center border-[2px] border-ink">
            <MaterialIcons name="check" size={10} color={tokens.colors['on-primary']} />
          </View>
        )}
      </View>
      <Text className="text-[10px] text-center font-label text-on-surface-variant mt-1">{number}</Text>
    </TouchableOpacity>
  );
}

// Matches design/AvatarCreator.html — step 3 of 3, finishes onboarding.
export default function AvatarCreatorScreen({ route }) {
  const { goal, heightCm, weightKg } = route.params;
  const [activePart, setActivePart] = useState('body');
  const [selection, setSelection] = useState({ body: 1, hair: 1, shirt: 0, pant: 0 });
  const [submitting, setSubmitting] = useState(false);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const activeDef = PARTS.find((p) => p.key === activePart);

  const finish = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        goal,
        heightCm,
        weightKg,
        // Server only persists hairStyle/skinTone today (shirt/pant equip
        // isn't wired up yet, see todo.md) — send everything anyway so it's
        // a no-op change on the client once the backend catches up.
        skinTone: PARTS[0].options[selection.body].id,
        hairStyle: PARTS[1].options[selection.hair].id,
        shirt: PARTS[2].options[selection.shirt].id,
        pant: PARTS[3].options[selection.pant].id,
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
        <AvatarCanvas selection={selection} className="w-40 h-52" />
      </ChibiSurface>

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

      <ChibiSurface className="p-4 mb-4">
        <Text className="font-label text-xs uppercase text-on-surface-variant mb-3">
          {activeDef.label} — {activeDef.options[selection[activeDef.key]].label}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {activeDef.options.map((option, i) => (
            <PartSwatch
              key={option.id}
              partKey={activeDef.key}
              option={option}
              number={i + 1}
              selected={selection[activeDef.key] === i}
              onPress={() => setSelection((s) => ({ ...s, [activeDef.key]: i }))}
            />
          ))}
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
