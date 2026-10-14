import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import {
  REFRESH_ACTION,
  renderStoneStreak,
  WIDGET_NAME,
} from './StoneStreakWidget';

/**
 * Runs whenever Android asks the widget to draw: when it is added, resized, on its
 * timer, and when the mini refresh button is tapped. Tapping anywhere else just
 * opens the app (handled by Android through clickAction="OPEN_APP").
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, clickAction } = props;
  if (widgetInfo.widgetName !== WIDGET_NAME) return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(
        await renderStoneStreak(widgetInfo.width, widgetInfo.height),
      );
      break;

    case 'WIDGET_CLICK':
      if (clickAction === REFRESH_ACTION) {
        props.renderWidget(
          await renderStoneStreak(widgetInfo.width, widgetInfo.height),
        );
      }
      break;

    default:
      break;
  }
}
