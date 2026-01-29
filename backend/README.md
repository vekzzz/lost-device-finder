# Lost Device Finder - Backend

Backend infrastructure for the Lost Device Finder app using Firebase.

## Tech Stack

- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database for users, devices, and commands
- **Firebase SDK** - Client-side integration

## Data Model

### Collections

#### `users/{userId}`
```typescript
{
  userId: string;        // Firebase Auth UID
  email: string;         // User email
  createdAt: Date;       // Account creation timestamp
}
```

#### `devices/{deviceId}`
```typescript
{
  deviceId: string;      // Auto-generated unique ID
  userId: string;        // Owner's Firebase Auth UID
  name: string;          // Device name (e.g., "My iPhone")
  platform: 'ios' | 'android';
  lastSeen: Date;        // Last time device connected
  status: 'online' | 'offline';
  createdAt: Date;       // Device registration timestamp
}
```

#### `commands/{commandId}`
```typescript
{
  commandId: string;     // Auto-generated unique ID
  deviceId: string;      // Target device
  type: 'ring' | 'stop'; // Command type
  status: 'pending' | 'executed' | 'failed';
  createdAt: Date;       // When command was created
  executedAt?: Date;     // When command was executed (optional)
}
```

## Security Rules

Security rules enforce:
- Users can only access their own data
- Users can only control devices they own
- Devices can update their own status
- Commands cannot be deleted (audit trail)

See [firestore.rules](firestore.rules:1) for complete implementation.

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Select a location close to your users

### 4. Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app
5. Copy the `firebaseConfig` object

### 5. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase config values in `.env`

### 6. Deploy Security Rules and Indexes

Install Firebase CLI:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firebase in this directory:
```bash
firebase init
```
- Select **Firestore** only
- Use existing project
- Use default files (firestore.rules and firestore.indexes.json)

Deploy rules and indexes:
```bash
npm run deploy
```

Or deploy individually:
```bash
npm run deploy:rules    # Deploy security rules only
npm run deploy:indexes  # Deploy indexes only
```

## Usage

### For Web App

Import the config in your web app:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### For Mobile App

Use the same config with React Native Firebase SDK.

## Key Queries

### Get user's devices
```typescript
const devicesRef = collection(db, 'devices');
const q = query(
  devicesRef,
  where('userId', '==', currentUser.uid),
  orderBy('lastSeen', 'desc')
);
const snapshot = await getDocs(q);
```

### Get pending commands for a device
```typescript
const commandsRef = collection(db, 'commands');
const q = query(
  commandsRef,
  where('deviceId', '==', deviceId),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(q);
```

### Listen for new commands (real-time)
```typescript
const commandsRef = collection(db, 'commands');
const q = query(
  commandsRef,
  where('deviceId', '==', deviceId),
  where('status', '==', 'pending')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const command = change.doc.data();
      // Handle new command
    }
  });
});
```

## Files Overview

- [firebase.json](firebase.json:1) - Firebase project configuration
- [firestore.rules](firestore.rules:1) - Security rules
- [firestore.indexes.json](firestore.indexes.json:1) - Database indexes
- [types/index.ts](types/index.ts:1) - TypeScript type definitions
- [package.json](package.json:1) - Dependencies and scripts
- [.env.example](.env.example:1) - Environment variable template

## Notes

- No server-side logic needed for MVP
- All operations handled by Firestore security rules
- Real-time updates via Firestore listeners
- Offline support via Firestore cache
