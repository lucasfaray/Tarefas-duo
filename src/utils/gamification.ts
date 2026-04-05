import type { HabitLog, Task, Habit } from '../types';

// XP required to reach each level (cumulative)
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPForNextLevel(level: number): number {
  const idx = level; // threshold index = level (since level 1 = idx 0)
  return LEVEL_THRESHOLDS[idx] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getXPProgress(xp: number): { current: number; required: number; pct: number } {
  const level = getLevelFromXP(xp);
  const currentFloor = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextCeil = LEVEL_THRESHOLDS[level] ?? xp;
  const current = xp - currentFloor;
  const required = nextCeil - currentFloor;
  const pct = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;
  return { current, required, pct };
}

export const LEVEL_TITLES = [
  '', 'Novato', 'Aprendiz', 'Dedicado', 'Focado', 'Consistente',
  'Campeão', 'Mestre', 'Lendário', 'Imortal', 'Supremo',
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? 'Supremo';
}

export const RANK_ICONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

// Streak calculation
export function calculateStreak(logs: HabitLog[], habitId: string, userId: string): number {
  const userLogs = logs
    .filter(l => l.habitId === habitId && l.userId === userId)
    .map(l => l.date)
    .sort()
    .reverse();

  if (userLogs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let current = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = current.toISOString().split('T')[0];
    if (userLogs.includes(dateStr)) {
      streak++;
    } else if (i === 0) {
      // allow missing today
      current.setDate(current.getDate() - 1);
      continue;
    } else {
      break;
    }
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

// Points for a date range
export function pointsInRange(
  logs: HabitLog[],
  tasks: Task[],
  habits: Habit[],
  userId: string,
  from: Date,
  to: Date,
): number {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const habitPts = logs
    .filter(l => l.userId === userId && l.date >= fromStr && l.date <= toStr)
    .reduce((acc, l) => {
      const habit = habits.find(h => h.id === l.habitId);
      return acc + (habit ? habit.points * l.completedCount : 0);
    }, 0);

  const taskPts = tasks
    .filter(t =>
      t.completed &&
      t.completedBy === userId &&
      t.completedAt &&
      t.completedAt.split('T')[0] >= fromStr &&
      t.completedAt.split('T')[0] <= toStr,
    )
    .reduce((acc, t) => acc + t.points, 0);

  return habitPts + taskPts;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function startOfWeek(d: Date, startOn: 0 | 1 = 1): Date {
  const day = d.getDay();
  const diff = (day - startOn + 7) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
