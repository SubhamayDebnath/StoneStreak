import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export function SettingsRow({
  icon,
  iconBg,
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
        disabled && { opacity: 0.5 },
        divider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor:
              iconBg || (danger ? colors.danger : colors.primary),
          },
        ]}
      >
        {icon}
      </View>
      <View style={styles.texts}>
        <Text
          style={[
            styles.title,
            { color: danger ? colors.danger : colors.text },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: danger ? colors.danger : colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
});
