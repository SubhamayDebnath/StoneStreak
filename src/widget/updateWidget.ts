import { Platform } from 'react-native';

// Set when the native widget module is missing (Expo Go, or an old build), so we stop trying
let unavailable = false;

/** Redraws every StoneStreak widget on the home screen. Safe to call anywhere. */
export async function updateWidgets(): Promise<void> {
  if (Platform.OS !== 'android' || unavailable) return;
  try {
    // Loaded lazily, so a build without the native module never crashes the app
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { renderStoneStreak, WIDGET_NAME } = require('./StoneStreakWidget');
    /* eslint-enable @typescript-eslint/no-require-imports */
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: ({ width, height }: { width: number; height: number }) =>
        renderStoneStreak(width, height),
    });
  } catch {
    unavailable = true; // the widget is optional, never let it break the app
  }
}
