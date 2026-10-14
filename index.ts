// App entry (package.json "main"). Starts Expo Router, then registers the widget task.
import 'expo-router/entry';

try {
  // The widget needs the native module, which Expo Go does not have. Guarded so
  // the app still starts there; in a development/preview build it just works.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { widgetTaskHandler } = require('./src/widget/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
} catch {
  // widget unavailable in this build
}
