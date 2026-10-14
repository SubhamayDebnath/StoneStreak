'use no memo';

// The widget library calls these components itself, outside React's render,
// so the React Compiler (enabled in app.json) must not add hooks to them.
import {
  FlexWidget,
  HexColor,
  OverlapWidget,
  SvgWidget,
  TextWidget,
  WidgetRepresentation,
} from 'react-native-android-widget';
import { toDateKey } from '@/lib/date';
import { heatLevel } from '@/lib/streak';
import { AppColors, darkColors, lightColors } from '@/theme/colors';
import { REFRESH_ICON_SHAPES, widgetIconShapes } from './iconShapes';
import { loadWidgetData, WidgetData } from './widgetData';

/** Must match the widget `name` in the app.json plugin config */
export const WIDGET_NAME = 'StoneStreak';
/** clickAction of the mini refresh button (handled in widgetTaskHandler) */
export const REFRESH_ACTION = 'REFRESH';

const PAD = 10;
const COLUMN_GAP = 12;
const REFRESH_SIZE = 24;
const ICON_GAP = 4;
const CELL_GAP = 2;
const DEFAULT_WIDTH = 250;
const DEFAULT_HEIGHT = 110;

const hex = (s: string) => s as HexColor;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/* ---------- layout ---------- */

export interface WidgetLayout {
  width: number;
  height: number;
  ring: number;
  rightWidth: number;
  iconSize: number;
  topRowHeight: number;
  step: number;
  cell: number;
  cols: number;
  /** How many days the heat map covers (starts on a Sunday, ends today) */
  heatDays: number;
}

/** Works out sizes (in dp) from the size the launcher gives the widget. */
export function computeLayout(widthDp: number, heightDp: number): WidgetLayout {
  const width = widthDp > 0 ? widthDp : DEFAULT_WIDTH;
  const height = heightDp > 0 ? heightDp : DEFAULT_HEIGHT;
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;

  const ring = Math.floor(Math.min(innerH, 76));
  const rightWidth = Math.floor(innerW - ring - COLUMN_GAP);

  const iconSize = clamp(
    Math.floor((rightWidth - REFRESH_SIZE - 8 - ICON_GAP * 4) / 5),
    16,
    26,
  );
  const topRowHeight = Math.max(iconSize, REFRESH_SIZE);

  const heatHeight = innerH - topRowHeight - 8;
  const step = clamp(Math.floor(heatHeight / 7), 5, 9);
  const cell = step - CELL_GAP;
  const cols = clamp(Math.floor((rightWidth + CELL_GAP) / step), 4, 53);
  const heatDays = (cols - 1) * 7 + new Date().getDay() + 1;

  return {
    width,
    height,
    ring,
    rightWidth,
    iconSize,
    topRowHeight,
    step,
    cell,
    cols,
    heatDays,
  };
}

/* ---------- SVG pieces ---------- */

const SVG_NS = 'xmlns="http://www.w3.org/2000/svg"';

function ringSvg(size: number, ratio: number, track: string, color: string) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const arc =
    ratio > 0
      ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(circ * Math.min(ratio, 1)).toFixed(2)} ${circ.toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`
      : '';
  return `<svg ${SVG_NS} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>${arc}</svg>`;
}

/** Round bubble with the habit icon: solid when done today, soft when not. */
function habitIconSvg(
  size: number,
  icon: string,
  color: string,
  doneToday: boolean,
) {
  const inner = size * 0.58;
  const k = inner / 24;
  const offset = (size - inner) / 2;
  const half = size / 2;
  return `<svg ${SVG_NS} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="${color}" fill-opacity="${doneToday ? 1 : 0.2}"/><g transform="translate(${offset} ${offset}) scale(${k.toFixed(4)})" fill="none" stroke="${doneToday ? '#FFFFFF' : color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${widgetIconShapes(icon)}</g></svg>`;
}

function refreshSvg(size: number, color: string) {
  const k = size / 24;
  return `<svg ${SVG_NS} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g transform="scale(${k.toFixed(4)})" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${REFRESH_ICON_SHAPES}</g></svg>`;
}

