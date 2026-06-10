# Chemistry System

## Purpose

Chemistry rewards **cohesive squad building** — same club, nation, and league links — without overpowering raw card strength. It is a tactical layer on top of overall, not a replacement.

**Target impact on match outcomes:** chemistry contributes roughly **5–10%** of effective team strength (via [Match Power](./match-power.md)), not 25%.

---

## Current state

- **Not implemented** in runtime.
- `Team.chemistryScore` exists in schema as `null` placeholder.
- Player identity for links resolves through `Card.playerId` → `Player` (club, nation, league).

---

## Design principles

| Principle | Detail |
|-----------|--------|
| Simple to explain | Three link types at launch |
| Visible during draft | Chemistry options labeled in pick UI |
| Capped per player | Avoid infinite stacking on one card |
| Team total bounded | 0–33 scale matches starting eleven size |
| Soft bonus | Overall still wins most comparisons |

---

## Link rules (v1)

Links are computed between a **candidate card** and **already-drafted cards** on the same team (or projected if shown in pick UI).

| Connection | Bonus | Condition |
|------------|-------|-----------|
| Same club | **+2** | Same `teamId` on player identity |
| Same nation | **+1** | Same nationality code |
| Same league | **+1** | Same `leagueId` |

### Per-player chemistry cap

A single card contributes at most **+3 chemistry** from links (configurable).

Example: one card links to two club teammates → +2 + +2 capped to +3 total from that card’s link calculation method (implementation: sum unique link types per card, then cap).

**Clarification for implementation:**

```
playerChemistry = min(3, clubLinks×2 + nationLinks×1 + leagueLinks×1)
```

Where each link type counts once per connected teammate (design tuning may use diminishing returns later).

---

## Team chemistry

### Scale

**Team chemistry: 0–33**

- Starting eleven → up to 11 cards.
- Theoretical average ~1.5 links per card → mid teams land ~15–22.
- Elite link-built squads approach high twenties; random squads sit lower.

Stored fields (planned):

| Field | Description |
|-------|-------------|
| `teamChemistry` | Total 0–33 |
| `playerChemistry[]` | Per starting card breakdown |
| `chemistryBreakdown` | `{ club, nation, league }` source totals |

### Breakdown example

```json
{
  "teamChemistry": 24,
  "breakdown": {
    "club": 12,
    "nation": 8,
    "league": 4
  },
  "players": [
    { "cardId": "…", "chemistry": 3, "sources": ["club", "nation"] }
  ]
}
```

---

## Draft integration

The [Draft Balance Engine](./draft-balance-engine.md) reserves one candidate slot per pick as **chemistry option**.

- Chemistry option may trade 2–4 overall points for +2–3 link value.
- UI shows projected team chemistry delta if picked.
- Encourages “team building” without forcing link-only drafts.

---

## Match integration

Chemistry feeds **Match Power**, not raw overall display.

```
MatchPower = Overall × ChemistryMultiplier
```

See [Match Power](./match-power.md) for multiplier curve (5–10% swing at team level).

Example (illustrative):

| Squad | Avg overall | Team chemistry | Match power |
|-------|-------------|----------------|-------------|
| A | 87 | 30 | Beats B sometimes |
| B | 89 | 10 | Stronger on paper |

Overall 89 still wins **most** matchups; chemistry creates variance and comeback stories.

---

## Position & chemistry (future)

Not in v1:

- Out-of-position chemistry penalty
- Adjacent-position partnership links (CB + CDM)
- Manager nationality link
- Rival nation negative links

See [Position System](./position-system.md).

---

## Configurable parameters

```typescript
interface ChemistryConfig {
  readonly sameClubBonus: number;      // default 2
  readonly sameNationBonus: number;    // default 1
  readonly sameLeagueBonus: number;    // default 1
  readonly maxChemistryPerPlayer: number; // default 3
  readonly maxTeamChemistry: number;   // default 33
}
```

---

## Metrics

Track for balance tuning:

- Average team chemistry at draft end
- Chemistry vs win rate correlation
- Pick rate on “chemistry option” candidates
- Club-heavy meta detection (same-club stacking)

---

## Open questions

1. Count links to **bench** cards or starting eleven only?
2. Chemistry recalculated live during draft or only at roster lock?
3. Show opponent chemistry during draft (hidden information)?
4. Decay chemistry if player moved to non-linking slot?

---

## Success criteria

- Players who plan links feel rewarded (~15% of outcome skill mix).
- Raw overall stacking without links still viable.
- No single link type dominates metagame without counter-draft options.
