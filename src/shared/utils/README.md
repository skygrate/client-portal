# Shared Utilities

- `format.ts`, `errors.ts`, `amplifyRecords.ts` – pure helpers safe for server and client usage.
- Avoid adding `'use client'` here; if a utility relies on browser APIs, move it into a feature or a dedicated client module.
