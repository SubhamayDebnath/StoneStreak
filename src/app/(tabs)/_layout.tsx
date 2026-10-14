import { Tabs } from 'expo-router';
import {
  ChartPie,
  CircleCheck,
  LayoutGrid,
  Settings,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useNotificationTap } from '@/hooks/useNotificationTap';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useTheme } from '@/hooks/useTheme';
import { useWidgetSync } from '@/hooks/useWidgetSync';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { ready, show, finish } = useOnboarding();
  useReminderSync();
  useNotificationTap();
  useWidgetSync();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false, // each tab draws its own title with <Screen>
          freezeOnBlur: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <CircleCheck color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color, size }) => (
              <LayoutGrid color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <ChartPie color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>

      {/* Covers the tabs while the flag loads and while onboarding is showing */}
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
