# Data Providers Module

## Purpose

Integrate external football data sources as provider adapters and orchestrate import into players, teams, and leagues aggregates.

## Responsibilities

- Define `DataProvider` enum and provider-neutral external records
- Expose `PlayerProvider`, `TeamProvider`, `LeagueProvider` ports
- Implement SportDB adapters (contract only — no live HTTP)
- Run import use cases with domain mapping and persistence

## Public API

Application use cases (not yet exposed via HTTP):

| Use Case                    | Input               |
| --------------------------- | ------------------- |
| `ImportPlayerUseCase`       | `{ externalId }`    |
| `ImportTeamUseCase`         | `{ externalId }`    |
| `ImportLeagueUseCase`       | `{ externalId }`    |
| `ImportPlayersBatchUseCase` | `{ externalIds[] }` |
| `ImportTeamsBatchUseCase`   | `{ externalIds[] }` |
| `ImportLeaguesBatchUseCase` | `{ externalIds[] }` |

## Dependencies

- `PlayersModule` — `PLAYER_REPOSITORY`
- `TeamsModule` — `TEAM_REPOSITORY`
- `LeaguesModule` — `LEAGUE_REPOSITORY`

## Domain Rules

- External IDs are never primary keys
- Provider DTOs must not map directly to domain entities
- `apiOverallHint` is never copied to `player.overall`

## Test Strategy

- Unit: SportDB mappers, import use cases (mocked ports), `DataProvider` enum
- Integration: full import with DB (future, when HTTP stubbed with fixtures)

## Documentation

- `docs/architecture/data-provider-architecture.md`
- `docs/architecture/import-pipeline.md`
