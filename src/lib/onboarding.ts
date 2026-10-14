import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stonestreak:onboarding-seen:v1';

/** True until the person has finished or skipped onboarding once. */
export async function shouldShowOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) !== '1';
  } catch {
    return true;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // ignore; onboarding will simply show again next launch
  }
}
