# Overall System

## Purpose

The overall system defines how player quality is represented, aggregated, and compared across the platform. It provides a single-number summary (overall rating) while leaving room for detailed sub-stat systems.

## Rules

### Player Overall Rating

- Integer value from 1 to 99.
- Represents general player quality on a card.
- Currently set directly; no sub-stat derivation yet.

### Team Overall (Future)

- Derived from the starting eleven's individual ratings.
- Modified by chemistry score.
- Displayed as a single team strength indicator.
- Currently stored as `null` on the `Team` entity — not calculated.

### Chemistry Score (Future)

- Numeric modifier applied to team performance.
- Based on player relationships (club, nation, league links).
- Currently stored as `null` on the `Team` entity — not calculated.

## Future Considerations

- **Weighted aggregation** — Strikers weighted differently than defenders in team overall
- **Position-adjusted ratings** — A 85-rated CB vs 85-rated ST may perform differently
- **Form multiplier** — Recent performance affects effective overall
- **Chemistry tiers** — Threshold-based bonuses (e.g., +1 at 20 chemistry, +3 at 30)
- **Manager influence** — Manager attribute affects team overall or chemistry ceiling
- **Formation fit** — Players out of position receive an overall penalty

## Open Questions

1. What formula should compute team overall from individual ratings?
2. Should chemistry be a flat bonus or a percentage multiplier?
3. Is 1–99 the right scale for all entities (players, teams, managers)?
4. Should overall ratings be visible during draft or hidden until picked?
5. How should out-of-position penalties interact with formation slot flexibility?
