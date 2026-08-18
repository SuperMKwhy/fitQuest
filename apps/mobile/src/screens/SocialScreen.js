import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiSurface } from '../components/Chibi';
import { api } from '../api/client';
import tokens from '../theme/tokens';

// Combines design/Leaderboard.html + the AddFriend/FriendRequest/MyFriendScreen
// cluster into one "Social" tab (see design/design.md's nav-unification notes).
// Friends aren't implemented yet (see todo.md) — this shows the real, live
// leaderboard and a placeholder for friends.

// Rank 1-3 get a gold/silver/bronze accent, built entirely from existing
// tokens (no new hex values) — see design/Leaderboard.html's podium treatment.
const RANK_STYLE = {
  1: { badgeBg: 'bg-tertiary-container', badgeText: 'text-on-tertiary-container', ring: 'border-tertiary-container', avatarBg: 'bg-tertiary-container', avatarText: 'text-on-tertiary-container' },
  2: { badgeBg: 'bg-surface-container-high', badgeText: 'text-on-surface-variant', ring: 'border-outline', avatarBg: 'bg-surface-container-high', avatarText: 'text-on-surface-variant' },
  3: { badgeBg: 'bg-secondary-container', badgeText: 'text-on-secondary-container', ring: 'border-secondary-container', avatarBg: 'bg-secondary-container', avatarText: 'text-on-secondary-container' },
};

function InitialAvatar({ displayName, rank }) {
  const style = RANK_STYLE[rank];
  const initial = (displayName || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      className={`w-12 h-12 rounded-lg border-[3px] border-ink items-center justify-center ${style ? style.avatarBg : 'bg-surface-container'}`}
    >
      <Text className={`font-headline text-lg ${style ? style.avatarText : 'text-on-surface-variant'}`}>
        {initial}
      </Text>
    </View>
  );
}

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
        <Text className="text-2xl font-headline text-on-background mb-2">Leaderboard</Text>

        {leaderboard.map((entry) => {
          const style = RANK_STYLE[entry.rank];
          const isTopThree = Boolean(style);
          return (
            <ChibiSurface
              key={entry.userId}
              className={`p-3 flex-row items-center gap-3 ${isTopThree ? `border-[3px] ${style.ring}` : ''}`}
            >
              <View className="w-9 items-center">
                {entry.rank === 1 ? (
                  <MaterialIcons name="emoji-events" size={26} color={tokens.colors['tertiary-container']} />
                ) : (
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center border-[3px] border-ink ${
                      isTopThree ? style.badgeBg : 'bg-surface-container'
                    }`}
                  >
                    <Text
                      className={`font-label text-xs ${isTopThree ? style.badgeText : 'text-on-surface-variant'}`}
                    >
                      {entry.rank}
                    </Text>
                  </View>
                )}
              </View>
              <InitialAvatar displayName={entry.displayName} rank={entry.rank} />
              <View className="flex-1">
                <Text className="font-headline-medium text-on-background">{entry.displayName}</Text>
                <Text className="text-xs text-on-surface-variant">Level {entry.level}</Text>
              </View>
              <Text className="font-label text-primary">{entry.totalXp} XP</Text>
            </ChibiSurface>
          );
        })}

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
