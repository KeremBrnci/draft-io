# Shared Utils Policy

## Purpose

Define what belongs in `@draft-io/shared-utils` to prevent it becoming a dumping ground for business logic.

## Current Status

Package is **actively maintained** with a small, curated set of pure utilities. Usage in application code is minimal by design — import only when a utility is genuinely shared.

## Allowed

| Category        | Examples                      | Requirements                  |
| --------------- | ----------------------------- | ----------------------------- |
| String helpers  | `slugify`, `isNonEmptyString` | Pure, deterministic           |
| Number helpers  | `clamp`                       | Pure, no domain meaning       |
| Type guards     | `assertNever`                 | Exhaustiveness checking       |
| Date formatting | ISO format helpers (future)   | No timezone business rules    |
| ID formatting   | `generateCode` (future)       | No domain-specific validation |

## Forbidden

| Category                | Why                                                     |
| ----------------------- | ------------------------------------------------------- |
| Business rules          | Belongs in domain layer                                 |
| Domain validation       | Belongs in value objects                                |
| Player/team/draft logic | Module-specific                                         |
| Framework wrappers      | Belongs in app infrastructure                           |
| HTTP clients            | Belongs in frontend `lib/api` or backend infrastructure |
| NestJS helpers          | Belongs in `apps/backend/src/common/`                   |
| Configuration access    | No `process.env` in shared-utils                        |

## Adding a New Utility

1. Confirm it is **pure** (no side effects, no I/O)
2. Confirm it is used or will be used by **2+ packages**
3. Add a **unit test**
4. Export from `src/index.ts`
5. Do **not** add domain-specific naming (e.g., `calculateChemistry` is forbidden)

## Good Example

```typescript
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

## Bad Example

```typescript
// ❌ Domain logic in shared-utils
export function isValidPlayerPosition(pos: string): boolean {
  return ['GK', 'ST'].includes(pos);
}
```

Position validation belongs in `positions/domain/value-objects/position.vo.ts`.

## Relationship to shared-types

| Package        | Contains                           |
| -------------- | ---------------------------------- |
| `shared-types` | TypeScript types and API contracts |
| `shared-utils` | Pure runtime utility functions     |

Never put types in shared-utils. Never put business logic in shared-types.
