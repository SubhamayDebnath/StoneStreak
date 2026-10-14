import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { Bell, Check, Hash, Minus, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/SectionLabel';
import { useTheme } from '@/hooks/useTheme';
import {
  formatTime,
  parseTime,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
} from '@/lib/date';
import { errorMessage } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { DEFAULT_HABIT_ICON, HABIT_ICONS } from '@/lib/habitIcons';
import { useHabitStore } from '@/store/habitStore';
import { habitPalette } from '@/theme';
import { ScheduleType, TrackingType, Weekday } from '@/types';

const DEFAULT_TIME = '09:00';
const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const MAX_TARGET = 9999;

export function HabitEditorScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existing = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const addHabit = useHabitStore((s) => s.addHabit);
  const editHabit = useHabitStore((s) => s.editHabit);

  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [trackingType, setTrackingType] = useState<TrackingType>(
    existing?.trackingType ?? 'check',
  );
  const [targetText, setTargetText] = useState(String(existing?.target ?? 1));
  const [color, setColor] = useState(existing?.color ?? habitPalette[0]);
  const [icon, setIcon] = useState(existing?.icon ?? DEFAULT_HABIT_ICON);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    existing?.scheduleType ?? 'daily',
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    existing?.weekdays?.length ? existing.weekdays : [1, 2, 3, 4, 5],
  );
  const [reminderOn, setReminderOn] = useState(!!existing?.reminderTime);
  const [time, setTime] = useState(existing?.reminderTime ?? DEFAULT_TIME);
  const [saving, setSaving] = useState(false);

  const targetNum = parseInt(targetText, 10);
  const targetValid = Number.isInteger(targetNum) && targetNum >= 1;

  const stepTarget = (delta: number) => {
    haptics.light();
    const current = targetValid ? targetNum : 1;
    const next = Math.min(MAX_TARGET, Math.max(1, current + delta));
    setTargetText(String(next));
  };

  const toggleDay = (d: Weekday) => {
    haptics.light();
    setWeekdays((cur) =>
      cur.includes(d)
        ? cur.filter((x) => x !== d)
        : ([...cur, d].sort((a, b) => a - b) as Weekday[]),
    );
  };

  const openTimePicker = () => {
    const { hour, minute } = parseTime(time);
    const value = new Date();
    value.setHours(hour, minute, 0, 0);

    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      is24Hour: false,
      onValueChange: (_event, picked) => {
        const hh = String(picked.getHours()).padStart(2, '0');
        const mm = String(picked.getMinutes()).padStart(2, '0');
        setTime(`${hh}:${mm}`);
      },
    });
  };

  const canSave =
    name.trim().length > 0 &&
    (scheduleType === 'daily' || weekdays.length > 0) &&
    (trackingType === 'check' || targetValid);

  // Has the person typed or changed anything worth keeping?
  const isDirty =
    isEdit && existing
      ? name.trim() !== existing.name ||
        description.trim() !== existing.description ||
        color !== existing.color ||
        icon !== existing.icon ||
        trackingType !== existing.trackingType ||
        (trackingType === 'count' && targetNum !== existing.target) ||
        scheduleType !== existing.scheduleType ||
        (scheduleType === 'weekdays' &&
          weekdays.join() !==
            [...existing.weekdays].sort((a, b) => a - b).join()) ||
        reminderOn !== !!existing.reminderTime ||
        (reminderOn && time !== existing.reminderTime)
      : name.trim() !== '' || description.trim() !== '';

  // Set just before we leave on purpose (after saving, or after "Discard")
  const allowLeave = useRef(false);

  // Ask before throwing away changes (header Close, swipe and the Android back button).
  // The listener is removed again by the cleanup function when this screen closes.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (allowLeave.current || !isDirty) return;
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes on this habit.',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              allowLeave.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
  }, [navigation, isDirty]);

  const onClose = () => {
    haptics.light();
    router.back();
  };

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        trackingType,
        target: trackingType === 'count' ? Math.min(MAX_TARGET, targetNum) : 1,
        scheduleType,
        weekdays: scheduleType === 'weekdays' ? weekdays : [],
        reminderTime: reminderOn ? time : null,
      };
      if (isEdit && existing) await editHabit(existing.id, data);
      else await addHabit(data);
      haptics.success();
      allowLeave.current = true;
      router.back();
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? 'Edit habit' : 'New habit',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={onClose} hitSlop={10}>
              <Text
                style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}
              >
                Close
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={onSave}
              disabled={!canSave || saving}
              hitSlop={10}
            >
              <Text
                style={{
                  color: canSave ? colors.primary : colors.textSecondary,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Save
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Name */}
        <SectionLabel>NAME</SectionLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Drink water"
          placeholderTextColor={colors.textSecondary}
          maxLength={60}
          autoFocus={!isEdit}
          returnKeyType="done"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />

        {/* Description */}
        <SectionLabel>DESCRIPTION</SectionLabel>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional. Why this habit matters to you"
          placeholderTextColor={colors.textSecondary}
          maxLength={200}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.multiline,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />

        {/* Type */}
        <SectionLabel>TYPE</SectionLabel>
        <View style={[styles.segment, { backgroundColor: colors.card }]}>
          {(['check', 'count'] as TrackingType[]).map((t) => {
            const active = trackingType === t;
            const textColor = active ? colors.onPrimary : colors.text;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  haptics.light();
                  setTrackingType(t);
                }}
                style={[
                  styles.segmentItem,
                  styles.segmentRow,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                {t === 'check' ? (
                  <Check size={16} color={textColor} strokeWidth={3} />
                ) : (
                  <Hash size={16} color={textColor} strokeWidth={3} />
                )}
                <Text style={{ color: textColor, fontWeight: '600' }}>
                  {t === 'check' ? 'Checkbox' : 'Count'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {trackingType === 'check'
            ? 'Mark it done once a day.'
            : 'Count up to a daily goal, like 8 glasses of water. You can go above the goal.'}
        </Text>

        {/* Daily goal (count only) */}
        {trackingType === 'count' && (
          <View
            style={[
              styles.card,
              styles.goalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.cardRow}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Daily goal
              </Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => stepTarget(-1)}
                  hitSlop={8}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <Minus size={18} color={colors.text} />
                </Pressable>
                <TextInput
                  value={targetText}
                  onChangeText={(t) =>
                    setTargetText(t.replace(/[^0-9]/g, '').slice(0, 4))
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  selectTextOnFocus
                  style={[
                    styles.targetInput,
                    {
                      color: targetValid ? colors.text : colors.danger,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <Pressable
                  onPress={() => stepTarget(1)}
                  hitSlop={8}
                  style={[styles.stepBtn, { borderColor: colors.border }]}
                >
                  <Plus size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Icon */}
        <SectionLabel>ICON</SectionLabel>
        <View style={styles.icons}>
          {HABIT_ICONS.map(({ name: iconName, label, Icon }) => {
            const active = icon === iconName;
            return (
              <Pressable
                key={iconName}
                onPress={() => {
                  haptics.light();
                  setIcon(iconName);
                }}
                accessibilityLabel={label}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: active ? color : colors.card,
                    borderColor: active ? color : colors.border,
                  },
                ]}
              >
                <Icon
                  size={22}
                  color={active ? '#FFFFFF' : colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Color */}
        <SectionLabel>COLOR</SectionLabel>
        <View style={styles.colors}>
          {habitPalette.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                haptics.light();
                setColor(c);
              }}
              style={[styles.swatch, { backgroundColor: c }]}
            >
              {color === c && (
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Schedule */}
        <SectionLabel>REPEAT</SectionLabel>
        <View style={[styles.segment, { backgroundColor: colors.card }]}>
          {(['daily', 'weekdays'] as ScheduleType[]).map((t) => {
            const active = scheduleType === t;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  haptics.light();
                  setScheduleType(t);
                }}
                style={[
                  styles.segmentItem,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.onPrimary : colors.text,
                    fontWeight: '600',
                  }}
                >
                  {t === 'daily' ? 'Every day' : 'Selected days'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {scheduleType === 'weekdays' && (
          <View style={styles.days}>
            {ALL_DAYS.map((d) => {
              const active = weekdays.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(d)}
                  accessibilityLabel={WEEKDAY_NAMES[d]}
                  style={[
                    styles.day,
                    {
                      backgroundColor: active ? color : colors.card,
                      borderColor: active ? color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : colors.text,
                      fontWeight: '700',
                    }}
                  >
                    {WEEKDAY_SHORT[d]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Reminder */}
        <SectionLabel>REMINDER</SectionLabel>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardRow}>
            <View style={styles.inline}>
              <Bell size={18} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Remind me
              </Text>
            </View>
            <Switch
              value={reminderOn}
              onValueChange={(v) => {
                haptics.light();
                setReminderOn(v);
              }}
              trackColor={{ true: color, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>

          {reminderOn && (
            <Pressable
              onPress={openTimePicker}
              style={[
                styles.cardRow,
                styles.timeRow,
                { borderTopColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                Time
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                {formatTime(time)}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 0 },
  hint: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
  },
  multiline: { minHeight: 84, fontSize: 16 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  goalCard: { marginTop: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInput: {
    minWidth: 64,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: 14, paddingHorizontal: 14 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  timeRow: { borderTopWidth: StyleSheet.hairlineWidth },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
