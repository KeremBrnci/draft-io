# Architecture Audit Report

**Date:** 2026-06-09  
**Scope:** Full monorepo (`apps/`, `packages/`, `docs/`, CI/CD)  
**Purpose:** Pre-feature validation of Clean Architecture, SOLID, modular monolith structure, testing, shared packages, and documentation.

---

## Executive Summary

The repository is a **well-documented architecture foundation** with one fully implemented reference module (`players`) and seven placeholder modules. The **domain layer is clean** — no NestJS, Prisma, or infrastructure imports. Layer separation is mostly correct, but several **moderate violations** exist in the application and presentation layers. Testing covers core player domain logic but falls short of documented coverage targets. **No event infrastructure** exists yet. Shared packages are correctly constrained but underutilized.

**Overall grade:** B+ foundation — suitable to build on, with known issues to address before scaling feature development.

---

## 1. Architectural Violations

### 1.1 Application Layer Coupled to NestJS (Moderate)

**Rule violated:** Application layer should be framework-agnostic per `docs/standards/architecture-rules.md`.

| File | Issue |
|------|-------|
| `apps/backend/src/modules/players/application/use-cases/create-player.use-case.ts` | `@Injectable`, `@Inject` from `@nestjs/common` |
| `apps/backend/src/modules/players/application/use-cases/get-player.use-case.ts` | `@Injectable`, `@Inject` from `@nestjs/common` |

Use cases are not portable or testable without NestJS DI metadata. Plain classes with constructor injection wired in `players.module.ts` would satisfy Clean Architecture.

### 1.2 Presentation Layer Imports Domain Entities (Moderate)

**Rule violated:** Presentation → Application only; domain mapping should not require entity imports.

| File | Issue |
|------|-------|
| `apps/backend/src/modules/players/presentation/dto/player-response.dto.ts` | Imports `Player` entity from domain layer |

`PlayerResponseDto.fromDomain(player: Player)` couples the DTO to the aggregate internals. Mapping belongs in an application output type, assembler, or presentation mapper fed by primitives/DTOs from use cases.

### 1.3 Shared Error Mapper Knows Module-Specific Codes (Low–Moderate)

| File | Issue |
|------|-------|
| `apps/backend/src/common/filters/domain-error-http.mapper.ts` | Hardcodes `PLAYER_NOT_FOUND`, `INVALID_PLAYER_ID`, etc. |

As modules grow, this central file becomes a cross-context coupling point. Per-module mappers or a registry pattern would preserve module boundaries.

### 1.4 DI Token Defined in Domain Port File (Minor)

| File | Issue |
|------|-------|
| `apps/backend/src/modules/players/domain/repositories/player.repository.port.ts` | Exports `PLAYER_REPOSITORY = Symbol(...)` |

The repository **interface** belongs in domain; the NestJS DI token is a composition-root concern and should live in `players.module.ts` or `application/tokens.ts`.

### 1.5 Duplicated Business Rules Across Layers (Low)

| Location | Duplication |
|----------|-------------|
| `domain/value-objects/player-position.vo.ts` | `VALID_POSITIONS` (10 positions) |
| `presentation/dto/create-player.dto.ts` | `VALID_POSITIONS` (same 10 positions) |

HTTP validation and domain validation can drift. Presentation DTOs should defer to domain invariants or import a single shared constant from a non-domain contract package — not duplicate lists.

### 1.6 Hybrid Infrastructure Layout (Informational, Not a Violation)

Infrastructure exists at two levels:

- **App-level:** `src/infrastructure/` (Prisma, Redis, config)
- **Module-level:** `src/modules/players/infrastructure/` (repository, mapper)

This is intentional and documented, but teams must be consistent when adding modules.

### 1.7 What Is Clean (No Violations Found)

| Check | Result |
|-------|--------|
| Domain imports `@nestjs/*` | None |
| Domain imports `@prisma/*` | None |
| Domain imports infrastructure | None |
| Application imports infrastructure | None |
| Domain imports `shared-types` | None |
| Domain imports `shared-utils` | None |

---

## 2. Circular Dependency Risks

### 2.1 Current State: No Active Cycles

ESLint `import/no-cycle` is enabled. Manual review of the `players` module dependency graph shows an acyclic flow:

```
presentation → application → domain ← infrastructure
```

### 2.2 Future Risks

| Risk | Scenario | Mitigation |
|------|----------|------------|
| **Cross-module domain imports** | `teams` imports `Player` entity from `players` | Reference `PlayerId` only; never import foreign aggregates |
| **Central error mapper growth** | All modules register codes in `domain-error-http.mapper.ts` | Per-module HTTP mappers |
| **Shared kernel bloat** | `common/domain` accumulates game logic | Keep shared kernel minimal; game concepts belong in feature modules |
| **Bidirectional module deps** | `draft` ↔ `lobbies` importing each other's application layers | Communicate via domain events or application service interfaces |
| **shared-types ↔ domain drift** | API types diverge from domain VOs | `shared-types` for API contracts only; domain owns invariants |

