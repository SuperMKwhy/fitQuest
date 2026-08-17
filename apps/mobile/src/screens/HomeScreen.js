import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
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
            <Text className="text-xl font-bold text-on-background">Hey, {profile?.displayName} 👋</Text>
            <Text className="text-on-surface-variant">Let's crush today's quest</Text>
          </View>
          <View className="bg-secondary-container rounded-full px-4 py-2 border-[3px] border-ink">
            <Text className="font-bold text-on-secondary-container">LVL {profile?.level ?? 1}</Text>
          </View>
        </View>

        <ChibiSurface className="p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="font-bold text-on-background">⚡ XP Progress</Text>
            <Text className="text-primary font-bold">{profile?.xp ?? 0} / {xpForNext} XP</Text>
          </View>
          <View className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <View
              className="h-2 bg-primary-container"
              style={{ width: `${Math.min(100, ((profile?.xp ?? 0) / xpForNext) * 100)}%` }}
            />
          </View>
        </ChibiSurface>

        <ChibiButton
          className="p-4 items-start"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'run' })}
        >
          <Text className="text-lg font-bold text-on-primary-container">Today's Quest 🗡️</Text>
          <Text className="text-on-primary-container">Track a run — GPS route, distance, pace</Text>
        </ChibiButton>

        <ChibiButton
          className="p-4 items-start"
          onPress={() => navigation.navigate('PreGameReady', { mode: 'quest_game' })}
        >
          <Text className="text-lg font-bold text-on-primary-container">Rank Match 🏆</Text>
          <Text className="text-on-primary-container">Arm-swing arcade — compete for XP</Text>
        </ChibiButton>

        <View className="flex-row gap-3">
          {[
            { label: 'AI Buddy', emoji: '🤖', screen: 'AIBuddyChat' },
            { label: 'Mood', emoji: '🙂', screen: 'MoodTracker' },
            { label: 'Health Log', emoji: '🍎', screen: 'HealthLog' },
          ].map((card) => (
            <Pressable key={card.screen} className="flex-1" onPress={() => navigation.navigate(card.screen)}>
              <ChibiSurface className="p-3 items-center">
                <Text className="text-2xl mb-1">{card.emoji}</Text>
                <Text className="text-xs font-bold text-on-background text-center">{card.label}</Text>
              </ChibiSurface>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
