# Match Simulation Engine V2 — Fun First

## Philosophy

Matches should feel **exciting, eventful, competitive, and unpredictable** — not boring, defensive, or low-scoring.

This is a **multiplayer football draft game**, not a football management simulator. When realism and fun conflict, **choose fun**.

## Inputs

Each match uses immutable team snapshots captured at kick-off:

- Participant display name and formation code
- `teamAverageOverall`, `teamChemistry`, `matchPower`
- Eleven drafted players with real names, positions, card overalls

## Time model

Accelerated playback (default **~260ms per match minute**). Statuses: `SCHEDULED`, `LIVE`, `HALF_TIME`, `FULL_TIME`, `PAUSED`.

## Match strength weights

Composite strength for attack selection:

| Component  | Weight |
| ---------- | ------ |
| Overall    | 65%    |
| Chemistry  | 20%    |
| Formation  | 10%    |
| Home       | 1.5%   |
| Randomness | 3.5%   |

Chemistry improves **chance quality and conversion**, not raw overall alone.

## Team xG model

```
teamXG = baseXG
  × powerDifferenceModifier
  × attackVsDefenseModifier
  × chemistryModifier
  × homeModifier
  × formationAttackModifier
  × opponentDefenseModifier
  × controlledRandomness
```

- `baseXG = 1.6`
- Clamp per team: **0.8 – 4.0**
- Final reported xG blends live shot accumulation with the team xG budget

## Formation impact

| Formation | Attack | Defense | Feel                    |
| --------- | ------ | ------- | ----------------------- |
| 3-4-3     | +18%   | -10%    | High volume, open game  |
| 4-3-3     | +12%   | -5%     | Pressing, wide attacks  |
| 4-4-2     | —      | —       | Balanced baseline       |
| 5-3-2     | -10%   | +10%    | Compact, fewer chances  |
| 4-5-1     | -15%   | +12%    | Low block, counter risk |

Formation modifiers affect shots, dangerous attacks, corners, and xG — visible in post-match stats.

## Event generation

Target **22–38 meaningful events** per match (dangerous attacks, shots, corners, penalties, woodwork, big chances, goals).

Commentary stays active even when goals are scarce.

## Goal distribution targets

| Metric            | Target    |
| ----------------- | --------- |
| Average goals     | 3.0 – 4.5 |
| Preferred average | ~3.6      |
| Average total xG  | 3.2 – 5.5 |
| Draw rate         | 15% – 25% |
| Home wins         | 40% – 50% |
| Away wins         | 30% – 40% |
| 0-0 frequency     | < 3%      |

Common scorelines: 2-1, 2-2, 3-1, 3-2, 4-2.

## Validation

`match-simulation-engine.service.unit.test.ts` runs 2000 simulations against the targets above.

## Config

Tunable via `DEFAULT_MATCH_SIMULATION_CONFIG` in `match-simulation.types.ts` and `FORMATION_MATCH_MODIFIERS` in `formation-match-modifiers.ts`.
