import { create } from 'zustand';
import { doc, setDoc, updateDoc, Unsubscribe } from 'firebase/firestore';
import { db, getCurrentUserId } from '../lib/firebase';
import { getOrCreateDeviceId, getDeviceName, getDevicePlatform } from '../lib/device';
import { listenForCommands, markCommandExecuted, markCommandFailed } from '../lib/commandListener';
import { playAlert, stopAlert } from '../lib/soundAlert';
import { DeviceStatus, AlertStatus, Command } from '../lib/types';
import { handleFirebaseError } from '../lib/firebaseErrors';

interface DeviceStore {
  // State
  deviceId: string | null;
  deviceStatus: DeviceStatus;
  alertStatus: AlertStatus;
  error: string | null;
  lastCommand: Command | null;

  // Actions
  initializeDevice: () => Promise<void>;
  startCommandListener: () => void;
  registerDevice: (ownerEmail: string) => Promise<void>;
  handleCommand: (command: Command) => Promise<void>;
  updateLastSeen: () => Promise<void>;
  manualStopAlert: () => Promise<void>;

  // Internal
  commandUnsubscribe: Unsubscribe | null;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // Initial state
  deviceId: null,
  deviceStatus: 'unregistered',
  alertStatus: 'idle',
  error: null,
  lastCommand: null,
  commandUnsubscribe: null,

  /**
   * Initializes the device (called on app start)
   * - Gets/creates device ID
   * - Device ID will be used for registration after user logs in
   */
  initializeDevice: async () => {
    try {
      set({ deviceStatus: 'registering', error: null });

      // Get or create device ID
      const deviceId = await getOrCreateDeviceId();
      set({ deviceId, deviceStatus: 'unregistered' });

    } catch (error) {
      const friendlyMessage = handleFirebaseError(error, 'device initialization');
      set({
        deviceStatus: 'error',
        error: friendlyMessage,
      });
    }
  },

  /**
   * Starts listening for commands after user is authenticated
   * Called after successful login/registration
   */
  startCommandListener: () => {
    const { deviceId, commandUnsubscribe } = get();

    if (!deviceId) {
      console.error('Cannot start command listener: deviceId not initialized');
      return;
    }

    // Clean up existing listener if any
    if (commandUnsubscribe) {
      commandUnsubscribe();
    }

    // Start listening for commands
    const unsubscribe = listenForCommands(deviceId, (command) => {
      get().handleCommand(command);
    });

    set({
      commandUnsubscribe: unsubscribe,
      deviceStatus: 'registered',
    });

    // Update last seen immediately
    get().updateLastSeen();

    // Set up periodic last seen updates (every 30 seconds for accurate online/offline detection)
    setInterval(() => {
      get().updateLastSeen();
    }, 30 * 1000);
  },

  /**
   * Registers this device in Firestore
   * Creates a device document that can be claimed by an owner
   */
  registerDevice: async (_ownerEmail: string) => {
    try {
      const { deviceId } = get();
      if (!deviceId) {
        throw new Error('Device ID not initialized');
      }

      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const deviceName = await getDeviceName();
      const platform = getDevicePlatform();

      // Create device document
      await setDoc(doc(db, 'devices', deviceId), {
        userId,
        name: deviceName,
        platform,
        lastSeen: new Date(),
        status: 'online',
        ringingStatus: 'idle',
        createdAt: new Date(),
      });

      set({ deviceStatus: 'registered' });
    } catch (error) {
      const friendlyMessage = handleFirebaseError(error, 'device registration');
      set({
        error: friendlyMessage,
      });
      throw error;
    }
  },

  /**
   * Handles incoming commands
   */
  handleCommand: async (command: Command) => {
    try {
      const { deviceId } = get();
      console.log('📥 Received command:', command.type, 'ID:', command.commandId);
      set({ lastCommand: command });

      if (command.type === 'ring') {
        console.log('🔔 Starting ring alert...');
        set({ alertStatus: 'ringing' });
        await playAlert();

        // Update ringing status in Firestore
        if (deviceId) {
          const deviceRef = doc(db, 'devices', deviceId);
          await updateDoc(deviceRef, { ringingStatus: 'ringing' });
          console.log('✓ Updated Firestore: ringingStatus = ringing');
        }

        await markCommandExecuted(command.commandId);
        console.log('✓ Ring command executed');
      } else if (command.type === 'stop') {
        console.log('⏹️ Stopping alert...');
        set({ alertStatus: 'stopping' });
        await stopAlert();

        // Update ringing status in Firestore
        if (deviceId) {
          const deviceRef = doc(db, 'devices', deviceId);
          await updateDoc(deviceRef, { ringingStatus: 'stopped' });
          console.log('✓ Updated Firestore: ringingStatus = stopped');
        }

        await markCommandExecuted(command.commandId);
        set({ alertStatus: 'idle' });
        console.log('✓ Stop command executed');
      } else if (command.type === 'found') {
        console.log('✓ Marking device as found...');
        set({ alertStatus: 'stopping' });
        await stopAlert();

        // Update ringing status in Firestore
        if (deviceId) {
          const deviceRef = doc(db, 'devices', deviceId);
          await updateDoc(deviceRef, { ringingStatus: 'found' });
          console.log('✓ Updated Firestore: ringingStatus = found');
        }

        await markCommandExecuted(command.commandId);
        set({ alertStatus: 'idle' });
        console.log('✓ Found command executed');
      }
    } catch (error) {
      console.error('❌ Error handling command:', error);
      await markCommandFailed(command.commandId);
      const friendlyMessage = handleFirebaseError(error, 'command execution');
      set({
        error: friendlyMessage,
        alertStatus: 'idle',
      });
    }
  },

  /**
   * Updates the device's last seen timestamp
   */
  updateLastSeen: async () => {
    try {
      const { deviceId, alertStatus } = get();
      if (!deviceId) return;

      const deviceRef = doc(db, 'devices', deviceId);

      // Reset ringingStatus to idle if alert is not playing
      const updates: { lastSeen: Date; status: string; ringingStatus?: string } = {
        lastSeen: new Date(),
        status: 'online',
      };

      if (alertStatus === 'idle') {
        updates.ringingStatus = 'idle';
      }

      await updateDoc(deviceRef, updates);
    } catch (error) {
      // Silently fail - this is not critical
      console.warn('Failed to update last seen:', error);
    }
  },

  /**
   * Manually stops the alert (when user finds the device)
   */
  manualStopAlert: async () => {
    try {
      const { deviceId } = get();
      console.log('User manually stopping alert...');
      set({ alertStatus: 'stopping' });
      await stopAlert();

      // Update ringing status in Firestore to indicate device was found
      if (deviceId) {
        const deviceRef = doc(db, 'devices', deviceId);
        await updateDoc(deviceRef, { ringingStatus: 'found' });
      }

      set({ alertStatus: 'idle' });
      console.log('Alert stopped successfully');
    } catch (error) {
      const friendlyMessage = handleFirebaseError(error, 'stopping alert');
      set({
        error: friendlyMessage,
        alertStatus: 'idle',
      });
    }
  },
}));
