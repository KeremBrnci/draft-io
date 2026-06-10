# Player Rating System

## Purpose

Define how **overall** — the single core gameplay value for player cards — is owned, calculated, and overridden in draft.io.

This is **not** a FIFA-style attribute system. There are no pace, shooting, passing, dribbling, defending, or physical sub-stats.

## Core Rule

**The game engine owns overall.** External providers (e.g. sportdb.dev) may supply hints, but those values are never trusted or stored as the final game overall without passing through the overall engine or an explicit admin override policy.

## Player Card Values Used in Gameplay

| Field                | Role                                               |
| -------------------- | -------------------------------------------------- |
| `primaryPosition`    | Draft eligibility, formation slots                 |
| `secondaryPositions` | Flexibility (future)                               |
| `overall`            | Core strength for draft, team building, simulation |
| `overallSource`      | Provenance of overall value                        |

## Overall Source

| Source            | Meaning                                                 |
| ----------------- | ------------------------------------------------------- |
| `CALCULATED`      | Produced by `overall-engine` (game-owned)               |
| `MANUAL_OVERRIDE` | Admin-set; blocks automatic recalculation until cleared |

### Admin override design (domain)

- `Player.applyManualOverallOverride(overall)` sets source to `MANUAL_OVERRIDE`
- `Player.applyCalculatedOverall(overall)` is a no-op when source is `MANUAL_OVERRIDE`
- Future: `RecalculatePlayerOverallUseCase` will respect override flag

## External Data

| Provider field                             | Usage                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `apiOverallHint` on `ExternalPlayerRecord` | Optional input to overall engine — **never** copied to `player.overall` on import         |
| Import placeholder                         | Until engine ships, imports use neutral placeholder overall (50) with `CALCULATED` source |

## Current State

- **Implemented:** Domain model (`overall`, `overallSource`), import placeholder policy, manual override on API create/update
- **Not implemented:** Overall calculation algorithm, recalculation batch job, admin UI

## Future Extensions

- Multiple `OverallCalculationStrategy` implementations (market-based, age curve, position baseline)
- Seasonal overall drift
- Card edition modifiers (Phase 4)

## Risks

| Risk                             | Mitigation                                          |
| -------------------------------- | --------------------------------------------------- |
| Accidental use of API overall    | Import mapper + policy tests; code review checklist |
| Stale overall after data refresh | Future recalculation pipeline with override respect |

## Alternatives Considered

| Alternative                            | Why rejected                                                |
| -------------------------------------- | ----------------------------------------------------------- |
| Store FIFA sub-stats                   | Out of scope; increases complexity without gameplay benefit |
| Trust SportDB overall directly         | Violates game ownership of balance                          |
| Single overall with no source tracking | Cannot support admin override or audit                      |
