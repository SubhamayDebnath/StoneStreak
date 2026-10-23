import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as LegacyFS from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import {
  Archive,
  Bell,
  ChevronRight,
  Download,
  Info,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Vibrate,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsRow } from '@/components/SettingsRow';
import { useTheme } from '@/hooks/useTheme';
import { buildBackup, parseBackup } from '@/lib/backup';
import { errorMessage, plural } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { requestReminderPermission } from '@/lib/notifications';
import { useHabitStore } from '@/store/habitStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ThemeMode } from '@/store/themeStore';
import { showToast } from '@/lib/toast';

const BACKUP_PREFIX = 'stonestreak-backup-';
const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'System', Icon: Smartphone },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

async function readPickedFile(uri: string): Promise<string> {
  try {
    return await LegacyFS.readAsStringAsync(uri);
  } catch {
    const response = await fetch(uri);
    return await response.text();
  }
}

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const habits = useHabitStore((s) => s.habits);
  const archived = useHabitStore((s) => s.archived);
  const doneMap = useHabitStore((s) => s.done);
  const getCompletionList = useHabitStore((s) => s.getCompletionList);
  const replaceAll = useHabitStore((s) => s.replaceAll);
  const clearAll = useHabitStore((s) => s.clearAll);

  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const remindersEnabled = useSettingsStore((s) => s.remindersEnabled);
  const setRemindersEnabled = useSettingsStore((s) => s.setRemindersEnabled);

  const [busy, setBusy] = useState(false);

  const completionCount = useMemo(() => Object.keys(doneMap).length, [doneMap]);
  const reminderCount = useMemo(
    () => habits.filter((h) => !!h.reminderTime).length,
    [habits],
  );
  const totalHabits = habits.length + archived.length;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  /* ---------- haptics ---------- */
  const onToggleHaptics = (value: boolean) => {
    setHapticsEnabled(value);
    if (value) haptics.light();
    showToast(value ? 'Haptics enabled' : 'Haptics disabled');
  };

  /* ---------- reminders ---------- */
  const onToggleReminders = async (value: boolean) => {
    if (!value) {
      haptics.light();
      setRemindersEnabled(false);
      showToast('Reminders paused');
      return;
    }

    const granted = await requestReminderPermission();
    if (!granted) {
      Alert.alert(
        'Notifications are off',
        'Allow notifications for StoneStreak in your phone settings to get reminders.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    haptics.light();
    setRemindersEnabled(true);
    showToast('Reminders enabled');
  };

  /* ---------- export ---------- */
  const onExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'This device cannot share files.');
        return;
      }

      for (const item of Paths.cache.list()) {
        if (item instanceof File && item.name.startsWith(BACKUP_PREFIX)) {
          try {
            item.delete();
          } catch {
            // ignore
          }
        }
      }

      const backup = buildBackup([...habits, ...archived], getCompletionList());
      const stamp = new Date().toISOString().slice(0, 10);
      const file = new File(Paths.cache, `${BACKUP_PREFIX}${stamp}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(backup, null, 2));

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export StoneStreak data',
      });
      haptics.success();
      showToast('Backup file generated');
    } catch (e) {
      Alert.alert('Export failed', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  /* ---------- import ---------- */
  const onImport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;

      const asset = res.assets[0];
      if ((asset.size ?? 0) > MAX_IMPORT_BYTES) {
        Alert.alert(
          'File too large',
          'This does not look like a StoneStreak backup.',
        );
        return;
      }

      const text = await readPickedFile(asset.uri);
      const { habits: newHabits, completions } = parseBackup(text);

      if (newHabits.length === 0) {
        Alert.alert('Nothing to import', 'This backup contains no habits.');
        return;
      }

      Alert.alert(
        'Replace all data?',
        `This backup has ${plural(newHabits.length, 'habit')} and ${plural(
          completions.length,
          'completion',
        )}. Your current data will be replaced.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              setBusy(true);
              try {
                await replaceAll(newHabits, completions);
                haptics.success();
                showToast('Data imported successfully');
              } catch (e) {
                Alert.alert('Import failed', errorMessage(e));
              } finally {
                setBusy(false);
              }
            },
          },
        ],
      );
    } catch (e) {
      Alert.alert('Import failed', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  /* ---------- delete all ---------- */
  const onDeleteAll = () => {
    if (busy) return;
    haptics.warning();
    Alert.alert(
      'Delete all data?',
      'All habits, streaks, and tracking history will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await clearAll();
              haptics.heavy();
              showToast('All data erased');
            } catch (e) {
              Alert.alert('Delete failed', errorMessage(e));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen
      title="Settings"
      right={busy ? <ActivityIndicator color={colors.primary} /> : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 4,
          paddingBottom: insets.bottom + 110,
        }}
      >
        {/* Appearance */}
        <SectionLabel first>APPEARANCE</SectionLabel>
        <View
          style={[
            styles.segment,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const active = mode === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  haptics.selection();
                  setMode(value);
                }}
                style={[
                  styles.segmentItem,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Icon size={16} color={active ? '#FFFFFF' : colors.text} />
                <Text
                  style={{
                    color: active ? '#FFFFFF' : colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preferences */}
        <SectionLabel>PREFERENCES</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon={<Bell size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.primary}
            title="Reminders"
            subtitle={
              remindersEnabled
                ? `${plural(reminderCount, 'reminder')} scheduled`
                : 'All reminders are paused'
            }
            right={
              <Switch
                value={remindersEnabled}
                onValueChange={onToggleReminders}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#FFFFFF"
              />
            }
            divider
          />
          <SettingsRow
            icon={<Vibrate size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg="#8B5CF6"
            title="Haptic feedback"
            subtitle="Vibrate when you tap, complete or reorder"
            right={
              <Switch
                value={hapticsEnabled}
                onValueChange={onToggleHaptics}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Data */}
        <SectionLabel>YOUR DATA</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon={<Archive size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg="#64748B"
            title="Archived habits"
            subtitle={
              archived.length === 0
                ? 'Nothing archived yet'
                : `${plural(archived.length, 'habit')} hidden, history kept`
            }
            onPress={() => router.push('/archived')}
            right={<ChevronRight size={18} color={colors.textSecondary} />}
            divider
          />
          <SettingsRow
            icon={<Download size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg="#10B981"
            title="Export data"
            subtitle={`${plural(totalHabits, 'habit')} · save a backup file`}
            onPress={onExport}
            disabled={busy}
            divider
          />
          <SettingsRow
            icon={<Upload size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg="#F59E0B"
            title="Import data"
            subtitle="Restore from a backup file"
            onPress={onImport}
            disabled={busy}
          />
        </View>

        {/* Danger */}
        <SectionLabel>DANGER ZONE</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon={<Trash2 size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg={colors.danger}
            title="Delete all data"
            subtitle="Remove every habit and its history"
            onPress={onDeleteAll}
            disabled={busy || (totalHabits === 0 && completionCount === 0)}
            danger
          />
        </View>

        {/* About */}
        <SectionLabel>ABOUT</SectionLabel>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon={<Info size={18} color="#FFFFFF" strokeWidth={2.4} />}
            iconBg="#71717A"
            title="StoneStreak"
            subtitle="All data is stored offline on this device"
            right={
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                v{version}
              </Text>
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
