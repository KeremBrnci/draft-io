# Match Power

## Purpose

**Match Power** is the pre-match strength score used for simulation input and UI comparison. It combines **card overall** with **team chemistry** so that link-built squads can occasionally upset stronger-on-paper teams — without chemistry dominating outcomes.

---

## Current state

- **Not implemented.**
- `Team.teamOverall` exists as nullable placeholder.
- Simulation module is placeholder; this document defines the **strength model** simulation will consume.

Related:

- [Match Simulation](./match-simulation.md) — event resolution (future)
- [Chemistry System](./chemistry-system.md) — link bonuses
- [Draft Balance Engine](./draft-balance-engine.md) — fairness targets for final squads

---

## Design principles

| Principle            | Detail                                                 |
| -------------------- | ------------------------------------------------------ |
| Overall first        | Overall remains the primary strength signal            |
| Chemistry spice      | ~5–10% effective swing at team level                   |
| Transparent          | Show match power in UI alongside overall               |
| Deterministic inputs | Same squad → same match power (RNG only in simulation) |
| Card-based           | Use `Card.overall`, not player identity overall        |

---

## Formula

### Team match power

```
TeamMatchPower = TeamAverageOverall × ChemistryMultiplier
```

Where:

```
TeamAverageOverall = mean(Card.overall for starting eleven)
ChemistryMultiplier = 1 + f(TeamChemistry)
```

### Chemistry multiplier curve (v1 target)

`TeamChemistry` is on scale **0–33** (see chemistry doc).

Target: full chemistry range moves effective strength by **~5–10%**.

**Example default curve (configurable):**

```
f(c) = (c / 33) × 0.08
ChemistryMultiplier = 1 + f(c)
```

| Team chemistry | Multiplier | Effective boost |
| -------------- | ---------- | --------------- |
| 0              | 1.00       | 0%              |
| 16 (mid)       | 1.04       | ~4%             |
| 33 (max)       | 1.08       | ~8%             |

Tuning bound: keep multiplier between **1.00 and 1.10** at launch unless playtests say otherwise.

### Worked example

**Team A**

- Average overall: **87**
- Team chemistry: **30** → multiplier ≈ 1 + (30/33×0.08) ≈ **1.073**
- Match power ≈ **87 × 1.073 ≈ 93.4**

**Team B**

- Average overall: **89**
- Team chemistry: **10** → multiplier ≈ 1 + (10/33×0.08) ≈ **1.024**
- Match power ≈ **89 × 1.024 ≈ 91.1**

Team B has higher overall; Team A has higher match power. Simulation should give A a **meaningful but not guaranteed** win chance.

---

## Per-slot contribution (optional display)

For UI breakdown:

```
SlotMatchPower = Card.overall × (1 + playerChemistryContribution / 33 × k)
```

Team total ≈ sum or average of slot values — exact aggregation matches team formula above.

---

## Relationship to draft balance

The [Draft Balance Engine](./draft-balance-engine.md) targets:

- Final **average overall** spread ≤ 2–3 between teams
- Comparable **match power** after chemistry (~1–2 point effective spread typical)

Simulation harness (1,000 drafts) validates:

- Mean match power variance across participants
- No systematic advantage for draft slot position

---

## Simulation usage (planned)

```
MatchSimulationInput {
  teamA: { cardIds, formationCode, teamMatchPower, teamChemistry }
  teamB: { … }
  seed: deterministic RNG seed
}
```

Simulation engine uses match power as **base strength**; event RNG creates scoreline variance. Higher match power → higher win probability, not certainty.

---

## Configurable parameters

```typescript
interface MatchPowerConfig {
  readonly chemistryMaxBoostPercent: number; // default 8 (= 0.08)
  readonly chemistryScaleMax: number; // default 33
  readonly minMultiplier: number; // default 1.0
  readonly maxMultiplier: number; // default 1.10
}
```

---

## Metrics

| Metric                           | Purpose                        |
| -------------------------------- | ------------------------------ |
| Average match power at draft end | End-to-end balance             |
| Match power vs win rate          | Chemistry impact audit         |
| Upset rate (lower overall wins)  | Excitement vs fairness         |
| Correlation overall → wins       | Ensure overall still dominates |

---

## Open questions

1. Use median vs mean overall for skew resistance?
2. Formation modifier on match power (future)?
3. Home advantage additive or multiplicative?
4. Display match power to opponents pre-match?

---

## Success criteria

- Chemistry matters enough to justify link picks in draft.
- Overall 89 + low chemistry beats overall 87 + high chemistry **more often than not**, but not always.
- Players describe outcomes as “we built better links” or “they had more stars,” not “RNG only.”
