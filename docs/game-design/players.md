# Players

## Purpose

Players are the core collectible units in draft.io. Each player is a card with a name, position, and overall rating that can be drafted, assigned to teams, and used in match simulation.

Players serve as the atomic building block for teams, chemistry calculations, and draft pools.

## Rules

### Identity

- Every player has a unique UUID identifier (`PlayerId`).
- Player names must be non-empty strings with a maximum of 100 characters.

### Attributes (Current Foundation)

| Attribute      | Type            | Constraints                        |
| -------------- | --------------- | ---------------------------------- |
| Name           | `PlayerName`    | 1–100 characters, trimmed          |
| Position       | `Position`      | One of 15 supported position codes |
| Overall Rating | `OverallRating` | Integer 1–99                       |

### Supported Positions

`GK`, `LB`, `CB`, `RB`, `LWB`, `RWB`, `CDM`, `CM`, `CAM`, `LM`, `RM`, `LW`, `RW`, `CF`, `ST`

### Operations (Planned)

- **Create** — Add a new player to the pool
- **Update** — Modify position or overall rating
- **Get by ID** — Retrieve a single player
- **List** — Browse players with optional position filter

## Future Considerations

- **Extended attributes** — Pace, shooting, passing, dribbling, defending, physical (sub-stats)
- **Player cards** — Rarity tiers, special editions, limited releases
- **Nation linkage** — Players belong to nations for chemistry and league eligibility
- **Age and form** — Dynamic rating adjustments over seasons
- **Injury and fatigue** — Match availability modifiers
- **Market value** — Draft cost and trade valuation
- **Historical stats** — Goals, assists, appearances across seasons

## Open Questions

1. Should player sub-stats be stored as JSONB or normalized columns?
2. Will players be user-generated, procedurally generated, or based on real football data?
3. How many players should exist in a default draft pool?
4. Should overall rating be recalculated from sub-stats or set independently?
5. Do players have a contract/expiry system tied to seasons?
6. Should duplicate player names be allowed across different cards?
