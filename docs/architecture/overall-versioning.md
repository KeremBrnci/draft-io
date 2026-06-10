# Overall Versioning

## Algorithm versions

Every calculation is tagged with an `OverallAlgorithmVersion` record (e.g. `V1`).

| Rule | Behavior |
|------|----------|
| Immutable history | `overall_calculations` rows are never updated or deleted by recalculation |
| Version on record | Each calculation stores `algorithmVersionId` |
| Active version | `overall_algorithm_versions.isActive` flags supported versions |
| Future V2/V3 | New strategies register under a new version code without migrating old rows |

## Recalculation strategy

1. Load player identity + league context
2. Load existing `PlayerMetrics` (manual career/legacy/profile)
3. Run current algorithm version calculator
4. **Append** new `OverallCalculation`
5. **Upsert** `PlayerMetrics` with latest component scores
6. Check `Card.overallSource` for `MANUAL_OVERRIDE`
7. If manual override present → skip card update (integration port, future)
8. Return `skippedDueToManualOverride` flag in API response

Batch recalculation (`POST /admin/overall/recalculate`) repeats steps 1–8 per player. Failures are counted but do not roll back prior players in the batch.

## Manual override strategy

```
IF any active card for player has overallSource = MANUAL_OVERRIDE
  THEN do not change card.overall
  ELSE card integration port may apply finalOverall (future)
```

Calculation history is **always** written regardless of override status. Admins can inspect how the engine would have rated the player even when cards are frozen.

Clearing an override (future admin action) will allow the next recalculation to flow through to cards.

## Metrics vs history

| Artifact | Cardinality | Updated on recalc |
|----------|-------------|-------------------|
| `PlayerMetrics` | 1 per player | Yes (upsert) |
| `OverallCalculation` | Many per player | Append only |

Compare `GET /admin/overall/history/:playerId` entries to audit formula changes across versions.

## Migration path to V2

1. Register `V2` in `overall_algorithm_versions`
2. Implement `OverallCalculatorV2` (or strategy registry entry)
3. Run batch recalculation with `algorithmVersion: "V2"`
4. V1 history remains queryable; new rows reference V2 version id

No destructive migration required.
