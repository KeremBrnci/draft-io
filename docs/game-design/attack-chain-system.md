# Attack Chain System

## Overview

Attack chains link build-up play to climax events (shots, goals, woodwork, penalties). They power the “how did this chance develop?” broadcast feel without simulating full player movement.

## Chain Lifecycle

| Phase    | `attackPhase` | Typical events                               |
| -------- | ------------- | -------------------------------------------- |
| Start    | `START`       | First `PASS` / possession in chain           |
| Progress | `PROGRESS`    | `PASS`, `DRIBBLE`, `CROSS`                   |
| End      | `END`         | `SHOT`, `GOAL`, `WOODWORK`, `MISSED_PENALTY` |

Each chain has:

- `attackChainId` — stable identifier (e.g. `chain-3`)
- `attackChainStep` — 1-based index within the chain
- `attackChainPlayers` — ordered names for goal overlays (e.g. Rodri → Yamal → Haaland)

## Generation

After base simulation, `MatchVisualizationEnricher`:

1. Detects climax events (`GOAL`, `SHOT`, `GOAL_CHANCE`, etc.).
2. Picks 3–4 players from the attacking squad (midfield → attack progression).
3. Inserts flow events (`PASS`, `DRIBBLE`, `CROSS`) at the same minute.
4. Advances `ballZone` along a deterministic path per team side.

Flow events **do not** change match statistics (shots, xG, possession counters were computed in the core engine).

## Goal Sequence UI

When `eventType === 'GOAL'`:

- `MatchActivePlayers` renders the full chain with arrows.
- `highlightGoal` flashes the ball marker and chain panel.
- Scorer + assister remain in commentary and goal celebration overlay.

## Why Not Full Simulation?

Draft.io is a **draft game match viewer**, not a physics engine. Chains are narratively coherent sequences derived from roster data and seeded RNG — fast to compute, easy to read, and stable across clients.
