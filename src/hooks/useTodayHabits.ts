import { useMemo } from 'react';
import { fromDateKey } from '@/lib/date';
import {
  getCurrentStreak,
  getDayProgress,
  getHabitsForDate,
} from '@/lib/streak';
import { useHabitStore } from '@/store/habitStore';
import { useTodayStore } from '@/store/todayStore';
import { Habit } from '@/types';

export function useTodayHabits() {
  const dateKey = useTodayStore((s) => s.today);
  const habits = useHabitStore((s) => s.habits);
  const done = useHabitStore((s) => s.done);

  return useMemo(() => {
    const date = fromDateKey(dateKey);
    const list: Habit[] = getHabitsForDate(habits, date);
    const progress = getDayProgress(habits, done, date);

    const streaks: Record<string, number> = {};
    for (const h of list) streaks[h.id] = getCurrentStreak(h, done, date);

    return {
      date,
      dateKey,
      list,
      streaks,
      done: progress.done,
      total: progress.total,
      hasAnyHabits: habits.length > 0,
    };
  }, [dateKey, habits, done]);
}
