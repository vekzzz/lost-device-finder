# Lost Device Finder

A personal project for locating and controlling lost devices remotely. Built with React Native (Expo) for mobile and React for the web dashboard, powered by Firebase.

## Features

- **Remote Ring Alert** - Trigger a loud alarm on your lost device (plays at max volume even when silent)
- **Real-time Device Tracking** - See online/offline status and last seen timestamps
- **Cross-Platform** - Mobile app for Android/iOS, web dashboard for control
- **Offline Support** - Works offline and syncs when connection is restored

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | React Native, Expo SDK 54, TypeScript |
| Web | React 18, Vite, TypeScript |
| Backend | Firebase (Firestore, Auth) |
| State | Zustand |

## Project Structure

```
├── backend/     # Firebase config & security rules
├── mobile/      # React Native app (Expo)
└── web/         # React web dashboard
```

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vekzzz/lost-device-finder.git
   cd lost-device-finder
   ```

2. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your config to `.env` files in `/backend`, `/mobile`, and `/web`

3. **Install dependencies**
   ```bash
   # Mobile
   cd mobile && npm install

   # Web
   cd ../web && npm install
   ```

4. **Run the apps**
   ```bash
   # Mobile (Expo)
   cd mobile && npx expo start

   # Web
   cd web && npm run dev
   ```

See [SETUP.md](SETUP.md) for detailed setup instructions.

## How It Works

1. Install the mobile app on devices you want to track
2. Sign up and register your devices
3. Use the web dashboard to locate devices
4. Send a "ring" command to trigger a loud alert
5. Find your device and send "stop" to silence it

## License

This is a personal project. Feel free to use it as reference or inspiration for your own projects.
