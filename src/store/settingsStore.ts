import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';

const HAPTICS_KEY = 'stonestreak.hapticsEnabled';
const REMINDERS_KEY = 'stonestreak.remindersEnabled';

function readFlag(key: string): boolean {
  try {
    if (Storage.getItemSync(key) === '0') return false;
  } catch {
    // ignore storage errors, default to enabled
  }
  return true;
}

function writeFlag(key: string, value: boolean) {
  try {
    Storage.setItemSync(key, value ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}

interface SettingsState {
  hapticsEnabled: boolean;
  setHapticsEnabled: (value: boolean) => void;
  remindersEnabled: boolean;
  setRemindersEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: readFlag(HAPTICS_KEY),
  setHapticsEnabled: (value) => {
    writeFlag(HAPTICS_KEY, value);
    set({ hapticsEnabled: value });
  },

  remindersEnabled: readFlag(REMINDERS_KEY),
  setRemindersEnabled: (value) => {
    writeFlag(REMINDERS_KEY, value);
    set({ remindersEnabled: value });
  },
}));
