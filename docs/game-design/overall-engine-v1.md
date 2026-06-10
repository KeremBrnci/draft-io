# Overall Engine V1

## Scope

Overall Engine V1 calculates **base card ratings** only. It does not generate cards, open packs, or run match simulation.

| In scope | Out of scope |
|----------|--------------|
| Weighted overall formula | Icon / Hero / Event card types |
| Component scoring strategies | Draft, lobby, chemistry |
| Historical calculation records | Automatic trophy collection |
| Manual career / legacy inputs | Card pack generation |

## Rating ownership

- **Player** — identity mirror (market value, age, league, positions)
- **Card** — gameplay strength (`overall`, `overallSource`)
- **Overall Engine** — produces calculated values and persists audit history

## Formula (V1)

Component scores are normalized to **0–100** before weighting:

```
rawScore =
  marketValueScore × 0.35 +
  careerScore      × 0.25 +
  ageScore         × 0.20 +
  leagueScore      × 0.15 +
  legacyScore      × 0.05
```

Calibration maps `rawScore` to FIFA-style **1–99** overall:

```
calibratedOverall = intercept + rawScore × slope
finalOverall      = applyProfileFloorsAndCeilings(calibratedOverall)
```

Default calibration (`overall-v1.config.ts`):

- intercept = 37
- slope = 0.59

## Component strategies

| Component | Strategy | V1 data source |
|-----------|----------|----------------|
| Market Value | `MarketValueScoringStrategy` | Player `marketValue` (EUR brackets) |
| Career | `CareerScoringStrategy` | Manual `PlayerMetrics.careerScore` |
| Age | `AgeScoringStrategy` | Derived from `birthDate` curve |
| League | `LeagueScoringStrategy` | Player league external id tiers |
| Legacy | `LegacyScoringStrategy` | Manual `PlayerMetrics.legacyScore` |

Career and legacy support Ballon d'Or, World Cup, Champions League, and legend flags as **numeric scores** until automatic collection ships.

## Profile floors and ceilings

Configurable tags on `PlayerMetrics.profileTag`:

| Tag | Rule |
|-----|------|
| `LEGEND_ACTIVE_OLD` | floor 85 |
| `ELITE_CURRENT` | floor 88 |
| `YOUNG_SUPERSTAR` | ceiling 89 |
| `NORMAL_PLAYER` | ceiling 82 |

## Calibration targets (validation only)

These players are **not hardcoded**. Tests use representative profiles:

| Archetype | Target band |
|-----------|-------------|
| Cristiano Ronaldo (aging legend) | 85–86 |
| Rodri (elite current) | 89–90 |
| Lamine Yamal (young superstar) | ~88 |
| Arda Güler (developing talent) | ~82 |

## Manual override

Cards store `overallSource`:

- `CALCULATED` — engine may update on recalculation
- `MANUAL_OVERRIDE` — recalculation **must not** overwrite the card rating

V1 still records a new `OverallCalculation` and updates `PlayerMetrics`, but returns `skippedDueToManualOverride: true` when any active card for the player is manually overridden.

## Admin API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/admin/overall/calculate/:playerId` | Calculate one player |
| POST | `/api/v1/admin/overall/recalculate` | Batch recalculate |
| GET | `/api/v1/admin/overall/history/:playerId` | Calculation history |
| GET | `/api/v1/admin/overall/metrics/:playerId` | Latest metrics |
| POST | `/api/v1/admin/overall/metrics/:playerId` | Set manual career/legacy/profile |
