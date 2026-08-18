import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChibiButton, ChibiSurface } from '../components/Chibi';
import tokens from '../theme/tokens';

// A single stat row inside the results card: icon badge, uppercase label,
// and a large bold value — matches the Score/Time rows in
// design/GameOverScreen.html's "Stats Container".
function StatRow({ icon, iconColor, label, value, suffix }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-dashed border-outline-variant">
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-full bg-surface-container-high border-[2px] border-ink items-center justify-center">
          <MaterialIcons name={icon} size={16} color={iconColor} />
        </View>
        <Text className="font-label text-on-surface uppercase">{label}</Text>
      </View>
      <View className="flex-row items-baseline gap-1">
        <Text className="font-headline text-2xl text-on-background">{value}</Text>
        {suffix ? <Text className="font-label text-xs text-on-surface-variant">{suffix}</Text> : null}
      </View>
    </View>
  );
}

// Matches design/GameOverScreen.html.
export default function GameOverScreen({ navigation, route }) {
  const { score, xpEarned, coinsEarned } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-6">
      {/* Drop-shadowed "GAME OVER" headline — stacked ink layer behind a
          secondary-container layer, approximating the mockup's
          drop-shadow(2px 2px 0 #1c1b1b) CSS filter. */}
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="star" size={24} color={tokens.colors.secondary} />
        <View className="items-center justify-center">
          <Text
            className="absolute text-4xl font-headline text-ink uppercase tracking-wider"
            style={{ top: 3, left: 3 }}
          >
            Game Over
          </Text>
          <Text className="text-4xl font-headline text-secondary-container uppercase tracking-wider">
            Game Over
          </Text>
        </View>
        <MaterialIcons name="star" size={24} color={tokens.colors.secondary} />
      </View>

      <ChibiSurface className="w-full max-w-sm p-4 gap-1">
        <StatRow icon="star" iconColor={tokens.colors['on-tertiary-container']} label="Score" value={score} suffix="pts" />
        <StatRow icon="bolt" iconColor={tokens.colors.primary} label="XP" value={`+${xpEarned}`} />
        <StatRow icon="monetization-on" iconColor={tokens.colors.tertiary} label="Coins" value={`+${coinsEarned}`} />
      </ChibiSurface>

      <ChibiButton
        className="w-full max-w-sm py-4"
        onPress={() => navigation.replace('QuestGame')}
      >
        <Text className="font-headline uppercase text-on-primary-container">Play Again</Text>
      </ChibiButton>

      <ChibiButton
        className="w-full max-w-sm py-4"
        onPress={() => navigation.navigate('Main', { screen: 'Social' })}
      >
        <Text className="font-headline uppercase text-on-primary-container">View Rank</Text>
      </ChibiButton>
    </SafeAreaView>
  );
}
