# ADR 002: Clean Architecture with DDD

## Status

Accepted

## Date

2026-06-09

## Context

The platform will contain complex business rules: draft order algorithms, chemistry calculations, match simulation physics, and league season management. We need an architecture that isolates business logic from infrastructure concerns and enables high testability.

## Decision

Each feature module will follow **Clean Architecture** with four layers, incorporating **Domain-Driven Design** concepts where appropriate:

```
Presentation → Application → Domain ← Infrastructure
```

### Layer Responsibilities

| Layer | Contains | Dependencies |
|-------|----------|-------------|
| **Domain** | Entities, Value Objects, Domain Errors, Repository Ports | None (pure TypeScript) |
| **Application** | Use Cases, Commands, Queries | Domain only |
| **Infrastructure** | Repositories, Mappers, External APIs | Domain (implements ports) |
| **Presentation** | Controllers, DTOs, Validation | Application, Domain (mapping) |

## Rationale

- **Testability** — Domain logic testable without database or HTTP (95%+ coverage target)
- **Maintainability** — Business rules live in one place, not scattered across controllers and services
- **Flexibility** — Swap Prisma for another ORM without touching domain
- **Team onboarding** — Consistent structure across all modules reduces cognitive load
- **DDD fit** — Player cards, draft picks, and match events are natural aggregate roots

## DDD Concepts Applied

| Concept | Application in draft.io |
|---------|------------------------|
| **Entities** | `Player`, `DraftRoom`, `Match` (future) |
| **Value Objects** | `PlayerId`, `OverallRating`, `PlayerPosition` |
| **Aggregates** | `Player` (root), `Draft` (root, future) |
| **Repositories** | Port interfaces in domain, Prisma adapters in infrastructure |
| **Domain Events** | Planned for cross-module communication (future) |
| **Bounded Contexts** | Each feature module is a bounded context |

## DDD Concepts Deferred

- **Event Sourcing** — Not needed initially; PostgreSQL is sufficient
- **CQRS** — Simple command/query separation without separate read models
- **Saga Pattern** — Will evaluate when cross-module workflows grow

## Consequences

### Positive

- Business logic is framework-agnostic and portable
- High test coverage achievable in domain/application layers
- Clear onboarding path for new developers
- Supports future mobile clients via stable API contracts

### Negative

- More files and boilerplate per feature
- Mapping between layers adds overhead (mitigated by dedicated Mapper classes)
- Learning curve for developers unfamiliar with Clean Architecture

## Enforcement

- ESLint `import/no-cycle` rule
- Architecture rules documented in `docs/standards/architecture-rules.md`
- PR checklist includes dependency rule verification
- Code reviews focus on layer placement
