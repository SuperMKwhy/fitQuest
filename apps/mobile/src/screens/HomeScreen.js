import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { AvatarCanvas, selectionFromProfile } from '../components/Avatar';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

const QUICK_ACTIONS = [
  { label: 'AI Buddy', icon: 'robot', family: 'community', screen: 'AIBuddyChat' },
  { label: 'Mood', icon: 'mood', family: 'material', screen: 'MoodTracker' },
  { label: 'Health Log', icon: 'restaurant', family: 'material', screen: 'HealthLog' },
];

// Matches design/HomeScreen.html's two primary CTA cards ("Today's Quest" /
// "Rank Match") — see the mapping decided with the user: run-tracking is the
// "Today's Quest" flow, the arm-swing/Flappy Bird game is "Rank Match"
// (async-competitive online mode).
function QuestCard({ icon, iconFamily = 'material', title, subtitle, onPress, className }) {
  const Icon = iconFamily === 'community' ? MaterialCommunityIcons : MaterialIcons;
  return (
    <ChibiButton className={`p-4 flex-row items-center justify-between ${className}`} onPress={onPress}>
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-12 h-12 rounded-lg border-[3px] border-ink bg-surface-container-lowest items-center justify-center">
          <Icon name={icon} size={26} color={tokens.colors['on-background']} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-headline text-on-primary-container uppercase">{title}</Text>
          <Text className="font-body text-[13px] text-on-primary-container opacity-90 leading-tight">{subtitle}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="bg-tertiary-container rounded-lg border-[3px] border-ink px-3 py-1.5">
          <Text className="font-headline-medium text-[13px] text-on-tertiary-container uppercase">Start</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={tokens.colors['on-primary-container']} />
      </View>
    </ChibiButton>
  );
}

export default function HomeScreen({ navigation }) {
  const profile = useAppStore((s) => s.profile);
  const xpForNext = (profile?.level ?? 1) * 100;
  const avatarSelection = selectionFromProfile(profile);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-margin-mobile gap-md" showsVerticalScrollIndicator={false}>
        {/* Top status bar */}
        <View className="flex-row justify-between items-center">
          <ChibiSurface className="flex-row items-center gap-2 p-2 flex-1 max-w-[220px]">
            <View className="w-11 h-11 rounded-full border-[3px] border-ink overflow-hidden bg-surface-container">
              <AvatarCanvas selection={avatarSelection} className="w-full h-full -mt-2" />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-on-background" numberOfLines={1}>
                {profile?.displayName ?? 'Hero'}
              </Text>
              <Text className="font-label text-[11px] text-primary-container">LEVEL {profile?.level ?? 1}</Text>
              <View className="h-2 bg-surface-container-high rounded-full border-[2px] border-ink mt-1 overflow-hidden">
                <View
                  className="h-full bg-primary-container"
                  style={{ width: `${Math.min(100, ((profile?.xp ?? 0) / xpForNext) * 100)}%` }}
                />
              </View>
            </View>
          </ChibiSurface>

          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1.5 bg-surface-container-lowest rounded-xl border-[3px] border-ink px-3 py-1.5">
              <MaterialIcons name="monetization-on" size={18} color={tokens.colors['tertiary-container']} />
              <Text className="font-label text-xs text-on-background">{profile?.coins ?? 0}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-surface-container-lowest rounded-xl border-[3px] border-ink px-3 py-1.5">
              <MaterialCommunityIcons name="diamond-stone" size={18} color={tokens.colors['primary-container']} />
              <Text className="font-label text-xs text-on-background">{profile?.gems ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* Center stage — hero avatar over the dashboard background */}
        <View className="relative rounded-xl overflow-hidden h-72 items-center justify-end">
          <Image
            source={require('../../assets/home/dashboard-bg.png')}
            className="absolute inset-0 w-full h-full opacity-20"
            resizeMode="cover"
          />
          <View className="absolute inset-0" pointerEvents="none">
            <Text className="absolute text-tertiary-container text-xl" style={{ top: '12%', left: '10%' }}>
              ✦
            </Text>
            <Text className="absolute text-primary-container text-lg" style={{ top: '28%', right: '12%' }}>
              ✦
            </Text>
            <Text className="absolute text-tertiary-container text-base" style={{ bottom: '38%', left: '6%' }}>
              ✦
            </Text>
            <Text className="absolute text-primary-container text-lg" style={{ top: '55%', right: '20%' }}>
              ✦
            </Text>
          </View>

          <View className="absolute top-2 right-2">
            <ChibiSurface className="items-center px-2 py-2 relative">
              <View className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary border-[2px] border-ink items-center justify-center">
                <Text className="text-on-secondary text-[10px] font-label">!</Text>
              </View>
              <MaterialIcons name="card-giftcard" size={20} color={tokens.colors['tertiary-container']} />
              <Text className="font-label text-[9px] text-center mt-1 uppercase">Daily{'\n'}Reward</Text>
            </ChibiSurface>
          </View>

          <AvatarCanvas selection={avatarSelection} className="w-40 h-[260px]" />
        </View>

        {/* Energy — decorative for now; there's no stamina mechanic wired up
            server-side yet, this just reads as "ready to play". */}
        <ChibiSurface className="flex-row items-center gap-3 p-2 rounded-full">
          <View className="w-10 h-10 rounded-full border-[3px] border-ink bg-primary-container items-center justify-center">
            <MaterialIcons name="bolt" size={20} color={tokens.colors['on-primary-container']} />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-baseline mb-1">
              <Text className="font-headline-medium text-on-background uppercase text-sm">Energy</Text>
              <Text className="font-label text-xs text-primary">100%</Text>
            </View>
            <View className="h-3 bg-surface-container-high rounded-full border-[2px] border-ink overflow-hidden">
              <View className="h-full w-full bg-primary-container" />
            </View>
          </View>
        </ChibiSurface>

        <QuestCard
          icon="assignment"
          title="Today's Quest"
          subtitle="Complete quests and earn awesome rewards!"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'run' })}
        />
        <QuestCard
          icon="sword-cross"
          iconFamily="community"
          title="Rank Match"
          subtitle="Compete with players and climb the ranks!"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'quest_game' })}
        />

        <View className="flex-row gap-3">
          {QUICK_ACTIONS.map((card) => (
            <Pressable key={card.screen} className="flex-1" onPress={() => navigation.navigate(card.screen)}>
              <ChibiSurface className="p-3 items-center">
                {card.family === 'community' ? (
                  <MaterialCommunityIcons name={card.icon} size={24} color={tokens.colors.primary} />
                ) : (
                  <MaterialIcons name={card.icon} size={24} color={tokens.colors.primary} />
                )}
                <Text className="text-xs font-headline-medium text-on-background text-center mt-1">{card.label}</Text>
              </ChibiSurface>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
