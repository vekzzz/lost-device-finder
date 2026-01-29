# Lost Device Finder - Mobile App

React Native mobile app that runs on the lost device and responds to remote commands.

## Tech Stack

- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type safety
- **Firebase SDK v11** - Backend integration
- **Zustand** - State management
- **Expo Audio** - Audio playback for alerts
- **AsyncStorage** - Local persistence

## Features

- 🔐 **User Authentication** - Email/password login to link device to account
- 🔑 **Unique Device ID** - Automatically generated and persisted
- 🔔 **Real-time Commands** - Listens for ring/stop commands from backend
- 🔊 **Max Volume Alert** - Plays loud sound even when device is silent
- 📴 **Offline Support** - Device ID persists without internet
- 🔄 **Auto-reconnect** - Automatically reconnects when network is restored
- ⚡ **Background Audio** - Alert plays even when app is in background (iOS)

## Project Structure

```
mobile/
├── components/             # React components
│   └── DeviceRegistration.tsx  # Login/signup form
├── lib/                   # Core functionality
│   ├── device.ts          # Device ID generation and persistence
│   ├── firebase.ts        # Firebase initialization
│   ├── firebase-config.ts # Firebase configuration
│   ├── commandListener.ts # Real-time command listener
│   ├── soundAlert.ts      # Audio alert functionality
│   └── types.ts           # TypeScript types
├── store/                 # State management
│   └── deviceStore.ts     # Zustand store for device state
├── assets/                # Static assets
│   └── alert.mp3          # Alert sound file (placeholder)
├── App.tsx                # Main app component
├── index.js               # App entry point
├── app.config.js          # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator installed
- Backend Firebase project set up (see [../backend/README.md](../backend/README.md))

### 2. Install Dependencies

```bash
cd mobile
npm install
```

### 3. Configure Firebase

**IMPORTANT:** You must enable Email/Password authentication in Firebase Console:

1. Go to https://console.firebase.google.com/project/lost-device-finder-prompt-plan/authentication/providers
2. Click on "Email/Password" under Sign-in providers
3. Enable it and click "Save"

**Configure Firebase in the app:**

The Firebase configuration is currently hardcoded in [lib/firebase-config.ts](lib/firebase-config.ts:1). Update it with your Firebase project credentials:

```typescript
export const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.firebasestorage.app",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};
```

> Note: Environment variables (.env file) are not loading properly in the current setup. This will be fixed in a future update.

### 4. Add Alert Sound

The app requires an alert sound file at [assets/alert.mp3](assets/alert.mp3:1).

**Option 1: Create your own**
- Use an audio editor (Audacity, GarageBand, etc.)
- Create a loud beeping/alarm sound (1-3 seconds)
- Export as MP3 and save to `assets/alert.mp3`

**Option 2: Use a free sound**
- Download from freesound.org or similar
- Convert to MP3 if needed
- Save as `assets/alert.mp3`

**For testing only:**
You can temporarily comment out the sound requirement in [lib/soundAlert.ts](lib/soundAlert.ts:24) (line 24).

### 5. Run the App

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Expo Go (Physical Device):**
```bash
npm start
```
Then scan the QR code with Expo Go app.

## How It Works

### User Registration & Device Initialization

When the app starts ([App.tsx](App.tsx:22)):
1. Generates or retrieves device ID from local storage
2. Checks if user is already authenticated
3. If not authenticated, shows login/signup screen ([components/DeviceRegistration.tsx](components/DeviceRegistration.tsx:1))
4. User signs in or creates account with email/password
5. Device is registered under user's account in Firestore
6. Starts listening for commands
7. Updates "last seen" timestamp every 5 minutes

### Command Handling

When a command is received ([store/deviceStore.ts](store/deviceStore.ts:122)):
1. Command listener detects new "pending" command
2. Executes the command (ring or stop)
3. Updates command status to "executed" or "failed"
4. Updates UI to show current state

### Sound Alert

Ring command flow ([lib/soundAlert.ts](lib/soundAlert.ts:12)):
1. Sets audio mode to play even when silent
2. Loads alert.mp3 at maximum volume
3. Plays sound in loop until stopped
4. Stop command ends the loop

### Offline Persistence

Device ID is stored using AsyncStorage ([lib/device.ts](lib/device.ts:32)):
- Persists across app restarts
- Works without internet connection
- Only regenerates if storage is cleared

## Key Files

### [components/DeviceRegistration.tsx](components/DeviceRegistration.tsx:1)
Login/signup form for linking device to user account.

### [App.tsx](App.tsx:1)
Main app component showing device status, ID, and command history.

### [lib/device.ts](lib/device.ts:1)
Device ID generation and platform detection.

### [lib/firebase.ts](lib/firebase.ts:1)
Firebase initialization with React Native persistence.

### [lib/firebase-config.ts](lib/firebase-config.ts:1)
Firebase configuration (hardcoded for now).

### [lib/commandListener.ts](lib/commandListener.ts:1)
Real-time listener for pending commands using Firestore snapshots.

### [lib/soundAlert.ts](lib/soundAlert.ts:1)
Audio playback with Expo Audio for maximum volume alerts.

### [store/deviceStore.ts](store/deviceStore.ts:1)
Zustand store managing device state, commands, and alert status.

## Device States

### Device Status
- `unregistered` - Initial state before initialization
- `registering` - Currently initializing device
- `registered` - Active and listening for commands
- `error` - Failed to initialize

### Alert Status
- `idle` - No alert playing
- `ringing` - Alert currently playing
- `stopping` - Alert being stopped

## Firebase Security

The app uses Email/Password authentication, which means:
- Users create accounts with email and password
- Each device is linked to a user's account
- Devices can only be accessed by their owner
- Device can update its own status and last seen
- Device can read commands for its device ID
- Device can update command execution status

See [../backend/firestore.rules](../backend/firestore.rules:1) for complete security rules.

## Platform-Specific Notes

### iOS
- Background audio enabled via `UIBackgroundModes: ['audio']`
- Alert plays even when device is locked/silent
- Requires Info.plist permission for background audio

### Android
- Audio continues in background
- May be affected by battery optimization settings
- Users may need to disable battery optimization for reliable operation

## Testing

### Test User Registration & Device Linking
1. Run the mobile app
2. You'll see the login/signup screen
3. Create an account with email and password
4. Device will be automatically registered to your account
5. You should see the main app screen with "Active" status

### Test Command Execution
1. From web app, login with the same email/password
2. You should see your device listed
3. Send a "ring" command
4. Mobile app should receive it within 1-2 seconds
5. Alert sound should play at max volume
6. Send "stop" command to end alert

### Test Offline Behavior
1. Turn off device internet
2. App should maintain device ID
3. Turn internet back on
4. App should reconnect and receive pending commands

## Troubleshooting

### "Device ID not initialized"
- Check Firebase configuration in `.env`
- Ensure Firebase project is set up correctly
- Check console logs for errors

### Alert sound not playing
- Ensure `assets/alert.mp3` exists
- Check device volume is not muted
- Test with physical device (simulator may have audio issues)

### Commands not received
- Check Firebase security rules are deployed
- Verify device is showing as "online" in Firestore
- Check internet connection
- Look for errors in console

### App crashes on start
- Run `npm install` to ensure dependencies are installed
- Clear Expo cache: `expo start -c`
- Check all environment variables are set

## Production Considerations

Before deploying to production:

1. **Alert Sound** - Use a professional, loud alert sound
2. **Bundle Identifier** - Change in [app.json](app.json:15) to your company domain
3. **Background Permissions** - Test background execution thoroughly
4. **Battery Optimization** - Add instructions for users to disable battery optimization
5. **Error Reporting** - Add crash reporting (Sentry, etc.)
6. **Analytics** - Track device registrations and command success rates

## Next Steps

After the mobile app is set up, build the **Web App** to control devices remotely.

See [../web/PROMPT.md](../web/PROMPT.md:1) for web app development.
