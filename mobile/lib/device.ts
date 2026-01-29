import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@lost_device_finder:deviceId';

/**
 * Generates a unique device ID based on timestamp and random values
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `device_${timestamp}_${random}${random2}`;
}

/**
 * Gets the device platform (ios or android)
 */
export function getDevicePlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

/**
 * Gets a human-readable device name
 */
export async function getDeviceName(): Promise<string> {
  const platform = getDevicePlatform();
  const modelName = Device.modelName || 'Unknown Device';
  return `${modelName} (${platform})`;
}

/**
 * Gets or creates a persistent device ID
 * This ID is stored locally and persists across app restarts
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const newId = generateDeviceId();

    // Persist it
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);

    return newId;
  } catch (error) {
    console.error('Error getting/creating device ID:', error);
    // Fallback to session-only ID if storage fails
    return generateDeviceId();
  }
}

/**
 * Clears the stored device ID (useful for testing or reset)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error clearing device ID:', error);
  }
}
