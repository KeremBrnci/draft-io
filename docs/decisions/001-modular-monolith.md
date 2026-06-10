# ADR 001: Modular Monolith Architecture

## Status

Accepted

## Date

2026-06-09

## Context

draft.io is a football draft and simulation platform that will grow to include lobbies, drafts, match simulation, chemistry engines, leagues, seasons, and player cards. We need an architecture that supports rapid initial development while enabling future scaling without premature complexity.

Options considered:

1. **Microservices** — Independent deployable services per domain
2. **Modular Monolith** — Single deployable with strict module boundaries
3. **Traditional Monolith** — Single codebase without module boundaries

## Decision

We will use a **Modular Monolith** architecture with feature-first modules, each containing Clean Architecture layers.

## Rationale

- **Team size** — Early stage; microservices overhead (network, deployment, observability) is not justified
- **Domain complexity** — Draft, simulation, and chemistry are tightly coupled during a match lifecycle
- **Future extraction** — Clear module boundaries (`auth`, `players`, `draft`, `simulation`) allow extracting services later without rewrite
- **Development velocity** — Single repo, shared types, unified CI, simpler local development
- **Transactional consistency** — Draft picks and roster updates benefit from ACID transactions within a single database

## Consequences

### Positive

- Simple deployment (single artifact)
- Shared database transactions across modules
- Easy refactoring across module boundaries
- Unified testing and CI pipeline
- `@draft-io/shared-types` works seamlessly

### Negative

- All modules scale together (mitigated by horizontal scaling of the monolith)
- Risk of module boundary erosion (mitigated by ESLint `import/no-cycle` and architecture reviews)
- Single point of failure (mitigated by container orchestration and health checks)

## Module Map

| Module       | Responsibility                | Future Extraction Candidate |
| ------------ | ----------------------------- | --------------------------- |
| `auth`       | Authentication, authorization | Low priority                |
| `users`      | User profiles, accounts       | Low priority                |
| `players`    | Player cards, attributes      | Medium                      |
| `formations` | Tactical formations           | Low (coupled to draft)      |
| `lobbies`    | Lobby management, matchmaking | Medium                      |
| `draft`      | Draft room, pick order        | High (real-time heavy)      |
| `matches`    | Match scheduling, results     | Medium                      |
| `simulation` | Match engine, chemistry       | High (CPU intensive)        |
