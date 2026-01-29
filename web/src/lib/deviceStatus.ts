/**
 * Utility functions for determining device online/offline status
 */

/**
 * Determines if a device is online based on its last seen timestamp
 * A device is considered online if it has been seen within the last 2 minutes
 * (Mobile app sends heartbeat every 30 seconds, so 2 minutes allows for some network delays)
 */
export function isDeviceOnline(lastSeen: Date): boolean {
  const now = new Date();
  const twoMinutesInMs = 2 * 60 * 1000;
  const timeSinceLastSeen = now.getTime() - lastSeen.getTime();

  return timeSinceLastSeen < twoMinutesInMs;
}

/**
 * Gets a human-readable status string for a device
 */
export function getDeviceStatus(lastSeen: Date): 'online' | 'offline' {
  return isDeviceOnline(lastSeen) ? 'online' : 'offline';
}

/**
 * Gets time elapsed since last seen in a human-readable format
 */
export function getTimeSinceLastSeen(lastSeen: Date): string {
  const now = new Date();
  const diff = now.getTime() - lastSeen.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return lastSeen.toLocaleDateString();
}
