---
name: feature-planning
description: >-
  Plans draft.io features across roadmap phases — scope, modules, dependencies,
  API contracts, and incremental delivery. Use when scoping new features,
  writing implementation plans, breaking work into PRs, or aligning with the
  phased roadmap.
---

# Feature Planning

## Governance

Mandatory before major features (lifecycle Steps 1–5). Supreme workflow authority: `workflow.mdc`.

| Document                     | Path                                      |
| ---------------------------- | ----------------------------------------- |
| AI Constitution              | `docs/architecture/ai-constitution.md`    |
| Workflow                     | `.cursor/rules/workflow.mdc`              |
| Universal instructions       | `AGENTS.md`                               |
| Project context (load first) | `.claude/skills/project-context/SKILL.md` |
| Feature lifecycle            | `docs/architecture/feature-lifecycle.md`  |

## Purpose

Structure feature delivery for **draft.io** across roadmap phases, bounded contexts, and incremental PRs. Plans connect game design intent to implementable backend/frontend tasks while respecting Clean Architecture and the modular monolith.

## When to use

- Starting a new feature (lobby, draft room, chemistry, simulation UI)
- Breaking large work into reviewable PRs
- Identifying cross-module dependencies before coding
- Writing implementation plans or Linear issues
- Assessing whether a request fits the current roadmap phase
- Resolving "what should we build first?" questions

## Required inputs

1. **Feature description** — User-facing outcome in one sentence
2. **Roadmap phase** — From `docs/architecture/future-roadmap.md`
3. **Affected modules** — Backend bounded contexts + frontend areas
4. **Dependencies** — Prerequisite features, infra (Redis, Socket.IO)
5. **Success criteria** — Measurable done definition
6. **Open design questions** — From `docs/game-design/` if unresolved

## Rules

### Roadmap phases (summary)

| Phase | Focus                | Key modules                    |
| ----- | -------------------- | ------------------------------ |
| 1     | Players + Formations | positions, players, formations |
| 2     | Lobby                | lobbies, auth, users           |
| 3     | Draft                | draft, lobbies, teams          |
| 4     | Chemistry            | teams, simulation (calculator) |
| 5     | Simulation + Matches | simulation, matches            |
| 6     | Leagues/seasons      | leagues, matches               |

**Do not skip phases.** If a feature needs draft but lobby doesn't exist, plan lobby first or scope a vertical slice with stubs.

### Planning workflow

```
1. Clarify user story and acceptance criteria
2. Map to roadmap phase and game design docs
3. Identify owning bounded context(s)
4. List domain concepts (entities, VOs, events)
5. Define API contracts (REST + WebSocket events)
6. Split into incremental deliverables
7. Order by dependency (domain → API → UI)
8. Estimate test strategy per slice
9. Document open questions and assumptions
```

### Feature plan template

```markdown
# Feature: [Name]

## User story

As a [role], I want [action] so that [outcome].

## Phase

Phase N — [name]

## Design references

- docs/game-design/[relevant].md
- docs/architecture/game-domain-overview.md

## Modules affected

- Backend: [modules]
- Frontend: [pages/components]

## Domain model (new/changed)

- Entity: ...
- Value objects: ...
- Events: ...
- Invariants: ...

## API contract

| Method | Path    | Description       |
| ------ | ------- | ----------------- |
| POST   | /drafts | Create draft room |

## WebSocket events (if real-time)

- `draft:pick-made` — payload shape
- `draft:completed`

## Dependencies

- [ ] Lobby module functional
- [ ] Redis for ephemeral state

## Delivery slices

### Slice 1: Domain core (no HTTP)

- DraftRoom entity, pick logic, unit tests

### Slice 2: API

- Create draft, make pick endpoints, e2e tests

### Slice 3: Real-time

- Socket.IO gateway, event publishing

### Slice 4: Frontend

- Draft board UI, Playwright e2e

## Success criteria

- [ ] User can complete a 2-player snake draft
- [ ] Picks reflected in team starting eleven
- [ ] architecture:check passes

## Open questions

1. Auto-pick behavior on timer expiry?
2. ...

## Assumptions

- Snake draft as default order type
```

