# Player Position Model

## Summary

Player positions are modeled as a **first-class relationship** between `Player` and the `Position` vocabulary — not as `primaryPosition` + `secondaryPositions[]` columns on the player row.

## Why the array approach was removed

| Problem | Array model | Relationship model |
|---------|-------------|-------------------|
| Validation | Ad-hoc VO on parallel fields | Central `PlayerPositions` rules |
| Querying | Filter only primary easily | Filter primary, secondary, any, multi-position |
| Extension | Hard to add metadata per role | Add columns on `player_positions` later |
| Gameplay hooks | Chemistry/simulation need role context | `isPrimary` + future modifiers per row |

## Domain model

```
Player (aggregate root)
  └── PlayerPositions (value object)
        └── PlayerPosition[] (child entities)
              id
              playerId
              position → Position VO (from positions module)
              isPrimary
              createdAt
```

### Rules (`PlayerPositions`)

- At least one position
- Exactly one `isPrimary = true`
- No duplicate `positionCode` per player
- Position codes validated via `Position.create()` — never hardcoded on `Player`

### Position vocabulary

Owned by `positions` module (`Position` VO, `GET /positions`). Supported codes:

`GK, LB, LWB, CB, RB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST`

## Persistence

Table: `player_positions` (see `prisma/schema.prisma` and `prisma/MIGRATION_PLAYER_POSITIONS.md`).

Prisma relation: `Player.positions → PlayerPosition[]`

Repository saves positions with replace strategy inside a transaction (delete + insert).

## API contracts (admin-ready)

`PlayerSummary` and `PlayerBrowserItemDto` expose:

- `positions: { positionCode, isPrimary }[]` — canonical
- `position` — primary shorthand (legacy clients)
- `secondaryPositions` — secondary shorthand (legacy clients)

Browse filters (backend ready, UI not built):

| Query param | Behavior |
|-------------|----------|
| `position` | Any assigned position |
| `primaryPosition` | Primary only |
| `secondaryPosition` | Secondary only |
| `hasMultiplePositions` | More than one assignment |

## Import pipeline

`ExternalPlayerRecord` still carries `primaryPosition` + `secondaryPositions` strings from providers. Mapper `mapExternalPlayerPositions()` converts to `PlayerPositions` before persisting.

- Single provider position → one row, `isPrimary=true`
- Profile with `main` + `other[]` → primary + secondary rows

## Future gameplay (documented only)

See `docs/game-design/position-system.md` for draft, simulation, and chemistry implications.
