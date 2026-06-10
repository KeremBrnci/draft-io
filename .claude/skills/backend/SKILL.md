---
name: backend
description: >-
  Implements NestJS backend features for draft.io following Clean Architecture —
  use cases, repositories, Prisma persistence, DTOs, and domain error mapping.
  Use when writing API endpoints, use cases, repositories, migrations, filters,
  or backend integration code.
---

# Backend

## Governance

Use during implementation (lifecycle Step 5). Subordinate to `ai-constitution.md` and `workflow.mdc`.

| Document               | Path                                      |
| ---------------------- | ----------------------------------------- |
| AI Constitution        | `docs/architecture/ai-constitution.md`    |
| Workflow               | `.cursor/rules/workflow.mdc`              |
| Universal instructions | `AGENTS.md`                               |
| Project context        | `.claude/skills/project-context/SKILL.md` |

## Purpose

Guide implementation of the **draft.io** NestJS backend (`apps/backend`) as a framework-at-the-edges modular monolith. Business logic lives in domain and application layers; NestJS, Prisma, and HTTP concerns stay at the boundaries.

## When to use

- Creating or modifying REST API endpoints
- Implementing use cases, commands, queries
- Writing Prisma repositories and persistence mappers
- Handling domain errors and HTTP status mapping
- Wiring NestJS modules and dependency injection
- Adding integration or e2e API tests
- Working with `common/` shared backend utilities

## Required inputs

1. **Module name** — Which bounded context? (`players`, `teams`, `draft`, etc.)
2. **Operation type** — Command (write) or query (read)?
3. **Aggregate affected** — Which entity owns invariants?
4. **API contract** — Request/response shape; align with `@draft-io/shared-types` if exposed to frontend
5. **Error cases** — Domain errors with convention-based codes (`PLAYER_NOT_FOUND`, `INVALID_POSITION`)

## Rules

### Request flow

```
HTTP Request
  → Controller (presentation)
    → validates DTO (class-validator)
    → maps DTO → Command/Query
    → calls UseCase.execute()
  → UseCase (application)
    → loads/saves via Repository port
    → orchestrates domain entities
  → Repository (infrastructure)
    → Prisma persistence
    → maps persistence ↔ domain via mapper
  → Response mapper → DTO → JSON
```

### Use cases

- One class per operation; single `execute(command | query)` method
- Plain TypeScript class — **no** `@Injectable()`
- Constructor injection of repository ports and domain services only
- Wire with `provideUseCase(UseCaseClass, [TOKEN, ...])` from `common/nest/provide-use-case.ts`

```typescript
export class CreatePlayerUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(command: CreatePlayerCommand): Promise<Player> {
    const player = Player.create({
      /* value objects */
    });
    await this.playerRepository.save(player);
    return player;
  }
}
```

### Commands and queries

- **Commands** (`application/commands/`) — write inputs; named `{verb}-{entity}.command.ts`
- **Queries** (`application/queries/`) — read inputs; named `{verb}-{entity}.query.ts`
- Plain interfaces or classes; no NestJS decorators

### Repository ports

- Interface in `domain/repositories/` with injection token: `export const PLAYER_REPOSITORY = Symbol('PlayerRepository')`
- Methods use domain types (`Player`, `PlayerId`), never Prisma types
- Implementation in `infrastructure/persistence/prisma-{entity}.repository.ts`
- Mapper in `infrastructure/mappers/` converts Prisma records ↔ domain entities

### Domain errors

- Extend `DomainError` from `common/errors/domain.error.ts`
- Use convention-based codes for HTTP mapping (`mapDomainErrorToHttpStatus`):
  - `*_NOT_FOUND` → 404
  - `INVALID_*` → 400
  - `CONFLICT_*` → 409
  - default → 422
- Throw from domain entities or use cases; never attach HTTP status in domain

### Controllers and DTOs

- Controllers delegate immediately to use cases — no business logic
- Request DTOs in `presentation/dto/` with `class-validator` decorators
- Response DTOs separate from request DTOs
- Response mappers in `presentation/mappers/` convert domain → DTO

