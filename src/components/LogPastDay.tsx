import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarPlus, Check, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/SectionLabel';
import { useTheme } from '@/hooks/useTheme';
import { isScheduledOn, toDateKey } from '@/lib/date';
import { errorMessage } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';

const NOTE_BEFORE_CREATED =
  'This date is before the habit was created. You can still log it, and it will count towards your stats.';
const NOTE_NOT_SCHEDULED =
  'This habit is not scheduled for this day of the week. Logging it will still count.';

export function LogPastDay({ habit }: { habit: Habit }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<Date | null>(null);

  const doneMap = useHabitStore((s) => s.done);
  const counts = useHabitStore((s) => s.counts);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const changeCount = useHabitStore((s) => s.changeCount);

  const isCount = habit.trackingType === 'count';
  const dateKey = picked ? toDateKey(picked) : '';
  const compositeKey = `${habit.id}|${dateKey}`;
  const complete = !!doneMap[compositeKey];
  const count = counts[compositeKey] ?? 0;

  const createdKey = habit.createdAt.slice(0, 10);
  const beforeCreated = picked ? dateKey < createdKey : false;
  const notScheduled = picked ? !isScheduledOn(habit, picked) : false;

  const openPicker = () => {
    haptics.light();
    const min = new Date(habit.createdAt);
    min.setFullYear(min.getFullYear() - 1);

    DateTimePickerAndroid.open({
      value: new Date(),
      mode: 'date',
      minimumDate: min,
      maximumDate: new Date(),
      onValueChange: (_event, date) => setPicked(date),
    });
  };

  const close = () => setPicked(null);

  const run = (action: Promise<unknown>) => {
    action.catch((e) => Alert.alert('Could not save', errorMessage(e)));
  };

  const dateLabel = picked
    ? picked.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <SectionLabel>MISSED A DAY?</SectionLabel>
      <Pressable
        onPress={openPicker}
        style={[
          styles.button,
          {
            backgroundColor: colors.cardSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        <CalendarPlus size={20} color={colors.primary} strokeWidth={2.2} />
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
          Log a past day
        </Text>
      </Pressable>

      <Modal
        visible={!!picked}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {habit.name}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
            {dateLabel}
          </Text>

          {beforeCreated && (
            <Text style={[styles.note, { color: colors.textSecondary }]}>
              {NOTE_BEFORE_CREATED}
            </Text>
          )}
          {notScheduled && (
            <Text style={[styles.note, { color: colors.textSecondary }]}>
              {NOTE_NOT_SCHEDULED}
            </Text>
          )}

          {isCount ? (
            <View style={styles.counter}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  run(changeCount(habit.id, dateKey, -1));
                }}
                disabled={count === 0}
                style={[
                  styles.round,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                    borderWidth: 1,
                    opacity: count === 0 ? 0.35 : 1,
                  },
                ]}
              >
                <Minus size={22} color={colors.text} />
              </Pressable>

              <View style={styles.countBox}>
                <Text style={[styles.countText, { color: colors.text }]}>
                  {count}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  of {habit.target}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  haptics.light();
                  run(changeCount(habit.id, dateKey, 1));
                }}
                style={[
                  styles.round,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Plus size={22} color={colors.text} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                haptics.light();
                run(toggleCompletion(habit.id, dateKey));
              }}
              style={[
                styles.check,
                {
                  backgroundColor: complete ? habit.color : colors.cardSubtle,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Check
                size={22}
                color={complete ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={{
                  color: complete ? '#FFFFFF' : colors.text,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {complete ? 'Done (tap to undo)' : 'Mark as done'}
              </Text>
            </Pressable>
          )}

          {/* Changes above are saved as you tap, so this only closes the sheet */}
          <Pressable
            onPress={() => {
              haptics.success();
              close();
            }}
            style={[styles.finish, { backgroundColor: colors.primary }]}
          >
            <Text
              style={{
                color: colors.onPrimary,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 15,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: '600' },
  note: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginVertical: 28,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBox: { alignItems: 'center', minWidth: 72 },
  countText: { fontSize: 40, fontWeight: '600' },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    marginVertical: 24,
  },
  finish: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 15,
  },
});
