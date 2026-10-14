import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { LoadError } from '@/components/LoadError';
import { useTheme } from '@/hooks/useTheme';
import { errorMessage } from '@/lib/format';
import { useHabitStore } from '@/store/habitStore';

// Keep the splash visible until the database is ready
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 300 });

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const loaded = useHabitStore((s) => s.loaded);
  const init = useHabitStore((s) => s.init);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      init().catch((e) => {
        console.warn('DB init failed', e);
        setError(errorMessage(e));
      }),
    [init],
  );

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setError(null);
    load();
  }, [load]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  // Hide the splash when the data is ready, or when loading failed (never stay stuck on it)
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (error) return <LoadError message={error} onRetry={retry} />;
  if (!loaded) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          // One header look for every screen
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: '800',
          },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="habit"
          options={{ presentation: 'modal', title: 'Habit' }}
        />
      </Stack>
    </>
  );
}
