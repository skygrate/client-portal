# Shared Domain Module

**Audience:** client features that need domain metadata.

- `index.ts` re-exports types (`DomainItem`), data hooks (`useDomains`), and utility helpers.
- `hooks/useDomains.ts` is client-only (`'use client'`); it reads from the configured data source and handles storage cleanup.
- `services/domains.ts` wraps Amplify client access; use it only when registering the default data source.
- Utilities (`utils/*`) are pure and safe for server usage.
- Configure alternate data sources via `configureDomainDataSource` in `@data/domains` if you need SSR or testing stubs.
