# Architecture Hardening Report

**Date:** 2026-06-09  
**Scope:** Architecture correctness, AI development standards, enforcement tooling

---

## Issues Fixed

### 1. NestJS Removed from Application Layer

- All 10 use cases converted to **plain classes** with constructor injection
- NestJS wiring moved to `provideUseCase()` factory in `*.module.ts`
- ESLint `no-restricted-imports` blocks `@nestjs/*` in application layer
- dependency-cruiser rule `no-application-nestjs` added

### 2. Domain Entity Leakage Prevented

- Created **presentation mappers** for all modules (players, formations, positions, teams, nations, leagues)
- Controllers return DTO shapes / `ApiResponse` only — never raw entities
- DTOs no longer import domain entities

### 3. Centralized Error Mapping Generalized

- Replaced per-module error code map with **convention-based mapping**:
  - `*_NOT_FOUND` → 404
  - `INVALID_*` → 400
  - `UNAUTHORIZED_*` → 401, `FORBIDDEN_*` → 403, `CONFLICT_*` → 409
  - default → 422
- Added unit tests for mapper

### 4. Result Types Consolidated

- **Backend canonical:** `apps/backend/src/common/domain/result.ts` (`ok`/`err`, `ok`/`value`)
- **API contract:** `packages/shared-types` → `ApiOperationResult` (`success`/`data`)
- Documented in `docs/standards/result-pattern.md`

### 5. Shared Utils Policy

- Documented allowed/forbidden usage in `docs/standards/shared-utils-policy.md`
- Package retained with curated pure utilities

### 6. Architecture Enforcement

- Added `.dependency-cruiser.cjs` with layer and circular dependency rules
- Extended ESLint with per-layer `no-restricted-imports`
- Added `pnpm architecture:check` script
- CI `architecture` job added

### 7. Test Coverage Gates

- Vitest thresholds: domain 90%, application 85%, overall 80%
- Coverage scoped to implemented modules (players, positions, formations, teams)
- Repository interface files excluded from coverage (type-only contracts)
- Added `pnpm test:coverage` script (backend)
- CI `coverage` job added
- New unit tests: `PlayerId`, `PlayerName`, `OverallRating`, `Position`, `Formation`, `StartingEleven`, use cases, error mapper

### 9. dependency-cruiser TypeScript Config

- Added root `tsconfig.depcruise.json` for correct path resolution when running from monorepo root
- `pnpm architecture:check` passes (129 modules, 341 dependencies)

### 10. Module READMEs

- Added README.md for players, formations, positions, teams, nations, leagues

### 8. AI Development Standards

- 11 Cursor rules in `.cursor/rules/`
- 10 Claude skills in `.claude/skills/`
- `docs/architecture/ai-development-standards.md`
- `docs/architecture/feature-lifecycle.md`

### 11. AI Governance Layer (2026-06-09)

- `docs/architecture/ai-constitution.md` — supreme rulebook, skill precedence, forbidden behaviors
- `.cursor/rules/workflow.mdc` — mandatory 10-step process (`alwaysApply: true`)
- `AGENTS.md` — universal instructions for all AI tools
- `.claude/skills/project-context/SKILL.md` — permanent vision and phase context
- `docs/architecture/project-vision.md` — product vision and gameplay flows
- `docs/architecture/ai-review-checklist.md` — pre-merge verification
- All Cursor rules and Claude skills updated with governance references

---

## Issues Intentionally Deferred

| Issue | Reason |
|-------|--------|
| Cross-module domain imports (`players` → `positions`) | Shared vocabulary; extract to kernel in Phase 1 completion |
| Adopting `Result<T,E>` in use cases | Throw-based pattern works; migrate incrementally |
| `shared-utils` runtime usage | Package ready; utilities imported when needed |
| OpenAPI generation | Separate task |
| Nations/leagues domain unit tests | Skeleton modules; tests added when rules finalize |
| Presentation → domain in mappers | Accepted: mappers are the translation boundary |

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cross-module domain imports not caught by depcruise | Medium | Documented exception; future shared kernel |
| Coverage scope excludes skeleton modules (nations, leagues) | Low | Expand include list when modules mature |
| dependency-cruiser requires root tsconfig.depcruise.json | Low | Documented; verified in CI |
| E2E tests mock use cases (not full stack) | Low | Add integration tests for critical paths |
| No EventBus implementation yet | Low | Phase 3 prerequisite |

---

## Next Recommended Steps

1. **Phase 1 completion** — Persist teams, nations, leagues in Prisma
2. **Extract Position vocabulary** — Shared kernel to remove cross-module domain imports
3. **Implement in-process EventBus** — Before lobby/draft work
4. **OpenAPI spec** — Generate from DTOs for frontend/mobile contracts
5. **Nations/leagues tests** — Add domain tests when persistence rules are finalized

---

## Verification Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm architecture:check
pnpm test:unit
pnpm test:coverage
pnpm --filter @draft-io/backend test:e2e
```
