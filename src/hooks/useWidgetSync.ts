import { useEffect } from 'react';
import { updateWidgets } from '@/widget/updateWidget';
import { useHabitStore } from '@/store/habitStore';
import { useTodayStore } from '@/store/todayStore';

/** Redraws the home screen widget after habits or check-ins change. Call once, high in the app. */
export function useWidgetSync() {
  const habits = useHabitStore((s) => s.habits);
  const done = useHabitStore((s) => s.done);
  const counts = useHabitStore((s) => s.counts);
  const todayKey = useTodayStore((s) => s.today);

  useEffect(() => {
    // Wait a moment so quick taps (e.g. +1 +1 +1) cause only one redraw
    const t = setTimeout(() => {
      updateWidgets();
    }, 600);
    return () => clearTimeout(t);
  }, [habits, done, counts, todayKey]);
}
