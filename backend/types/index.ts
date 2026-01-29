// Data Models for Lost Device Finder Backend

export interface User {
  userId: string;
  email: string;
  createdAt: Date;
}

export interface Device {
  deviceId: string;
  userId: string; // Owner of the device
  name: string;
  platform: 'ios' | 'android';
  lastSeen: Date;
  status: 'online' | 'offline';
  ringingStatus: 'idle' | 'ringing' | 'stopped' | 'found'; // Current alert state
  createdAt: Date;
}

export interface Command {
  commandId: string;
  deviceId: string;
  type: 'ring' | 'stop' | 'found';
  status: 'pending' | 'executed' | 'failed';
  createdAt: Date;
  executedAt?: Date;
}

export interface Activity {
  activityId: string;
  deviceId: string;
  userId: string;
  action: 'ring' | 'stop' | 'found';
  timestamp: Date;
  deviceName: string;
}

// Firestore document creation types (without auto-generated fields)
export interface CreateUserData {
  email: string;
  createdAt: Date;
}

export interface CreateDeviceData {
  userId: string;
  name: string;
  platform: 'ios' | 'android';
  lastSeen: Date;
  status: 'online' | 'offline';
  ringingStatus: 'idle' | 'ringing' | 'stopped' | 'found';
  createdAt: Date;
}

export interface CreateCommandData {
  deviceId: string;
  type: 'ring' | 'stop' | 'found';
  status: 'pending';
  createdAt: Date;
}

export interface CreateActivityData {
  deviceId: string;
  userId: string;
  action: 'ring' | 'stop' | 'found';
  timestamp: Date;
  deviceName: string;
}

export interface UpdateCommandData {
  status: 'executed' | 'failed';
  executedAt: Date;
}
