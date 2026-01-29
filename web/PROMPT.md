# WEB PROMPT – Lost Device Finder

Context:
This web app controls registered devices owned by the user.

Responsibilities:
- Authenticate user
- List devices
- Trigger commands (ring / stop)
- Display device status (online/offline, last seen)

Tech Stack:
- React + Vite
- TypeScript
- Firebase Auth + Firestore
- React Query
- Zustand

Constraints:
- No maps
- No tracking
- Simple dashboard UI

Always:
- Keep UI minimal
- Reflect backend command states
- Handle offline devices gracefully