import { useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { fromDateKey } from '@/lib/date';
import { heatLevel } from '@/lib/streak';
import { HeatCell } from '@/types';

const GAP = 3;
const LABEL_W = 30;
const MONTH_ROW_H = 16;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

interface Props {
  /** Oldest first, ending today */
  cells: HeatCell[];
  /** 5 colors, index = heatLevel (0..4) */
  levelColors: string[];
  cellSize?: number;
  /** Show the Less / More legend */
  legend?: boolean;
  /** Text shown for the tapped day, after the date */
  describe: (cell: HeatCell) => string;
}

/** Column and row of a date inside the week columns */
function findCell(
  columns: (HeatCell | null)[][],
  date: string | null,
): { c: number; r: number } | null {
  if (!date) return null;
  for (let c = 0; c < columns.length; c++) {
    const r = columns[c].findIndex((cell) => cell?.date === date);
    if (r >= 0) return { c, r };
  }
  return null;
}

export function HeatMap({
  cells,
  levelColors,
  cellSize = 15,
  legend = false,
  describe,
}: Props) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const step = cellSize + GAP;

  // Group the cells into week columns (Sunday at the top)
  const columns = useMemo(() => {
    if (cells.length === 0) return [] as (HeatCell | null)[][];
    const lead = fromDateKey(cells[0].date).getDay();
    const padded: (HeatCell | null)[] = [
      ...Array<HeatCell | null>(lead).fill(null),
      ...cells,
    ];
    const out: (HeatCell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      const col = padded.slice(i, i + 7);
      while (col.length < 7) col.push(null);
      out.push(col);
    }
    return out;
  }, [cells]);

  // Month names above the first column of each month
  const monthLabels = useMemo(() => {
    let lastMonth = -1;
    let lastCol = -10;
    return columns.map((col, i) => {
      const first = col.find((c) => c !== null);
      if (!first) return '';
      const month = fromDateKey(first.date).getMonth();
      if (month !== lastMonth && i - lastCol >= 3) {
        lastMonth = month;
        lastCol = i;
        return MONTHS[month];
      }
      return '';
    });
  }, [columns]);

  const selectedPos = findCell(columns, selected);

  const selectedCell = selected
    ? (cells.find((c) => c.date === selected) ?? null)
    : null;
  const selectedLabel = selectedCell
    ? fromDateKey(selectedCell.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const width = columns.length * step;
  const height = MONTH_ROW_H + 7 * step;

  // One touch handler for the whole grid: work out which square was tapped
  const onPress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const col = Math.floor(locationX / step);
    const row = Math.floor((locationY - MONTH_ROW_H) / step);
    if (row < 0 || row > 6) return;
    const cell = columns[col]?.[row];
    if (cell) setSelected(cell.date);
  };

  return (
    <View>
      <View style={styles.row}>
        {/* Weekday labels */}
        <View style={{ width: LABEL_W, paddingTop: MONTH_ROW_H }}>
          {DAY_LABELS.map((label, i) => (
            <View
              key={i}
              style={{
                height: cellSize,
                marginBottom: GAP,
                justifyContent: 'center',
              }}
            >
              <Text style={[styles.small, { color: colors.textSecondary }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          <Pressable onPress={onPress} style={{ paddingRight: 24 }}>
            <View pointerEvents="none">
              <Svg width={width} height={height}>
                {monthLabels.map((m, i) =>
                  m ? (
                    <SvgText
                      key={`m${i}`}
                      x={i * step}
                      y={11}
                      fontSize={10}
                      fontWeight="600"
                      fill={colors.textSecondary}
                    >
                      {m}
                    </SvgText>
                  ) : null,
                )}

                {columns.map((col, c) =>
                  col.map((cell, r) =>
                    cell ? (
                      <Rect
                        key={cell.date}
                        x={c * step}
                        y={MONTH_ROW_H + r * step}
                        width={cellSize}
                        height={cellSize}
                        rx={3}
                        fill={levelColors[heatLevel(cell)]}
                        opacity={cell.scheduled === 0 ? 0.35 : 1}
                      />
                    ) : null,
                  ),
                )}

                {selectedPos && (
                  <Rect
                    x={selectedPos.c * step}
                    y={MONTH_ROW_H + selectedPos.r * step}
                    width={cellSize}
                    height={cellSize}
                    rx={3}
                    fill="none"
                    stroke={colors.text}
                    strokeWidth={1.5}
                  />
                )}
              </Svg>
            </View>
          </Pressable>
        </ScrollView>
      </View>

      <Text style={[styles.info, { color: colors.textSecondary }]}>
        {selectedCell
          ? `${selectedLabel} · ${describe(selectedCell)}`
          : 'Tap a square to see that day'}
      </Text>

      {legend && (
        <View style={styles.legend}>
          <Text style={[styles.small, { color: colors.textSecondary }]}>
            Less
          </Text>
          {levelColors.map((c, i) => (
            <View key={i} style={[styles.legendBox, { backgroundColor: c }]} />
          ))}
          <Text style={[styles.small, { color: colors.textSecondary }]}>
            More
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  small: { fontSize: 10, fontWeight: '600' },
  info: { fontSize: 12, marginTop: 10, minHeight: 16 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
});
