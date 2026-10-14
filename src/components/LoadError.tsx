import { TriangleAlert } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  message: string;
  onRetry: () => void;
}

/** Shown instead of a blank screen when the database cannot be opened. */
export function LoadError({ message, onRetry }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TriangleAlert size={40} color={colors.danger} />
      <Text style={[styles.title, { color: colors.text }]}>
        Could not open your data
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
