# Lost Device Finder - Web App

React web dashboard for controlling and managing lost devices remotely.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Firebase SDK** - Backend integration
- **Zustand** - State management
- **React Query** - Data fetching and caching

## Features

- 🔐 **Authentication** - Email/password sign in and sign up
- 📱 **Device Management** - View all registered devices
- 🔔 **Remote Commands** - Send ring/stop commands to devices
- 🔴 **Real-time Status** - Live device status updates (online/offline)
- 📊 **Device Info** - Platform, last seen, and device ID
- 📱 **Responsive** - Works on desktop and mobile browsers

## Project Structure

```
web/
├── src/
│   ├── components/        # React components
│   │   ├── Auth.tsx       # Login/signup form
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   └── DeviceCard.tsx # Device card with controls
│   ├── hooks/             # Custom React hooks
│   │   ├── useDevices.ts  # Device data fetching
│   │   └── useCommands.ts # Command mutations
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts   # Authentication state
│   │   └── deviceStore.ts # Device selection state
│   ├── lib/               # Core utilities
│   │   ├── firebase.ts    # Firebase initialization
│   │   └── types.ts       # TypeScript types
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Backend Firebase project set up (see [../backend/README.md](../backend/README.md))

### 2. Install Dependencies

```bash
cd web
npm install
```

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase config (same values from backend setup):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## How It Works

### Authentication Flow

When the app loads ([src/App.tsx](src/App.tsx:9)):
1. Initializes Firebase auth state listener
2. Shows loading screen while checking auth
3. Shows login/signup form if not authenticated
4. Shows dashboard if authenticated

### Device List

Dashboard component ([src/components/Dashboard.tsx](src/components/Dashboard.tsx:1)):
1. Fetches user's devices from Firestore
2. Uses real-time listener for live updates
3. Displays devices in a grid layout
4. Shows empty state if no devices registered

### Real-time Updates

Device data hook ([src/hooks/useDevices.ts](src/hooks/useDevices.ts:1)):
1. Queries Firestore for devices owned by current user
2. Sets up onSnapshot listener for real-time updates
3. Automatically refetches when data changes
4. Updates UI immediately when device status changes

### Sending Commands

Command mutation hook ([src/hooks/useCommands.ts](src/hooks/useCommands.ts:1)):
1. User clicks "Ring" or "Stop" button
2. Creates new command document in Firestore
3. Command status starts as "pending"
4. Mobile app receives command via real-time listener
5. Mobile app executes and updates status to "executed"

## Key Files

### [src/lib/firebase.ts](src/lib/firebase.ts:1)
Firebase initialization with environment variables.

### [src/store/authStore.ts](src/store/authStore.ts:1)
Zustand store for authentication state and sign out.

### [src/hooks/useDevices.ts](src/hooks/useDevices.ts:1)
React Query hook with real-time Firestore listener.

### [src/hooks/useCommands.ts](src/hooks/useCommands.ts:1)
Mutation hook for sending ring/stop commands.

### [src/components/Auth.tsx](src/components/Auth.tsx:1)
Login and signup form with email/password.

### [src/components/Dashboard.tsx](src/components/Dashboard.tsx:1)
Main dashboard showing device list and user info.

### [src/components/DeviceCard.tsx](src/components/DeviceCard.tsx:1)
Individual device card with status and control buttons.

## User Flow

### First Time User

1. Visit web app
2. Click "Sign up"
3. Enter email and password
4. Account created, redirected to dashboard
5. Dashboard shows "No devices registered"
6. Install mobile app on device to register

### Existing User

1. Visit web app
2. Sign in with email/password
3. View list of registered devices
4. See device status (online/offline) and last seen
5. Click "Ring" to trigger alert on lost device
6. Click "Stop" to end alert

### Finding a Lost Device

1. Open web app and sign in
2. Locate the lost device in the list
3. Check if device is online
4. Click "Ring" button
5. Device plays loud alert sound
6. Find the device by following the sound
7. Click "Stop" to end the alert

## Device Status

### Online
- Device was seen in the last 5 minutes
- Green border and "Online" badge
- Commands will be received immediately

### Offline
- Device hasn't connected in over 5 minutes
- Gray border and "Offline" badge
- Commands will be queued and executed when device reconnects

## Firebase Security

The web app enforces:
- Users can only see their own devices
- Users can only send commands to their own devices
- Commands are validated by Firestore security rules
- Device ownership is strictly enforced

See [../backend/firestore.rules](../backend/firestore.rules:1) for complete security rules.

## Styling

The app uses vanilla CSS with:
- CSS custom properties for theming
- Mobile-first responsive design
- Card-based layout
- Purple gradient authentication screen
- Clean, minimal dashboard

## Troubleshooting

### "Failed to fetch devices"
- Check Firebase configuration in `.env`
- Ensure Firebase security rules are deployed
- Verify user is signed in

### Devices not updating in real-time
- Check browser console for errors
- Ensure Firestore indexes are deployed
- Verify internet connection

### Cannot send commands
- Check device ownership in Firestore
- Ensure security rules allow command creation
- Verify device exists and belongs to user

### Build errors
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors: `npm run build`
- Clear Vite cache: delete `node_modules/.vite`

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR - changes appear immediately without full reload.

### TypeScript
All components are fully typed. Check types with `npm run build`.

### React Query DevTools
Add React Query DevTools for debugging:
```bash
npm install @tanstack/react-query-devtools
```

### Environment Variables
All env vars must be prefixed with `VITE_` to be available in the browser.

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder via Netlify's web UI or CLI

## Production Considerations

Before deploying to production:

1. **Environment Variables** - Set up production `.env` file
2. **Error Tracking** - Add error monitoring (Sentry, etc.)
3. **Analytics** - Add usage tracking
4. **Testing** - Add unit and integration tests
5. **Security** - Review Firebase security rules
6. **Performance** - Optimize bundle size and images
7. **SEO** - Add meta tags and Open Graph data

## Next Steps

The complete system is now ready:
- ✓ **Backend** - Firebase with security rules
- ✓ **Mobile** - React Native app for devices
- ✓ **Web** - Control dashboard

To use the full system:
1. Deploy backend security rules and indexes
2. Install mobile app on your device
3. Deploy web app to hosting
4. Register devices via mobile app
5. Control devices via web dashboard