### Slicing principles

- **Slice 1 always domain** — entities, VOs, unit tests, no NestJS
- **Each slice mergeable** — CI green after every PR
- **Vertical slices when possible** — one endpoint + minimal UI beats all-backend-then-all-frontend
- **Stub external deps** — in-memory lobby for draft development if lobby lags
- **Max ~400 lines per PR** when practical — use `split-to-prs` for large work

### Cross-cutting concerns checklist

| Concern       | Plan explicitly                          |
| ------------- | ---------------------------------------- |
| Auth          | Who can perform action?                  |
| Real-time     | Socket.IO events + Redis state           |
| Idempotency   | Draft picks, match simulation            |
| Migrations    | Prisma schema changes                    |
| Shared types  | `@draft-io/shared-types` updates         |
| Events        | Domain events for cross-module reactions |
| Feature flags | If partial rollout needed                |

### API-first contracts

Define request/response shapes before implementation:

1. Add types to `@draft-io/shared-types`
2. Backend DTOs mirror shared types
3. Frontend consumes shared types
4. E2e tests validate contract

### Infrastructure dependencies

| Feature          | Infrastructure            |
| ---------------- | ------------------------- |
| Lobby state      | Redis                     |
| Draft real-time  | Socket.IO + Redis pub/sub |
| Match simulation | None (in-process)         |
| Auth (future)    | JWT, session store        |

Plan infra setup as explicit slice zero if not yet operational.

## Examples

### Example 1: Plan "Make draft pick" (Phase 3)

**Slices:**

1. `DraftRoom` entity with `makePick()`, pool management, unit tests
2. `MakeDraftPickUseCase`, repository, `POST /drafts/:id/picks`
3. `DraftPickMade` event → teams module assigns player
4. Socket.IO broadcast pick to room
5. Frontend pick button + board update

**Blockers:** Lobby must provide `draftRoomId` and participant list.

### Example 2: Deferring chemistry UI (Phase 4)

Phase 3 draft UI shows player overall only. Chemistry preview is Phase 4 slice — plan the hook (`PreviewChemistryQuery`) as interface in Phase 3 but implement in Phase 4 to avoid scope creep.

### Example 3: Phase gate rejection

**Request:** "Add match simulation highlights reel"

**Response:** Simulation instant resolution is Phase 5. Highlights require event timeline — depends on simulation event model. Defer to Phase 5b after basic score resolution ships.

## Checklist

- [ ] Feature mapped to roadmap phase
- [ ] Game design doc exists or created before implementation
- [ ] Owning bounded context identified
- [ ] Cross-module deps listed with ID-only references
- [ ] API contract drafted in shared-types
- [ ] Work split into mergeable slices
- [ ] Each slice has test plan
- [ ] Open questions documented with assumptions
- [ ] Infra requirements identified (Redis, Socket.IO)
- [ ] Success criteria are testable
- [ ] Out-of-scope items explicitly listed
- [ ] No parallel work on conflicting schema migrations

## Anti-patterns

| Anti-pattern                          | Correct approach                 |
| ------------------------------------- | -------------------------------- |
| Big-bang PR for entire draft system   | Slice by domain → API → UI       |
| Starting UI before API contract       | shared-types first               |
| Building simulation before draft      | Follow phase order               |
| Ignoring open design questions        | Resolve or document assumption   |
| No success criteria                   | Testable acceptance checklist    |
| Mixing auth + draft + sim in one plan | Separate features per phase      |
| Planning microservices                | Modular monolith modules         |
| Skipping domain slice                 | Entities before controllers      |
| Frontend-only draft state             | Backend authoritative + WS sync  |
| Underestimating real-time complexity  | Explicit Socket.IO + Redis slice |
