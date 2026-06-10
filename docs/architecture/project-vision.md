# Project Vision

**Product:** draft.io  
**Genre:** Football draft, team building, and league simulation  
**Platform:** Web (Phase 1); Mobile (Phase 10+)

---

## What is the product?

draft.io is a **multiplayer football draft and simulation game**. Players compete in private lobbies to draft real footballers (represented as cards with ratings and positions), assemble starting elevens in chosen formations, build team chemistry, and simulate league seasons to climb rankings.

The core fantasy is **being a manager**: scout the pool, outdraft opponents, optimize lineups, and prove your squad in simulated matches — without manual kick-by-kick control.

---

## Who are the users?

| Persona                | Motivation                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Draft enthusiast**   | Enjoys snake drafts, pick strategy, and building the best possible squad under constraints  |
| **Football fan**       | Wants to play with recognizable player archetypes, formations, and league structures        |
| **Competitive player** | Seeks rankings, seasons, and repeatable skill expression through drafting and team building |
| **Social group**       | Friends who want a structured game night experience with lobby codes and shared drafts      |
| **Async player**       | Prefers turn-based or timed drafts that fit around schedules                                |

Primary audience: adults and older teens who follow football and enjoy fantasy/draft formats (similar mental model to fantasy sports or sports card drafting).

---

## Why will they play?

1. **Draft tension** — Limited pool, turn order, and opponent picks create meaningful decisions every round.
2. **Team identity** — Formation choice, player roles, and chemistry make each squad feel unique.
3. **Low friction multiplayer** — Join with a code; no account complexity required early on.
4. **Satisfying simulation** — Watch your drafted team perform in matches you shaped but don't manually control.
5. **Long-term progression** — Leagues, seasons, and rankings give reason to return.

---

## Core Gameplay Loop

```
Create or join lobby
    → Configure draft settings
        → Draft players (turn-based)
            → Assign to formation / starting eleven
                → Chemistry calculated
                    → League matches simulated
                        → Standings updated
                            → New season / rematch
```

Each loop reinforces the previous: better drafting → better teams → better results → higher rank.

---

## Lobby Flow

**Status:** Not implemented (Phase 5)

1. Host creates a private lobby with a shareable code.
2. Host configures: player count, draft type, timer, pool size, formation rules.
3. Participants join with display names; lobby shows occupancy and settings.
4. Host starts when minimum players joined; lobby transitions to draft room.
5. Disconnect/reconnect handled via Redis-backed session state (future).

**Design principles:** Simple join UX, clear settings preview, no game rules in the transport layer.

---

## Draft Flow

**Status:** Not implemented (Phase 6)

1. Draft room opens from lobby with fixed participant order (snake or linear).
2. Shared player pool displayed; picked players removed from pool.
3. Active picker selects one player within timer; pick recorded and broadcast.
4. Auto-pick on timeout (future: best available by rating).
5. Draft completes when all rosters reach configured size.
6. Each participant's picks assigned to their team aggregate.

**Design principles:** Turn integrity, idempotent picks, auditable pick history, real-time updates without coupling domain to WebSocket.

---

## Team Building Flow

**Status:** Partial (teams, formations, players exist; chemistry not calculated)

1. Player selects formation (e.g., 4-3-3) for their team.
2. Drafted players assigned to starting eleven slots per formation rules.
3. Bench/reserves (future) held outside starting eleven.
4. Team overall and chemistry scores computed by engines (future).
5. Team locked before match day (future league rule).

**Current state:** Team aggregate, formation templates, and starting eleven slots exist. Chemistry and team overall are `null` placeholders.

---

## Chemistry Flow

**Status:** Not implemented (Phase 7)

1. Chemistry engine reads starting eleven: nations, leagues, clubs, positions.
2. Rules produce a score (0–100) with explainable factors (e.g., same nation links, role coverage).
3. Score affects simulation modifiers — never hidden magic numbers.
4. UI shows breakdown so players can optimize lineups.

**Design principles:** Deterministic, seedable, unit-tested rules in domain/application — not in UI or Prisma.

---

## Match Simulation Flow

**Status:** Not implemented (Phase 8)

1. Two teams submitted: formation, starting eleven, chemistry, ratings.
2. Match engine runs with injected random source (seeded for replay).
3. Engine produces scoreline, key events, and player contributions (explainable).
4. Result persisted to league standings.
5. Same seed + inputs → same result (reproducibility requirement).

**Design principles:** No real-time user input during match; simulation is a domain service with `RandomPort`.

---

## League Flow

**Status:** Skeleton only (Phase 9)

1. League created with N teams and season schedule.
2. Round-robin or fixture generator produces match pairings.
3. Each fixture runs through match simulation.
4. Points, goal difference, and rankings updated.
5. Season ends; champion declared; optional promotion/relegation (future).

---

## Long-Term Progression

| Layer              | Progression                                           |
| ------------------ | ----------------------------------------------------- |
| **Account**        | Stats, history, achievements (future)                 |
| **Collection**     | Player card expansion, special editions (Phase 2–4)   |
| **Ranked leagues** | Skill-based matchmaking into competitive seasons      |
| **Meta**           | Formations, chemistry knowledge, draft meta evolution |

Progression rewards **knowledge and drafting skill**, not pay-to-win mechanics (monetization TBD, not in current scope).

---

## Mobile Vision

**Status:** Phase 10 — not started

- Native or React Native client consuming same REST/WebSocket API
- Optimized for: lobby join, draft picks, lineup view, match results
- No duplicate business logic on mobile — API contracts from `shared-types`
- Push notifications for draft turn (future)

---

## Non-Goals

These are **explicitly out of scope** unless the product direction changes via ADR:

| Non-Goal                                | Rationale                                           |
| --------------------------------------- | --------------------------------------------------- |
| Real-time gameplay                      | Product is draft + simulation, not e-sports control |
| FIFA-style control mechanics            | No manual passing, shooting, or player switching    |
| Complex 3D rendering                    | UI focuses on cards, tables, and match summaries    |
| Pay-to-win card packs                   | Not designed in current phases                      |
| Cross-platform sync with external games | Standalone product                                  |
| Blockchain / NFT players                | Not part of vision                                  |

---

## Technical Vision (supports product vision)

- **Domain-first:** Game rules survive framework changes
- **Multi-agent safe:** AI constitution and workflow prevent drift
- **Testable simulation:** Every engine reproducible in CI
- **Modular monolith:** Add phases without rewriting core

See also: `future-roadmap.md`, `game-domain-overview.md`, `ai-constitution.md`.
