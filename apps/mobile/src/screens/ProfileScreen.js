import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { AvatarCanvas, selectionFromProfile } from '../components/Avatar';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

const GOAL_LABELS = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  improve_health: 'Improve Health',
};

// No design/ mockup exists for this screen (only Personal.html, which is the
// onboarding "Your Stats" step already used by OnboardingStatsScreen) — this
// is an original layout built from the same tokens/components as the rest
// of the app rather than a ported mockup.
function StatTile({ icon, iconFamily = 'material', label, value, className = '' }) {
  const Icon = iconFamily === 'community' ? MaterialCommunityIcons : MaterialIcons;
  return (
    <ChibiSurface className={`flex-1 p-3 items-center ${className}`}>
      <Icon name={icon} size={20} color={tokens.colors.primary} />
      <Text className="font-headline text-lg text-on-background mt-1" numberOfLines={1}>
        {value}
      </Text>
      <Text className="font-label text-[10px] text-on-surface-variant uppercase text-center">{label}</Text>
    </ChibiSurface>
  );
}

export default function ProfileScreen() {
  const profile = useAppStore((s) => s.profile);
  const logout = useAppStore((s) => s.logout);
  const avatarSelection = selectionFromProfile(profile);
  const xpForNext = (profile?.level ?? 1) * 100;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-margin-mobile gap-md" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-primary-container text-xl">✦</Text>
            <Text className="font-headline text-2xl text-on-background uppercase">Profile</Text>
            <Text className="text-primary-container text-xl">✦</Text>
          </View>
        </View>

        {/* Hero card — avatar + identity + XP */}
        <ChibiSurface className="items-center p-4">
          <View className="w-32 h-52 mb-2">
            <AvatarCanvas selection={avatarSelection} className="w-full h-full" />
          </View>
          <Text className="text-xl font-headline text-on-background" numberOfLines={1}>
            {profile?.displayName ?? 'Hero'}
          </Text>
          <View className="bg-secondary-container rounded-full px-3 py-1 border-[3px] border-ink mt-1 mb-3">
            <Text className="font-label text-xs text-on-secondary-container">LEVEL {profile?.level ?? 1}</Text>
          </View>
          <View className="w-full">
            <View className="flex-row justify-between mb-1">
              <Text className="font-label text-[11px] text-on-surface-variant uppercase">XP Progress</Text>
              <Text className="font-label text-[11px] text-primary">
                {profile?.xp ?? 0} / {xpForNext}
              </Text>
            </View>
            <View className="h-3 bg-surface-container-high rounded-full border-[2px] border-ink overflow-hidden">
              <View
                className="h-full bg-primary-container"
                style={{ width: `${Math.min(100, ((profile?.xp ?? 0) / xpForNext) * 100)}%` }}
              />
            </View>
          </View>
        </ChibiSurface>

        {/* Stat tiles */}
        <View className="flex-row gap-3">
          <StatTile icon="stars" label="Total XP" value={profile?.totalXp ?? 0} />
          <StatTile icon="monetization-on" label="Coins" value={profile?.coins ?? 0} />
          <StatTile icon="diamond-stone" iconFamily="community" label="Gems" value={profile?.gems ?? 0} />
        </View>

        {/* Goal + body stats */}
        <ChibiSurface className="p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <MaterialIcons name="flag" size={18} color={tokens.colors['primary-container']} />
            <Text className="font-label text-[12px] uppercase text-on-surface-variant">Current Goal</Text>
          </View>
          <Text className="font-headline text-lg text-on-background uppercase mb-4">
            {GOAL_LABELS[profile?.goal] ?? '—'}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <MaterialIcons name="accessibility-new" size={14} color={tokens.colors['primary-container']} />
                <Text className="font-label text-[10px] uppercase text-on-surface-variant">Height</Text>
              </View>
              <Text className="font-headline text-on-background">
                {profile?.heightCm ? `${profile.heightCm} cm` : '—'}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <MaterialIcons name="monitor-weight" size={14} color={tokens.colors['primary-container']} />
                <Text className="font-label text-[10px] uppercase text-on-surface-variant">Weight</Text>
              </View>
              <Text className="font-headline text-on-background">
                {profile?.weightKg ? `${profile.weightKg} kg` : '—'}
              </Text>
            </View>
          </View>
        </ChibiSurface>

        <ChibiButton className="py-4 bg-error-container" onPress={logout}>
          <Text className="font-headline uppercase text-on-error-container">Log out</Text>
        </ChibiButton>
      </ScrollView>
    </SafeAreaView>
  );
}
