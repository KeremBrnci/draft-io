---
name: nest-module
description: >-
  Scaffolds new NestJS bounded-context modules for draft.io following the
  players reference implementation — layers, DI wiring, exports, and tests.
  Use when creating a new backend module, adding a bounded context, or
  extending module structure.
---

# Nest Module

## Governance

Use when scaffolding backend modules during lifecycle Step 5. Subordinate to `architecture.mdc` and `ai-constitution.md`.

| Document               | Path                                      |
| ---------------------- | ----------------------------------------- |
| AI Constitution        | `docs/architecture/ai-constitution.md`    |
| Workflow               | `.cursor/rules/workflow.mdc`              |
| Universal instructions | `AGENTS.md`                               |
| Project context        | `.claude/skills/project-context/SKILL.md` |

## Purpose

Provide a repeatable workflow for creating new **draft.io** backend modules as NestJS bounded contexts with Clean Architecture layers. Every module follows the `players/` reference implementation and template in `apps/backend/src/modules/README.md`.

## When to use

- Creating a new module (`draft`, `lobbies`, `matches`, `simulation`, etc.)
- Adding a new use case to an existing module
- Wiring cross-module dependencies via NestJS exports
- Registering a module in `AppModule`
- Setting up repository ports and Prisma adapters for a new aggregate

## Required inputs

1. **Module name** — Singular, lowercase (`draft`, not `drafts`)
2. **Aggregate root** — Primary entity (e.g., `DraftRoom`, `Lobby`, `Match`)
3. **Operations** — List of commands/queries (create, get-by-id, list, etc.)
4. **Persistence** — Prisma table, in-memory, or Redis?
5. **Exports** — Which use cases/repositories other modules need?

## Rules

### Directory scaffold

Copy structure from `players/`:

```
apps/backend/src/modules/{module}/
├── application/
│   ├── commands/
│   ├── queries/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── errors/
│   └── repositories/
├── infrastructure/
│   ├── mappers/
│   └── persistence/
├── presentation/
│   ├── controllers/
│   ├── dto/
│   └── mappers/
└── {module}.module.ts
```

### Step-by-step creation

**1. Domain layer first**

- Entity with `create()` and `reconstitute()` factories
- Value objects for IDs and validated fields
- `DomainError` subclasses with convention codes
- Repository interface + injection token symbol

**2. Application layer**

- One use case per operation
- Commands/queries as plain types
- No NestJS, no Prisma

**3. Infrastructure layer**

- `prisma-{entity}.repository.ts` implements port
- `{entity}.mapper.ts` converts Prisma ↔ domain
- In-memory repository for static data (see `formations/`)

**4. Presentation layer**

- Controller with thin handlers
- Request DTOs with `class-validator`
- Response DTOs and mappers

**5. Module wiring**

```typescript
import { Module } from '@nestjs/common';
import { provideUseCase } from '../../common/nest/provide-use-case';
import { ENTITY_REPOSITORY } from './domain/repositories/{entity}.repository';
import { PrismaEntityRepository } from './infrastructure/persistence/prisma-{entity}.repository';
import { EntityController } from './presentation/controllers/{entity}.controller';
import { CreateEntityUseCase } from './application/use-cases/create-{entity}.use-case';

@Module({
  controllers: [EntityController],
  providers: [
    provideUseCase(CreateEntityUseCase, [ENTITY_REPOSITORY]),
    { provide: ENTITY_REPOSITORY, useClass: PrismaEntityRepository },
  ],
  exports: [CreateEntityUseCase, ENTITY_REPOSITORY],
})
export class EntityModule {}
```

**6. Register in AppModule**

```typescript
import { EntityModule } from './modules/{module}/{module}.module';

@Module({
  imports: [PlayersModule, EntityModule /* ... */],
})
export class AppModule {}
```

**7. Prisma schema** (if persisted)

Add model to `schema.prisma`, run migration, never expose Prisma types outside infrastructure.

**8. Tests**

- Unit tests colocated with domain, use cases
- Integration test for repository
- E2e test for primary endpoints

### Cross-module imports

```typescript
// draft.module.ts — needs players
@Module({
  imports: [PlayersModule],
  providers: [provideUseCase(MakeDraftPickUseCase, [DRAFT_REPOSITORY, PLAYER_REPOSITORY])],
})
export class DraftModule {}
```

Import the **module**, inject the **token** — never import entities across domains.

### Placeholder modules

For not-yet-implemented modules, create minimal structure:

- Domain interfaces and error stubs
- Empty or in-memory repository
- Controller returning 501 or omitted until ready

Do not create empty modules with no domain concept defined.

## Examples

### Example 1: Creating `draft` module

```
draft/
├── domain/
│   ├── entities/draft-room.entity.ts      # pick order, pool, state machine
│   ├── value-objects/draft-pick.vo.ts
│   ├── value-objects/draft-order.vo.ts
│   ├── errors/draft.errors.ts             # DRAFT_NOT_FOUND, INVALID_PICK
│   └── repositories/draft-room.repository.ts
├── application/
│   ├── commands/make-pick.command.ts
│   ├── use-cases/make-pick.use-case.ts
│   └── use-cases/create-draft-room.use-case.ts
├── infrastructure/persistence/prisma-draft-room.repository.ts
├── presentation/controllers/draft.controller.ts
└── draft.module.ts
```

Exports: `MakeDraftPickUseCase`, `DRAFT_ROOM_REPOSITORY` for lobby integration.

### Example 2: In-memory module (formations pattern)

Static game data with no database:

- Repository interface in domain
- `in-memory-formation.repository.ts` returns predefined templates
- No Prisma model needed

### Example 3: Adding use case to existing module

1. Create `application/commands/archive-player.command.ts`
2. Create `application/use-cases/archive-player.use-case.ts`
3. Add method to `PlayerRepository` port if needed
4. Implement in `PrismaPlayerRepository`
5. Add `provideUseCase(ArchivePlayerUseCase, [PLAYER_REPOSITORY])` to module
6. Add controller endpoint
7. Unit + e2e tests

## Checklist

- [ ] Module folder matches template structure
- [ ] Domain has entity, VOs, errors, repository port
- [ ] Use cases are plain classes with `execute()`
- [ ] `provideUseCase()` for every use case in module providers
- [ ] Repository bound with `{ provide: TOKEN, useClass: Impl }`
- [ ] Controller has no business logic
- [ ] DTOs validated with class-validator
- [ ] Module registered in `AppModule`
- [ ] Prisma migration if new tables
- [ ] `exports` includes cross-module dependencies
- [ ] Unit tests for domain and use cases
- [ ] Integration test for repository
- [ ] E2e test for HTTP endpoints
- [ ] `pnpm architecture:check` passes
- [ ] `apps/backend/src/modules/README.md` updated if placeholder promoted

## Anti-patterns

| Anti-pattern                             | Correct approach                      |
| ---------------------------------------- | ------------------------------------- |
| Single `service.ts` with all logic       | Layered use cases + domain            |
| Skipping repository port                 | Interface in domain always            |
| `@Injectable()` on use cases             | `provideUseCase()`                    |
| Business logic in `{module}.module.ts`   | Module is DI wiring only              |
| Importing `PlayersModule` in domain      | Application layer injection only      |
| Giant controller file                    | One controller per aggregate resource |
| Shared `dto/` folder at src root         | Per-module `presentation/dto/`        |
| Prisma client as provider                | Repository implementation class       |
| Forgetting to export use cases           | Explicit `exports` array              |
| Creating module without aggregate design | Domain model first                    |
