import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/lib/haptics';

export function Fab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      accessibilityLabel="Add habit"
      style={[styles.fab, { backgroundColor: colors.primary }]}
    >
      <Plus size={28} color={colors.onPrimary} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
