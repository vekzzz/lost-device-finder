# MOBILE PROMPT – Lost Device Finder

Context:
This app runs on the lost device itself.

Responsibilities:
- Generate and persist deviceId
- Listen for backend commands
- Trigger max-volume sound alert
- Work without internet when possible
- Save last-known activity snapshot

Tech Stack:
- React Native (Expo)
- TypeScript
- Zustand
- Firebase SDK
- Expo AV / Device APIs

Constraints:
- Platform limitations (iOS/Android)
- Power-saving mode handling
- No background GPS tracking

Always:
- Prioritize reliability over features
- Fail gracefully