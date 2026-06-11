# Momentum System

## Purpose

Momentum gives viewers a quick read on which team is pressing the game — similar to TV “momentum graphs” — without affecting simulation outcomes in V1.

## Internal Model

`MatchMomentumTracker` maintains normalized values:

- `home` and `away` in range **0.15 – 0.85**
- Starts at **0.5 / 0.5**

### Event Deltas (attacking team)

| Event                                       | Δ momentum |
| ------------------------------------------- | ---------- |
| `GOAL`                                      | +0.14      |
| `GOAL_CHANCE`, `SHOT_ON_TARGET`, `WOODWORK` | +0.05      |
| `SHOT`, `PENALTY`                           | +0.035     |
| `DANGEROUS_ATTACK`, `CORNER`, `FREE_KICK`   | +0.025     |
| `PASS`, `DRIBBLE`, `CROSS`                  | +0.012     |
| `YELLOW_CARD`                               | −0.03      |
| `RED_CARD`                                  | −0.06      |
| `MISSED_PENALTY`                            | −0.04      |

The defending side receives ~55% of the inverse shift to keep totals bounded.

## API Exposure

Per event visualization stores raw `homeMomentum` / `awayMomentum` (0–1).

`MatchLiveVisualizationDto.momentum` exposes:

- `home` / `away` — **percent** (sum ≈ 100)
- `homeTrend` / `awayTrend` — change over the **last 5 minutes** of revealed play

## UI

`MatchMomentumBar` renders a dual-color track (home blue / away red) plus 5-minute trend labels.

## WebSocket

`MOMENTUM_CHANGED` fires on each revealed event with visualization data so clients can refresh without parsing the full event list.

## Future

Momentum could feed commentary tone, crowd audio, or post-match “swing minutes” highlights. V1 is display-only.
