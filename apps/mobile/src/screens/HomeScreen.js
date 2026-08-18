import { Pressable, ScrollView, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import tokens from '../theme/tokens';
import { useAppStore } from '../state/useAppStore';

// Matches design/HomeScreen.html's two primary CTA cards ("Today's Quest" /
// "Rank Match") — see the mapping decided with the user: run-tracking is the
// "Today's Quest" flow, the arm-swing/Flappy Bird game is "Rank Match"
// (async-competitive online mode).
export default function HomeScreen({ navigation }) {
  const profile = useAppStore((s) => s.profile);
  const xpForNext = (profile?.level ?? 1) * 100;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-headline text-on-background">Hey, {profile?.displayName} 👋</Text>
            <Text className="font-body text-on-surface-variant">Let's crush today's quest</Text>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1 bg-surface-container-lowest rounded-full px-3 py-1.5 border-[3px] border-ink">
              <MaterialIcons name="monetization-on" size={16} color={tokens.colors['tertiary-container']} />
              <Text className="font-label text-xs text-on-background">{profile?.coins ?? 0}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-surface-container-lowest rounded-full px-3 py-1.5 border-[3px] border-ink">
              <MaterialCommunityIcons name="diamond-stone" size={16} color={tokens.colors['primary-container']} />
              <Text className="font-label text-xs text-on-background">{profile?.gems ?? 0}</Text>
            </View>
          </View>
        </View>

        <ChibiSurface className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <Text className="font-headline-medium text-on-background">XP Progress</Text>
              <View className="bg-secondary-container rounded-full px-3 py-1 border-[3px] border-ink">
                <Text className="font-label text-xs text-on-secondary-container">LVL {profile?.level ?? 1}</Text>
              </View>
            </View>
            <Text className="text-primary font-label text-xs">{profile?.xp ?? 0} / {xpForNext} XP</Text>
          </View>
          <View className="h-3 bg-surface-container-high rounded-full border-[2px] border-ink overflow-hidden">
            <View
              className="h-full bg-primary-container"
              style={{ width: `${Math.min(100, ((profile?.xp ?? 0) / xpForNext) * 100)}%` }}
            />
          </View>
        </ChibiSurface>

        <ChibiButton
          className="p-4 items-start"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'run' })}
        >
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialCommunityIcons name="sword-cross" size={20} color={tokens.colors['on-primary-container']} />
            <Text className="text-lg font-headline text-on-primary-container">Today's Quest</Text>
          </View>
          <Text className="font-body text-on-primary-container">Track a run — GPS route, distance, pace</Text>
        </ChibiButton>

        <ChibiButton
          className="p-4 items-start"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'quest_game' })}
        >
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialIcons name="emoji-events" size={20} color={tokens.colors['on-primary-container']} />
            <Text className="text-lg font-headline text-on-primary-container">Rank Match</Text>
          </View>
          <Text className="font-body text-on-primary-container">Arm-swing arcade — compete for XP</Text>
        </ChibiButton>

        <View className="flex-row gap-3">
          {[
            { label: 'AI Buddy', icon: 'robot', family: 'community', screen: 'AIBuddyChat' },
            { label: 'Mood', icon: 'mood', family: 'material', screen: 'MoodTracker' },
            { label: 'Health Log', icon: 'restaurant', family: 'material', screen: 'HealthLog' },
          ].map((card) => (
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
