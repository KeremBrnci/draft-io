# Architecture Rules

This document defines the architectural guardrails for the draft.io platform. All contributors must follow these rules to maintain long-term maintainability.

## Architectural Style

- **Modular Monolith** — Single deployable unit with clear module boundaries
- **Clean Architecture** — Dependency rule: inner layers never depend on outer layers
- **Domain-Driven Design** — Rich domain models, bounded contexts per feature module
- **Feature-First Organization** — Code organized by business capability, not technical layer at the top level

## Layer Dependency Rules

### Allowed Dependencies

```
Presentation  →  Application  →  Domain
Infrastructure  →  Domain
Infrastructure  →  Application (via interfaces/ports only)
```

| From Layer     | To Layer       | Allowed                                   |
| -------------- | -------------- | ----------------------------------------- |
| Presentation   | Application    | ✅                                        |
| Presentation   | Domain         | ⚠️ Only for mapping, never business logic |
| Application    | Domain         | ✅                                        |
| Application    | Infrastructure | ❌ Use ports/interfaces instead           |
| Infrastructure | Domain         | ✅                                        |
| Infrastructure | Application    | ❌                                        |
| Domain         | Application    | ❌                                        |
| Domain         | Infrastructure | ❌                                        |
| Domain         | Presentation   | ❌                                        |
| Application    | Presentation   | ❌                                        |

### Forbidden Dependencies

1. **Domain → Infrastructure** — Domain must not import Prisma, Redis, HTTP, or NestJS
2. **Domain → Presentation** — Domain must not know about controllers or DTOs
3. **Application → Presentation** — Use cases must not import controllers
4. **Application → Infrastructure** — Use dependency injection via ports (interfaces)
5. **Circular dependencies** — Between modules or layers (enforced by ESLint `import/no-cycle`)

## Module Boundaries

Each feature module is a bounded context:

```
modules/
  players/
    application/
    domain/
    infrastructure/
    presentation/
    players.module.ts
```

### Cross-Module Communication

- Modules communicate through **application services** or **domain events** (future)
- Direct imports of another module's infrastructure layer are **forbidden**
- Shared kernel lives in `src/common/` — keep it minimal

## Dependency Inversion

1. Define repository interfaces (ports) in the **domain** layer
2. Implement repositories in the **infrastructure** layer
3. Wire implementations in the **module** file using NestJS DI tokens

```typescript
// domain/repositories/player.repository.port.ts
export const PLAYER_REPOSITORY = Symbol('PLAYER_REPOSITORY');
export interface PlayerRepositoryPort { ... }

// infrastructure/persistence/prisma-player.repository.ts
export class PrismaPlayerRepository implements PlayerRepositoryPort { ... }

// players.module.ts
{ provide: PLAYER_REPOSITORY, useClass: PrismaPlayerRepository }
```

## Shared Packages

| Package                  | Domain Layer   | Application | Infrastructure | Presentation | Frontend |
| ------------------------ | -------------- | ----------- | -------------- | ------------ | -------- |
| `@draft-io/shared-types` | ❌             | ⚠️          | ⚠️             | ✅           | ✅       |
| `@draft-io/shared-utils` | ✅ (pure only) | ✅          | ✅             | ✅           | ✅       |

## Error Handling

- **Domain errors** — Extend `DomainError`, contain `code` and `message` only
- **HTTP mapping** — Done in presentation layer (`DomainErrorHttpMapper`)
- **Never** put HTTP status codes in domain layer

## Logging

- Use structured JSON logging via `LoggerService`
- Include `module`, `correlationId` (future), and `level`
- Never log sensitive data (passwords, tokens)

## Future Considerations

- **Socket.IO** — Lives in presentation/infrastructure, not domain
- **Mobile apps** — Consume the same API; shared-types ensures contract consistency
- **Extraction to microservices** — Module boundaries enable future service extraction
