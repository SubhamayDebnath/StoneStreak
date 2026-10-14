import { useEffect } from 'react';
import { syncReminders } from '@/lib/notifications';
import { useHabitStore } from '@/store/habitStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTodayStore } from '@/store/todayStore';

/** Keeps scheduled notifications in step with the habits. Call once, high in the app. */
export function useReminderSync() {
  const habits = useHabitStore((s) => s.habits);
  const done = useHabitStore((s) => s.done);
  const remindersEnabled = useSettingsStore((s) => s.remindersEnabled);
  const todayKey = useTodayStore((s) => s.today);

  // Only the fields that affect reminders, so reordering doesn't reschedule
  const habitSig = JSON.stringify(
    habits
      .filter((h) => h.reminderTime)
      .map((h) => [
        h.id,
        h.name,
        h.reminderTime,
        h.scheduleType,
        h.weekdays,
        h.trackingType,
        h.target,
      ]),
  );

  // Which reminder habits are done today, so completing one skips today's reminder
  const doneTodaySig = habits
    .filter((h) => h.reminderTime && done[`${h.id}|${todayKey}`])
    .map((h) => h.id)
    .join(',');

  useEffect(() => {
    const t = setTimeout(() => {
      syncReminders(habits, remindersEnabled, done).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitSig, doneTodaySig, remindersEnabled, todayKey]);
}
