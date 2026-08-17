// Same xp-per-level curve the original client-only mock used (App.js:
// `xpForNext = level * 100`), now applied server-side so it's authoritative.
export function xpForLevel(level: number): number {
  return level * 100;
}

export function applyXpGain(current: { level: number; xp: number }, gained: number) {
  let { level, xp } = current;
  xp += gained;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }
  return { level, xp };
}

// Simple, tunable reward formulas for the two activity types. Revisit once
// real playtesting data exists (see todo.md).
export function rewardsForActivity(input: {
  type: 'run' | 'quest_game';
  distanceM?: number | null;
  durationS: number;
  score?: number | null;
}) {
  if (input.type === 'run') {
    const km = (input.distanceM ?? 0) / 1000;
    const xpEarned = Math.round(km * 20 + input.durationS / 60);
    const coinsEarned = Math.round(km * 15);
    return { xpEarned: Math.max(xpEarned, 1), coinsEarned: Math.max(coinsEarned, 1) };
  }
  // quest_game (arm-swing / Flappy Bird)
  const xpEarned = Math.max(Math.round((input.score ?? 0) * 2), 5);
  const coinsEarned = Math.max(Math.round((input.score ?? 0) * 1.5), 3);
  return { xpEarned, coinsEarned };
}
