import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Makes the row tappable. Leave undefined for static rows or rows with a control. */
  onPress?: () => void;
  /** Control shown at the right side, e.g. a Switch or a value label */
  right?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  /** Draw a thin line under the row */
  divider?: boolean;
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  disabled,
  danger,
  divider,
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      android_ripple={onPress ? { color: colors.border } : undefined}
      style={[
        styles.row,
        disabled && { opacity: 0.6 },
        divider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {icon}
      <View style={styles.texts}>
        <Text
          style={[
            styles.title,
            { color: danger ? colors.danger : colors.text },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  texts: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 1 },
});
