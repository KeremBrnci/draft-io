# Testing Strategy

## Philosophy

Tests are a first-class architectural concern. They validate behavior, document intent, and enable safe refactoring.

## Test Pyramid

```
        ╱ E2E ╲          Few, slow, high confidence
       ╱─────────╲
      ╱ Integration ╲    Medium count, DB/external deps
     ╱───────────────╲
    ╱    Unit Tests    ╲  Many, fast, isolated
   ╱─────────────────────╲
```

## Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| Domain (entities, VOs) | **95%+** | Pure logic, easy to test, highest value |
| Application (use cases) | **90%+** | Business orchestration, mock ports |
| Infrastructure | **70%+** | Integration tests cover critical paths |
| Presentation | **60%+** | E2E tests cover HTTP layer |
| **Overall** | **80%+** | Enforced in CI with thresholds |

## Test Types

### Unit Tests

**What:** Domain entities, value objects, use cases

**Where:** Co-located with source (`*.unit.test.ts`)

**Rules:**
- No database, network, or filesystem
- Mock all ports/interfaces
- Test invariants, edge cases, and error paths

**Example — Value Object:**

```typescript
// overall-rating.vo.unit.test.ts
describe('OverallRating', () => {
  it('rejects ratings above maximum', () => {
    expect(() => OverallRating.create(100)).toThrow(InvalidOverallRatingError);
  });
});
```

**Example — Use Case:**

```typescript
// get-player.use-case.unit.test.ts
describe('GetPlayerUseCase', () => {
  it('throws when player is not found', async () => {
    const repository = { findById: vi.fn().mockResolvedValue(null), save: vi.fn() };
    const useCase = new GetPlayerUseCase(repository);
    await expect(useCase.execute({ playerId: '...' })).rejects.toThrow(PlayerNotFoundError);
  });
});
```

### Integration Tests

**What:** Repositories, database interactions, Redis operations

**Where:** `apps/backend/test/integration/`

**Rules:**
- Require running PostgreSQL (via Docker Compose)
- Clean up test data in `afterAll`/`afterEach`
- Skip when `DATABASE_URL` is not set
- Use a dedicated test database

**Example:**

```typescript
describe.skipIf(!process.env['DATABASE_URL'])('PrismaPlayerRepository', () => {
  it('persists and retrieves a player', async () => { ... });
});
```

### E2E Tests

**What:** API endpoints, full request/response cycle

**Where:**
- Backend: `apps/backend/test/e2e/`
- Frontend: `apps/frontend/e2e/` (Playwright)

**Rules:**
- Backend E2E uses `@nestjs/testing` with module overrides
- Frontend E2E uses Playwright against running dev server
- Test happy paths and validation errors

**Example — Backend E2E:**

```typescript
it('POST /api/v1/players creates a player', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/players')
    .send({ displayName: 'Test', position: 'ST', overallRating: 88 })
    .expect(201);
  expect(response.body.data.displayName).toBe('Test');
});
```

**Example — Frontend E2E:**

```typescript
test('home page displays platform title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'draft.io' })).toBeVisible();
});
```

## Running Tests

```bash
# All unit tests
pnpm test

# Backend unit only
pnpm --filter @draft-io/backend test:unit

# Backend integration (requires DB)
DATABASE_URL=postgresql://draft_io:draft_io@localhost:5432/draft_io_test \
  pnpm test:integration

# Backend E2E
pnpm --filter @draft-io/backend vitest run --project e2e

# Frontend E2E (Playwright)
pnpm test:e2e
```

## Test Naming

```
describe('<ClassName>', () => {
  it('<does something specific when condition>', () => { ... });
});
```

Examples:
- `'creates a valid player'`
- `'rejects ratings above maximum'`
- `'throws when player is not found'`

## Mocking Guidelines

1. Mock at port boundaries, not internal methods
2. Use `vi.fn()` with explicit return types
3. Verify interactions with `toHaveBeenCalledWith`
4. Never mock the class under test

## CI Integration

| Job | Tests Run | Services Required |
|-----|-----------|-------------------|
| `unit-tests` | All `*.unit.test.ts` | None |
| `integration-tests` | `test/integration/**` | PostgreSQL |
| `e2e-tests` | Backend E2E + Playwright | PostgreSQL (backend), dev server (frontend) |

## What NOT to Test

- Framework internals (NestJS DI, Next.js routing)
- Third-party library behavior
- Trivial getters with no logic
- Generated Prisma client methods
