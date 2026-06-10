# Position System (Game Design)

## Purpose

Positions describe **where a real footballer can credibly play**. They are identity data on `Player`, not card strength. Gameplay systems consume position assignments — they do not redefine them on the card.

## Examples

| Player | Primary | Secondary |
|--------|---------|-----------|
| Rodri | CDM | CM, CB |
| Kimmich | CDM | CM, RB |
| Valverde | CM | RM, RW |
| Alaba | CB | LB, CDM |

Stored as `player_positions` rows with `isPrimary`.

## Draft

Formation slots require a position code (e.g. CDM). A player is **draft-eligible** for a slot if they have an assignment matching that code — primary or secondary.

```
Formation slot: CDM
Candidates:
  - Player A: primary CDM ✓
  - Player B: secondary CDM ✓
  - Player C: only CM ✗ (unless future flex rules)
```

Future draft UI can rank candidates by `isPrimary` (preferred role first).

## Simulation (future)

Position-specific performance modifiers attach to **which position the player is deployed in**, not only their primary.

Example — Valverde deployed at RW vs CM:

- RW deployment → secondary role modifier
- CM deployment → primary role modifier

Not implemented. The relationship model stores enough data to support per-deployment modifiers later (`player_positions` row + match context).

## Chemistry (future)

Chemistry rules may use:

- **Out-of-position**: deployed slot not in player's assignments
- **Position compatibility**: adjacent codes (e.g. CM ↔ CDM)
- **Role compatibility**: primary vs secondary at deployed slot

Not implemented. All rules can query `Player.positions` without parsing arrays.

## Overall rating (future)

Position-based overall adjustments read primary/secondary context from assignments. Overall engine `OverallCalculationContext` now includes full `positions[]` plus legacy shorthand fields.

## Admin / data quality

- Missing primary → `MISSING_POSITION` issue
- Distribution charts group by primary `position_code`
- Multi-position players discoverable via `hasMultiplePositions` filter
