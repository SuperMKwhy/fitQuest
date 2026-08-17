import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChibiSurface } from '../components/Chibi';
import { api } from '../api/client';

// Combines design/Leaderboard.html + the AddFriend/FriendRequest/MyFriendScreen
// cluster into one "Social" tab (see design/design.md's nav-unification notes).
// Friends aren't implemented yet (see todo.md) — this shows the real, live
// leaderboard and a placeholder for friends.
export default function SocialScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .getLeaderboard()
      .then(setLeaderboard)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <Text className="text-2xl font-bold text-on-background mb-2">Leaderboard</Text>

        {leaderboard.map((entry) => (
          <ChibiSurface key={entry.userId} className="p-3 flex-row items-center gap-3">
            <Text className="w-8 text-center font-bold text-on-surface-variant">#{entry.rank}</Text>
            <View className="flex-1">
              <Text className="font-bold text-on-background">{entry.displayName}</Text>
              <Text className="text-xs text-on-surface-variant">Level {entry.level}</Text>
            </View>
            <Text className="font-bold text-primary">{entry.totalXp} XP</Text>
          </ChibiSurface>
        ))}

        {!loading && leaderboard.length === 0 && (
          <Text className="text-on-surface-variant text-center py-8">No one on the board yet — be the first!</Text>
        )}

        <View className="mt-6">
          <Text className="text-lg font-bold text-on-background mb-2">Friends</Text>
          <ChibiSurface className="p-4">
            <Text className="text-on-surface-variant">Coming soon.</Text>
          </ChibiSurface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
