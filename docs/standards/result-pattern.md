# Result Pattern

## Purpose

Provide a single, consistent way to represent success and failure in domain and application layers without exceptions for expected errors.

## Canonical Type

**Location:** `apps/backend/src/common/domain/result.ts`

```typescript
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never>;
export function err<E>(error: E): Result<never, E>;
```

This is the **only** Result type for backend domain and application code.

## API Contract Type (Separate)

**Location:** `packages/shared-types/src/result.ts`

```typescript
export type ApiOperationResult<T, E = string> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };
```

Used for **HTTP/API contracts** between frontend and backend. Different shape (`success`/`data` vs `ok`/`value`) intentionally separates API from domain.

## Where Result Is Allowed

| Layer | Allowed | Notes |
|-------|---------|-------|
| Domain | Yes | Prefer throwing domain errors for invariant violations |
| Application | Yes | Use for expected failures (not found, validation) |
| Infrastructure | Rarely | Only for adapter-level operations |
| Presentation | No | Map `Result` to HTTP at controller boundary |
| Frontend | Use `ApiOperationResult` | From `@draft-io/shared-types` |

## Where Result Is Forbidden

- Inside Prisma repositories (throw or return domain types)
- Inside DTOs
- Mixing `ApiOperationResult` in backend domain/application code

## Error Representation

- Domain errors extend `DomainError` with a `code` string
- Application use cases may `throw` domain errors (current pattern) or return `err(domainError)`
- HTTP mapping uses convention-based `mapDomainErrorToHttpStatus()` — not Result-aware yet

## HTTP Mapping

Domain errors thrown from use cases are caught by `HttpExceptionFilter` and mapped via:

- `*_NOT_FOUND` → 404
- `INVALID_*` → 400
- default → 422

## Migration Path

When adopting Result in use cases:

1. Change `execute()` return type to `Promise<Result<T, DomainError>>`
2. Replace `throw new XError()` with `return err(new XError())`
3. Controllers check `result.ok` and map accordingly
4. Keep invariant violations as throws inside entities/value objects

## Good Example

```typescript
async execute(query: GetPlayerByIdQuery): Promise<Result<Player, PlayerNotFoundError>> {
  const player = await this.playerRepository.findById(PlayerId.create(query.playerId));
  if (player === null) {
    return err(new PlayerNotFoundError(query.playerId));
  }
  return ok(player);
}
```

## Bad Example

```typescript
// ❌ Using ApiOperationResult in application layer
import type { ApiOperationResult } from '@draft-io/shared-types';
```
