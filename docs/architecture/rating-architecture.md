# Rating Architecture

## Layered model

```
┌─────────────────────────────────────────────────────────┐
│  Admin API (admin/overall/*)                            │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Application use cases                                  │
│  CalculatePlayerOverall · RecalculateOverall            │
│  GetOverallHistory · GetPlayerMetrics · UpsertMetrics   │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌──────────────────┐
│ OverallCalc   │  │ Scoring        │  │ Persistence      │
│ V1 facade     │  │ strategies     │  │ PlayerMetrics    │
│               │  │ (MV/Age/League)│  │ OverallCalculation│
└───────────────┘  └────────────────┘  └──────────────────┘
```

## Module boundaries

| Module           | Responsibility                                         |
| ---------------- | ------------------------------------------------------ |
| `overall-engine` | Formula, strategies, metrics, calculation history      |
| `players`        | Identity inputs (market value, age, league, positions) |
| `cards`          | Gameplay `overall` + `overallSource` on base cards     |
| `leagues`        | League tier resolution via `externalId`                |

## Contracts preserved

Existing ports remain backward compatible:

- `OverallCalculator.calculate(context)` — now returns extended `OverallCalculationResult` with `overall` alias for `finalOverall`
- `OverallCalculationStrategy` — implemented by `OverallCalculatorV1`
- `StubOverallCalculator` — retained for tests; module wires `OverallCalculatorV1` in production

## Card integration (contract only)

`CardOverallIntegrationPort` defines how calculated overall values will propagate to **base cards**:

```typescript
applyCalculatedOverallToBaseCards(playerId, overall);
```

Implementation is deferred. `Card.applyCalculatedOverall()` already respects `MANUAL_OVERRIDE`.

## Data model

| Table                        | Mutability  | Purpose                                   |
| ---------------------------- | ----------- | ----------------------------------------- |
| `overall_algorithm_versions` | Rarely      | Version registry (V1, V2, …)              |
| `player_metrics`             | Upsert      | Latest component snapshot + manual inputs |
| `overall_calculations`       | Append-only | Immutable audit trail                     |

Never overwrite calculation history. Recalculation appends a new row and upserts metrics.

## Configuration

All weights, brackets, league tiers, and profile bounds live in:

`apps/backend/src/modules/overall-engine/domain/config/overall-v1.config.ts`

The calculator reads config — no magic numbers inside strategy classes beyond defaults.
