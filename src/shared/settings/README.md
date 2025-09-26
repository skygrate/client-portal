# Shared Settings Module

- Exports the user profile hook (`useUserProfile`) and Amplify-based CRUD service.
- The hook is client-only; it uses React state and the `@data/settings` abstraction.
- `services/userProfile.ts` is the default data source implementation registered in `@data/client`.
- Access profile data in UI code through `@settings` (for types/hooks) or `@data/settings` (for server/workers).
