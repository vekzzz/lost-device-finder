import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Send a local notification
 */
export async function sendNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Check if app is in background or foreground
 */
export function isAppInBackground(): boolean {
  return AppState.currentState === 'background' || AppState.currentState === 'inactive';
}

/**
 * Listen for app state changes
 */
export function setupAppStateListener(callback: (state: AppStateStatus) => void): () => void {
  const subscription = AppState.addEventListener('change', callback);
  return () => subscription.remove();
}
