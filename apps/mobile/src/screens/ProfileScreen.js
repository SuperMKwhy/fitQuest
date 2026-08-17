import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import { useAppStore } from '../state/useAppStore';

export default function ProfileScreen() {
  const profile = useAppStore((s) => s.profile);
  const logout = useAppStore((s) => s.logout);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View className="items-center py-4">
          <View className="w-20 h-20 rounded-full bg-secondary-container border-[3px] border-ink items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-on-secondary-container">
              {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-on-background">{profile?.displayName}</Text>
          <Text className="text-on-surface-variant">Level {profile?.level}</Text>
        </View>

        <ChibiSurface className="p-4">
          {[
            ['Total XP', profile?.totalXp ?? 0],
            ['Coins', profile?.coins ?? 0],
            ['Gems', profile?.gems ?? 0],
            ['Goal', profile?.goal?.replaceAll('_', ' ') ?? '—'],
          ].map(([label, val]) => (
            <View key={label} className="flex-row justify-between py-2 border-b border-outline-variant">
              <Text className="text-on-surface-variant">{label}</Text>
              <Text className="font-bold text-on-background">{val}</Text>
            </View>
          ))}
        </ChibiSurface>

        <ChibiButton className="py-4" onPress={logout}>
          <Text className="font-bold uppercase text-on-primary-container">Log out</Text>
        </ChibiButton>
      </ScrollView>
    </SafeAreaView>
  );
}