### 2.3 Missing Enforcement

No `import/no-restricted-paths` ESLint rule enforces layer boundaries programmatically. Violations are caught only by convention and code review.

---

## 3. Over-Engineering Risks

### 3.1 Appropriate for Long-Term Goals

| Pattern | Assessment |
|---------|------------|
| Four-layer modules | Justified for complex game domains (draft, simulation, chemistry) |
| Repository ports | Justified for testability and Prisma swap |
| Value objects for IDs/ratings | Justified for invariant enforcement |
| ADRs and standards docs | Justified for team onboarding |

### 3.2 Potential Over-Engineering

| Item | Risk | Recommendation |
|------|------|----------------|
| **Redis wired globally, unused** | Premature infrastructure | Keep for documented pub/sub plan; don't add abstractions until lobbies ship |
| **`Result<T,E>` in common + shared-types** | Two result types, neither used in backend domain flow | Consolidate or remove unused one |
| **`@draft-io/shared-utils` declared but unused** | Dependency noise | Use when needed; avoid importing "just because" |
| **7 placeholder modules in `AppModule`** | Empty modules add bootstrap cost | Acceptable as roadmap markers |
| **Vitest SWC + separate e2e/integration configs** | Complexity for 10 unit tests | Justified as CI scales |
| **Coverage thresholds in vitest.config** | Defined but not enforced in CI | Either enforce or document as aspirational |

### 3.3 Under-Engineering (Opposite Risk)

| Gap | Risk |
|-----|------|
| No domain events | Cross-module workflows will resort to direct imports |
| No API versioning strategy beyond `/api/v1` prefix | Breaking changes uncontrolled |
| No OpenAPI / contract tests | Frontend/backend drift |

---

## 4. Missing Documentation

### 4.1 Present and Complete

| Document | Status |
|----------|--------|
| `docs/standards/architecture-rules.md` | Complete |
| `docs/standards/coding-standards.md` | Complete |
| `docs/standards/typescript-guidelines.md` | Complete |
| `docs/standards/testing-strategy.md` | Complete (aspirational coverage) |
| `docs/standards/folder-structure.md` | Complete |
| `docs/standards/naming-conventions.md` | Complete |
| `docs/standards/git-workflow.md` | Complete |
| `docs/decisions/001–005` (ADRs) | Complete |
| `docs/architecture/overview.md` | Complete |
| `apps/backend/src/modules/README.md` | Complete |

### 4.2 Missing or Incomplete

| Document | Gap |
|----------|-----|
| **Game design docs** | No `docs/game-design/` — rules for players, formations, chemistry, draft, simulation undefined |
| **Game domain overview** | No cross-module interaction map for game concepts |
| **Future roadmap** | No phased delivery plan |
| **API reference** | No OpenAPI/Swagger spec |
| **Environment variable reference** | Only `.env.example` files |
| **Deployment runbook** | No production deployment guide |
| **Contributor onboarding** | Root README only; no `CONTRIBUTING.md` |
| **docs index** | No `docs/README.md` navigation hub |
| **Redis usage guide** | ADR exists; no implementation patterns doc |
| **Event-driven patterns** | Not documented (does not exist yet) |
| **Aggregate boundary guide** | DDD aggregate rules not documented for game entities |

### 4.3 Documentation vs Reality Mismatches

| Doc Claim | Reality |
|-----------|---------|
| Testing strategy: coverage enforced in CI | CI runs tests but **no coverage gate** |
| Testing strategy: domain 95%+, application 90%+ | Thresholds in vitest config but **not run in CI** |
| `folder-structure.md`: frontend `components/`, `features/` | **Not created** (marked future) |
| ADR 004: Redis pub/sub for lobbies | **Redis client unused** in feature code |

---

## 5. Missing Test Coverage Areas

### 5.1 Coverage Targets (from `docs/standards/testing-strategy.md`)

| Layer | Target | Current State |
|-------|--------|---------------|
| Domain | 95%+ | Partial — `Player` entity and `OverallRating` tested; `PlayerId`, `PlayerPosition` not tested |
| Application | 90%+ | Partial — 2 of 2 use cases tested (only 2 exist) |
| Overall | 80%+ | **Not measured in CI** |

### 5.2 Untested Backend Code

