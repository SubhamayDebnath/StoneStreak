import { Habit, Weekday } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date -> "YYYY-MM-DD" */
export function toDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" -> local Date at midnight */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Is this habit scheduled on the given date? */
export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.scheduleType === 'daily') return true;
  return habit.weekdays.includes(date.getDay() as Weekday);
}

export const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** "HH:mm" -> { hour, minute } */
export function parseTime(t: string): { hour: number; minute: number } {
  const [hour, minute] = t.split(':').map(Number);
  return { hour, minute };
}

export function formatTime(t: string): string {
  const { hour, minute } = parseTime(t);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${pad(minute)} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** "Every day" or "Mon, Wed, Fri" (always in week order) */
export function scheduleLabel(
  habit: Pick<Habit, 'scheduleType' | 'weekdays'>,
): string {
  if (habit.scheduleType === 'daily') return 'Every day';
  if (habit.weekdays.length === 0) return 'No days selected';
  return [...habit.weekdays]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_NAMES[d].slice(0, 3))
    .join(', ');
}
