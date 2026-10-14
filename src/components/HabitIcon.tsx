import { StyleSheet, View } from 'react-native';
import { HABIT_ICON_COMPONENTS, normalizeIcon } from '@/lib/habitIcons';

interface Props {
  name?: string | null;
  color: string;
  size?: number;
}

/** Round colored bubble with the habit icon inside. */
export function HabitIcon({ name, color, size = 44 }: Props) {
  const Icon = HABIT_ICON_COMPONENTS[normalizeIcon(name)];

  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: color + '26', // ~15% opacity of the habit color
        },
      ]}
    >
      <Icon size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignItems: 'center', justifyContent: 'center' },
});
