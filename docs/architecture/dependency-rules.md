# Dependency Rules

## Enforcement

These rules are enforced by:

1. **dependency-cruiser** — `pnpm architecture:check`
2. **ESLint** — `no-restricted-imports` per layer
3. **CI** — `architecture` job in GitHub Actions

## Layer Rules

```
Presentation  →  Application  →  Domain
Infrastructure  →  Domain
Infrastructure  →  Application (via ports only)
```

### Allowed

| From                          | To          | Example                                                         |
| ----------------------------- | ----------- | --------------------------------------------------------------- |
| Presentation                  | Application | Controller imports `CreatePlayerUseCase`                        |
| Presentation                  | Domain      | **Mappers only** — `player-response.mapper.ts` imports `Player` |
| Application                   | Domain      | Use case imports `PlayerRepository` port                        |
| Infrastructure                | Domain      | Repository implements port, mapper converts                     |
| Infrastructure                | Application | Rare — prefer domain ports                                      |
| Module wiring (`*.module.ts`) | All layers  | Composition root                                                |

### Forbidden

| From         | To                       | Reason                          |
| ------------ | ------------------------ | ------------------------------- |
| Domain       | Infrastructure           | Dependency inversion violation  |
| Domain       | Presentation             | Inner layer must not know outer |
| Domain       | Application              | Domain is innermost             |
| Application  | Infrastructure           | Use ports instead               |
| Application  | Presentation             | Wrong direction                 |
| Presentation | Infrastructure           | Controllers must not touch DB   |
| Application  | `@nestjs/*`              | Framework coupling              |
| Domain       | `@nestjs/*`, `@prisma/*` | Purity violation                |

## Cross-Module Rules

Modules reference each other **by ID**, not by importing foreign entities.

### Allowed

```typescript
// teams/domain/entities/team.entity.ts
readonly playerIds: readonly string[];  // Reference by ID
readonly formationCode: string;         // Reference by code
```

### Discouraged

```typescript
// ❌ Importing another module's entity in domain
import { Player } from '../../players/domain/entities/player.entity';
```

### Current Exception (Documented)

`players/application` imports `Position` from `positions/domain`. This is accepted temporarily as shared vocabulary. Future: extract to shared kernel or application port.

### External Provider Boundary

| Rule                                                                | Enforcement                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------- |
| `players`/`teams`/`leagues` domain must not import `data-providers` | dependency-cruiser `no-feature-domain-to-data-providers` |
| `ExternalProvider` enum lives in `core/external-reference`          | shared kernel                                            |
| Provider adapters live only in `data-providers/infrastructure`      | module structure                                         |
| API DTOs must not become domain entities directly                   | import pipeline mappers                                  |

## Examples

### Good — Use case with port

```typescript
// application/use-cases/create-player.use-case.ts
export class CreatePlayerUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}
}
```

### Bad — Use case with Prisma

```typescript
// ❌ application/use-cases/create-player.use-case.ts
import { PrismaService } from '../../infrastructure/...';
```

### Good — Controller with mapper

```typescript
// presentation/controllers/players.controller.ts
const player = await this.createPlayerUseCase.execute(command);
return { data: toPlayerSummary(player) };
```

### Bad — Controller returning entity

```typescript
// ❌
return { data: player }; // Raw domain entity
```

## Composition Root Exceptions

These files may import across layers for wiring:

- `*.module.ts` — NestJS DI wiring
- `main.ts` — Bootstrap
- `app.module.ts` — Root composition

## Running Checks

```bash
pnpm architecture:check   # dependency-cruiser
pnpm lint                 # ESLint layer rules
```
