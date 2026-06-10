# Room League Format

## Scope

After draft, each lobby creates a **room-scoped mini league** (`RoomLeague`). This is separate from imported catalog `League` competitions.

## Fixture rules

Double round-robin: every participant plays every other participant **twice**, home and away.

| Players | Matches |
| ------- | ------- |
| 2       | 2       |
| 4       | 12      |
| 8       | 56      |

Formula: `n * (n - 1)` fixtures.

Generation: `generateDoubleRoundRobinFixtures()` in the simulation module.

## Phase flow

```text
DRAFT complete → TEAM_REVIEW → host starts league → MATCHES
```

1. All participants finish 11 picks → lobby moves to `TEAM_REVIEW`
2. `RoomLeague`, fixtures, and standings rows are created
3. Host calls `POST /lobbies/code/:code/league/start`
4. First fixture simulates and plays live; further matches via `next-match` or UI button

## Standings

Updated after each `FULL_TIME`:

- Played, W/D/L
- Goals for / against / difference
- Points (3/1/0)
- Rank sorted by points, GD, GF

## API

- `GET /team-review` — squad summary
- `POST /league/start` — host starts matches phase
- `GET /league` — fixtures, table, live match
- `POST /league/next-match` — schedule next fixture
- `GET /matches/:matchId` — match detail

## WebSocket events

`MATCH_STARTED`, `MATCH_MINUTE_UPDATED`, `MATCH_EVENT_CREATED`, `GOAL_SCORED`, `HALF_TIME`, `FULL_TIME`, `LEAGUE_TABLE_UPDATED`
