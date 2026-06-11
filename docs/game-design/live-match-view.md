# Live Match View (Active Player Visualization V1)

## Purpose

Draft.io matches are **pre-simulated** and revealed minute-by-minute. V1 adds a broadcast-style viewer that shows where the ball is, who is involved, and how attacks develop — without rendering all 22 players.

## Layout

| Area   | Component                                               | Content                                          |
| ------ | ------------------------------------------------------- | ------------------------------------------------ |
| Top    | `MatchLivePitch`                                        | 9-zone pitch, ball marker, active zone highlight |
| Top    | `MatchActivePlayers`                                    | Only players in the current event                |
| Middle | Scoreboard + `MatchMomentumBar` + `MatchLiveStatsPanel` | Score, xG, shots, possession, momentum           |
| Bottom | `MatchCommentaryFeed`                                   | Synchronized text commentary                     |

Lineups (all 22 players) are hidden during live play and shown after full time.

## Pitch Zones

The field uses a 3×3 grid:

```
A1  A2  A3   ← home attacking third
B1  B2  B3   ← midfield
C1  C2  C3   ← home defensive third
```

- **Home** attacks upward (C → B → A).
- **Away** attacks downward (A → B → C).
- Each event stores `ballZone` and `previousBallZone` for animated transitions.

## Active Players Only

We never plot the full squad on the pitch. Each revealed event carries:

- `activePlayerCardIds` / `activePlayerNames` (1–2 players)
- Optional `secondaryCardId` for pass/cross targets

Examples:

| Moment                | Active players | Ball zone |
| --------------------- | -------------- | --------- |
| Rodri wins possession | Rodri          | B2        |
| Pass to Yamal         | Rodri, Yamal   | A3        |
| Haaland shoots        | Haaland        | A2        |

## Synchronization

On every reveal, the backend updates:

1. Commentary (`MatchCommentaryFeed`)
2. Pitch (`liveVisualization.ballZone`, active players)
3. Statistics (existing live stats reducer)
4. Momentum (`MatchMomentumBar`)

WebSocket events: `BALL_MOVED`, `ATTACK_STARTED`, `ATTACK_PROGRESS`, `SHOT`, `GOAL`, `MOMENTUM_CHANGED`, `MATCH_EVENT_CREATED`.

## Match Speed

Default `msPerMinute: 1000` → ~90 football minutes in ~90 real seconds (configurable in `DEFAULT_MATCH_SIMULATION_CONFIG`).

Target range: **60–120 seconds** per match.

## Replay Storage

Major events (`GOAL`, `PENALTY`, `RED_CARD`, `WOODWORK`) store `isReplayEligible: true` and full attack-chain metadata in `replaySnapshots` on `MatchStateDto`. Replay UI is deferred to a later version.
