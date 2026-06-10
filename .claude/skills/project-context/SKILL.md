---
name: project-context
description: >-
  Permanent draft.io project context — vision, current phase, implemented vs
  planned modules, and core principles. Load at the start of every agent session
  before planning or implementing any change.
---

# Project Context

## Purpose

Provide **permanent, authoritative context** so every AI agent — regardless of tool or session — understands what draft.io is, what exists today, and what must not be built without approval.

This skill is the **first skill to load** in any session. It complements `AGENTS.md` and `ai-constitution.md`.

## When to use

- Start of every new agent session
- Before feature planning or implementation
- When unsure if a module is implemented or placeholder
- When evaluating whether a user request is in scope for current phase
- When onboarding to the repository

## Required inputs

None — this skill is self-contained. Optionally cross-check:

- `docs/architecture/project-vision.md` for product detail
- `docs/architecture/future-roadmap.md` for phase deliverables
- `docs/architecture/architecture-hardening-report.md` for latest technical status

## Governance references

| Document               | Path                                       |
| ---------------------- | ------------------------------------------ |
| AI Constitution        | `docs/architecture/ai-constitution.md`     |
| Workflow rule          | `.cursor/rules/workflow.mdc`               |
| Universal instructions | `AGENTS.md`                                |
| AI review checklist    | `docs/architecture/ai-review-checklist.md` |

---

## Project Vision

**draft.io** is a football draft and simulation game.

Players will:

1. Create **private lobbies** and share join codes
2. **Join** with friends and configure draft settings
3. Select **formations** for their team
4. **Draft** football players from a shared pool (turn-based)
5. **Build teams** — assign players to starting eleven slots
6. Generate **chemistry** from player combinations
7. **Simulate** league matches between drafted squads
8. **Compete** for rankings across seasons

This is strategy and simulation — **not** real-time kick-by-kick control.

Full vision: `docs/architecture/project-vision.md`

---

## Current Phase

**Phase 1: Foundation** — Players, teams, formations, positions, nations, leagues (skeleton)

### Implemented

| Module        | What exists                                        |
| ------------- | -------------------------------------------------- |
| `positions`   | 15 position codes, `Position` VO, list API         |
| `players`     | Aggregate, CRUD use cases, Prisma repo, unit tests |
| `formations`  | 5 templates, in-memory repo, list/get API          |
| `teams`       | Aggregate, starting eleven VO, list API (skeleton) |
| `nations`     | Skeleton aggregate, list API                       |
| `leagues`     | Skeleton aggregate, list API                       |
| `core/events` | `DomainEvent`, `EventBus` abstractions (no impl)   |

### Placeholder (empty modules — do not implement without approval)

| Module          | Phase    |
| --------------- | -------- |
| `lobbies`       | Phase 5  |
| `draft`         | Phase 6  |
| `matches`       | Phase 8  |
| `simulation`    | Phase 8  |
| `auth`, `users` | Phase 2+ |

### Not implemented

- Lobby creation and join flow
- Draft room and pick logic
- Chemistry engine
- Rating engine (beyond basic overall on player card)
- Match simulation
- Seasons and league fixtures
- WebSocket / real-time
- Mobile app

---

## Future Roadmap

| Phase        | Focus                                                        |
| ------------ | ------------------------------------------------------------ |
| **Phase 1**  | Players, formations, positions, team foundations _(current)_ |
| **Phase 2**  | Player database expansion, card sub-stats                    |
| **Phase 3**  | Rating engine                                                |
| **Phase 4**  | Card system                                                  |
| **Phase 5**  | Lobby                                                        |
| **Phase 6**  | Draft                                                        |
| **Phase 7**  | Chemistry                                                    |
| **Phase 8**  | Match simulation                                             |
| **Phase 9**  | Leagues and seasons                                          |
| **Phase 10** | Mobile app                                                   |

Detail: `docs/architecture/future-roadmap.md`

---

## Core Principles

| Principle                     | Meaning                                                 |
| ----------------------------- | ------------------------------------------------------- |
| **Domain First**              | Game rules in domain/application; never in UI or Prisma |
| **Architecture First**        | Clean Architecture layers enforced by CI                |
| **Testability First**         | Domain rules unit-tested; coverage gates in CI          |
| **Deterministic Simulation**  | Seeded, reproducible engines (when built)               |
| **Long-Term Maintainability** | Multi-year, multi-agent codebase via AI constitution    |

---

## Technical Stack

| Layer       | Technology                                           |
| ----------- | ---------------------------------------------------- |
| Backend     | NestJS modular monolith, TypeScript                  |
| Frontend    | Next.js 15 App Router, TypeScript                    |
| Database    | PostgreSQL + Prisma (infrastructure only)            |
| Cache       | Redis (future: lobby/draft)                          |
| Monorepo    | pnpm workspaces                                      |
| Testing     | Vitest (unit/integration/e2e), Playwright (frontend) |
| Enforcement | dependency-cruiser, ESLint layer rules               |

Reference module: `apps/backend/src/modules/players/`

---

## Architecture Summary

```
Presentation → Application → Domain
Infrastructure → Domain
```

- Use cases: plain classes, wired via `provideUseCase()`
- Controllers: DTOs only, mappers in presentation
- Repositories: ports in domain, Prisma in infrastructure

Run `pnpm architecture:check` after structural changes.

---

## Rules

1. **Load this skill first** every session
2. **Read `ai-constitution.md`** before structural work
3. **Follow `workflow.mdc`** — plan before implement
4. **Do not implement** lobby, draft, simulation, chemistry unless explicitly requested and approved
5. **Use `feature-planning` skill** for any medium/large feature
6. **Return DTOs** from controllers — never domain entities
7. **English only** for all identifiers

---

## Examples

### Good session start

```
1. Load project-context skill
2. User asks: "Add nation filter to player list"
3. Agent confirms nations module is skeleton, plans application-layer filter
4. Small change — abbreviated workflow, still tests + architecture check
```

### Bad session start

```
1. User asks: "Build the draft room"
2. Agent immediately creates WebSocket gateway and 20 files
3. Violates phase, workflow, and constitution
```

---

## Checklist

- [ ] Vision and current phase understood
- [ ] Know which modules are implemented vs placeholder
- [ ] `ai-constitution.md` and `AGENTS.md` referenced
- [ ] `workflow.mdc` will be followed for this task
- [ ] Major features will not be implemented without plan + approval

---

## Anti-patterns

- Assuming lobby/draft/simulation exist because folders exist
- Building Phase 5+ features during Phase 1 tasks
- Ignoring governance docs because "the user said build it" (still plan first)
- Treating placeholder modules as ready for game logic
- Skipping `project-context` on "small" tasks that touch game rules
