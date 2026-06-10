# Draft Balance Engine

## Purpose

The Draft Balance Engine creates **fair teams** while preserving **randomness, excitement, and surprise moments**.

The game must never feel predetermined.  
The game must never feel completely random.

| Target                    | Avoid                                  |
| ------------------------- | -------------------------------------- |
| Fairness + excitement     | Perfect balance                        |
| Meaningful decisions      | Pure luck                              |
| “I have a chance to win.” | “The game was decided before kickoff.” |
| “Anything can happen.”    | Identical, chess-like drafts           |

### Target player experience

Success means one player can say **“I got lucky.”** without another saying **“The game was decided by luck.”**

### Intended skill mix (design north star)

| Factor                           | Approx. weight |
| -------------------------------- | -------------- |
| Correct pick decisions           | ~50%           |
| Team building (structure, links) | ~25%           |
| Chemistry                        | ~15%           |
| Luck / wildcards                 | ~10%           |

These are **design targets**, not hard simulation weights. They guide tuning and UX copy.

---

## Relationship to other systems

| System                                    | Role                                        |
| ----------------------------------------- | ------------------------------------------- |
| [Draft System](./draft-system.md)         | Turn flow, card picks, roster assembly      |
| [Chemistry System](./chemistry-system.md) | Link bonuses on drafted cards               |
| [Match Power](./match-power.md)           | Pre-match strength from overall + chemistry |
| [Position System](./position-system.md)   | Slot eligibility via `PlayerPosition`       |
| [Card System](./card-system.md)           | Draft picks are **Cards**, not Players      |

The balance engine runs **inside draft pick generation** and **at lobby/draft start** (budget allocation). It does not replace the overall engine or card creation pipeline.

---

## Design philosophy

### Controlled randomness

- Do **not** generate a fully random card pool.
- Do **not** generate identical option sets for every player every pick.
- Generate **curated choice sets** per pick that feel different but converge on similar team strength.

### Soft balancing

- Never force mathematically equal teams.
- Allow slightly stronger or weaker final squads.
- **Target:** final average team overall spread ≤ **2–3 points** (not 10).

### Surprise without rigging

- Occasional elite cards (Rodri, Mbappé, Haaland, Yamal) create memorable moments.
- A hidden **Team Power Budget** ensures one early superstar reduces later elite exposure.
- Early luck → later compensation. Late luck → early compensation.

---

## Configurable parameters

All thresholds, budgets, and probabilities live in **configuration** (future: `DraftBalanceConfig` / DB settings). Documentation uses example defaults only.

```typescript
// Example shape — not implementation
interface DraftBalanceConfig {
  readonly tiers: readonly DraftTierConfig[];
  readonly targetTeamAverageOverall: number; // e.g. 87
  readonly budgetDeviationMaxPercent: number; // e.g. 3
  readonly finalOverallSpreadMax: number; // e.g. 3
  readonly candidatesPerPick: number; // e.g. 5
  readonly wildcardProbability: number; // e.g. 0.08
  readonly eliteOpportunityBaseRate: number;
  readonly positionWeights: PositionWeightConfig;
}
```

---

## Player tiers

Cards are classified into draft tiers by **card overall** (from `Card.overall`).

| Tier | Example overall range | Role in balance          |
| ---- | --------------------- | ------------------------ |
| S    | 92+                   | Elite / surprise anchors |
| A    | 88–91                 | Strong picks             |
| B    | 84–87                 | Solid core               |
| C    | 80–83                 | Role players             |
| D    | 75–79                 | Risk / development       |

Thresholds are **configurable** per game mode or season. The engine reads tier boundaries from config, not hardcoded constants.

Tier drives:

- Budget cost of a pick (see below)
- Elite opportunity eligibility
- Candidate slot composition rules

---

## Team Power Budget (hidden)

When a draft room **starts**, each participant receives a hidden **Team Power Budget**.

### Concept

Budget represents total “draft currency” spent across all picks. Every card pick consumes budget proportional to its strength (tier / overall).

**Example target:** 11-player squad, ~87 average overall → budget scale ~960 per player (configurable formula).

| Player   | Hidden budget (example) |
| -------- | ----------------------- |
| Player 1 | 960                     |
| Player 2 | 955                     |
| Player 3 | 962                     |
| Player 4 | 958                     |

### Fairness rule

- Maximum deviation between participants at draft start: **< 3%** (configurable).
- Budget is **hidden** during draft; players see cards and chemistry hints, not remaining budget numbers (optional post-draft reveal for analytics).

### Pick cost

Each card consumes budget:

```
pickCost = f(cardOverall, tier, wildcardFlag)
```

Picking an S-tier superstar early reduces remaining budget → fewer elite options later in the draft for that player.

---

## Controlled surprise system

### Elite opportunities

Each pick generation may include **at most one** elite-weighted option when budget and surprise state allow.

Examples: Rodri, Mbappé, Haaland, Yamal — surfaced as exciting options, not guaranteed picks.

### Surprise ledger (per participant)

Track per drafter:

| Field             | Purpose                                 |
| ----------------- | --------------------------------------- |
| `elitePicksTaken` | Count of S/A tier picks above threshold |
| `surpriseDebt`    | Compensation owed after early luck      |
| `surpriseCredit`  | Pre-paid budget for late elite windows  |

**Early luck:** player takes Haaland in round 2 → `surpriseDebt` increases → mid/late picks skew toward medium/risky options or lower tier ceilings until debt cleared.

**Late luck:** player had weak early rounds → `surpriseCredit` allows one elevated elite window before final picks.

