# Lost Device Finder - Complete Setup Guide

This guide walks you through setting up the entire Lost Device Finder system from scratch.

## System Overview

The Lost Device Finder consists of three components:
1. **Backend** - Firebase (Firestore + Auth)
2. **Mobile App** - React Native app that runs on the device to be found
3. **Web App** - React dashboard to control devices

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier is sufficient)
- For mobile development:
  - iOS: macOS with Xcode
  - Android: Android Studio
- Git (optional, for version control)

## Step-by-Step Setup

### Part 1: Backend Setup (15 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name: `lost-device-finder`
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to **Authentication**
   - Click "Get started"
   - Enable **Email/Password** sign-in method
   - Save

3. **Create Firestore Database**
   - In Firebase Console, go to **Firestore Database**
   - Click "Create database"
   - Choose **Production mode**
   - Select a location (choose closest to your users)
   - Click "Enable"

4. **Get Firebase Configuration**
   - In Firebase Console, go to **Project Settings** (gear icon)
   - Scroll to "Your apps" section
   - Click the Web icon (`</>`)
   - Register app name: `Lost Device Finder Web`
   - Copy the `firebaseConfig` object values

5. **Deploy Backend**
   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and paste your Firebase config values

   # Install Firebase CLI globally
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase (choose existing project)
   firebase init
   # Select: Firestore
   # Use existing project: lost-device-finder
   # Accept default files (firestore.rules, firestore.indexes.json)

   # Deploy security rules and indexes
   npm run deploy
   ```

6. **Verify Backend**
   - Go to Firestore in Firebase Console
   - You should see "Rules" and "Indexes" tabs populated

### Part 2: Mobile App Setup (20 minutes)

1. **Configure Environment**
   ```bash
   cd mobile
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and paste your Firebase config values
   # Use EXPO_PUBLIC_ prefix for all variables
   ```

2. **Add Alert Sound**
   - Find or create a loud beep/alarm sound (MP3 format)
   - Save it as `mobile/assets/alert.mp3`
   - Recommended: 1-3 seconds, loud and attention-grabbing
   - Free sounds: freesound.org, zapsplat.com

3. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Run the App**

   **Option A: iOS Simulator (Mac only)**
   ```bash
   npm run ios
   ```

   **Option B: Android Emulator**
   ```bash
   npm run android
   ```

   **Option C: Physical Device (Easiest)**
   ```bash
   npm start
   ```
   - Install "Expo Go" app on your phone
   - Scan the QR code shown in terminal

5. **Test Mobile App**
   - App should show "Device Status: Active"
   - Note the Device ID shown on screen
   - Keep the app running in the foreground

### Part 3: Web App Setup (15 minutes)

1. **Configure Environment**
   ```bash
   cd web
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and paste your Firebase config values
   # Use VITE_ prefix for all variables
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:5173`

3. **Create Account**
   - Click "Sign up"
   - Enter email and password
   - Click "Sign Up"
   - You should see the dashboard (empty state)

### Part 4: Testing the System (10 minutes)

1. **Register Mobile Device**

   Currently, devices auto-register when the mobile app starts. You can verify in Firestore:
   - Go to Firebase Console > Firestore Database
   - Check the `devices` collection
   - You should see a document with your device

2. **Link Device to User (Manual Step)**

   Since we're using MVP architecture, you need to manually link the device to your user:
   - In Firestore, find your device document
   - Edit the `userId` field
   - Set it to your user's UID (found in Authentication tab)
   - Save

3. **Send Ring Command**
   - Refresh the web dashboard
   - You should now see your device listed
   - Click the "Ring" button
   - Mobile device should start playing alert sound within 1-2 seconds

4. **Stop Alert**
   - Click the "Stop" button in web dashboard
   - Mobile device should stop the alert

## Common Issues

### Mobile app shows "Error initializing device"
- Check Firebase config in `mobile/.env`
- Ensure all environment variables start with `EXPO_PUBLIC_`
- Verify Firebase project allows the domain

### Web app shows "Failed to fetch devices"
- Check Firebase config in `web/.env`
- Ensure all environment variables start with `VITE_`
- Verify Firestore security rules are deployed

### Alert sound doesn't play
- Ensure `mobile/assets/alert.mp3` exists
- Check device volume is not muted
- Test on a physical device (simulators may have audio issues)

### Device doesn't appear in web dashboard
- Check that device `userId` matches your user UID in Firestore
- Verify Firestore security rules are deployed
- Check browser console for errors

## Security Notes

⚠️ **Important**: This MVP uses a simplified security model:
- Devices auto-register with anonymous auth
- Manual linking required to connect device to owner
- In production, implement proper device ownership flow

For production use, consider:
- Device registration codes or QR codes
- Two-factor authentication
- Device approval workflow
- Encrypted communication

## Architecture Diagram

```
┌─────────────────┐
│   Web App       │
│   (React)       │
│                 │
│  - Login/Signup │
│  - View Devices │
│  - Send Commands│
└────────┬────────┘
         │
         │ Firebase Auth
         │ Firestore Queries
         │
    ┌────▼─────┐
    │ Firebase │
    │ Backend  │
    │          │
    │ - Auth   │
    │ - DB     │
    │ - Rules  │
    └────┬─────┘
         │
         │ Real-time Listeners
         │ Command Updates
         │
┌────────▼────────┐
│   Mobile App    │
│ (React Native)  │
│                 │
│ - Listen for    │
│   commands      │
│ - Play alert    │
│ - Update status │
└─────────────────┘
```

## Data Flow

1. **Device Registration**
   ```
   Mobile App → Firebase Auth (anonymous) → Device ID stored locally
   ```

2. **Sending Ring Command**
   ```
   Web Dashboard → Create command in Firestore → Mobile receives via listener → Play sound → Update command status
   ```

3. **Real-time Updates**
   ```
   Mobile updates lastSeen → Firestore → Web dashboard refreshes → Shows online/offline status
   ```

## Next Steps

After successful setup:

1. **Customize Mobile App**
   - Change app name and bundle identifier
   - Add custom icon and splash screen
   - Configure background permissions

2. **Enhance Web App**
   - Add device nicknames
   - Show command history
   - Add device removal feature

3. **Deploy to Production**
   - Build mobile apps for app stores
   - Deploy web app to hosting (Vercel, Netlify, Firebase Hosting)
   - Set up proper domain and SSL

4. **Add Features**
   - Device location (last known)
   - Multiple alert sounds
   - Scheduled alerts
   - Battery level monitoring

## Support

For issues or questions:
- Check individual README files in each folder
- Review Firebase documentation
- Check React Native/Expo documentation

## License

MIT License - feel free to use and modify for your needs.
