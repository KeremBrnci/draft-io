# Overall Engine

## Purpose

Generate **game-owned overall** values (1–99) for player cards. The engine is the only authority for calculated ratings.

## Responsibilities

| Artifact | Role |
|----------|------|
| `OverallCalculationContext` | Inputs for calculation |
| `OverallCalculationResult` | Output overall value |
| `OverallCalculationStrategy` | Pluggable algorithm |
| `OverallCalculator` | Facade delegating to strategies |

## Module Structure

```
overall-engine/
├── domain/
│   ├── models/overall-calculation-context.ts
│   ├── models/overall-calculation-result.ts
│   ├── ports/overall-calculator.port.ts
│   ├── ports/overall-calculation-strategy.port.ts
│   └── errors/overall-engine.errors.ts
├── application/
│   └── services/stub-overall-calculator.ts
└── overall-engine.module.ts
```

## Context Fields

```typescript
interface OverallCalculationContext {
  playerId: string;
  primaryPosition: string;
  secondaryPositions: readonly string[];
  age: number | null;
  marketValue: number | null;
  nationality: string;
  apiOverallHint: number | null; // untrusted provider metadata
}
```

## Strategy Pattern

```typescript
interface OverallCalculationStrategy {
  readonly strategyId: string;
  calculate(context: OverallCalculationContext): OverallCalculationResult;
}
```

Multiple strategies can be registered later (e.g. `market-value-v1`, `baseline-v1`).

## Integration with Player Domain

| Event | Behavior |
|-------|----------|
| Import | Placeholder overall until engine runs |
| Manual API update | `MANUAL_OVERRIDE` blocks recalculation |
| Future batch job | `RecalculateOverallUseCase` calls `OverallCalculator` |

## Current State (V1 shipped)

- `OverallCalculatorV1` implements the weighted component formula
- Scoring strategies: market value, career, age, league, legacy
- Persistence: `PlayerMetrics`, `OverallCalculation`, `OverallAlgorithmVersion`
- Admin API under `/api/v1/admin/overall/*`
- `StubOverallCalculator` retained for contract tests only

See also:

- `docs/game-design/overall-engine-v1.md`
- `docs/architecture/rating-architecture.md`
- `docs/architecture/overall-versioning.md`

## Future Extensions

- First strategy implementation in Phase 3
- Wire calculator into `ImportPlayerUseCase` after algorithm approval
- Explainability metadata on `OverallCalculationResult` (factor breakdown)

## Risks

| Risk | Mitigation |
|------|------------|
| Premature algorithm in import path | Stub + placeholder policy |
| apiOverallHint used directly | Documented forbidden; review checklist |

## Alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Inline overall in import mapper | No testability or strategy swap |
| Overall in frontend | Violates domain ownership |
