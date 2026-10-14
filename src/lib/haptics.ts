import * as ExpoHaptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

function safe(fn: () => Promise<void>) {
  if (!useSettingsStore.getState().hapticsEnabled) return;
  try {
    fn().catch(() => {});
  } catch {
    // ignore haptic failures
  }
}

export const haptics = {
  light: () =>
    safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)),
  heavy: () =>
    safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy)),
  selection: () => safe(() => ExpoHaptics.selectionAsync()),
  success: () =>
    safe(() =>
      ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Success,
      ),
    ),
  warning: () =>
    safe(() =>
      ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Warning,
      ),
    ),
};
