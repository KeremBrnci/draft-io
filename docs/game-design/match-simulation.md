# Match Simulation

## Purpose

Match simulation resolves competitive encounters between two teams, producing scores and events based on team composition, formation, chemistry, and **card** attributes.

## Card-Based Simulation (architecture decision)

**Simulation uses Card overall values, not Player entities.**

| Wrong                        | Right                                      |
| ---------------------------- | ------------------------------------------ |
| Load `Player.overallRating`  | Load `Card.overall` for each starting slot |
| Identity row drives strength | Playable card edition drives strength      |

Player identity is used only when simulation needs person-level data (e.g. nationality for chemistry links) — resolved via `card.playerId`.

## Rules

### Current State

- **Not implemented.** The `simulation` and `matches` modules are placeholders.
- Team, Card, and Player domain structures exist to support future simulation inputs.

### Planned Inputs

| Input                  | Source                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| Team A starting eleven | `Team.startingEleven` — **card IDs**                                 |
| Team B starting eleven | `Team.startingEleven` — **card IDs**                                 |
| Card strength          | `Card.overall` per slot                                              |
| Formation              | `Team.formationCode`                                                 |
| Chemistry              | `Team.chemistryScore` (future) — derived from cards' players         |
| Team overall           | `Team.teamOverall` (future) — aggregate of card overalls + chemistry |

### Planned Outputs

| Output             | Description                          |
| ------------------ | ------------------------------------ |
| Final score        | Goals for each team                  |
| Match events       | Goals, cards, substitutions (future) |
| Performance grades | Per-**card** performance (future)    |
| Statistics         | Possession, shots, passes (future)   |

### Resolution flow (planned)

```
startingEleven.cardIds[]
  → CardRepository.findByIds
  → Card.overall (+ future traits)
  → SimulationEngine.resolve
```

## Future Considerations

- **Simulation engine** — Deterministic vs probabilistic resolution
- **Tick-based simulation** — Minute-by-minute event generation
- **Highlight reel** — Key moments for frontend display
- **Home advantage** — Venue modifier
- **Weather and pitch conditions** — Environmental factors
- **Injury during match** — May affect player identity status; cards unchanged
- **Extra time and penalties** — Knockout match resolution
- **Replay seed** — Deterministic replays from a seed value

## Open Questions

1. Should simulation be real-time (live ticking) or instant resolution?
2. What level of event detail is needed (full play-by-play vs summary)?
3. How much should randomness vs deterministic skill influence outcomes?
4. Should users watch simulation live or receive results instantly?
5. How do formation and chemistry translate into simulation modifiers?
6. Is head-to-head the only mode, or are there tournaments and leagues?
7. What performance characteristics are required (simulate in <1s vs live over 90 virtual minutes)?
