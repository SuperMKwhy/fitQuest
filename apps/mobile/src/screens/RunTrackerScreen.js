import { useCallback } from 'react';
import RunTracker from '../game/RunTracker';
import { useAppStore } from '../state/useAppStore';

export default function RunTrackerScreen({ navigation }) {
  const submitActivity = useAppStore((s) => s.submitActivity);

  const handleFinish = useCallback(
    async ({ distanceM, elapsedS }) => {
      let earned = { xpEarned: 0, coinsEarned: 0 };
      try {
        const recorded = await submitActivity({ type: 'run', distanceM, durationS: elapsedS });
        earned = { xpEarned: recorded.xpEarned, coinsEarned: recorded.coinsEarned };
      } catch {
        // Backend unreachable — still show the run's own stats, just no XP/coins.
      }
      navigation.replace('WorkoutSummary', { distanceM, elapsedS, ...earned });
    },
    [navigation, submitActivity]
  );

  return <RunTracker onExit={() => navigation.goBack()} onFinish={handleFinish} />;
}
