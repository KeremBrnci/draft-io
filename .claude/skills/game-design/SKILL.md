---
name: game-design
description: >-
  Applies draft.io football game design rules — players, formations, draft,
  chemistry, overall ratings, and match simulation. Use when implementing game
  mechanics, validating domain rules, designing UX flows, or resolving design
  questions against docs/game-design/.
---

# Game Design

## Governance

Required before game rule changes (workflow Steps 1–2). Subordinate to `game-domain.mdc` and `ai-constitution.md`.

| Document               | Path                                      |
| ---------------------- | ----------------------------------------- |
| AI Constitution        | `docs/architecture/ai-constitution.md`    |
| Workflow               | `.cursor/rules/workflow.mdc`              |
| Universal instructions | `AGENTS.md`                               |
| Project context        | `.claude/skills/project-context/SKILL.md` |
| Project vision         | `docs/architecture/project-vision.md`     |

## Purpose

Ensure code and features align with **draft.io** game design: a multiplayer football draft where participants build squads from player cards, then simulate matches based on team composition, formations, and chemistry. Design docs in `docs/game-design/` are the source of truth for mechanics.

## When to use

- Implementing player cards, team building, or draft room logic
- Designing chemistry bonuses or overall rating calculations
- Building match simulation inputs/outputs
- Creating UI for draft boards, formation pickers, or match results
- Resolving open design questions before coding
- Validating that domain invariants match game rules

## Required inputs

1. **Mechanic area** — Players, formations, draft, chemistry, simulation, leagues?
2. **Design doc** — Relevant file in `docs/game-design/`
3. **Phase** — Is the mechanic in scope per `docs/architecture/future-roadmap.md`?
4. **Open questions** — Unresolved items in design docs that block implementation
5. **Player impact** — How does this affect draft strategy or match outcomes?

## Rules

### Core game loop (target state)

```
Create/join Lobby → Configure draft settings → Draft players → Build team
  → (Chemistry calculated) → Schedule/play Match → Simulation → Results/standings
```

### Domain modules and game concepts

| Module         | Game concept          | Key rules                                         |
| -------------- | --------------------- | ------------------------------------------------- |
| **positions**  | 15 position codes     | Vocabulary for players, formations, slots         |
| **players**    | Player cards          | Name, position, overall rating (sub-stats future) |
| **formations** | Tactical templates    | 11 slots with allowed positions per slot          |
| **teams**      | User squads           | Starting eleven, formation code, manager (future) |
| **nations**    | National identity     | Links for chemistry and leagues                   |
| **leagues**    | Season competition    | Teams grouped by nation/season                    |
| **draft**      | Multiplayer pick flow | Turn order, pool, timer, roster assignment        |
| **simulation** | Match resolution      | Score, events from team stats + chemistry         |

### Players (`docs/game-design/players.md`)

- Overall rating is primary stat (1–99 range; validate in `OverallRating` VO)
- Position must be one of 15 valid codes
- Sub-stats (pace, shooting, etc.) planned — reserve domain structure
- Player cards are immutable during a match; mutable in roster management

### Formations (`docs/game-design/formations.md`)

- 5 predefined formations (in-memory templates, not DB aggregates)
- Each slot defines allowed positions
- Team references formation by **code string**, not embedded object
- Lineup must satisfy formation slot constraints

### Draft (`docs/game-design/draft-system.md`)

**Planned flow:**

1. Lobby creates draft room with settings (pool size, roster size, timer, order type)
2. Participants receive draft order (snake, linear, or random)
3. Shared player pool; picks remove players from pool
4. Turn-based selection until rosters full
5. Selected players assigned to `Team.startingEleven`
6. `DraftCompleted` event → teams editable

**Settings to support:**

