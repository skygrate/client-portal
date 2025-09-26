# Shared Data Layer

Purpose: Provide environment-agnostic access to feature data. Each file exports `configure*DataSource` so you can plug in Amplify, server actions, or test doubles.

## Usage

- Default client configuration happens in `@data/client` (imported in `Providers`).
- For SSR or unit tests, call `configure...` with alternative implementations before using the helpers.
- UI code should use helpers like `listApplicationsByUser` rather than importing Amplify services directly.

## Client vs Server

- `client.ts` is the only client-only file (`'use client'`); it wires Amplify actions.
- The rest of the files are pure TypeScript gateways and safe on the server.
