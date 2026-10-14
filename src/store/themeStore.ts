import Storage from 'expo-sqlite/kv-store';
import { Appearance } from 'react-native';
import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY = 'stonestreak.themeMode';

function readMode(): ThemeMode {
  try {
    const v = Storage.getItemSync(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // ignore storage errors, fall back to system
  }
  return 'system';
}

/** Tells Android which scheme the whole app should use (null = follow system) */
function applyMode(mode: ThemeMode) {
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}

const initial = readMode();
applyMode(initial);

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initial,
  setMode: (mode) => {
    applyMode(mode);
    try {
      Storage.setItemSync(KEY, mode);
    } catch {
      // ignore storage errors
    }
    set({ mode });
  },
}));
