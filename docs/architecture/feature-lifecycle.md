# Feature Lifecycle

**Authority:** Implements the Mandatory Development Lifecycle in [`ai-constitution.md`](./ai-constitution.md).  
**Workflow:** Enforced by [`.cursor/rules/workflow.mdc`](../../.cursor/rules/workflow.mdc).

## Overview

Every feature follows this lifecycle to maintain architecture quality.

```
1. Idea → 2. Planning → 3. Domain Design → 4. Architecture Review
  → 5. Implementation → 6. Testing → 7. Code Review
  → 8. Documentation → 9. Release
```

## 1. Idea

- Capture in issue tracker with problem statement
- Identify affected modules
- Classify size: small / medium / large

## 2. Planning

Use **feature-planning** skill. Produce:

- Domain impact analysis
- Data model impact
- API impact
- Frontend impact
- Testing plan
- Documentation plan
- Risks and alternatives

**Gate:** No implementation for medium/large features without planning doc.

## 3. Domain Design

Use **domain-modeling** skill. Produce:

- Entities and value objects
- Aggregate boundaries
- Repository contracts
- Domain errors
- Invariants and business rules

**Gate:** Game rules documented in `docs/game-design/` before implementation.

## 4. Architecture Review

Use **architecture** skill. Verify:

- Layer placement correct
- No forbidden dependencies
- Module boundaries respected
- No over-engineering

**Gate:** `pnpm architecture:check` must pass before merge.

## 5. Implementation

- Follow `backend.mdc` / `frontend.mdc` rules
- Use cases as plain classes (no NestJS in application)
- Mappers in presentation layer
- Prisma only in infrastructure

## 6. Testing

Use **testing** skill:

- Unit tests for domain/application (required)
- Integration tests for repositories (when persistence changes)
- E2E tests for new API endpoints

**Gate:** `pnpm test:coverage` meets thresholds.

## 7. Code Review

Use **code-review** skill. Check:

- Architecture, SOLID, naming, tests, security, docs

Findings grouped: Critical / Major / Minor

## 8. Documentation

- Update module README
- Create ADR for architectural decisions
- Update `docs/game-design/` for game rule changes
- Update API types in `@draft-io/shared-types`

## 9. Release

- CI green (lint, typecheck, tests, coverage, architecture)
- Changelog entry
- Deploy via standard pipeline

## Phase Mapping

| Roadmap Phase | Lifecycle emphasis |
|---------------|-------------------|
| Phase 1 (Players) | Domain design + testing |
| Phase 2 (Lobby) | Architecture review + real-time patterns |
| Phase 3 (Draft) | Game design + event infrastructure |
| Phase 4 (Chemistry) | Domain modeling + simulation-engine skill |
| Phase 5 (Simulation) | Determinism + seeded testing |
| Phase 6 (Leagues) | Data model + persistence |
| Phase 7 (Mobile) | API contracts + feature-planning |
