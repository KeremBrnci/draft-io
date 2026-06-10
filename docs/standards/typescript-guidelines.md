# TypeScript Guidelines

## Compiler Configuration

All packages extend `tsconfig.base.json` with these strict flags:

| Flag | Purpose |
|------|---------|
| `strict` | Enable all strict type-checking options |
| `noImplicitAny` | Disallow implicit `any` types |
| `strictNullChecks` | `null` and `undefined` are distinct types |
| `noUncheckedIndexedAccess` | Index access returns `T \| undefined` |
| `noImplicitReturns` | All code paths must return a value |
| `noUnusedLocals` | Error on unused local variables |
| `noUnusedParameters` | Error on unused parameters |
| `exactOptionalPropertyTypes` | Distinguish missing from `undefined` |

## Prohibited Patterns

### `any`

```typescript
// ❌ Forbidden
function process(data: any): void { ... }

// ✅ Use unknown and narrow
function process(data: unknown): void {
  if (isPlayerData(data)) { ... }
}
```

### `@ts-ignore`

```typescript
// ❌ Forbidden
// @ts-ignore
const value = dangerousOperation();

// ✅ Allowed with justification
// @ts-expect-error — Prisma client types lag behind schema migration
const result = prisma.legacyTable.findFirst();
```

Document every `@ts-expect-error` with a reason. Review quarterly.

## Type Patterns

### Discriminated Unions for Results

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

### Branded Types for IDs

```typescript
// Use Value Objects instead of raw strings
class PlayerId extends ValueObject<{ value: string }> { ... }
```

### Const Assertions

```typescript
const POSITIONS = ['GK', 'CB', 'ST'] as const;
type Position = (typeof POSITIONS)[number];
```

### Type Imports

Always use `import type` for type-only imports:

```typescript
import type { PlayerSummary } from '@draft-io/shared-types';
import { Player } from '../domain/entities/player.entity';
```

## Enums vs Union Types

Prefer **string union types** over TypeScript enums:

```typescript
// ✅ Preferred
type PlayerPosition = 'GK' | 'CB' | 'ST';

// ❌ Avoid
enum PlayerPosition { GK = 'GK', CB = 'CB' }
```

## Null Handling

```typescript
// With noUncheckedIndexedAccess
const items = ['a', 'b'];
const first = items[0]; // string | undefined

if (first !== undefined) {
  console.log(first.toUpperCase());
}

// Prefer explicit null checks over non-null assertions
const player = await repository.findById(id);
if (player === null) {
  throw new PlayerNotFoundError(id.value);
}
```

## Async Patterns

- Always `await` promises or explicitly `void` fire-and-forget
- Use `async/await` over raw `.then()` chains
- ESLint enforces `@typescript-eslint/no-floating-promises`

## Generic Constraints

```typescript
// ✅ Constrain generics
function findById<T extends Entity<unknown>>(repo: Repository<T>, id: string): Promise<T | null>

// ❌ Unconstrained generics
function findById<T>(repo: Repository<T>, id: string): Promise<T | null>
```

## Module Resolution

| Package | Module System | Resolution |
|---------|--------------|------------|
| Backend | CommonJS | Node |
| Frontend | ESNext | Bundler |
| Shared packages | NodeNext | NodeNext |

## Testing Types

- Test files: `*.unit.test.ts`, `*.integration.test.ts`
- Use `vi.fn()` with explicit mock types
- Avoid casting test doubles with `as any`
