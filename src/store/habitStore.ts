import { create } from 'zustand';
import * as db from '@/lib/db';
import { isComplete } from '@/lib/tracking';
import { Completion, Habit, NewHabit } from '@/types';

const key = (habitId: string, date: string) => `${habitId}|${date}`;

interface HabitState {
  /** Active habits only (Today, Habits tab and reminders use this) */
  habits: Habit[];
  /** Archived habits: hidden, history kept */
  archived: Habit[];
  /** "habitId|YYYY-MM-DD" -> how many times it was logged */
  counts: Record<string, number>;
  /** "habitId|YYYY-MM-DD" -> true when the habit is complete that day */
  done: Record<string, true>;
  loaded: boolean;

  init: () => Promise<void>;
  addHabit: (input: NewHabit) => Promise<Habit>;
  editHabit: (id: string, patch: Partial<NewHabit>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedIds: string[]) => Promise<void>;
  /** Sets the count for a day. Returns true if the habit is complete afterwards. */
  setCount: (habitId: string, date: string, count: number) => Promise<boolean>;
  /** Adds delta (+1 / -1) to the count. Returns true if complete afterwards. */
  changeCount: (
    habitId: string,
    date: string,
    delta: number,
  ) => Promise<boolean>;
  /** Checkbox habits: returns true if the habit is now completed. */
  toggleCompletion: (habitId: string, date: string) => Promise<boolean>;
  getCompletionList: () => Completion[];
  replaceAll: (habits: Habit[], completions: Completion[]) => Promise<void>;
  clearAll: () => Promise<void>;
}

function splitHabits(all: Habit[]) {
  return {
    habits: all.filter((h) => !h.archived),
    archived: all.filter((h) => h.archived),
  };
}

/** Pass ALL habits (active + archived) so archived history is kept in the maps */
function buildMaps(habits: Habit[], list: Completion[]) {
  const byId = new Map(habits.map((h) => [h.id, h]));
  const counts: Record<string, number> = {};
  const done: Record<string, true> = {};
  for (const c of list) {
    const habit = byId.get(c.habitId);
    if (!habit) continue;
    const k = key(c.habitId, c.date);
    counts[k] = c.count;
    if (isComplete(habit, c.count)) done[k] = true;
  }
  return { counts, done };
}

function dropHistory(
  id: string,
  counts: Record<string, number>,
  done: Record<string, true>,
) {
  const nextCounts = { ...counts };
  const nextDone = { ...done };
  const prefix = id + '|';
  for (const k of Object.keys(nextCounts)) {
    if (k.startsWith(prefix)) {
      delete nextCounts[k];
      delete nextDone[k];
    }
  }
  return { counts: nextCounts, done: nextDone };
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  archived: [],
  counts: {},
  done: {},
  loaded: false,

  init: async () => {
    await db.initDb();
    const [all, completions] = await Promise.all([
      db.getHabits(),
      db.getCompletions(),
    ]);
    set({ ...splitHabits(all), ...buildMaps(all, completions), loaded: true });
  },

  addHabit: async (input) => {
    const habit = await db.insertHabit(input);
    set((s) => ({ habits: [...s.habits, habit] }));
    return habit;
  },

  editHabit: async (id, patch) => {
    await db.updateHabit(id, patch);
    set((s) => {
      const habits = s.habits.map((h) =>
        h.id === id ? { ...h, ...patch } : h,
      );
      const habit = habits.find((h) => h.id === id);
      const done = { ...s.done };
      // The goal or type may have changed, so re-check every logged day
      if (habit) {
        const prefix = id + '|';
        for (const k of Object.keys(s.counts)) {
          if (!k.startsWith(prefix)) continue;
          if (isComplete(habit, s.counts[k])) done[k] = true;
          else delete done[k];
        }
      }
      return { habits, done };
    });
  },

  /** Permanent delete (works for active and archived habits) */
  removeHabit: async (id) => {
    await db.deleteHabit(id);
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      archived: s.archived.filter((h) => h.id !== id),
      ...dropHistory(id, s.counts, s.done),
    }));
  },

  archiveHabit: async (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return;
    await db.archiveHabit(id);
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      archived: [{ ...habit, archived: true }, ...s.archived],
    }));
  },

  restoreHabit: async (id) => {
    const habit = get().archived.find((h) => h.id === id);
    if (!habit) return;
    const sortOrder = await db.restoreHabit(id);
    set((s) => ({
      archived: s.archived.filter((h) => h.id !== id),
      habits: [...s.habits, { ...habit, archived: false, sortOrder }],
    }));
  },

  reorderHabits: async (orderedIds) => {
    const previous = get().habits;
    const byId = new Map(previous.map((h) => [h.id, h]));
    const seen = new Set<string>();
    const ordered: Habit[] = [];

    for (const id of orderedIds) {
      const h = byId.get(id);
      if (h && !seen.has(id)) {
        seen.add(id);
        ordered.push(h);
      }
    }
    // A habit that is not in the list (e.g. added while dragging) must never disappear
    for (const h of previous) if (!seen.has(h.id)) ordered.push(h);

    const next = ordered.map((h, i) => ({ ...h, sortOrder: i }));
    set({ habits: next });

    try {
      await db.saveOrder(next.map((h) => h.id));
    } catch (e) {
      set({ habits: previous });
      throw e;
    }
  },

  setCount: async (habitId, date, count) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return false;

    const next = Math.max(0, Math.min(99999, Math.floor(count)));
    const k = key(habitId, date);
    const complete = isComplete(habit, next);

    // Remember this day's old values so a failed save can be undone
    const prevCount = get().counts[k];
    const prevDone = !!get().done[k];

    set((s) => {
      const counts = { ...s.counts };
      const done = { ...s.done };
      if (next > 0) counts[k] = next;
      else delete counts[k];
      if (complete) done[k] = true;
      else delete done[k];
      return { counts, done };
    });

    try {
      await db.setCompletionCount(habitId, date, next);
    } catch (e) {
      set((s) => {
        const counts = { ...s.counts };
        const done = { ...s.done };
        if (prevCount === undefined) delete counts[k];
        else counts[k] = prevCount;
        if (prevDone) done[k] = true;
        else delete done[k];
        return { counts, done };
      });
      throw e;
    }
    return complete;
  },

  changeCount: async (habitId, date, delta) => {
    const current = get().counts[key(habitId, date)] ?? 0;
    return get().setCount(habitId, date, current + delta);
  },

  toggleCompletion: async (habitId, date) => {
    const current = get().counts[key(habitId, date)] ?? 0;
    return get().setCount(habitId, date, current > 0 ? 0 : 1);
  },

  getCompletionList: () =>
    Object.entries(get().counts).map(([k, count]) => {
      const [habitId, date] = k.split('|');
      return { habitId, date, count };
    }),

  replaceAll: async (habits, completions) => {
    await db.replaceAllData(habits, completions);
    const all = await db.getHabits();
    set({ ...splitHabits(all), ...buildMaps(all, completions) });
  },

  clearAll: async () => {
    await db.deleteAllData();
    set({ habits: [], archived: [], counts: {}, done: {} });
  },
}));
