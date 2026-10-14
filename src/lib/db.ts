import * as SQLite from 'expo-sqlite';
import { DEFAULT_HABIT_ICON } from '@/lib/habitIcons';
import { Completion, Habit, NewHabit, Weekday } from '@/types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('db-stonestreak.db').catch((e) => {
      dbPromise = null; // let the next call try again
      throw e;
    });
  }
  return dbPromise;
}

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
) {
  const cols = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  if (!cols.some((c) => c.name === column)) {
    await db.execAsync(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
}

let initPromise: Promise<void> | null = null;

/** Safe to call many times: the setup runs once (and again only after a failure). */
export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = runInit().catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}

async function runInit(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '${DEFAULT_HABIT_ICON}',
      tracking_type TEXT NOT NULL DEFAULT 'check',
      target INTEGER NOT NULL DEFAULT 1,
      schedule_type TEXT NOT NULL DEFAULT 'daily',
      weekdays TEXT NOT NULL DEFAULT '[]',
      reminder_time TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS completions (
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
  `);

  // Migrations for databases created by older versions of the app
  await addColumnIfMissing(
    db,
    'habits',
    'icon',
    `TEXT NOT NULL DEFAULT '${DEFAULT_HABIT_ICON}'`,
  );
  await addColumnIfMissing(
    db,
    'habits',
    'description',
    `TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    db,
    'habits',
    'tracking_type',
    `TEXT NOT NULL DEFAULT 'check'`,
  );
  await addColumnIfMissing(
    db,
    'habits',
    'target',
    'INTEGER NOT NULL DEFAULT 1',
  );
  await addColumnIfMissing(
    db,
    'habits',
    'archived',
    'INTEGER NOT NULL DEFAULT 0',
  );
  await addColumnIfMissing(
    db,
    'completions',
    'count',
    'INTEGER NOT NULL DEFAULT 1',
  );
}

/* ---------- row mapping ---------- */

interface HabitRow {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  tracking_type: string;
  target: number;
  schedule_type: 'daily' | 'weekdays';
  weekdays: string;
  reminder_time: string | null;
  sort_order: number;
  created_at: string;
  archived: number | null;
}

function parseWeekdays(raw: string): Weekday[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value)) {
      return value.filter(
        (d): d is Weekday => Number.isInteger(d) && d >= 0 && d <= 6,
      );
    }
  } catch {
    // damaged value, treat as no days
  }
  return [];
}

function rowToHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    color: r.color,
    icon: r.icon || DEFAULT_HABIT_ICON,
    trackingType: r.tracking_type === 'count' ? 'count' : 'check',
    target: r.target >= 1 ? r.target : 1,
    scheduleType: r.schedule_type === 'weekdays' ? 'weekdays' : 'daily',
    weekdays: parseWeekdays(r.weekdays),
    reminderTime: r.reminder_time,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    archived: r.archived === 1,
  };
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const INSERT_HABIT_SQL = `INSERT INTO habits
  (id, name, description, color, icon, tracking_type, target,
   schedule_type, weekdays, reminder_time, sort_order, created_at, archived)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function habitParams(h: Habit) {
  return [
    h.id,
    h.name,
    h.description,
    h.color,
    h.icon,
    h.trackingType,
    h.target,
    h.scheduleType,
    JSON.stringify(h.weekdays),
    h.reminderTime,
    h.sortOrder,
    h.createdAt,
    h.archived ? 1 : 0,
  ];
}

/* ---------- habits ---------- */

/** Returns active AND archived habits. The store splits them. */
export async function getHabits(): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitRow>(
    'SELECT * FROM habits ORDER BY sort_order ASC, created_at ASC',
  );
  return rows.map(rowToHabit);
}

export async function insertHabit(input: NewHabit): Promise<Habit> {
  const db = await getDb();
  const max = await db.getFirstAsync<{ m: number | null }>(
    'SELECT MAX(sort_order) AS m FROM habits',
  );
  const habit: Habit = {
    ...input,
    id: makeId(),
    sortOrder: (max?.m ?? -1) + 1,
    createdAt: new Date().toISOString(),
    archived: false,
  };
  await db.runAsync(INSERT_HABIT_SQL, habitParams(habit));
  return habit;
}

export async function updateHabit(
  id: string,
  patch: Partial<NewHabit>,
): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<HabitRow>(
    'SELECT * FROM habits WHERE id = ?',
    id,
  );
  if (!row) return;
  const cur = rowToHabit(row);
  const next = { ...cur, ...patch };
  await db.runAsync(
    `UPDATE habits
       SET name = ?, description = ?, color = ?, icon = ?, tracking_type = ?, target = ?,
           schedule_type = ?, weekdays = ?, reminder_time = ?
     WHERE id = ?`,
    next.name,
    next.description,
    next.color,
    next.icon,
    next.trackingType,
    next.target,
    next.scheduleType,
    JSON.stringify(next.weekdays),
    next.reminderTime,
    id,
  );
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions WHERE habit_id = ?', id);
    await db.runAsync('DELETE FROM habits WHERE id = ?', id);
  });
}

/** Hides a habit. Its completions are kept. */
export async function archiveHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE habits SET archived = 1 WHERE id = ?', id);
}

/** Brings a habit back at the end of the active list. Returns its new sort order. */
export async function restoreHabit(id: string): Promise<number> {
  const db = await getDb();
  const max = await db.getFirstAsync<{ m: number | null }>(
    'SELECT MAX(sort_order) AS m FROM habits WHERE archived = 0',
  );
  const next = (max?.m ?? -1) + 1;
  await db.runAsync(
    'UPDATE habits SET archived = 0, sort_order = ? WHERE id = ?',
    next,
    id,
  );
  return next;
}

export async function saveOrder(orderedIds: string[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync(
        'UPDATE habits SET sort_order = ? WHERE id = ?',
        i,
        orderedIds[i],
      );
    }
  });
}

/* ---------- completions ---------- */

export async function getCompletions(): Promise<Completion[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    habit_id: string;
    date: string;
    count: number;
  }>('SELECT habit_id, date, count FROM completions');
  return rows.map((r) => ({
    habitId: r.habit_id,
    date: r.date,
    count: r.count >= 1 ? r.count : 1,
  }));
}

/** Saves how many times a habit was done on a day. 0 removes the entry. */
export async function setCompletionCount(
  habitId: string,
  date: string,
  count: number,
): Promise<void> {
  const db = await getDb();
  if (count <= 0) {
    await db.runAsync(
      'DELETE FROM completions WHERE habit_id = ? AND date = ?',
      habitId,
      date,
    );
    return;
  }
  await db.runAsync(
    'INSERT OR REPLACE INTO completions (habit_id, date, count) VALUES (?, ?, ?)',
    habitId,
    date,
    count,
  );
}

/* ---------- bulk (export / import / delete all) ---------- */

export async function replaceAllData(
  habits: Habit[],
  completions: Completion[],
): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions');
    await db.runAsync('DELETE FROM habits');
    for (const h of habits) {
      await db.runAsync(INSERT_HABIT_SQL, habitParams(h));
    }
    for (const c of completions) {
      await db.runAsync(
        'INSERT OR REPLACE INTO completions (habit_id, date, count) VALUES (?, ?, ?)',
        c.habitId,
        c.date,
        c.count,
      );
    }
  });
}

export async function deleteAllData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions');
    await db.runAsync('DELETE FROM habits');
  });
}
