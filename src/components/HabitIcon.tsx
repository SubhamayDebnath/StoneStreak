import { StyleSheet, View } from 'react-native';
import { HABIT_ICON_COMPONENTS, normalizeIcon } from '@/lib/habitIcons';

interface Props {
  name?: string | null;
  color: string;
  size?: number;
}

/** Round solid colored bubble with a crisp white icon inside. */
export function HabitIcon({ name, color, size = 44 }: Props) {
  const Icon = HABIT_ICON_COMPONENTS[normalizeIcon(name)];

  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor: color,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.18)',
        },
      ]}
    >
      <Icon size={Math.round(size * 0.52)} color="#FFFFFF" strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
