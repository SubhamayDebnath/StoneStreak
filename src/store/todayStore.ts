import { AppState } from 'react-native';
import { create } from 'zustand';
import { todayKey } from '@/lib/date';

interface TodayState {
  /** "YYYY-MM-DD" for the current local day */
  today: string;
  refresh: () => void;
}

export const useTodayStore = create<TodayState>((set, get) => ({
  today: todayKey(),
  refresh: () => {
    const t = todayKey();
    if (t !== get().today) set({ today: t });
  },
}));

const refresh = () => useTodayStore.getState().refresh();

// While the app is open, check once a minute so the day rolls over at midnight.
// The timer only runs in the foreground, so nothing keeps running in the background.
let timer: ReturnType<typeof setInterval> | null = null;

function startTicking() {
  if (!timer) timer = setInterval(refresh, 60_000);
}

function stopTicking() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

if (AppState.currentState === 'active') startTicking();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    refresh(); // the day may have changed while the app was in the background
    startTicking();
  } else {
    stopTicking();
  }
});
