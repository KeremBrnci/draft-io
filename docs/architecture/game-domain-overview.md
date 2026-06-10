# Game Domain Overview

## Purpose

This document describes how the core game domain modules interact and how they will support future features (lobbies, drafts, simulation, leagues).

## Domain Modules

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Positions  │     │  Formations │     │   Nations   │
│  (vocab)    │     │  (templates)│     │  (aggregate)│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Players   │────▶│    Teams    │◀────│   Leagues   │
│  (aggregate)│     │  (aggregate)│     │  (aggregate)│
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │            ┌──────┴──────┐
       │            ▼             ▼
       │     ┌──────────┐  ┌───────────┐
       │     │  Draft   │  │  Matches  │
       │     │ (future) │  │ (future)  │
       │     └────┬─────┘  └─────┬─────┘
       │          │              │
       │          ▼              ▼
       │     ┌──────────┐  ┌───────────┐
       └────▶│  Lobbies │  │Simulation │
             │ (future) │  │ (future)  │
             └──────────┘  └───────────┘
```

## Module Responsibilities

### Positions

- **Type:** Shared vocabulary (value objects)
- **Responsibility:** Define the 15 valid position codes
- **Used by:** Players, Formations, Teams (via application layer validation)

### Players

- **Type:** Aggregate root
- **Responsibility:** Player cards with name, position, overall rating
- **References:** Position (from positions module)
- **Referenced by:** Teams (via player IDs), Draft (future), Simulation (future)

### Formations

- **Type:** Domain templates (predefined, in-memory)
- **Responsibility:** Tactical layouts with 11 slots and allowed positions
- **Referenced by:** Teams (via formation code string)

### Teams

- **Type:** Aggregate root
- **Responsibility:** Starting eleven, formation, manager, chemistry/overall (future)
- **References:** Player IDs, formation code
- **Referenced by:** Leagues, Matches (future), Draft (future)

### Nations

- **Type:** Aggregate root
- **Responsibility:** National identity for players and leagues
- **Referenced by:** Leagues, Chemistry (future)

### Leagues

- **Type:** Aggregate root
- **Responsibility:** Groups of teams within a nation and season
- **References:** Team IDs, Nation ID

## Cross-Module Communication Rules

### Allowed

- Modules reference other aggregates **by ID only** (e.g., `Team` holds `playerIds: string[]`)
- Application layer validates cross-module references (e.g., verify player exists before assigning to team)
- Domain events (via `EventBus`) for cross-module notifications (future)

### Forbidden

- Importing another module's entity into domain layer
- Direct database joins across module boundaries
- Business logic in controllers

## Future Interaction Flows

### Draft Flow (Phase 3)

```
Lobby created
  → Draft room initialized with player pool
  → Participants pick players (Draft module)
  → Selected PlayerIds assigned to Team.startingEleven
  → Team formation chosen
  → DraftCompleted event published
```

### Match Simulation Flow (Phase 5)

```
Match scheduled (Matches module)
  → Load Team A and Team B (by ID)
  → Resolve Player cards for starting elevens
  → Load Formation templates
  → Calculate chemistry (Chemistry engine)
  → Run simulation (Simulation module)
  → Store match result
  → MatchCompleted event published
```

### League Season Flow (Phase 6)

```
League created with teams
  → Season schedule generated
  → Matches played (simulation)
  → Standings updated
  → SeasonCompleted event published
```

## Event Infrastructure

Located at `src/core/events/`:

- `DomainEvent` — Base class for domain events
- `EventBus` — Port for publish/subscribe within the monolith

No external message broker. In-process dispatch initially; Redis pub/sub for cross-instance delivery when Socket.IO scaling is needed.

## Aggregate Boundaries

| Aggregate | Root Entity | Consistency Boundary |
|-----------|-------------|-------------------|
| Player | `Player` | Name, position, rating invariants |
| Team | `Team` | Lineup slots, formation, manager |
| Nation | `Nation` | National identity |
| League | `League` | Team membership, season |
| Formation | `Formation` | Slot definitions (immutable template) |

Formations are not traditional aggregates — they are immutable predefined data. Teams and Leagues reference them by code.
