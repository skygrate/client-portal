# Shared Files Module

**Purpose:** reusable file-management helpers for client features.

- `hooks/useFiles.ts` is client-only and depends on Amplify Storage; import it from `@files` when building upload UI.
- `utils/path.ts` contains pure helpers for normalizing S3 prefixes (server-safe).
- `types.ts` re-exports the storage DTO (`StorageFileItem`).
- Feature code should avoid calling Amplify storage APIs directly; use `useFiles` or the functions exposed in `@data` if you add them later.
