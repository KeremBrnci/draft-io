# xG System

## Overview

Expected goals (xG) quantify chance quality. Each shot-like event receives an xG value used for:

- Match totals (`homeXg`, `awayXg`)
- Goal probability
- Live stats panel

## Base values

| Chance type   | Base xG |
|---------------|---------|
| Long shot     | 0.03    |
| Free kick     | 0.08    |
| Header        | 0.18    |
| Box shot      | 0.25    |
| One-on-one    | 0.55    |
| Penalty       | 0.78    |

## Modifiers

Final xG adjusts by:

- **Shooter overall** — higher-rated finishers get a quality factor
- **Defending match power** — stronger opponents suppress chance quality

```text
xg = base * qualityFactor * defenseFactor
goalChance = min(0.92, xg * (1.05 + random * 0.35))
```

## Storage

- Match-level totals on `RoomMatch`
- Per-event `xgValue` on `RoomMatchEvent` for shots, penalties, and goals
- Player ratings influenced by goals scored

## Design intent

xG should track scorelines loosely: a 2.4–1.1 xG match can finish 2–1 or 3–1, but not 0–4 without rare variance.
