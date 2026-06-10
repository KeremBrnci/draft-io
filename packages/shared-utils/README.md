# @draft-io/shared-utils

Shared pure utility functions with no framework dependencies.

## Allowed Usage

| Consumer | Allowed | Notes |
|----------|---------|-------|
| Frontend (`apps/frontend`) | ✅ Yes | UI helpers, formatting, validation |
| Backend (all layers) | ✅ Yes | Pure functions only |
| Domain layer | ✅ Yes | Only if the utility has zero infrastructure coupling |

## What Belongs Here

- Pure functions (no side effects, no I/O)
- String, number, date formatting helpers
- Type guards and assertion utilities
- Shared validation helpers (non-domain-specific)

## What Does NOT Belong Here

- Domain business rules (belong in domain layer)
- Framework wrappers (NestJS, React hooks)
- Database or HTTP clients
- Configuration or environment access

## Rules

1. Every function must be pure and deterministic.
2. No runtime dependencies beyond TypeScript stdlib.
3. All functions must have unit tests.
4. Never import from `apps/*` or domain modules.
