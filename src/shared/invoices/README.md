# Shared Invoices Module

- Provides the default Amplify-backed invoice service (`services/invoices.ts`).
- Consumers should prefer the `@data/invoices` abstraction which can be swapped for SSR/API implementations.
- The service is client-friendly but not inherently client-only; it uses Amplify Storage/Data under the hood.
- When mocking invoices (tests, stories), configure a fake data source via `configureInvoicesDataSource`.
