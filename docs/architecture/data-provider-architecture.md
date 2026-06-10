# Data Provider Architecture

## Purpose

Integrate external football data sources (starting with **sportdb.dev**) as **read-only data providers** without coupling game domain to HTTP clients or provider-specific JSON shapes.

## Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `data-providers` module | Provider ports, adapters, import use cases |
| `players` / `teams` / `leagues` | Domain aggregates and persistence |
| `overall-engine` | Game-owned overall generation |

## Module Structure

```
data-providers/
├── domain/
│   ├── enums/data-provider.enum.ts
│   ├── models/external-*-record.ts
│   └── ports/*-provider.port.ts
├── application/
│   ├── use-cases/import-*.use-case.ts
│   ├── mappers/external-*-to-*.mapper.ts
│   └── policies/import-placeholder-overall.policy.ts
├── infrastructure/
│   └── sportdb/
│       ├── dtos/
│       ├── mappers/
│       └── providers/
└── data-providers.module.ts
```

## ExternalProvider (Shared Kernel)

```typescript
// apps/backend/src/core/external-reference/external-provider.ts
enum ExternalProvider {
  SPORTDB = 'SPORTDB',
  SPORTMONKS = 'SPORTMONKS',
  API_FOOTBALL = 'API_FOOTBALL',
  SOFASCORE = 'SOFASCORE',
}
```

- `players` / `teams` / `leagues` domain import `ExternalProvider` from **core**, never from `data-providers`.
- `data-providers` may depend on core `ExternalProvider`.
- Deprecated alias: `data-providers/domain/enums/data-provider.enum.ts` → re-exports only.

New providers add an adapter under `infrastructure/{provider}/` and register in `data-providers.module.ts` — no changes to player/team/league domain entities.

## External Reference Strategy

Internal UUID is the primary key. Provider identity is stored separately:

| Field | Example |
|-------|---------|
| `id` | `550e8400-e29b-41d4-a716-446655440000` |
| `provider` | `SPORTDB` |
| `externalId` | `vgOOdZbd` |

Database: `@@unique([provider, externalId])` on players, teams, leagues.

## Provider Ports

```typescript
interface PlayerProvider {
  fetchByExternalId(externalId: string): Promise<ExternalPlayerRecord | null>;
  fetchBatch(externalIds: readonly string[]): Promise<readonly ExternalPlayerRecord[]>;
}
```

`TeamProvider` and `LeagueProvider` follow the same pattern.

## Mapping Rules

**Forbidden:** `SportDbPlayerDto` → `Player` entity directly.

**Required chain:**

```
SportDb DTO → sportdb mapper → ExternalPlayerRecord
  → application mapper → Player entity → repository
```

## Current State

- SportDB adapters implemented as **contracts only** (`resolveDto` returns null — no HTTP)
- Import use cases wired with repository dependencies
- `DataProvidersModule` registered in `AppModule`

## Future Extensions

- HTTP client in infrastructure with rate limiting and API keys via `@nestjs/config`
- Provider selection per import job (`ImportJob` aggregate)
- Caching layer (Redis) for provider responses

## Risks

| Risk | Mitigation |
|------|------------|
| Provider API shape changes | DTO + mapper isolation per provider |
| Duplicate imports | `findByExternalReference` + conflict errors |
| Provider outage | Batch import retry policy (future) |

## Alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Prisma as integration point | Violates clean architecture |
| Single god ImportService | No bounded context boundaries |
| External ID as primary key | Breaks multi-provider and internal references |
