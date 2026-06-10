---
name: architecture
description: >-
  Enforces draft.io Clean Architecture and modular monolith boundaries across
  NestJS backend and Next.js frontend. Use when designing features, reviewing
  layer dependencies, planning module interactions, or resolving architectural
  questions about bounded contexts, aggregates, and cross-module communication.
---

# Architecture

## Governance

Mandatory before structural changes. Subordinate to `docs/architecture/ai-constitution.md` (priority 2 rule: `architecture.mdc`).

| Document                     | Path                                      |
| ---------------------------- | ----------------------------------------- |
| AI Constitution              | `docs/architecture/ai-constitution.md`    |
| Workflow                     | `.cursor/rules/workflow.mdc`              |
| Universal instructions       | `AGENTS.md`                               |
| Project context (load first) | `.claude/skills/project-context/SKILL.md` |

## Purpose

Guide architectural decisions for **draft.io** — a football draft and simulation platform built as a **modular monolith** with **Clean Architecture** on the backend (NestJS) and a thin Next.js frontend. This skill ensures layer boundaries, bounded-context isolation, and alignment with the phased roadmap in `docs/architecture/`.

## When to use

- Designing a new feature that spans multiple modules (e.g., draft → teams → players)
- Evaluating whether code belongs in domain, application, infrastructure, or presentation
- Reviewing import graphs or dependency-cruiser violations
- Deciding how modules communicate (IDs vs entities, events vs direct calls)
- Planning real-time features (Socket.IO, Redis) without breaking layer rules
- Onboarding to the repo structure (`apps/backend`, `apps/frontend`, `packages/`)

## Required inputs

Before making architectural recommendations, gather:

1. **Feature scope** — Which bounded context(s) are involved? (players, teams, draft, simulation, etc.)
2. **Phase alignment** — Which roadmap phase in `docs/architecture/future-roadmap.md`?
3. **Data ownership** — Which aggregate root owns the consistency boundary?
4. **Cross-module needs** — Read-only lookup, write orchestration, or event notification?
5. **Persistence strategy** — Prisma per-module tables, in-memory templates, or Redis ephemeral state?

## Rules

### Monorepo layout

```
draft.io/
├── apps/backend/          # NestJS modular monolith
├── apps/frontend/         # Next.js 15 App Router
├── packages/
│   ├── shared-types/      # API contracts (frontend ↔ backend)
│   └── shared-utils/      # Pure utilities (no framework deps)
└── docs/architecture/     # Authoritative design docs
```

### Backend layer rules (enforced by `.dependency-cruiser.cjs`)

| Layer              | May depend on                                 | Must NOT depend on                                        |
| ------------------ | --------------------------------------------- | --------------------------------------------------------- |
| **domain**         | Other domain VOs (sparingly), `common/domain` | application, infrastructure, presentation, NestJS, Prisma |
| **application**    | domain, `common/`                             | infrastructure, presentation, NestJS, Prisma              |
| **infrastructure** | domain, application ports, Prisma             | presentation                                              |
| **presentation**   | application use cases, DTOs                   | infrastructure (except `*.module.ts` wiring)              |

Run `pnpm architecture:check` after structural changes.

### Bounded contexts (modules)

Each module under `apps/backend/src/modules/{name}/` is a bounded context:

- **Implemented:** `players`, `teams`, `formations`, `positions`, `nations`, `leagues`
- **Planned:** `auth`, `users`, `lobbies`, `draft`, `matches`, `simulation`

Reference implementation: `players/`. Module template: `apps/backend/src/modules/README.md`.

### Cross-module communication

**Allowed:**

- Reference other aggregates **by ID only** (`playerIds: string[]`, `formationCode: string`)
- Application-layer orchestration validates cross-module references (e.g., verify player exists before team assignment)
- Domain events via `src/core/events/` (`DomainEvent`, `EventBus`) for notifications
- Export use cases or repository tokens from module `exports` for composition in other modules

**Forbidden:**

- Importing another module's **entity** into your domain layer
- Cross-module Prisma joins or shared database views
- Business logic in controllers or DTOs
- Circular module dependencies

### Frontend architecture

- **Server Components by default**; client components only for interactivity
- API access through `apps/frontend/src/lib/api/` — never import backend internals
- Shared HTTP contracts live in `@draft-io/shared-types`
- No domain logic in the frontend; validation is UX-level only

### Event infrastructure

- In-process `EventBus` initially; Redis pub/sub when Socket.IO scales across instances
- Events name past-tense facts: `DraftPickMade`, `DraftCompleted`, `MatchCompleted`
- Event handlers live in the **application** layer of the consuming module

## Examples

### Example 1: Assigning a drafted player to a team

```
Draft module (application)
  → validates pick is legal (draft aggregate)
  → calls TeamsModule's AssignPlayerToSlotUseCase with { teamId, playerId, slot }
Teams module (application)
  → loads Team aggregate by ID
  → validates slot position against Formation template (by formationCode)
  → persists via TeamRepository
  → publishes TeamRosterUpdated event
```

Draft never imports `Team` entity. Teams never imports `Draft` entity.

### Example 2: Match simulation inputs

```
Matches module schedules fixture
  → loads teamIdA, teamIdB
Simulation module receives SimulateMatchCommand
  → application layer fetches Team + Player data via use case exports (by ID)
  → passes plain input DTO to simulation engine (domain service)
  → returns MatchResult value object
```

Simulation engine stays framework-free; orchestration stays in application.

### Example 3: Fixing a dependency-cruiser violation

**Violation:** `application/use-cases/create-team.use-case.ts` imports `PrismaTeamRepository`

**Fix:** Inject `TeamRepository` port (interface in domain); bind `PrismaTeamRepository` only in `teams.module.ts`.

## Checklist

- [ ] Feature maps to a single owning bounded context (or explicit orchestrator)
- [ ] Aggregate boundary identified; invariants enforced in domain entities
- [ ] Cross-module references use IDs, not entity imports
- [ ] No NestJS or Prisma in domain/application layers
- [ ] Repository interfaces in domain; implementations in infrastructure
- [ ] Use cases are plain classes wired via `provideUseCase()`
- [ ] HTTP mapping stays in presentation (controllers, DTOs, response mappers)
- [ ] Domain errors use convention-based HTTP mapping (`mapDomainErrorToHttpStatus`)
- [ ] `pnpm architecture:check` passes
- [ ] Frontend uses `@draft-io/shared-types` for API contracts
- [ ] Roadmap phase documented if feature is multi-phase

## Anti-patterns

| Anti-pattern                                  | Why it's wrong                       | Correct approach                                     |
| --------------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| Shared `entities/` folder across modules      | Breaks bounded contexts              | One `domain/entities/` per module                    |
| Fat controllers with business rules           | Untestable, violates layers          | Thin controller → use case → domain                  |
| Prisma client in use cases                    | Couples application to ORM           | Repository port + infrastructure adapter             |
| `@Injectable()` on use cases                  | Couples application to NestJS        | `provideUseCase()` factory                           |
| Direct Prisma joins across modules            | Hidden coupling, shared schema leaks | Application-level ID resolution                      |
| Importing `Team` into `draft/domain`          | Cross-context entity coupling        | Pass `teamId` string                                 |
| Microservice extraction prematurely           | Operational complexity               | Modular monolith until scale demands split           |
| Putting simulation math in controllers        | Wrong layer                          | Domain service or value objects                      |
| Frontend duplicating backend validation rules | Drift risk                           | Backend is source of truth; frontend mirrors UX only |
| Skipping `architecture:check` in CI           | Regressions slip through             | Fix violations before merge                          |
