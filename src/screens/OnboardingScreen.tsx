import { Bell, Flame, LucideIcon, Target } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/lib/haptics';
import { habitPalette } from '@/theme';

type Page = { key: string; title: string; text: string; Icon: LucideIcon };

const PAGES: Page[] = [
  {
    key: 'build',
    title: 'Build better habits',
    text: 'Create habits, pick a color and choose the days that fit your life.',
    Icon: Target,
  },
  {
    key: 'streak',
    title: 'Keep your streak alive',
    text: 'Check habits off every day and watch your streaks and heat map grow.',
    Icon: Flame,
  },
  {
    key: 'remind',
    title: 'Never forget',
    text: 'Set a reminder time for each habit and stay on track.',
    Icon: Bell,
  },
];

// Icon colors come from the app's habit palette (change the indexes to taste)
const ICON_COLORS = [2, 4, 6].map((i) => habitPalette[i % habitPalette.length]);

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Page>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === PAGES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(PAGES.length - 1, page)));
  };

  const onNext = () => {
    haptics.light();
    if (isLast) {
      onDone();
      return;
    }
    // Update right away so a quick double tap moves two pages, not one
    const next = index + 1;
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const onSkip = () => {
    haptics.light();
    onDone();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {!isLast && (
        <Pressable
          onPress={onSkip}
          hitSlop={12}
          style={[styles.skipBtn, { top: insets.top + 12 }]}
        >
          <Text style={[styles.skip, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </Pressable>
      )}

      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(p) => p.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        style={styles.list}
        renderItem={({ item, index: i }) => {
          const tint = ICON_COLORS[i];
          return (
            <View style={[styles.page, { width }]}>
              <View
                style={[styles.iconOuter, { backgroundColor: tint + '22' }]}
              >
                <View style={[styles.iconInner, { backgroundColor: tint }]}>
                  <item.Icon size={52} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.text, { color: colors.textSecondary }]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.dots}>
          {PAGES.map((p, i) => (
            <View
              key={p.key}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 8,
                  backgroundColor: i === index ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={onNext}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isLast ? 'Get started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  skipBtn: { position: 'absolute', right: 20, zIndex: 1 },
  skip: { fontSize: 16, fontWeight: '600' },
  list: { flex: 1 },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 12 },
  bottom: { paddingTop: 8 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: { height: 8, borderRadius: 4 },
  button: {
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '700' },
});