function heatSvg(data: WidgetData, layout: WidgetLayout, colors: AppColors) {
  const { step, cell, cols } = layout;
  const levels = [
    colors.heat0,
    colors.heat1,
    colors.heat2,
    colors.heat3,
    colors.heat4,
  ];
  const width = cols * step - CELL_GAP;
  const height = 7 * step - CELL_GAP;
  const todayKey = toDateKey(new Date());

  // The first cell is a Sunday, so cell i sits in column floor(i / 7), row i % 7
  let rects = '';
  data.heat.forEach((c, i) => {
    const col = Math.floor(i / 7);
    if (col >= cols) return;
    const row = i % 7;
    const fill = levels[heatLevel(c)];
    const opacity = c.scheduled === 0 ? 0.45 : 1;
    const outline =
      c.date === todayKey
        ? ` stroke="${colors.textSecondary}" stroke-width="1"`
        : '';
    rects += `<rect x="${col * step}" y="${row * step}" width="${cell}" height="${cell}" rx="${Math.max(1.5, cell / 3).toFixed(1)}" fill="${fill}" fill-opacity="${opacity}"${outline}/>`;
  });
  return {
    svg: `<svg ${SVG_NS} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rects}</svg>`,
    width,
    height,
  };
}

/* ---------- widget ---------- */

function Widget({
  data,
  layout,
  colors,
}: {
  data: WidgetData;
  layout: WidgetLayout;
  colors: AppColors;
}) {
  const { done, total } = data.progress;
  const ratio = total > 0 ? done / total : 0;
  const ringColor =
    total > 0 && done >= total ? colors.success : colors.primary;
  const heat = heatSvg(data, layout, colors);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Open StoneStreak"
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        padding: PAD,
        backgroundColor: hex(colors.card),
        borderRadius: 22,
      }}
    >
      {/* Progress ring with today's count in the middle */}
      <OverlapWidget style={{ width: layout.ring, height: layout.ring }}>
        <SvgWidget
          svg={ringSvg(layout.ring, ratio, colors.heat0, ringColor)}
          style={{ width: layout.ring, height: layout.ring }}
        />
        <FlexWidget
          style={{
            width: layout.ring,
            height: layout.ring,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text={total > 0 ? `${done}/${total}` : '–'}
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: hex(colors.text),
            }}
          />
          <TextWidget
            text="today"
            style={{ fontSize: 9, color: hex(colors.textSecondary) }}
          />
        </FlexWidget>
      </OverlapWidget>

      <FlexWidget
        style={{
          width: layout.rightWidth,
          height: 'match_parent',
          marginLeft: COLUMN_GAP,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top habits + mini refresh button */}
        <FlexWidget
          style={{
            width: layout.rightWidth,
            height: layout.topRowHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {data.top.length > 0 ? (
            <FlexWidget
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexGap: ICON_GAP,
              }}
            >
              {data.top.map((h) => (
                <SvgWidget
                  key={h.id}
                  svg={habitIconSvg(
                    layout.iconSize,
                    h.icon,
                    h.color,
                    h.doneToday,
                  )}
                  style={{ width: layout.iconSize, height: layout.iconSize }}
                />
              ))}
            </FlexWidget>
          ) : (
            <TextWidget
              text="Add a habit to start"
              style={{ fontSize: 11, color: hex(colors.textSecondary) }}
            />
          )}

          <FlexWidget
            clickAction={REFRESH_ACTION}
            accessibilityLabel="Refresh widget"
            style={{
              width: REFRESH_SIZE,
              height: REFRESH_SIZE,
              borderRadius: REFRESH_SIZE / 2,
              backgroundColor: hex(colors.heat0),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgWidget
              svg={refreshSvg(12, colors.textSecondary)}
              style={{ width: 12, height: 12 }}
            />
          </FlexWidget>
        </FlexWidget>

        {/* Mini heat map */}
        <SvgWidget
          svg={heat.svg}
          style={{ width: heat.width, height: heat.height }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/** Shown if the data can't be read. Tapping still opens the app. */
function FallbackWidget({ colors }: { colors: AppColors }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        width: 'match_parent',
        height: 'match_parent',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hex(colors.card),
        borderRadius: 22,
      }}
    >
      <TextWidget
        text="Tap to open StoneStreak"
        style={{ fontSize: 13, color: hex(colors.textSecondary) }}
      />
    </FlexWidget>
  );
}

/** Reads the data and returns the light and dark version of the widget. */
export async function renderStoneStreak(
  widthDp: number,
  heightDp: number,
): Promise<WidgetRepresentation> {
  const layout = computeLayout(widthDp, heightDp);
  try {
    const data = await loadWidgetData(layout.heatDays);
    return {
      light: <Widget data={data} layout={layout} colors={lightColors} />,
      dark: <Widget data={data} layout={layout} colors={darkColors} />,
    };
  } catch (e) {
    console.warn('Widget data failed', e);
    return {
      light: <FallbackWidget colors={lightColors} />,
      dark: <FallbackWidget colors={darkColors} />,
    };
  }
}
