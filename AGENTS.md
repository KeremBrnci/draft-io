# AGENTS.md — Universal AI Instructions

**Project:** draft.io  
**Type:** Football Draft & Simulation Game  
**Audience:** Claude, Cursor, Gemini, Copilot, OpenCode, and all future AI coding agents

---

## Start Here

Before writing or modifying code, read these documents **in order**:

1. [`docs/architecture/ai-constitution.md`](docs/architecture/ai-constitution.md) — Supreme authority
2. [`.cursor/rules/workflow.mdc`](.cursor/rules/workflow.mdc) — Mandatory process
3. [`.claude/skills/project-context/SKILL.md`](.claude/skills/project-context/SKILL.md) — Current phase and vision
4. [`docs/architecture/project-vision.md`](docs/architecture/project-vision.md) — Product context

---

## Project Type

**Football Draft & Simulation Game** — a multiplayer platform where players:

- Create and join private lobbies
- Draft football players from a shared pool
- Build teams with formations and starting elevens
- Generate team chemistry from player combinations
- Simulate league matches and compete for rankings

This is **not** a real-time action football game. It is a **strategy, drafting, and simulation** experience.

---

## Architecture

| Principle          | Implementation                                                     |
| ------------------ | ------------------------------------------------------------------ |
| Clean Architecture | Domain → Application → Infrastructure / Presentation               |
| Modular Monolith   | Feature modules under `apps/backend/src/modules/`                  |
| SOLID              | Single responsibility per use case; dependency inversion via ports |
| Repository Pattern | Domain defines ports; Prisma implements in infrastructure          |
| Use Case Pattern   | Plain TypeScript classes; no NestJS in application layer           |
| API Contracts      | `@draft-io/shared-types` shared between frontend and backend       |

### Layer dependency direction (inward only)

```
Presentation → Application → Domain
Infrastructure → Domain (+ Application ports)
```

**Forbidden:** Domain → anything outer. Application → Infrastructure.

Run `pnpm architecture:check` after structural changes.

---

## Development Rules

### Always

| Action                                | Reference                                     |
| ------------------------------------- | --------------------------------------------- |
| Plan first                            | `workflow.mdc`, `feature-planning` skill      |
| Review architecture                   | `architecture.mdc`, `architecture` skill      |
| Model domain                          | `domain-modeling` skill, `game-domain.mdc`    |
| Generate tests                        | `testing.mdc`, `testing` skill                |
| Review code before done               | `code-review` skill, `ai-review-checklist.md` |
| Return DTOs from controllers          | Presentation mappers only                     |
| Keep game rules in domain/application | Never in controllers, repos, or UI            |

### Never

| Action                             | Why                          |
| ---------------------------------- | ---------------------------- |
| Skip planning for major features   | Causes architecture drift    |
| Leak domain entities to API        | Breaks presentation boundary |
| Break architecture boundaries      | CI fails; long-term debt     |
| Put business logic in controllers  | Transport layer only         |
| Put business logic in repositories | Persistence layer only       |
| Use hidden randomness              | Simulation must be seedable  |
| Implement unrequested gameplay     | Scope control                |
| Use Turkish or mixed naming        | `naming.mdc` violation       |

---

## Mandatory Workflow

Every feature follows the lifecycle in `ai-constitution.md`:

```
Planning → Domain Analysis → Architecture Review → Approval
  → Implementation → Testing → Code Review → Documentation → Release
```

**Major features** (lobby, draft, simulation, chemistry, leagues, seasons, mobile) require explicit approval before implementation.

---

## Domain Ownership

Game rules and business logic live in **domain** and **application** layers only.

| Domain           | Owner Module             | Status                   |
| ---------------- | ------------------------ | ------------------------ |
| Players          | `players`                | Implemented (foundation) |
| Teams            | `teams`                  | Implemented (skeleton)   |
| Formations       | `formations`             | Implemented (in-memory)  |
| Positions        | `positions`              | Implemented (vocabulary) |
| Nations          | `nations`                | Skeleton                 |
| Leagues          | `leagues`                | Skeleton                 |
| Draft            | `draft`                  | Not implemented          |
| Lobby            | `lobbies`                | Not implemented          |
| Chemistry        | domain services (future) | Not implemented          |
| Match Simulation | `simulation`, `matches`  | Not implemented          |
| Seasons          | `leagues` (future)       | Not implemented          |

Controllers, DTOs, Prisma repositories, and React components **must not** contain game rules.

---

## Simulation Rules

All simulation logic (match engine, chemistry, rating, draft order) must be:

| Property      | Requirement                                  |
| ------------- | -------------------------------------------- |
| Deterministic | Same inputs + seed → same outputs            |
| Reproducible  | Tests can replay scenarios                   |
| Seedable      | `RandomPort` or equivalent injected          |
| Testable      | Unit tests without network or DB             |
| Explainable   | Rating and chemistry calculations documented |

No `Math.random()` in services. No unseeded randomness in tests.

See `simulation-engine.mdc` and `simulation-engine` skill.

---

## Repository Layout

```
draft.io/
├── AGENTS.md                    ← You are here
├── apps/
│   ├── backend/                 # NestJS modular monolith
│   └── frontend/                # Next.js 15 App Router
├── packages/
│   ├── shared-types/            # API contracts
│   └── shared-utils/            # Pure utilities only
├── docs/
│   ├── architecture/            # System design, AI governance
│   ├── game-design/             # Game rules (source of truth for mechanics)
│   └── decisions/               # ADRs
├── .cursor/rules/               # Cursor agent rules
└── .claude/skills/              # Claude agent skills
```

Reference module: `apps/backend/src/modules/players/`

---

## Verification Commands

Run before declaring work complete:

```bash
pnpm lint
pnpm typecheck
pnpm architecture:check
pnpm test:unit
pnpm test:coverage
pnpm --filter @draft-io/backend test:e2e
```

---

## Skills Quick Reference

| When               | Skill                    |
| ------------------ | ------------------------ |
| Session start      | `project-context`        |
| New feature        | `feature-planning`       |
| Structure change   | `architecture`           |
| New entities/rules | `domain-modeling`        |
| Backend code       | `backend`, `nest-module` |
| Frontend code      | `frontend`               |
| Tests              | `testing`                |
| Game mechanics     | `game-design`            |
| Simulation         | `simulation-engine`      |
| Pre-merge          | `code-review`            |

---

## Rule Priority

When rules conflict, higher priority wins. Full list in `ai-constitution.md`:

1. `ai-constitution.md`
2. `architecture.mdc`
3. `game-domain.mdc`
4. `workflow.mdc`
5. `backend.mdc` / `frontend.mdc`
6. `testing.mdc`
7. `naming.mdc`

---

## Non-Goals (Do Not Build Unless Explicitly Requested)

- Real-time player-controlled match gameplay
- FIFA-style control mechanics
- Complex 3D rendering
- Mobile native app (Phase 10+)
- Lobby, draft, simulation (until approved and planned)

---

## Questions?

If requirements are ambiguous: **ask before implementing**.  
If a change spans multiple modules: **plan before coding**.  
If it affects game rules: **update game-design docs first**.
