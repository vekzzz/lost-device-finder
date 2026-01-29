# BACKEND PROMPT – Lost Device Finder

Context:
Backend coordinates commands between web and mobile.

Responsibilities:
- Store users and devices
- Store and dispatch commands
- Enforce ownership security
- Keep data model simple

Tech Stack:
- Firebase Firestore
- Firebase Auth
- Optional Node.js + Express (if needed)

Data Model (MVP):
- users/{userId}
- devices/{deviceId}
- commands/{commandId}

Constraints:
- No real-time tracking
- No heavy server logic

Always:
- Optimize for simplicity
- Avoid premature scaling