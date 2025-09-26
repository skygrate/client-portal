# Shared Hooks

- `useErrorState` – client hook for consistent error reporting. Accepts either a string or `{ error, fallback, origin, notify }` payload.
- `useAsyncAction` – wraps async callbacks with optional confirmation prompts and busy state tracking. Client-only, intended for event handlers.

Guidelines:
- Prefer these shared hooks over local copies so error logging and UX remain consistent.
- Extend them here if a feature needs additional behavior; avoid duplicating per feature.
