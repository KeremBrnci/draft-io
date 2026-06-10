# Formation Selection Phase

## Overview

Formation Selection is the first in-game phase after the lobby. Every player receives a **personal pool of five random formations** from the catalog, picks exactly one, and locks that choice before the draft begins.

```
Lobby → Formation Selection → Draft → Team Review → Match Simulation
         ^^^^^^^^^^^^^^^^^^
         this document
```

## Why formation comes before draft

1. **Structure before players** — The formation defines slot layout and allowed positions. Draft picks are filtered and scored against those slots later.
2. **Meaningful trade-offs early** — Different formations create different squad-building paths before any card is picked.
3. **Fair randomness** — Each player gets their own five-option pool, not a shared global list.

## Formation catalog

Formations are stored in the database (`formations` table), seeded from domain templates on backend startup. The API and selection logic **never hardcode** formation lists in application code for gameplay flows.

Each formation includes:

- Stable `id` (UUID)
- Display `code` (e.g. `4-3-3`)
- Eleven slot definitions (label + allowed positions)

## Personal formation pool

When the host starts formation selection:

1. Room phase becomes `FORMATION_SELECTION`.
2. For **each participant**, the server draws **5 unique formations** from the full catalog.
3. Pools are persisted in `lobby_participant_formation_options`.
4. Shuffle is **deterministic** per `(lobbyId, participantId)` so refresh/reconnect restores the same options.

Player A and Player B may see overlapping codes (e.g. both see `4-3-3`) but the underlying option sets are generated independently.

## Selection rules

| Rule              | Behavior                                          |
| ----------------- | ------------------------------------------------- |
| Pick count        | Exactly one formation per player                  |
| Pool constraint   | Must pick from assigned five                      |
| After pick        | `phaseStatus = FORMATION_SELECTED`, choice locked |
| Change after lock | Not allowed                                       |
| Host start draft  | Enabled only when all players selected            |

Persisted fields:

- `lobby_participants.selected_formation_id`
- `lobby_participants.phase_status`

## Room state machine

Use `Lobby.phase` (`RoomPhase`) — not booleans.

| Phase                 | Meaning                                                        |
| --------------------- | -------------------------------------------------------------- |
| `LOBBY`               | Waiting room, ready checks                                     |
| `FORMATION_SELECTION` | Personal pools assigned, picks in progress                     |
| `DRAFT`               | Draft session initialized (player picking not implemented yet) |
| `TEAM_REVIEW`         | Future                                                         |
| `MATCHES`             | Future                                                         |
| `FINISHED`            | Future                                                         |

Transitions implemented now:

```
LOBBY --(host start)--> FORMATION_SELECTION --(all selected + host)--> DRAFT
```

`Lobby.status` still tracks join capacity (`OPEN`, `FULL`, `STARTED`, `CLOSED`). Game flow is driven by `phase`.

## Timer support (future)

Schema prepares optional timing without enforcing it yet:

| Field                            | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `formation_selection_started_at` | Set when phase begins                            |
| `formation_selection_deadline`   | Nullable; reserved for auto-pick / force advance |

No server-side countdown enforcement in this phase.

## WebSocket events

Namespace: `/rooms`

Client joins with `join_room { code }`.

| Event                         | When                               |
| ----------------------------- | ---------------------------------- |
| `FORMATION_SELECTION_STARTED` | Host starts formation phase        |
| `PLAYER_SELECTED_FORMATION`   | A player locks a formation         |
| `ALL_FORMATIONS_SELECTED`     | Last required pick completed       |
| `DRAFT_READY`                 | Host starts draft, phase → `DRAFT` |

REST polling remains as fallback on the formation screen.

## How formation affects draft pool (future)

Not implemented in this phase. Design intent:

- Draft offers will bias toward positions required by the chosen formation.
- Chemistry and match power engines consume formation slot layout when picks exist.

## API

| Method | Path                                                    | Purpose                   |
| ------ | ------------------------------------------------------- | ------------------------- |
| `POST` | `/lobbies/code/:code/start`                             | Begin formation selection |
| `GET`  | `/lobbies/code/:code/formation-selection?sessionToken=` | State + personal pool     |
| `POST` | `/lobbies/code/:code/formation-selection/select`        | Lock formation            |
| `POST` | `/lobbies/code/:code/draft/start`                       | Host starts draft         |

## Reconnection

Session token + lobby code (stored in `localStorage`) reload:

- Personal five-option pool
- Locked `selectedFormationId`
- Room phase and participant counts

## Frontend

Route: `/play/room/[code]/formation`

- Formation cards with pitch preview (slot markers, no players)
- Selected / locked visual states
- Progress meter: `N / M players selected`
- Host **Draftı Başlat** when `canStartDraft`

## Tests

Backend unit tests cover:

- Room phase transitions
- Personal pool assignment
- Selection persistence and lock
- WebSocket event names / publisher integration
- Reconnection via repository reload
- Draft start gating
