import { Tabs } from 'expo-router';
import {
  ChartPie,
  CircleCheck,
  LayoutGrid,
  Settings,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationTap } from '@/hooks/useNotificationTap';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useTheme } from '@/hooks/useTheme';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { ready, show, finish } = useOnboarding();
  useReminderSync();
  useNotificationTap();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 64 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => (
              <CircleCheck color={color} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color }) => (
              <LayoutGrid color={color} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color }) => (
              <ChartPie color={color} size={22} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Settings color={color} size={22} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>

      {(!ready || show) && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background },
          ]}
        >
          {show && <OnboardingScreen onDone={finish} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
