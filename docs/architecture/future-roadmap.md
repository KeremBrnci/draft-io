# Future Roadmap

## Overview

Phased delivery plan for the draft.io platform. Each phase builds on the previous, maintaining the modular monolith architecture.

---

## Phase 1: Players + Formations

**Status:** Foundation in progress

### Deliverables

- [x] Player aggregate (name, position, overall rating)
- [x] Position vocabulary (15 positions)
- [x] Formation templates (5 formations, in-memory)
- [x] CRUD use cases for players
- [x] Formation listing API
- [ ] Player persistence (Prisma schema finalized)
- [ ] Player card sub-stats
- [ ] Frontend player browser

### Modules Active

`positions`, `players`, `formations`

---

## Phase 2: Lobby

**Status:** Not started

### Deliverables

- Lobby creation and configuration
- Player join/leave flow
- Lobby state management (Redis)
- Real-time lobby updates (Socket.IO)
- Lobby lifecycle (open → full → started)

### Modules Active

`lobbies`, `auth`, `users`

### Dependencies

- Phase 1 complete (players exist for pool preview)
- Redis pub/sub operational
- Socket.IO gateway

---

## Phase 3: Draft

**Status:** Not started

### Deliverables

- Draft room creation from lobby
- Pick order generation (snake/linear)
- Turn-based pick flow with timer
- Player pool management
- Draft-to-team assignment
- Real-time draft board (Socket.IO)

### Modules Active

`draft`, `lobbies`, `players`, `teams`

### Dependencies

- Phase 2 complete (lobbies functional)
- Event bus for `DraftPickMade`, `DraftCompleted` events

---

## Phase 4: Chemistry

**Status:** Not started

### Deliverables

- Chemistry link definitions (nation, league, position)
- Chemistry score calculation engine
- Team chemistry integration
- Chemistry preview in team builder
- Chemistry-aware team overall calculation

### Modules Active

`teams`, `players`, `nations`, `simulation` (chemistry sub-domain)

### Dependencies

- Phase 1 complete (teams with starting eleven)
- Phase 3 complete (drafted teams exist)

---

## Phase 5: Match Simulation

**Status:** Not started

### Deliverables

- Simulation engine (probabilistic resolution)
- Match scheduling between teams
- Score and event generation
- Simulation input assembly (team + formation + chemistry)
- Match result storage
- Match replay data (seed-based)

### Modules Active

`simulation`, `matches`, `teams`, `formations`

### Dependencies

- Phase 4 complete (chemistry scores available)
- Teams with filled starting elevens

---

## Phase 6: Leagues

**Status:** Not started

### Deliverables

- League creation and team enrollment
- Season scheduling (round-robin, knockout)
- Standings and leaderboard
- Season lifecycle management
- League persistence (Prisma schema)
- Nation-league association

### Modules Active

`leagues`, `nations`, `teams`, `matches`

### Dependencies

- Phase 5 complete (matches can be simulated)
- Phase 1 nations module persisted

---

## Phase 7: Mobile Application

**Status:** Not started

### Deliverables

- React Native or Flutter mobile app
- Shared API consumption via `@draft-io/shared-types`
- Push notifications for draft turns and match results
- Mobile-optimized draft board and team management
- Offline-capable player card browsing

### Dependencies

- Phases 1–6 API stable
- OpenAPI specification published
- Authentication flow supports mobile clients

---

## Cross-Cutting Concerns (All Phases)

| Concern        | Approach                                      |
| -------------- | --------------------------------------------- |
| Authentication | JWT tokens, Phase 2                           |
| Real-time      | Socket.IO + Redis adapter, Phase 2+           |
| Events         | In-process EventBus → Redis pub/sub, Phase 3+ |
| API versioning | `/api/v1` prefix, maintained throughout       |
| Testing        | Unit → Integration → E2E per phase            |
| Monitoring     | Structured logging now; metrics Phase 2+      |

---

## Architecture Principles (Maintained Across All Phases)

1. **No game logic in controllers** — use cases only
2. **Domain layer stays pure** — no framework imports
3. **Cross-module references by ID** — never import foreign entities
4. **Events for cross-module workflows** — not direct application layer calls
5. **Incremental persistence** — Prisma schema grows per phase
6. **Each phase is deployable** — no long-lived feature branches