| Setting        | Impact                              |
| -------------- | ----------------------------------- |
| Pool size      | Total draftable players             |
| Roster size    | Picks per participant               |
| Pick timer     | Auto-pick on expiry                 |
| Draft order    | Snake vs linear fairness            |
| Formation lock | Pre- vs post-draft formation choice |

### Chemistry (`docs/game-design/chemistry-system.md`)

- Team-level score from links in starting eleven
- Link types: same nation, same league, adjacent positions, manager nation
- Affects simulation performance and/or displayed team overall
- `Team.chemistryScore` reserved (currently `null`)
- Draft UI should preview potential chemistry (future)

### Match simulation (`docs/game-design/match-simulation.md`)

**Inputs:**

- Team A/B starting elevens (player IDs resolved to ratings)
- Formation codes
- Chemistry scores
- Team overall (future)

**Outputs:**

- Final score
- Match events (goals, cards — future detail levels TBD)
- Player performance ratings (future)

**Design decisions pending:**

- Real-time tick vs instant resolution
- Deterministic (seeded) vs probabilistic
- Event detail level (summary vs play-by-play)

### Overall system (`docs/game-design/overall-system.md`)

- Player overall drives base strength
- Team overall aggregates lineup ratings + formation fit + chemistry
- Displayed to users; feeds simulation modifiers

### Implementation priority

Follow roadmap phases — do not implement simulation before draft foundations exist:

1. Players + Formations (current)
2. Lobby
3. Draft
4. Chemistry
5. Simulation + Matches
6. Leagues/seasons

## Examples

### Example 1: Valid starting eleven

Formation `4-3-3` slot 9 allows `['LW', 'LM', 'LF']`. Assigning a `ST` to slot 9 violates formation rules — reject in `Team` aggregate with `INVALID_SLOT_POSITION` domain error.

### Example 2: Snake draft order

8 participants, 11 rounds → pick order round 1: 1-8, round 2: 8-1, round 3: 1-8, etc. Encode in `DraftOrder` value object; expose current picker via `DraftRoom.currentPickIndex`.

### Example 3: Chemistry preview during draft

When user hovers a player in draft UI, compute hypothetical chemistry if added to current lineup. This is a **read model** / query — not persisted until draft completes. Backend: `PreviewChemistryQuery` orchestrates without mutating team.

### Example 4: Simulation fairness

Use seeded PRNG (`MatchSeed` VO) so identical inputs reproduce identical results. Store seed in match result for replay/debug.

## Checklist

- [ ] Mechanic documented in `docs/game-design/` or design doc updated first
- [ ] Domain invariants encode rules (not just UI validation)
- [ ] Formation slot constraints enforced in Team aggregate
- [ ] Position codes validated against positions module vocabulary
- [ ] Rating bounds match design (reject out-of-range)
- [ ] Draft picks are atomic (player removed from pool + assigned to team)
- [ ] Open design questions flagged before implementing ambiguous behavior
- [ ] Phase alignment checked — no simulation logic in Phase 1
- [ ] Chemistry weights configurable (constants), not magic numbers in logic
- [ ] User-facing copy matches game terminology (formation, chemistry, overall)

## Anti-patterns

| Anti-pattern                                  | Correct approach                                   |
| --------------------------------------------- | -------------------------------------------------- |
| Hardcoding 4-4-2 slots in draft module        | Reference formations module by code                |
| Letting users field any 11 players            | Enforce formation slot positions                   |
| Computing chemistry in frontend only          | Backend domain/service is authoritative            |
| Ignoring draft timer edge cases               | Auto-pick, pause-on-disconnect per design decision |
| FIFA-exact stat names without doc reference   | Follow `docs/game-design/players.md`               |
| Simulation randomness without seed            | Deterministic replay support                       |
| Mixing league standings into draft module     | Separate bounded contexts                          |
| Implementing auction draft before snake works | Follow phased roadmap                              |
| Player overall as float                       | Integer 1–99 per design                            |
| Skipping design doc open questions            | Resolve or document assumption in PR               |
