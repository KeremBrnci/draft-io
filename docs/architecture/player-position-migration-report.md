# Player Position Migration Report

Generated during replacement of `primaryPosition` + `secondaryPositions[]` with `PlayerPosition` relationship model.

## Files created

| File                                                                                    | Purpose                       |
| --------------------------------------------------------------------------------------- | ----------------------------- |
| `apps/backend/src/modules/players/domain/entities/player-position.entity.ts`            | `PlayerPosition` child entity |
| `apps/backend/src/modules/players/domain/value-objects/player-position-id.vo.ts`        | Position assignment ID        |
| `apps/backend/src/modules/players/domain/value-objects/player-positions.vo.ts`          | Validated position set        |
| `apps/backend/src/modules/players/domain/errors/player-position.errors.ts`              | Domain validation errors      |
| `apps/backend/src/modules/players/application/mappers/map-external-player-positions.ts` | Import mapping                |
| `apps/backend/src/modules/players/infrastructure/mappers/player-position.mapper.ts`     | Prisma ↔ domain               |
| `packages/shared-types/src/players/player-position-assignment.ts`                       | API DTO                       |
| `apps/backend/prisma/MIGRATION_PLAYER_POSITIONS.md`                                     | SQL migration plan            |
| `docs/architecture/player-position-model.md`                                            | Architecture doc              |
| `docs/game-design/position-system.md`                                                   | Game design doc               |
| `docs/architecture/player-position-migration-report.md`                                 | This report                   |
| `*.unit.test.ts` (positions, mapper, import)                                            | Domain and mapping tests      |

## Files updated

### Prisma / persistence

- `apps/backend/prisma/schema.prisma` — `player_positions` table; removed legacy columns from `Player`
- `apps/backend/src/modules/players/infrastructure/persistence/prisma-player.repository.ts`
- `apps/backend/src/modules/players/infrastructure/persistence/player-list-filter.prisma.ts`
- `apps/backend/src/modules/players/infrastructure/mappers/player.mapper.ts`

### Domain / application

- `apps/backend/src/modules/players/domain/entities/player.entity.ts`
- `apps/backend/src/modules/players/domain/repositories/player.repository.ts` — new filter fields
- `apps/backend/src/modules/players/application/use-cases/create-player.use-case.ts`
- `apps/backend/src/modules/players/application/use-cases/browse-players.use-case.ts`
- `apps/backend/src/modules/players/application/read-models/player-browser-item.ts`
- `apps/backend/src/modules/players/testing/player-test.factory.ts`
- `apps/backend/src/modules/data-providers/application/mappers/external-player-to-player.mapper.ts`

### API / shared types

- `packages/shared-types/src/players/player-summary.ts`
- `packages/shared-types/src/players/player-browser.ts` — `BrowsePlayersFilterDto`
- `packages/shared-types/src/players/index.ts`
- `packages/shared-types/src/index.ts`
- `apps/backend/src/modules/players/presentation/mappers/player-response.mapper.ts`
- `apps/backend/src/modules/players/presentation/mappers/player-browser-response.mapper.ts`
- `apps/backend/src/modules/players/presentation/dto/browse-players-query.dto.ts`
- `apps/backend/src/modules/players/presentation/controllers/admin-players.controller.ts`

### Data quality / overall engine

- `apps/backend/src/modules/data-quality/infrastructure/persistence/prisma-data-quality.repository.ts`
- `apps/backend/src/modules/overall-engine/domain/models/overall-calculation-context.ts`

### Tests (representative)

- All `player.entity`, `browse-players`, `create-player`, `list-players`, import, integration tests
- `apps/backend/test/integration/players.repository.integration.test.ts`

## Files deleted

| File                                  | Reason                                         |
| ------------------------------------- | ---------------------------------------------- |
| `secondary-positions.vo.ts`           | Replaced by `PlayerPositions`                  |
| `secondary-positions.vo.unit.test.ts` | Replaced by `player-positions.vo.unit.test.ts` |

## Unchanged (provider boundary)

These still use `primaryPosition` / `secondaryPositions` on `ExternalPlayerRecord` — mapped at import boundary only:

- `transfermarkt.mapper.ts`
- `sportdb-player.mapper.ts`
- `external-player-record.ts`

## Migration complexity

| Area              | Complexity | Notes                                  |
| ----------------- | ---------- | -------------------------------------- |
| Prisma schema     | Medium     | New table + drop 2 columns             |
| Domain            | Medium     | New VO/entity, Player aggregate change |
| Repository        | Medium     | Transactional position replace         |
| Queries/filters   | Medium     | Join via `positions` relation          |
| API               | Low        | Backward-compatible shorthand fields   |
| Frontend admin UI | Low        | No UI changes required yet             |
| Import pipeline   | Low        | Mapper at boundary                     |
| Data quality      | Low        | groupBy on `player_positions`          |

## Recommended migration order

1. Apply DB migration per `MIGRATION_PLAYER_POSITIONS.md` (dual-write optional)
2. Deploy backend with relationship model
3. Run backfill + validation queries
4. Drop legacy columns
5. Next sprint: admin UI position filters using new query params

## Risks

| Risk                              | Mitigation                                                                 |
| --------------------------------- | -------------------------------------------------------------------------- |
| DB not migrated but code deployed | Run migration before deploy; integration tests skip without `DATABASE_URL` |
| Invalid legacy position codes     | Data quality flags; import validates via `Position.create()`               |
| Performance on position filters   | Indexes on `player_id`, `position_code`, `is_primary`                      |
| Breaking API clients              | `position` + `secondaryPositions` retained on responses                    |

## Recommended next sprint

1. Execute `player_positions` migration on dev/staging
2. Admin UI: position / primary / multi-position filters
3. Enrichment job: ensure profile sync populates secondary rows
4. Draft module design using `Player.positions.hasPosition()`
