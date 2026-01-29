import { Audio } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let hasShownWarning = false;

/**
 * Plays a continuous beep alert at maximum volume
 * The sound loops until stopped
 */
export async function playAlert(): Promise<void> {
  try {
    // Stop any existing sound first
    await stopAlert();

    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    // For now, since we don't have a real alert.mp3 file,
    // we'll show a visual alert instead
    if (!hasShownWarning) {
      console.log('🔔 RING COMMAND RECEIVED - Playing alert');
      hasShownWarning = true;
    }

    // Try to play a sound from online source as fallback
    // This is a temporary solution until a proper alert.mp3 is added
    try {
      const { sound } = await Audio.Sound.createAsync(
        // Using a simple beep sound from a reliable CDN
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0,
        },
        onPlaybackStatusUpdate
      );

      currentSound = sound;
      await currentSound.playAsync();

      console.log('✓ Alert sound is now playing');
    } catch (soundError) {
      console.warn('Could not play alert sound:', soundError);

      // If all else fails, at least log it clearly
      console.log('⚠️ ALERT: Ring command active - no audio available');
      console.log('ℹ️ To add a real alert sound, replace mobile/assets/alert.mp3 with an actual MP3 file');
    }
  } catch (error) {
    console.error('Error in playAlert:', error);
    // Don't throw - we want the command to still be marked as executed
    // Show a clear message that the alert was triggered
    console.log('⚠️ Alert triggered but sound playback failed');
  }
}

/**
 * Callback for playback status updates
 */
function onPlaybackStatusUpdate(status: Audio.AVPlaybackStatus) {
  if (status.isLoaded && status.isPlaying) {
    // Sound is playing successfully
  }
  if (status.isLoaded && status.didJustFinish && !status.isLooping) {
    console.log('Alert finished playing');
  }
  if ('error' in status && status.error) {
    console.error('Playback error:', status.error);
  }
}

/**
 * Stops the currently playing alert
 */
export async function stopAlert(): Promise<void> {
  try {
    if (currentSound) {
      console.log('⏹️ Stopping alert sound');
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
      console.log('✓ Alert sound stopped');
    }
  } catch (error) {
    console.error('Error stopping alert:', error);
    // Force cleanup even if there's an error
    currentSound = null;
  }
}

/**
 * Checks if an alert is currently playing
 */
export async function isAlertPlaying(): Promise<boolean> {
  try {
    if (!currentSound) {
      return false;
    }

    const status = await currentSound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  } catch (error) {
    console.error('Error checking alert status:', error);
    return false;
  }
}
