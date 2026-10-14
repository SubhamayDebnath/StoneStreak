import { buildHabitHeat, buildOverallHeat } from '@/lib/analytics';
import { getCompletions, getHabits, initDb } from '@/lib/db';
import { getCurrentStreak, getDayProgress } from '@/lib/streak';
import { toDateKey } from '@/lib/date';
import { isComplete } from '@/lib/tracking';
import { HeatCell } from '@/types';

export const TOP_HABITS = 5;

export interface WidgetHabit {
  id: string;
  icon: string;
  color: string;
  /** Finished for today */
  doneToday: boolean;
}

export interface WidgetData {
  progress: { done: number; total: number };
  /** The habits done most often over the last 30 days */
  top: WidgetHabit[];
  /** Overall heat map, oldest first, ending today */
  heat: HeatCell[];
  hasHabits: boolean;
}

/**
 * Reads straight from the database, so it also works when the app is closed
 * (the widget runs in a background task without the Zustand stores).
 */
export async function loadWidgetData(heatDays: number): Promise<WidgetData> {
  await initDb();
  const [all, completions] = await Promise.all([getHabits(), getCompletions()]);

  const habits = all.filter((h) => !h.archived);
  const byId = new Map(habits.map((h) => [h.id, h]));

  const counts: Record<string, number> = {};
  const done: Record<string, true> = {};
  for (const c of completions) {
    const habit = byId.get(c.habitId);
    if (!habit) continue;
    const k = `${c.habitId}|${c.date}`;
    counts[k] = c.count;
    if (isComplete(habit, c.count)) done[k] = true;
  }

  const now = new Date();
  const todayKey = toDateKey(now);

  // "Regular" = completed on the most days in the last 30 days, then longest current streak
  const ranked = habits
    .map((h) => {
      const cells = buildHabitHeat(h, counts, 30, now);
      const daysDone = cells.filter(
        (c) => c.scheduled > 0 && c.done >= c.scheduled,
      ).length;
      return { h, daysDone, streak: getCurrentStreak(h, done, now) };
    })
    .sort(
      (a, b) =>
        b.daysDone - a.daysDone ||
        b.streak - a.streak ||
        a.h.sortOrder - b.h.sortOrder,
    )
    .slice(0, TOP_HABITS);

  return {
    progress: getDayProgress(habits, done, now),
    top: ranked.map(({ h }) => ({
      id: h.id,
      icon: h.icon,
      color: h.color,
      doneToday: !!done[`${h.id}|${todayKey}`],
    })),
    heat: buildOverallHeat(habits, done, heatDays, now),
    hasHabits: habits.length > 0,
  };
}
