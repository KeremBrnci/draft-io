# Player–Card Separation

## Current Model

Today a single `Player` aggregate combines:

| Concern | Examples on `Player` |
|---------|---------------------|
| Identity | `firstName`, `displayName`, `nationality`, `externalReference` |
| Provider mirror | `teamId`, `leagueId`, `marketValue`, `age` |
| **Gameplay strength** | **`overall`, `overallSource`** |

API contracts (`PlayerSummary`) expose `overallRating` and `overallSource` on the player resource. Import pipeline assigns overall via `import-overall.policy.ts` (SportDB placeholder 50, Transfermarkt null). Teams reference `StartingEleven.playerIds` — today player UUIDs, intended to become card UUIDs.

There is **no** `Card` aggregate, table, or module.

## Problems

1. **One identity, many editions** — Messi Base, TOTY, Prime Icon are different playable assets with different overalls; one row cannot represent them.
2. **Gameplay strength on identity** — Overall on `Player` couples Transfermarkt/SportDB imports to draft and simulation semantics.
3. **Draft pool confusion** — Draft must pick **cards**, not real-world persons.
4. **Future card types** — Hero, Icon, Prime, Event require type, rarity, version, and release metadata on a collectible, not on identity.
5. **Overall engine target** — Calculator output must attach to a **card**, not overwrite identity.
6. **Index pollution** — `@@index([overall])` on `players` optimizes the wrong table for gameplay queries.

## Future Requirements

```
Player (identity)  →  1:N  →  Card (playable asset)
Card                 →  used by  →  Draft, Team.startingEleven, Simulation
```

| Concept | Owns |
|---------|------|
| **Player** | Real person: names, nationality, positions (provider default), image, status, provider IDs |
| **Card** | Gameplay: `overall`, `cardType`, `rarity`, `cardVersion`, `releaseDate`, `isActive` |

Examples:

| Player | Cards |
|--------|-------|
| Lionel Messi | Base 89, TOTY 98, Prime Icon 99 |
| Cristiano Ronaldo | Base 88, Prime 96, Icon 97 |

Future fields (document only, not implemented): `chemistryModifier`, `specialTraits`, `cardArt`, `eventMetadata`.

## Import Pipeline Rule

**Transfermarkt and SportDB imports create/update `Player` identity only.**

Imports must **not** create or update `Card` records. Card creation is game-owned (manual admin, overall engine, promotions, events).

Rationale: providers supply person identity and affiliation; the game owns collectible editions and strength.

## Migration Strategy

### Phase A — Domain & schema (this sprint)

1. Add `cards` module and `Card` entity.
2. Remove `overall` / `overallSource` from `Player` domain.
3. Propose Prisma `cards` table; deprecate `players.overall` columns (proposal only until migration run).
4. Stop import pipeline from assigning overall.
5. Document draft/simulation/team contracts.

### Phase B — Data migration (next sprint)

1. Run Prisma migration: create `cards`, backfill one `BASE` card per player that had `overall`.
2. Drop `players.overall`, `players.overall_source`.
3. Migrate `starting_eleven` JSON from player IDs to card IDs (or dual-read period).

### Phase C — API & gameplay prep

1. Split `PlayerSummary` / `CardSummary` in shared-types.
2. Card CRUD and admin card creation APIs.
3. Wire overall engine → `Card.applyCalculatedOverall`.
4. Draft module consumes card pool.

### Phase D — Gameplay

Draft → Team (card IDs) → Simulation (card overalls). Out of scope for this document.

## Affiliation Fields on Player

`teamId`, `leagueId`, `countryId`, and `marketValue` remain on `Player` as **provider affiliation mirror** — not gameplay strength. They support import UX and future overall-engine inputs. They are not card rarity or modifiers.

## Related Documents

- [card-domain-overview.md](./card-domain-overview.md)
- [player-to-card-migration-report.md](./player-to-card-migration-report.md)
- [../game-design/card-system.md](../game-design/card-system.md)
