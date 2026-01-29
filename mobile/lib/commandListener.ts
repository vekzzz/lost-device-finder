import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Command } from './types';

type CommandHandler = (command: Command) => void | Promise<void>;

/**
 * Listens for new commands for a specific device
 * Calls the handler when a new pending command is received
 */
export function listenForCommands(
  deviceId: string,
  onCommand: CommandHandler
): Unsubscribe {
  const commandsRef = collection(db, 'commands');
  const q = query(
    commandsRef,
    where('deviceId', '==', deviceId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const commandData = change.doc.data();
          const command: Command = {
            commandId: change.doc.id,
            deviceId: commandData.deviceId,
            type: commandData.type,
            status: commandData.status,
            createdAt: commandData.createdAt?.toDate() || new Date(),
            executedAt: commandData.executedAt?.toDate(),
          };

          // Handle the command
          onCommand(command);
        }
      });
    },
    (error) => {
      console.error('Error listening for commands:', error);
    }
  );
}

/**
 * Marks a command as executed
 */
export async function markCommandExecuted(commandId: string): Promise<void> {
  try {
    const commandRef = doc(db, 'commands', commandId);
    await updateDoc(commandRef, {
      status: 'executed',
      executedAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking command as executed:', error);
    throw error;
  }
}

/**
 * Marks a command as failed
 */
export async function markCommandFailed(commandId: string): Promise<void> {
  try {
    const commandRef = doc(db, 'commands', commandId);
    await updateDoc(commandRef, {
      status: 'failed',
      executedAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking command as failed:', error);
    throw error;
  }
}
