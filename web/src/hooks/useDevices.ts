import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Device } from '../lib/types';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export function useDevices() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['devices', user?.uid],
    queryFn: () => {
      return new Promise<Device[]>((resolve) => {
        if (!user) {
          resolve([]);
          return;
        }

        const devicesRef = collection(db, 'devices');
        const q = query(
          devicesRef,
          where('userId', '==', user.uid),
          orderBy('lastSeen', 'desc')
        );

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
          const devices: Device[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              deviceId: doc.id,
              userId: data.userId,
              name: data.name,
              platform: data.platform,
              lastSeen: data.lastSeen?.toDate() || new Date(),
              status: data.status,
              ringingStatus: data.ringingStatus || 'idle',
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          });

          resolve(devices);
        });

        // Cleanup is handled by React Query
        return () => unsubscribe();
      });
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity, // Never mark as stale since we use real-time updates
  });
}

// Real-time subscription hook
export function useDevicesRealtime() {
  const user = useAuthStore((state) => state.user);
  const { data, refetch } = useDevices();

  useEffect(() => {
    if (!user) return;

    const devicesRef = collection(db, 'devices');
    const q = query(
      devicesRef,
      where('userId', '==', user.uid),
      orderBy('lastSeen', 'desc')
    );

    const unsubscribe = onSnapshot(q, () => {
      refetch();
    });

    return () => unsubscribe();
  }, [user, refetch]);

  return data || [];
}
