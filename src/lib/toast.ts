import { Platform, ToastAndroid } from 'react-native';

/** Native Android toast - zero React tree overhead */
export function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}
