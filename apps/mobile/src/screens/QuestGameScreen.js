import { useCallback, useRef } from 'react';
import ArmSwingGame from '../game/ArmSwingGame';
import { useAppStore } from '../state/useAppStore';

// Matches the "Rank Match" flow from design/Pre-GameReadyScreen.html +
// design/GameOverScreen.html — wraps the arm-swing/Flappy Bird game (see
// README's "Arm Swing Game" section for how the WebView bridge works) and
// reports the result to the backend as an async-competitive activity.
export default function QuestGameScreen({ navigation }) {
  const submitActivity = useAppStore((s) => s.submitActivity);
  const startedAtRef = useRef(Date.now());

  const handleScore = useCallback(
    async (score) => {
      const durationS = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      let earned = { xpEarned: 0, coinsEarned: 0 };
      try {
        const recorded = await submitActivity({ type: 'quest_game', durationS, score });
        earned = { xpEarned: recorded.xpEarned, coinsEarned: recorded.coinsEarned };
      } catch {
        // Backend unreachable — still show the score, just no XP/coins.
      }
      navigation.replace('GameOver', { score, ...earned });
    },
    [navigation, submitActivity]
  );

  return <ArmSwingGame onExit={() => navigation.goBack()} onScore={handleScore} />;
}
