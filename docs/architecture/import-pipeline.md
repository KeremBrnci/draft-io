# Import Pipeline

## Purpose

Describe the end-to-end flow for importing players, teams, and leagues from external providers into draft.io persistence.

## Pipeline Flow

```
External API (SportDB | Transfermarkt)
        ↓
HttpClient (rate limit, retry, timeout)
        ↓
ProviderRegistry → Provider Adapter (*Provider)
        ↓
Provider DTO
        ↓
Infrastructure Mapper → External*Record
        ↓
Import*UseCase
        ↓
Application Mapper → Domain Entity
        ↓
Repository (Prisma)
        ↓
PostgreSQL
```

## Use Cases

| Use Case                             | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `ImportPlayerUseCase`                | Single player by provider + slug + external ID    |
| `SearchPlayersUseCase`               | Admin search against provider                     |
| `ImportTeamUseCase`                  | Single team                                       |
| `ImportLeagueUseCase`                | Single league                                     |
| `ImportPlayersBatchUseCase`          | Sequential batch (future: parallel + transaction) |
| `ImportTeamsBatchUseCase`            | Sequential batch                                  |
| `ImportLeaguesBatchUseCase`          | Sequential batch                                  |
| `ListProviderCountriesUseCase`       | List countries (Transfermarkt)                    |
| `ImportCountriesUseCase`             | Import countries into `countries` table           |
| `ListCompetitionsByCountryUseCase`   | List competitions for a country                   |
| `ImportCompetitionsByCountryUseCase` | Import competitions as leagues                    |
| `ImportClubPlayersUseCase`           | Import squad roster for a club                    |
| `SyncPlayerProfileUseCase`           | Refresh a single player profile                   |

## Import Order (recommended)

### SportDB

1. **Leagues** — no dependencies
2. **Teams** — optional league context
3. **Players** — resolves `teamId` / `leagueId` via `findByExternalReference`

### Transfermarkt

1. **Countries** — stored in `countries` table (`nations` module)
2. **Competitions** — imported as leagues with `countryId` FK
3. **Clubs** — imported as teams with `countryId` / `leagueId` FKs
4. **Players** — club roster or profile sync; `overall` remains `null`

## Player Import Details

1. Fetch `ExternalPlayerRecord` from `PlayerProvider.fetchBySlugAndId`
2. If `findByExternalReference` exists → **update** via `applyExternalPlayerImport`
3. Else → create via `mapExternalPlayerToDomain`
4. Resolve team/league internal IDs from provider external IDs (nullable if not imported yet)
5. Assign overall per provider policy (`import-overall.policy.ts`):
   - SportDB: placeholder 50 (`CALCULATED`) — not `apiOverallHint`
   - Transfermarkt: `null` overall until rating engine exists
6. Re-import preserves `MANUAL_OVERRIDE` overall
7. `save(player)` (upsert by internal `id`)

## Idempotency

- Unique constraint on `(provider, external_id)` prevents duplicate rows
- Re-import updates existing aggregate in place (same internal `id`)
- Tests: `import-player.use-case.unit.test.ts`, `import-team.use-case.unit.test.ts`

## Admin Endpoints

See `docs/architecture/sportdb-integration.md` and `docs/architecture/transfermarkt-integration.md` for `/api/v1/admin/imports/*`.

## Current State

- SportDB and Transfermarkt HTTP clients and providers implemented (fixtures in unit tests; live API optional via smoke scripts)
- Prisma repositories for players, teams, leagues, countries
- Admin import API and frontend panel (manual sync only)

## Future Extensions

- Background job queue for large batches
- Import audit log table
- Dry-run mode returning diff without save

## Risks

| Risk                      | Mitigation                                                                  |
| ------------------------- | --------------------------------------------------------------------------- |
| Import before team exists | `teamId` left null; re-link job later                                       |
| Partial batch failure     | Batch use case stops on first error (document; add continue-on-error later) |

## Alternatives

| Alternative                | Why rejected                            |
| -------------------------- | --------------------------------------- |
| ETL outside backend        | Loses domain validation and testability |
| Direct Prisma seed scripts | Bypasses use cases and overall policy   |
