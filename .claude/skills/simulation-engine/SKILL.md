---
name: simulation-engine
description: >-
  Designs and implements draft.io match simulation and chemistry calculation —
  deterministic engines, team strength modifiers, and match results. Use when
  building simulation module, chemistry scoring, match resolution, or replay
  systems.
---

# Simulation Engine

## Governance

Phase 8 only — requires plan and approval per `workflow.mdc`. Subordinate to `ai-constitution.md`.

| Document               | Path                                      |
| ---------------------- | ----------------------------------------- |
| AI Constitution        | `docs/architecture/ai-constitution.md`    |
| Workflow               | `.cursor/rules/workflow.mdc`              |
| Universal instructions | `AGENTS.md`                               |
| Project context        | `.claude/skills/project-context/SKILL.md` |
| Project vision         | `docs/architecture/project-vision.md`     |

## Purpose

Guide design and implementation of the **draft.io** match simulation engine and chemistry system — transforming team compositions into match outcomes. The engine lives in the `simulation` bounded context as framework-free domain logic, orchestrated by application use cases and fed by team/player data via IDs.

## When to use

- Implementing match resolution (`simulation` module)
- Building chemistry calculation (`ChemistryCalculator` domain service)
- Designing deterministic replay with seeds
- Computing team overall from lineup + formation + chemistry
- Integrating simulation with `matches` module
- Performance tuning simulation (<1s instant vs live tick)

## Required inputs

1. **Simulation mode** — Instant resolution vs tick-based (per design decision)
2. **Team inputs** — Starting elevens, formations, chemistry, ratings
3. **Determinism** — Seeded PRNG requirement for replays?
4. **Output detail** — Score only vs events timeline
5. **Design constraints** — `docs/game-design/match-simulation.md`, `chemistry-system.md`

## Rules

### Module placement

```
simulation/
├── domain/
│   ├── entities/match-result.entity.ts       # immutable result
│   ├── value-objects/match-seed.vo.ts
│   ├── value-objects/team-strength.vo.ts
│   ├── services/simulation-engine.service.ts # pure domain logic
│   ├── services/chemistry-calculator.service.ts
│   └── errors/simulation.errors.ts
├── application/
│   ├── commands/simulate-match.command.ts
│   └── use-cases/simulate-match.use-case.ts
└── infrastructure/                            # optional persistence for results
```

`matches` module owns scheduling and lifecycle; `simulation` owns resolution math.

### Architecture principles

- **Pure domain engine** — no I/O, no NestJS, no Prisma in `simulation-engine.service.ts`
- **Orchestration in application** — use case loads teams/players by ID from other modules
- **Input DTO → domain** — map loaded data to `SimulationInput` value object
- **Immutable output** — `MatchResult` cannot change after creation
- **Deterministic by default** — `MatchSeed` + seeded PRNG for reproducible results

### Simulation input model

```typescript
interface SimulationInput {
  readonly teamA: TeamSnapshot;
  readonly teamB: TeamSnapshot;
  readonly seed: MatchSeed;
}

interface TeamSnapshot {
  readonly teamId: string;
  readonly formationCode: string;
  readonly chemistryScore: number;
  readonly teamOverall: number;
  readonly players: ReadonlyArray<{
    readonly playerId: string;
    readonly position: string;
    readonly overallRating: number;
  }>;
}
```

Snapshots are plain data assembled in application layer — not live entity references.

### Simulation pipeline

```
1. Load Team A/B by ID (application — teams module)
2. Resolve Player cards for starting eleven (application — players module)
3. Load Formation templates (application — formations module)
4. Calculate chemistry if not cached (ChemistryCalculator domain service)
5. Compute TeamStrength for each side (domain)
6. Run SimulationEngine.simulate(input) → MatchResult
7. Persist result via MatchRepository (matches module)
8. Publish MatchCompleted event
```

### Chemistry calculator

Per `docs/game-design/chemistry-system.md`:

- Input: 11 players with nation/league metadata + formation slots
- Output: numeric chemistry score (0 to configurable max)
- Link types: same nation, same league, adjacent positions, manager nation
- Weights in `domain/constants/chemistry-weights.ts` — tunable without logic changes

```typescript
export class ChemistryCalculator {
  calculate(lineup: LineupForChemistry): ChemistryScore {
    let score = 0;
    score += this.nationLinks(lineup);
    score += this.leagueLinks(lineup);
    score += this.adjacencyLinks(lineup);
    return ChemistryScore.create(score);
  }
}
```

### Team strength formula (conceptual)

