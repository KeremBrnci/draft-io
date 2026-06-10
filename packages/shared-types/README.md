# @draft-io/shared-types

Shared TypeScript types and API contracts for the draft.io platform.

## Allowed Usage

| Consumer                     | Allowed      | Notes                                                      |
| ---------------------------- | ------------ | ---------------------------------------------------------- |
| Frontend (`apps/frontend`)   | ✅ Yes       | API response types, shared enums, pagination               |
| Backend Presentation layer   | ✅ Yes       | DTO mapping targets, API contracts                         |
| Backend Application layer    | ⚠️ Sparingly | Prefer domain types; use for cross-boundary contracts only |
| Backend Domain layer         | ❌ No        | Domain must remain framework-agnostic and self-contained   |
| Backend Infrastructure layer | ⚠️ Sparingly | Mapping to/from external APIs only                         |

## What Belongs Here

- API request/response shapes
- Shared enums and constants used across frontend and backend
- Pagination and common utility types
- WebSocket event payloads (future)

## What Does NOT Belong Here

- Domain entities or value objects
- Business logic
- Framework-specific types (NestJS, Prisma, React)
- Database schema definitions

## Rules

1. This package must have **zero runtime dependencies**.
2. All exports must be types or pure utility functions with no side effects.
3. Breaking changes require a version bump and coordinated frontend/backend update.
4. Never import from `apps/*` into this package.