| Area | Files | Priority |
|------|-------|----------|
| Value objects | `player-id.vo.ts`, `player-position.vo.ts` | High |
| Domain errors | `player.errors.ts` | Medium |
| Mapper | `player.mapper.ts` | High |
| Repository | `prisma-player.repository.ts` | High (integration test exists but skipped without DB) |
| Presentation | `players.controller.ts`, DTOs | Medium |
| Common | `http-exception.filter.ts`, `domain-error-http.mapper.ts`, `logger.service.ts` | Medium |
| Infrastructure | `prisma.service.ts`, `redis.service.ts`, `environment.validation.ts` | Low (integration) |
| Placeholder modules | All 7 stub modules | N/A until implemented |

### 5.3 Test Infrastructure Gaps

| Gap | Detail |
|-----|--------|
| Integration tests not in default `pnpm test` | Must run `test:integration` separately |
| E2E tests mock use cases | Controller wiring tested; not full stack (use case + repository + DB) |
| No frontend Playwright in default CI path for unit | E2E runs in CI but requires dev server |
| No contract tests | API shapes not validated against `shared-types` |
| No architecture boundary tests | Layer violations not automatically detected |

### 5.4 Shared Package Tests

| Package | Tests |
|---------|-------|
| `shared-types` | `paginated-response.test.ts` only |
| `shared-utils` | `clamp.test.ts` only; `assertNever`, `slugify`, `isNonEmptyString` untested |

---

## 6. SOLID Compliance Assessment

| Principle | Status | Notes |
|-----------|--------|-------|
| **Single Responsibility** | Good | Use cases are focused; controller delegates |
| **Open/Closed** | Good | New modules can be added without modifying existing |
| **Liskov Substitution** | Good | `PrismaPlayerRepository` satisfies port interface |
| **Interface Segregation** | Good | `PlayerRepositoryPort` is minimal |
| **Dependency Inversion** | Partial | Port pattern correct, but use cases depend on NestJS decorators |

---

## 7. Modular Monolith Structure Assessment

| Criterion | Status |
|-----------|--------|
| Feature-first organization | Pass |
| Bounded contexts as modules | Pass (7 placeholders + 1 impl) |
| Layer consistency per module | Pass for `players`; N/A for stubs |
| Cross-module communication pattern | **Not established** (no events, no shared interfaces) |
| Shared kernel size | Pass (minimal `common/`) |
| Extraction readiness | Pass (module boundaries documented in ADR 001) |

---

## 8. Shared Package Usage Assessment

| Package | Domain | Application | Infrastructure | Presentation | Frontend |
|---------|--------|-------------|----------------|--------------|----------|
| `shared-types` | Not used (correct) | Not used | Not used | Used (2 files) | Used (1 file) |
| `shared-utils` | Not used | Not used | Not used | Not used | Not used |

**Findings:**

- `shared-types` usage is correct — API boundary only.
- `PlayerPosition` in `shared-types` has 10 positions; domain has matching 10 — will need expansion for full position set.
- `shared-utils` is a declared dependency with zero usage — acceptable for foundation stage.

---

## 9. Testing Setup Assessment

| Component | Status |
|-----------|--------|
| Vitest (unit) | Configured with SWC for NestJS decorator metadata |
| Vitest (integration) | Configured; requires `DATABASE_URL` |
| Vitest (e2e backend) | Configured; mocks use cases |
| Playwright (frontend) | Configured with webServer |
| GitHub Actions CI | lint, typecheck, unit, integration, e2e, build |
| Coverage reporting | Configured locally; **not in CI** |

---

## 10. Recommended Actions (Prioritized)

### Before New Feature Development

1. **Decouple use cases from NestJS** — remove `@Injectable`/`@Inject`; wire in module only.
2. **Move domain-to-DTO mapping out of presentation** — application output types or assemblers.
3. **Add `import/no-restricted-paths`** — enforce layer boundaries in ESLint.
4. **Establish domain event infrastructure** — before `lobbies` and `draft` modules interact.
5. **Create game design documentation** — define rules before implementing logic.

### Before Production

6. Add coverage gate to CI.
7. Add OpenAPI spec generation from DTOs.
8. Per-module domain error HTTP mappers.
9. Deployment and environment documentation.

### Do Not Change Yet (Acceptable for Foundation)

- Redis global wiring (documented future use).
- Placeholder modules in `AppModule`.
- Hybrid infrastructure layout.

---

## 11. Audit Conclusion

The foundation demonstrates **correct architectural intent** with a clean domain layer and a usable reference module. The violations found are **fixable without restructuring** and are typical of NestJS + Clean Architecture hybrids. The largest gaps are **game domain documentation**, **event infrastructure**, **automated boundary enforcement**, and **test coverage breadth**.

This audit did **not** modify any code. Findings should be addressed incrementally alongside the game domain foundation work.
