import { collection, addDoc, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Activity } from './types';

/**
 * Logs an activity to Firestore
 */
export async function logActivity(
  deviceId: string,
  userId: string,
  action: 'ring' | 'stop' | 'found',
  deviceName: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'activities'), {
      deviceId,
      userId,
      action,
      deviceName,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Subscribe to recent activities for a user
 */
export function subscribeToActivities(
  userId: string,
  callback: (activities: Activity[]) => void,
  maxActivities: number = 10
): Unsubscribe {
  const activitiesQuery = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(maxActivities)
  );

  return onSnapshot(activitiesQuery, (snapshot) => {
    const activities: Activity[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        activityId: doc.id,
        deviceId: data.deviceId,
        userId: data.userId,
        action: data.action,
        timestamp: data.timestamp.toDate(),
        deviceName: data.deviceName,
      });
    });
    callback(activities);
  });
}
