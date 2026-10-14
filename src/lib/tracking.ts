import { Habit } from '@/types';

/** Is the habit complete for a day, given how many times it was logged? */
export function isComplete(
  habit: Pick<Habit, 'trackingType' | 'target'>,
  count: number,
): boolean {
  if (habit.trackingType === 'count') return count >= Math.max(1, habit.target);
  return count >= 1;
}
