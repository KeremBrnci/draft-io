---
name: testing
description: >-
  Writes and organizes tests for draft.io using Vitest (unit, integration, e2e)
  and Playwright (frontend e2e). Use when adding tests, choosing test layers,
  mocking repositories, or debugging CI test failures.
---

# Testing

## Governance

Use during lifecycle Steps 6 and 9. Subordinate to `ai-constitution.md` and `ai-review-checklist.md`.

| Document | Path |
|----------|------|
| AI Constitution | `docs/architecture/ai-constitution.md` |
| Workflow | `.cursor/rules/workflow.mdc` |
| Universal instructions | `AGENTS.md` |
| Project context | `.claude/skills/project-context/SKILL.md` |
| AI review checklist | `docs/architecture/ai-review-checklist.md` |

## Purpose

Establish consistent testing strategy across the draft.io monorepo: fast unit tests at the domain/application core, integration tests at persistence boundaries, HTTP e2e tests for API contracts, and Playwright for frontend user flows.

## When to use

- Adding tests for new use cases, entities, or value objects
- Writing repository integration tests against a real/test database
- Creating HTTP e2e tests for NestJS endpoints
- Adding Playwright specs for frontend flows
- Deciding what to mock vs test with real dependencies
- Fixing CI failures in `.github/workflows/ci.yml`

## Required inputs

1. **Layer under test** — domain VO, entity, use case, repository, controller, UI?
2. **Dependencies** — What must be real vs mocked?
3. **Test config** — Which vitest config applies? (unit / integration / e2e)
4. **Assertions** — Behavior, HTTP status, domain invariants, or user-visible outcome?

## Rules

### Test pyramid for draft.io

```
        ┌─────────────┐
        │ Playwright  │  Few — critical user journeys
        │ (frontend)  │
        ├─────────────┤
        │ HTTP e2e    │  API contract smoke tests
        │ (backend)   │
        ├─────────────┤
        │ Integration │  Repository + Prisma (test DB)
        ├─────────────┤
        │ Unit        │  Domain, VOs, use cases (mocked ports)
        └─────────────┘  Many — fast, isolated
```

### File naming and location

| Layer | Pattern | Location |
|-------|---------|----------|
| Unit | `*.unit.test.ts` | Colocated with source |
| Integration | `*.integration.test.ts` | `apps/backend/test/integration/` |
| Backend e2e | `*.e2e.test.ts` | `apps/backend/test/e2e/` |
| Frontend unit | `*.test.ts` | Colocated in `apps/frontend/src/` |
| Frontend e2e | `*.spec.ts` | Playwright test directory |

### Backend Vitest configs

- `vitest.unit.config.ts` — domain, application, VOs, mappers
- `vitest.integration.config.ts` — Prisma repositories against test database
- `vitest.e2e.config.ts` — full NestJS app HTTP requests

```bash
pnpm --filter @draft-io/backend test:unit
pnpm --filter @draft-io/backend test:integration
pnpm --filter @draft-io/backend test:e2e
```

Root: `pnpm test` runs unit + backend e2e; `pnpm test:e2e` includes frontend Playwright.

### Unit test rules

- **Domain entities/VOs:** test invariants, factory methods, mutation rules — no mocks
- **Use cases:** mock repository ports; verify interactions and return values
- **No database, no HTTP** in unit tests
- **No NestJS TestingModule** for use case unit tests — instantiate directly:

```typescript
const repo: PlayerRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  // ...
};
const useCase = new CreatePlayerUseCase(repo);
```

### Integration test rules

- Use test database (env `DATABASE_URL` for test)
- Test repository implementations: save → find roundtrip
- Clean up data between tests (transactions or truncate)
- Do not test business logic here — that's unit test territory

### Backend e2e rules

- Boot NestJS application (or use supertest against running app)
- Test HTTP status codes, response body shape, validation errors
- Minimal scenarios per endpoint (happy path + key error cases)
- Use realistic payloads matching DTO validation rules

### Frontend testing

- **Vitest:** API client, formatters, pure component logic
- **Playwright:** `pnpm --filter @draft-io/frontend test:e2e`
- Prefer `getByRole` selectors for accessibility
- Mock API at network level or use test backend fixture

### What to test where

| Concern | Layer |
|---------|-------|
| `OverallRating.create(150)` throws | Unit (VO) |
| `Player.updatePosition` updates timestamp | Unit (entity) |
| `CreatePlayerUseCase` saves new player | Unit (use case, mock repo) |
| `PrismaPlayerRepository.findById` returns entity | Integration |
| `POST /players` returns 201 | E2e |
| Player list renders on page | Playwright |

### CI expectations

All of these must pass before merge:

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:integration   # when DB available in CI
pnpm test:e2e
pnpm architecture:check
```

## Examples

### Example 1: Value object unit test

```typescript
describe('OverallRating', () => {
  it('rejects ratings below 1', () => {
    expect(() => OverallRating.create(0)).toThrow();
  });

  it('accepts valid rating', () => {
    const rating = OverallRating.create(87);
    expect(rating.value).toBe(87);
  });
});
```

### Example 2: Use case unit test

```typescript
describe('CreatePlayerUseCase', () => {
  it('persists a new player', async () => {
    const repo = { save: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreatePlayerUseCase(repo as unknown as PlayerRepository);

    const result = await useCase.execute({
      name: 'Test Player',
      position: 'ST',
      overallRating: 85,
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.name.value).toBe('Test Player');
  });
});
```

### Example 3: E2e API test

```typescript
describe('POST /players', () => {
  it('creates player and returns 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/players')
      .send({ name: 'E2E Player', position: 'CM', overallRating: 80 })
      .expect(201);

    expect(res.body.displayName).toBe('E2E Player');
  });

  it('returns 400 for invalid position', async () => {
    await request(app.getHttpServer())
      .post('/players')
      .send({ name: 'Bad', position: 'XX', overallRating: 80 })
      .expect(400);
  });
});
```

## Checklist

- [ ] Test file uses correct suffix (`.unit.test.ts`, `.integration.test.ts`, `.e2e.test.ts`)
- [ ] Unit tests have no external I/O
- [ ] Use case tests mock ports, not Prisma
- [ ] Domain tests cover invalid inputs and boundary values
- [ ] Integration tests clean up database state
- [ ] E2e tests cover success and primary error paths
- [ ] Tests are deterministic (no `Date.now()` without mocking)
- [ ] No testing implementation details (private methods) unless critical
- [ ] Test names describe behavior: `'rejects duplicate slot assignment'`
- [ ] CI scripts pass locally before push

## Anti-patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Testing use cases through HTTP | Unit test use case directly |
| Real database in unit tests | Mock repository port |
| Snapshot testing entire API responses | Assert specific fields |
| `setTimeout` in tests without fake timers | `vi.useFakeTimers()` |
| Shared mutable test state across files | Isolated setup/teardown per test |
| Skipping error path tests | Test `*_NOT_FOUND`, `INVALID_*` cases |
| Playwright testing every pixel | Critical paths only |
| 100% coverage on mappers/DTOs | Focus on domain and use cases |
| Flaky e2e from race conditions | `await expect(locator).toBeVisible()` |
| Testing Prisma schema in unit tests | Integration layer only |
