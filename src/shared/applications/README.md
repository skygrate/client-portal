# Shared Applications Module

**Exports:** `ApplicationItem`, `AppType`, status helpers, and Amplify-backed services.

- Hooks and UI call into the `@data/applications` layer; this folder supplies the default Amplify implementation.
- `services/apps.ts` should only be imported inside data-source registration (client or server). It is *client-compatible* but not client-only.
- `utils/status.ts` and `utils/mapRecord.ts` are pure utilities and can run server-side.
- Prefer importing from `@applications` rather than deep paths to maintain encapsulation.
