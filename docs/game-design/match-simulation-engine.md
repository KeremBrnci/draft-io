# Match Simulation Engine V1

## Purpose

Resolve head-to-head matches between drafted squads with believable football outcomes, live minute-by-minute playback, and persistent statistics.

## Inputs

Each match uses immutable team snapshots captured at kick-off:

- Participant display name and formation code
- `teamAverageOverall`, `teamChemistry`, `matchPower`
- Eleven drafted players with real names, positions, card overalls

Strength is derived from draft balance calculators already used during roster building.

## Time model

Matches do not simulate wall-clock 90 minutes. Playback uses accelerated time:

- Default: **1 real second = 1 match minute**
- Configurable via `DEFAULT_MATCH_SIMULATION_CONFIG.msPerMinute`

Statuses: `SCHEDULED`, `LIVE`, `HALF_TIME`, `FULL_TIME`, `PAUSED`.

## Momentum system

Each team carries hidden momentum during generation and playback:

- Goals increase attacking team momentum (+0.15) and reduce opponent momentum (-0.10)
- Attack selection weights combine `matchPower`, chemistry boost (max ~10%), home advantage (~5%), and momentum
- Stronger teams dominate possession more often but upsets remain possible

## Event generation

Target: **12–22 major events** per match.

Event types include dangerous attacks, shots, goals, woodwork, penalties, cards, corners, and free kicks. Events are pre-generated with seeded RNG, stored in `room_match_events`, then revealed minute-by-minute during playback.

## Result storage

Persisted entities:

- `RoomMatch` — scoreline, xG, snapshots, status, seed
- `RoomMatchEvent` — commentary, player references, xG per shot
- `RoomMatchStatistic` — possession, shots, cards, player ratings
- `RoomLeagueStanding` — table row updated after `FULL_TIME`

## Chemistry influence

Chemistry contributes up to **10%** effective strength via `chemistryImpactCap`. Overall / match power remains primary; chemistry can swing close games.

## Validation

`match-simulation-engine.service.unit.test.ts` runs 1000 simulations and checks:

- Average goals and xG remain football-like
- Home win rate > away win rate with home advantage
- Draw rate remains meaningful
