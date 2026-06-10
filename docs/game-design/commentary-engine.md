# Commentary Engine

## Goal

Generate readable, football-flavored commentary that references **real drafted player names**, not generic placeholders.

## Data sources

Commentary pulls from `MatchTeamSnapshot.players`:

- Shooter for shots and goals
- Assister (optional secondary player) on goals
- Taker for corners, free kicks, penalties

## Templates

Event-specific phrase pools live in `MatchSimulationEngine`:

- **Dangerous attack** — wing play, quick transitions
- **Shot / shot on target** — distance, blocked attempts, keeper saves
- **Goal** — scorer + team name, penalty conversions
- **Woodwork** — near misses
- **Cards** — yellow/red with player name
- **Structural** — kick-off, half-time, full-time scorelines

## Examples

- "Rodri switches play to the right wing."
- "Haaland rises highest but his header hits the post."
- "Goal! Mbappe finishes brilliantly for Away FC!"
- "Goal ruled out for offside."

## Playback

Events are created during pre-simulation with a `minute` and `commentary` string. During live playback the frontend renders revealed events newest-first in a commentary feed.