### Module wiring (`{module}.module.ts`)

Only place where infrastructure meets NestJS DI:

```typescript
@Module({
  controllers: [PlayersController],
  providers: [
    provideUseCase(CreatePlayerUseCase, [PLAYER_REPOSITORY]),
    { provide: PLAYER_REPOSITORY, useClass: PrismaPlayerRepository },
  ],
  exports: [CreatePlayerUseCase, PLAYER_REPOSITORY],
})
export class PlayersModule {}
```

### Prisma

- Schema in `apps/backend/prisma/schema.prisma`
- Table names snake_case via `@@map`; columns via `@map`
- Domain layer never imports `@prisma/client`
- Migrations run from backend package

### Shared packages

- `@draft-io/shared-types` — API-layer result types for HTTP contracts
- Domain/application use `common/domain/result.ts` (see `docs/standards/result-pattern.md`)

## Examples

### Example 1: Adding `DELETE /players/:id`

1. `DeletePlayerCommand` with `id: string`
2. `DeletePlayerUseCase` — load by ID, throw `PlayerNotFoundError` if missing, call `repository.delete(id)`
3. `PlayerNotFoundError` with code `PLAYER_NOT_FOUND`
4. Controller: `@Delete(':id')` → use case → `204 No Content`
5. Unit test use case with in-memory/fake repository
6. E2e test in `test/e2e/players.e2e.test.ts`

### Example 2: Cross-module validation in application layer

`AssignPlayerToTeamUseCase` (teams module):

```typescript
async execute(command: AssignPlayerCommand): Promise<Team> {
  const player = await this.playerRepository.findById(PlayerId.create(command.playerId));
  if (!player) throw new PlayerNotFoundError(command.playerId);
  const team = await this.teamRepository.findById(TeamId.create(command.teamId));
  // domain logic on team entity
  await this.teamRepository.save(team);
  return team;
}
```

Inject `PLAYER_REPOSITORY` from `PlayersModule` exports — still no entity cross-import.

### Example 3: List with filters

- `ListPlayersQuery` with optional `position?: string`, `minRating?: number`
- Use case passes filter to repository port method
- Repository implements Prisma `where` clause in infrastructure only

## Checklist

- [ ] Use case has no NestJS or Prisma imports
- [ ] Repository interface in domain; Prisma impl in infrastructure
- [ ] Value objects validate on creation (`PlayerName.create()`, `Position.create()`)
- [ ] Entity factory methods: `create()` for new, `reconstitute()` from persistence
- [ ] DTO validation on request bodies
- [ ] Response mapper separates domain from HTTP shape
- [ ] Domain errors use naming conventions for HTTP mapping
- [ ] Module exports use cases other modules need
- [ ] Unit tests colocated: `*.unit.test.ts` next to source
- [ ] Integration tests for repositories: `test/integration/`
- [ ] E2e tests for HTTP: `test/e2e/`
- [ ] `pnpm --filter @draft-io/backend typecheck` passes
- [ ] `pnpm architecture:check` passes

## Anti-patterns

| Anti-pattern                                              | Correct approach                      |
| --------------------------------------------------------- | ------------------------------------- |
| `@Injectable()` on use cases                              | `provideUseCase()`                    |
| Returning Prisma models from use cases                    | Map to domain entity, then to DTO     |
| `try/catch` swallowing domain errors in controllers       | Let global exception filter handle    |
| HTTP status codes in domain errors                        | Convention-based codes only           |
| Generic `Error` throws                                    | Typed `DomainError` subclasses        |
| Business logic in `prisma-*.repository.ts`                | Repository is persistence only        |
| God use case handling 5 operations                        | One use case per operation            |
| Leaking `uuid` generation into domain entity              | Generate ID in use case or VO factory |
| Skipping response mapper (returning entity in controller) | Always map to response DTO            |
| Importing controllers across modules                      | Import exported use cases only        |