The ledger is **soft** — it nudges candidate generation weights, never hard-blocks a tier entirely (preserves “anything can happen”).

---

## Draft pick generation

When a drafter selects a **formation slot / position**, the engine generates **N candidate cards** (default **5**, configurable).

### Candidate composition (minimum mix)

Every choice set must include at least:

| Slot type     | Intent                                        |
| ------------- | --------------------------------------------- |
| **Strong**    | High overall, safe floor                      |
| **Medium**    | Balanced value                                |
| **Risky**     | Lower floor, higher ceiling or budget savings |
| **Chemistry** | Boosts existing club/nation/league links      |
| **Wildcard**  | See [Wildcard system](#wildcard-system)       |

Rules:

- Do not offer five identical archetypes (e.g. five 86-rated CMs).
- Do not offer five cards with the same decision profile.
- Every option should change the team story (strength vs link vs gamble).

### Generation pipeline (logical)

```
1. Resolve slot position (formation)
2. Filter pool: eligible cards (position compatibility)
3. Apply participant budget + surprise ledger weights
4. Fill 5 slots: strong, medium, risky, chemistry, wildcard
5. De-duplicate near-identical overall + same player
6. Return ranked candidates for UI
```

Candidates are drawn from the **shared draft pool** (card IDs), not regenerated per player as duplicate entities.

---

## Wildcard system

Wildcards inject **excitement without destroying balance**.

### Wildcard types (examples)

| Type            | Example                             |
| --------------- | ----------------------------------- |
| Legend card     | Special high-profile edition        |
| Rare special    | Limited `CardType` (Hero, Event)    |
| High chemistry  | Weak overall but +3 link potential  |
| Out-of-position | Elite player, secondary slot only   |
| Young talent    | High ceiling, lower current overall |

### Probability

- Base wildcard slot probability: **configurable** (e.g. 8–12% per pick set).
- Wildcard picks still consume budget; extreme overall wildcards increase `surpriseDebt`.
- Wildcards must not appear every pick — rarity preserves memory.

**Design intent:** the wildcard system is the primary source of “Oha ona Mbappé geldi!” moments. Budget + surprise ledger prevent that moment from deciding the match alone.

---

## Position compatibility

Uses `PlayerPosition` assignments on the player linked to each card.

| Assignment         | Eligibility weight |
| ------------------ | ------------------ |
| Primary position   | 100%               |
| Secondary position | 90%                |
| Third position     | 80%                |

- Slot filter: card eligible if player has matching `positionCode` (primary or secondary).
- Candidate ranking: prefer primary > secondary > tertiary.
- **Future:** out-of-position penalties in simulation — **not in v1**.

See [Position System](./position-system.md).

---

## Chemistry integration

Chemistry is computed from drafted cards’ player identity (club, nation, league). The balance engine prioritizes **chemistry slot** candidates using projected link value.

Details: [Chemistry System](./chemistry-system.md).

During pick generation, chemistry options should be **legible** in UI (“+2 club link with Kanté”).

---

## Soft balancing validation

### Per-draft checks (runtime)

After each pick (optional debug / production metrics):

- Rolling projected team average overall per participant
- Remaining budget band
- Elite picks taken vs lobby average

### Simulation harness (offline)

Run **1,000 simulated drafts** with synthetic drafters (random choice heuristics):

| Metric                        | Target                                  |
| ----------------------------- | --------------------------------------- |
| Mean team overall per slot    | Within configured spread                |
| Std dev of final team overall | Low; no outlier > 3 avg overall         |
| Elite pick distribution       | No participant > 2× others consistently |
| Mean chemistry                | Comparable across participants          |
| Mean match power              | See [Match Power](./match-power.md)     |

**Pass criteria:** no participant archetype (always-first-picker, always-snake-tail) gains > **5% win rate advantage** in simulation vs uniform baseline (future: tie to match simulation).

---

## Metrics & telemetry

Persist aggregates for live tuning (future tables / analytics):

| Metric                      | Use                                |
| --------------------------- | ---------------------------------- |
| Average draft rating        | Balance drift detection            |
| Average chemistry           | Link system health                 |
| Average match power         | End-to-end strength                |
| Pick rates                  | Over/under-selected cards          |
| Win rates                   | Outcome fairness (post-simulation) |
| Wildcard pick rate          | Excitement vs balance              |
| Tier distribution per draft | Pool health                        |

---

## Implementation phases

| Phase                         | Scope                                                |
| ----------------------------- | ---------------------------------------------------- |
| **V1 — Docs + config schema** | This document; config types; no runtime              |
| **V2 — Budget + tiers**       | Allocate budgets at draft start; tier classification |
| **V3 — Pick generator**       | 5-candidate sets with composition rules              |
| **V4 — Surprise ledger**      | Elite debt/credit weighting                          |
| **V5 — Wildcards**            | Configurable wildcard slot                           |
| **V6 — Simulation harness**   | 1k-draft Monte Carlo validation                      |

---

## Open questions

1. Exact budget formula: linear in overall vs tier table?
2. Show chemistry preview on candidates during draft?
3. Snake draft interaction with budget (does pick order affect budget)?
4. Shared pool depletion: can two players see the same card ID in different pick sets?
5. Post-draft budget reveal for education / trust?

---

## Success criteria (recap)

- Drafts feel **different** every time.
- Superstar moments happen **often enough to remember**, rarely enough to dominate.
- Final teams land within **2–3 overall** average spread.
- Players attribute wins to **choices and team building**, with luck as spice — not the whole meal.
