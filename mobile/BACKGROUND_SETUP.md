# Background Execution Guide

This guide explains how the Lost Device Finder mobile app works in the background.

## How It Works

The app uses **Firestore real-time listeners** and **notifications** to ensure you receive alerts even when the app is in the background.

### Key Features:
- ✅ **Real-time Command Listening**: Active Firestore listener while app is running
- ✅ **Push Notifications**: Alert notifications when ring commands are received
- ✅ **Background Audio**: Alert sound plays even when app is in background
- ✅ **Persistent Connection**: Firestore listeners stay active in background (limited time)

## Installation

### 1. Install Dependencies

```bash
cd mobile
npm install
```

This installs `expo-notifications` for local notifications.

### 2. Run the App

```bash
npm start
```

## How Background Execution Works

### When App is in Foreground (Open):
- ✅ Firestore listener is active
- ✅ Commands execute **instantly** (< 1 second)
- ✅ Alert plays immediately
- ✅ No delay

### When App is in Background (Home button pressed):
- ✅ Firestore listener remains active for **~30 seconds to 5 minutes** (iOS/Android vary)
- ✅ Commands execute quickly while listener is active
- ✅ Notification sent when alert starts
- ✅ Alert audio continues playing

### When App is Closed (Force quit):
- ⚠️ Firestore listener stops
- ⚠️ Commands will NOT execute until app is reopened
- 💡 **Important**: Keep the app running in background (don't force quit)

## Best Practices

### For Users:

1. **Don't Force Quit the App**
   - Press Home button instead of swiping away
   - This keeps the Firestore listener active
   - Commands will execute faster

2. **Enable Notifications**
   - Grant notification permission when prompted
   - Notifications alert you when the device rings
   - Even if app is in background

3. **Keep App in Background**
   - The app works best when kept running
   - iOS/Android will manage memory automatically
   - Only close if absolutely necessary

4. **Ensure Good Internet Connection**
   - Firestore requires active internet
   - Wi-Fi or cellular data must be enabled
   - Commands sync via Firebase

## Platform-Specific Behavior

### iOS:
- Background execution: **~3-5 minutes** after backgrounding
- Audio continues playing if alert started while app was foreground
- Low Power Mode: Reduces background time
- Notifications: Work reliably

### Android:
- Background execution: **~30 seconds to 5 minutes** depending on manufacturer
- Doze Mode: May limit background activity
- Battery Optimization: May kill background processes
- **Recommendation**: Disable battery optimization for this app

## Testing

### Test Real-time Response (App Open):
1. Open mobile app and log in
2. Send "Ring" command from web dashboard
3. Alert should play within 1 second

### Test Background Response (App in Background):
1. Open mobile app and log in
2. Press Home button (don't swipe away)
3. Send "Ring" command from web
4. Alert should play within 5-30 seconds
5. Notification should appear

### Test After Reopening (App Was Closed):
1. Force quit the app
2. Send "Ring" command from web
3. Nothing happens (expected - app is closed)
4. Reopen the app
5. Command executes immediately upon reconnection

## Troubleshooting

### Alert not playing when app is in background:

1. **Check if app was force quit**:
   - Don't swipe away from app switcher
   - Just press Home button

2. **Check notification permissions**:
   - Settings → Lost Device Finder → Notifications
   - Ensure "Allow Notifications" is enabled

3. **Check internet connection**:
   - Ensure Wi-Fi or cellular data is active
   - Firestore requires internet to sync

4. **Wait a moment**:
   - Background execution may take 5-30 seconds
   - Be patient, especially on Android

### Notifications not appearing:

1. **Grant permissions**:
   - Open app → Allow notifications when prompted
   - Or: Settings → Lost Device Finder → Notifications → Enable

2. **Check Do Not Disturb**:
   - Disable Do Not Disturb mode
   - Or whitelist this app

3. **Restart the app**:
   - Force quit and reopen
   - Log in again

### Commands not executing:

1. **Ensure app is logged in**:
   - Open app and verify you're signed in
   - Check for "Device Protection Active" message

2. **Check Firestore connection**:
   - Look for "Background fetch is available" or similar status
   - Verify internet is working

3. **Keep app running**:
   - Don't force quit
   - Let it run in background

## Android Battery Optimization

Many Android manufacturers aggressively kill background apps. To improve reliability:

### Samsung:
1. Settings → Apps → Lost Device Finder
2. Battery → Optimize battery usage
3. Select "All apps" → Find "Lost Device Finder"
4. Toggle OFF

### Xiaomi/MIUI:
1. Settings → Apps → Manage apps → Lost Device Finder
2. Battery saver → No restrictions
3. Autostart → Enable
4. Battery optimization → Don't optimize

### Huawei:
1. Settings → Apps → Lost Device Finder
2. Battery → App launch → Manage manually
3. Enable: Auto-launch, Secondary launch, Run in background

### OnePlus/Oppo:
1. Settings → Apps → Lost Device Finder
2. Battery → Battery optimization → Don't optimize
3. Advanced → Background freeze → Disabled

## Limitations

### Current Implementation:
- ✅ Works great when app is in foreground
- ✅ Works well when app is in background (limited time)
- ⚠️ Does NOT work when app is force quit
- ⚠️ Background time varies by platform (30 sec - 5 min)

### Why Not True Background Service?:
- iOS: Requires specific background modes (location, audio, VoIP, etc.)
- Android: Possible with foreground service, but requires persistent notification
- Expo Go: Background tasks don't work in Expo Go
- **Solution for Production**: Use EAS Build for standalone app with full background capabilities

## Production Deployment

For true always-on background execution, you'll need to:

1. **Build Standalone App** (not Expo Go):
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

2. **Add Background Modes** (iOS):
   - Already configured in app.json
   - Requires App Store review

3. **Add Foreground Service** (Android):
   - Shows persistent notification
   - App runs continuously
   - Better reliability

4. **Consider Push Notifications** (Advanced):
   - Use Firebase Cloud Messaging
   - Send push when command is created
   - Wakes app to execute command
   - Most reliable solution

## Recommendations

### For Best Experience:

1. ✅ Use standalone build (EAS Build), not Expo Go
2. ✅ Enable notifications
3. ✅ Don't force quit the app
4. ✅ Disable battery optimization (Android)
5. ✅ Keep good internet connection
6. ✅ Educate users on best practices

### Current Setup is Best For:
- Development and testing
- Apps kept running in background
- Devices that aren't force-quit often
- Users who understand the limitations

### For Production, Consider:
- Push notifications via FCM
- Foreground service (Android)
- Background modes (iOS)
- Standalone app builds
