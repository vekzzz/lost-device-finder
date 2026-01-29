// Mirror types from backend
export interface Device {
  deviceId: string;
  userId: string;
  name: string;
  platform: 'ios' | 'android';
  lastSeen: Date;
  status: 'online' | 'offline';
  ringingStatus: 'idle' | 'ringing' | 'stopped' | 'found';
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

export interface User {
  userId: string;
  email: string;
  createdAt: Date;
}