```
baseStrength = average(player.overallRating for starting eleven)
formationModifier = formation.fitScore(lineup positions)
chemistryModifier = chemistryScore * CHEMISTRY_WEIGHT
teamStrength = baseStrength + formationModifier + chemistryModifier
```

Keep formula in domain service; coefficients in constants file.

### Simulation engine

**Instant resolution (recommended for MVP):**

```typescript
export class SimulationEngine {
  simulate(input: SimulationInput): MatchResult {
    const rng = SeededRandom.create(input.seed);
    const strengthA = TeamStrengthCalculator.compute(input.teamA);
    const strengthB = TeamStrengthCalculator.compute(input.teamB);

    const goalsA = this.resolveGoals(strengthA, strengthB, rng);
    const goalsB = this.resolveGoals(strengthB, strengthA, rng);

    return MatchResult.create({
      teamAId: input.teamA.teamId,
      teamBId: input.teamB.teamId,
      goalsA,
      goalsB,
      seed: input.seed,
      events: [], // expand in later phases
    });
  }
}
```

**Tick-based (future):** separate `TickSimulationEngine` implementing same interface; minute-by-minute event generation.

### Randomness rules

- Inject `RandomPort` or pass seeded generator — never `Math.random()` directly in untested code
- Same `SimulationInput` + `MatchSeed` → identical `MatchResult`
- Store seed in result for audit/replay

### Cross-module boundaries

- Simulation module **imports no entities** from teams/players
- Application use case injects `TEAM_REPOSITORY`, `PLAYER_REPOSITORY` from exports
- Builds `SimulationInput` snapshot before calling engine

### Performance targets

| Mode                 | Target                                                 |
| -------------------- | ------------------------------------------------------ |
| Instant              | < 500ms per match                                      |
| Live tick            | 90 virtual minutes over ~3 real minutes (configurable) |
| Batch (league round) | Parallelize with worker pool (future)                  |

## Examples

### Example 1: Simulate match use case

```typescript
export class SimulateMatchUseCase {
  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly formationRepo: FormationRepository,
    private readonly matchRepo: MatchRepository,
    private readonly engine: SimulationEngine,
    private readonly chemistry: ChemistryCalculator,
  ) {}

  async execute(command: SimulateMatchCommand): Promise<MatchResult> {
    const teamA = await this.loadTeamSnapshot(command.teamAId);
    const teamB = await this.loadTeamSnapshot(command.teamBId);
    const input = SimulationInput.create({ teamA, teamB, seed: command.seed });
    const result = this.engine.simulate(input);
    await this.matchRepo.saveResult(command.matchId, result);
    return result;
  }
}
```

### Example 2: Chemistry during draft preview

Read-only query — no simulation module needed:

```typescript
// teams/application/queries/preview-chemistry.query.ts
// Loads hypothetical lineup, runs ChemistryCalculator, returns score
```

### Example 3: Replay verification test

```typescript
it('produces identical results for same seed', () => {
  const input = buildFixtureInput();
  const seed = MatchSeed.create('test-seed-123');
  const r1 = engine.simulate({ ...input, seed });
  const r2 = engine.simulate({ ...input, seed });
  expect(r1).toEqual(r2);
});
```

## Checklist

- [ ] Engine is pure — no side effects in `simulate()`
- [ ] Seeded RNG for determinism
- [ ] `SimulationInput` is snapshot, not live entities
- [ ] Chemistry weights externalized to constants
- [ ] Team strength formula documented and unit tested
- [ ] `MatchResult` immutable after creation
- [ ] Application layer loads cross-module data by ID
- [ ] No Prisma/NestJS in domain services
- [ ] Unit tests cover edge cases (equal strength, max chemistry, min rating)
- [ ] Property-based or seeded regression tests for stability
- [ ] Design doc updated if formula changes
- [ ] Performance benchmark for instant mode

## Anti-patterns

| Anti-pattern                              | Correct approach                           |
| ----------------------------------------- | ------------------------------------------ |
| Loading Prisma in simulation engine       | Application builds snapshot                |
| `Math.random()` without seed              | Seeded PRNG                                |
| Mutable match result                      | Immutable `MatchResult` VO/entity          |
| Chemistry in frontend only                | `ChemistryCalculator` in domain            |
| 90-minute loop for MVP                    | Instant resolution first                   |
| Embedding player entities in engine       | Plain snapshot DTOs                        |
| Magic numbers in formula                  | Named constants with tests                 |
| Simulation writing to teams table         | Results to matches repository              |
| Non-deterministic CI tests                | Fixed seeds in tests                       |
| God class doing chemistry + sim + persist | Separate services + use case orchestration |
