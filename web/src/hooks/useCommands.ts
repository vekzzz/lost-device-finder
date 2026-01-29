import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { db, getCurrentUserId } from '../lib/firebase';
import { handleFirebaseError } from '../lib/firebaseErrors';
import { logActivity } from '../lib/activities';

interface SendCommandParams {
  deviceId: string;
  type: 'ring' | 'stop' | 'found';
  deviceName: string;
}

export function useSendCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, type, deviceName }: SendCommandParams) => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const commandsRef = collection(db, 'commands');

        await addDoc(commandsRef, {
          deviceId,
          type,
          status: 'pending',
          createdAt: new Date(),
        });

        // Log the activity
        await logActivity(deviceId, userId, type, deviceName);
      } catch (error) {
        const friendlyMessage = handleFirebaseError(error, 'sending command');
        throw new Error(friendlyMessage);
      }
    },
    onSuccess: () => {
      // Invalidate devices query to refresh status
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
