import { addDays, fromDateKey, isScheduledOn, toDateKey } from '@/lib/date';
import { Habit, HeatCell } from '@/types';

type DoneMap = Record<string, true>;

const isDoneOn = (done: DoneMap, habitId: string, date: string) =>
  !!done[`${habitId}|${date}`];

/** Local midnight of the day the habit was created. */
function startDate(habit: Habit): Date {
  return fromDateKey(toDateKey(new Date(habit.createdAt)));
}

/**
 * Current streak = consecutive scheduled days completed, counting back from today.
 * - Days the habit isn't scheduled are skipped (they don't break the streak).
 * - If today is scheduled but not done yet, the streak isn't broken (day isn't over).
 */
export function getCurrentStreak(
  habit: Habit,
  done: DoneMap,
  today: Date = new Date(),
): number {
  const start = startDate(habit);
  let streak = 0;
  let cursor = fromDateKey(toDateKey(today));
  let isToday = true;

  while (cursor >= start) {
    if (isScheduledOn(habit, cursor)) {
      const completed = isDoneOn(done, habit.id, toDateKey(cursor));
      if (completed) {
        streak++;
      } else if (!isToday) {
        break;
      }
    }
    isToday = false;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive scheduled days completed, since the habit was created. */
export function getBestStreak(
  habit: Habit,
  done: DoneMap,
  today: Date = new Date(),
): number {
  const end = fromDateKey(toDateKey(today));
  let cursor = startDate(habit);
  let best = 0;
  let run = 0;

  while (cursor <= end) {
    if (isScheduledOn(habit, cursor)) {
      if (isDoneOn(done, habit.id, toDateKey(cursor))) {
        run++;
        if (run > best) best = run;
      } else if (toDateKey(cursor) !== toDateKey(end)) {
        // a missed day breaks the run (today doesn't count as missed yet)
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

/** Percent (0-100) of scheduled days completed since creation. */
export function getCompletionRate(
  habit: Habit,
  done: DoneMap,
  today: Date = new Date(),
): number {
  const end = fromDateKey(toDateKey(today));
  let cursor = startDate(habit);
  let scheduled = 0;
  let completed = 0;

  while (cursor <= end) {
    if (isScheduledOn(habit, cursor)) {
      scheduled++;
      if (isDoneOn(done, habit.id, toDateKey(cursor))) completed++;
    }
    cursor = addDays(cursor, 1);
  }
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

/** Habits scheduled for a given date. */
export function getHabitsForDate(habits: Habit[], date: Date): Habit[] {
  const key = toDateKey(date);
  return habits.filter(
    (h) => isScheduledOn(h, date) && toDateKey(new Date(h.createdAt)) <= key,
  );
}

/** Today's progress, used by the Today screen. */
export function getDayProgress(
  habits: Habit[],
  done: DoneMap,
  date: Date = new Date(),
): { done: number; total: number } {
  const list = getHabitsForDate(habits, date);
  const key = toDateKey(date);
  const completed = list.filter((h) => isDoneOn(done, h.id, key)).length;
  return { done: completed, total: list.length };
}

/** 0 = nothing/not scheduled, 1-4 = increasing completion. */
export function heatLevel(cell: HeatCell): 0 | 1 | 2 | 3 | 4 {
  if (cell.scheduled === 0 || cell.done === 0) return 0;
  const ratio = cell.done / cell.scheduled;
  if (ratio >= 1) return 4;
  if (ratio >= 0.66) return 3;
  if (ratio >= 0.33) return 2;
  return 1;
}
