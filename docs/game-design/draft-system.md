# Draft System

## Purpose

The draft system is the core multiplayer interaction where participants take turns selecting **cards** from a shared pool to build their teams.

## Card-Based Draft (architecture decision)

**Draft selects Cards, not Players.**

| Wrong                           | Right                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Pick "Lionel Messi" (player ID) | Pick "Messi TOTY 98" (card ID)                          |
| One pick per person             | Multiple card editions of same player can exist in pool |

### Why

- Same player can have Base (89) and Prime Icon (99) — different strategic value.
- Draft pool is a set of **playable assets**, not a roster of real-world persons.
- Simulation and team squads resolve **card overall**, not identity.

### Draft pool composition (planned)

- Pool entries reference `cardId`.
- Each entry exposes: player display name, card type, rarity, overall (for UI).
- Inactive cards (`isActive = false`) are excluded.
- Import does **not** populate the pool — cards are created by game systems first.

## Rules

### Current State

- **Not implemented.** The `draft` module is a placeholder.
- Player identity and Card domain foundations must be complete before draft logic begins.

### Planned Flow (High-Level)

1. Lobby creates a draft room with configured settings.
2. Participants join and receive draft order.
3. **Draft pool is generated from available cards** (not players).
4. Participants pick **cards** in turn until rosters are full.
5. Selected **card IDs** are assigned to each participant's team squad.
6. Draft results are finalized; teams reference cards in `startingEleven`.

### Draft Settings (Proposed)

| Setting           | Description                                    |
| ----------------- | ---------------------------------------------- |
| Pool size         | Total **cards** available for drafting         |
| Roster size       | **Cards** each participant must draft          |
| Pick timer        | Seconds per pick before auto-skip              |
| Draft order       | Snake, linear, or random                       |
| Formation lock    | Whether formation is chosen pre- or post-draft |
| Card type filters | Optional: BASE only, no ICON, etc.             |

## Team Integration

After draft, `Team.startingEleven` slots hold **card UUIDs**, not player UUIDs.

Chemistry and formation systems (future) resolve player identity **through** the card's `playerId` when nationality/club links are needed.

## Related systems

- [Card System](./card-system.md) — draft picks are **Cards**, not Players
- [Position System](./position-system.md) — slot eligibility
- [Draft Balance Engine](./draft-balance-engine.md) — fairness, budgets, pick generation, wildcards
- [Chemistry System](./chemistry-system.md) — link bonuses
- [Match Power](./match-power.md) — overall × chemistry strength score
- [Match Simulation](./match-simulation.md) — uses drafted teams

## Pick generation (Draft Balance Engine)

When a formation slot is selected, the balance engine generates **5 candidate cards** per pick with a required mix: strong, medium, risky, chemistry, wildcard. Hidden team budgets and surprise ledgers keep final squads fair while allowing superstar moments. See [Draft Balance Engine](./draft-balance-engine.md).

## Future Considerations

- **Snake draft** — Reverse pick order each round
- **Auction draft** — Budget-based bidding for cards
- **Auto-pick** — Highest overall available card when timer expires
- **Trade picks** — Exchange draft positions during draft
- **Draft grades** — Post-draft analysis based on card overalls
- **Spectator mode** — Watch drafts in progress
- **Draft history** — Replay and review past drafts

## Open Questions

1. Snake or linear draft as default?
2. Should unpicked cards enter a waiver pool?
3. How is the draft pool generated — all active cards, filtered subset, or curated event pool?
4. Can multiple editions of the same player appear in one pool?
5. What happens on disconnect mid-draft — pause, auto-pick, or forfeit?
6. Hidden budget system — see [Draft Balance Engine](./draft-balance-engine.md) (not pure pick-order luck)
7. How many cards offered per pick? → **5** (configurable via balance config)
