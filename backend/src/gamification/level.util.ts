const XP_PER_LEVEL = 100;

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

// Progression simple et linéaire : 100 XP par niveau, niveau 1 à 0 XP.
export function computeLevel(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = safeXp % XP_PER_LEVEL;

  return {
    level,
    currentLevelXp,
    xpForNextLevel: XP_PER_LEVEL - currentLevelXp,
    progressPercent: Math.round((currentLevelXp / XP_PER_LEVEL) * 100),
  };
}
