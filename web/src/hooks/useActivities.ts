import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { subscribeToActivities } from '../lib/activities';
import { Activity } from '../lib/types';
import { getCurrentUserId } from '../lib/firebase';

export function useActivities(maxActivities: number = 10) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      setActivities([]);
      return;
    }

    const unsubscribe = subscribeToActivities(userId, setActivities, maxActivities);

    return () => {
      unsubscribe();
    };
  }, [userId, maxActivities]);

  return activities;
}
