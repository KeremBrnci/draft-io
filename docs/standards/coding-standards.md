# Coding Standards

## SOLID Principles

### Single Responsibility Principle (SRP)

Each class/function has one reason to change.

- **Entities** — Represent business objects and enforce invariants
- **Use Cases** — Orchestrate a single application operation
- **Repositories** — Handle persistence for one aggregate
- **Controllers** — Handle HTTP request/response mapping only

### Open/Closed Principle (OCP)

Open for extension, closed for modification.

- Add new use cases rather than modifying existing ones
- Extend behavior via new implementations of ports (e.g., new repository)
- Use strategy pattern for varying algorithms (simulation engine, chemistry)

### Liskov Substitution Principle (LSP)

Implementations must be substitutable for their interfaces.

- `PrismaPlayerRepository` must fully satisfy `PlayerRepositoryPort`
- Mock implementations in tests must behave like production implementations

### Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use.

- Keep repository ports focused (e.g., `PlayerRepositoryPort`, not `GenericRepository`)
- Split large service interfaces into role-specific ports

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

- Application layer depends on `PlayerRepositoryPort`, not `PrismaPlayerRepository`
- Wire concrete implementations in module configuration

## General Rules

1. **No `any`** — Use `unknown` and narrow with type guards
2. **No `@ts-ignore`** — Use `@ts-expect-error` with description if absolutely necessary
3. **Strict TypeScript** — All compiler strict flags enabled
4. **Immutable by default** — Use `readonly` for properties and parameters
5. **Explicit over implicit** — No magic strings; use constants and enums
6. **Small functions** — Target < 30 lines; extract when logic grows
7. **No business logic in controllers** — Controllers delegate to use cases

## DTO Usage

| Layer        | DTO Type         | Purpose                              |
| ------------ | ---------------- | ------------------------------------ |
| Presentation | Request DTOs     | Input validation (`class-validator`) |
| Presentation | Response DTOs    | Output shape for API consumers       |
| Application  | Commands/Queries | Internal operation parameters        |
| Domain       | Entities/VOs     | Business objects with invariants     |

Rules:

- Request DTOs use `class-validator` decorators
- Response DTOs map from domain entities via static factory methods
- Never pass DTOs into the domain layer
- Commands and queries are plain interfaces, not classes

## Repository Pattern

```typescript
// Port (domain layer)
interface PlayerRepositoryPort {
  findById(id: PlayerId): Promise<Player | null>;
  save(player: Player): Promise<void>;
}

// Adapter (infrastructure layer)
class PrismaPlayerRepository implements PlayerRepositoryPort { ... }

// Mapper (infrastructure layer)
class PlayerMapper {
  static toDomain(record: PrismaPlayer): Player { ... }
  static toPersistence(player: Player): PrismaPlayerCreateInput { ... }
}
```

## Service Boundaries

- **Use Cases** — One public `execute()` method per class
- **Domain Services** — Only when logic doesn't belong to a single entity
- **Application Services** — Coordinate multiple use cases (sparingly)
- **Infrastructure Services** — External system adapters (Redis, email, etc.)

## Error Handling

```typescript
// Domain
throw new PlayerNotFoundError(playerId);

// Application — let domain errors propagate
// Presentation — HttpExceptionFilter maps to HTTP responses
```

Never catch and swallow errors. Always log at the boundary.

## Logging Standards

```json
{
  "timestamp": "2026-06-09T12:00:00.000Z",
  "level": "error",
  "message": "Failed to save player",
  "module": "PrismaPlayerRepository",
  "trace": "..."
}
```

- `log` — Normal operations
- `warn` — Recoverable issues
- `error` — Failures requiring attention
- `debug` — Development diagnostics only

## Import Order

Enforced by ESLint:

1. Node.js built-ins
2. External packages
3. Internal modules (absolute)
4. Relative imports

Alphabetized within each group, blank line between groups.
