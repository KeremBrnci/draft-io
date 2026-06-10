---
name: code-review
description: >-
  Reviews draft.io pull requests for Clean Architecture compliance, game design
  alignment, test coverage, and security. Use when reviewing PRs, auditing
  changes, or providing structured feedback before merge.
---

# Code Review

## Governance

Mandatory before merge (lifecycle Step 7). Pair with `docs/architecture/ai-review-checklist.md`.

| Document | Path |
|----------|------|
| AI Constitution | `docs/architecture/ai-constitution.md` |
| Workflow | `.cursor/rules/workflow.mdc` |
| Universal instructions | `AGENTS.md` |
| Project context | `.claude/skills/project-context/SKILL.md` |
| AI review checklist | `docs/architecture/ai-review-checklist.md` |

## Purpose

Provide structured, consistent code review for **draft.io** changes — enforcing Clean Architecture boundaries, game design fidelity, testing standards, and production-grade quality before merge.

## When to use

- Reviewing pull requests or local diffs
- Auditing a module for architectural drift
- Pre-merge checklist before requesting review
- Investigating whether a change is too large or crosses too many boundaries
- Validating that implementation matches design docs

## Required inputs

1. **Diff scope** — Files changed, modules affected
2. **Intent** — Feature, bugfix, refactor, or chore?
3. **Roadmap phase** — Does change belong in current phase?
4. **Test evidence** — Unit/integration/e2e coverage added?
5. **Architecture check** — `pnpm architecture:check` result

## Rules

### Review priority order

1. **Correctness** — Does it work? Edge cases? Race conditions in draft/sim?
2. **Architecture** — Layer violations, cross-module entity imports
3. **Domain fidelity** — Game rules match `docs/game-design/`
4. **Security** — Input validation, auth boundaries (when applicable)
5. **Tests** — Appropriate layer, meaningful assertions
6. **Maintainability** — Naming, file size, clarity
7. **Performance** — Only when hot path (simulation, draft real-time)

### Severity labels

Use consistent feedback severity:

- **Critical** — Must fix before merge (bugs, security, layer violations, missing tests for core logic)
- **Suggestion** — Should consider (naming, minor refactor, additional test case)
- **Nit** — Optional (formatting, comment style)

### Architecture review points

- [ ] No domain/application imports of NestJS or Prisma
- [ ] No presentation → infrastructure imports (except `*.module.ts`)
- [ ] Cross-module references use IDs, not foreign entities
- [ ] Use cases wired with `provideUseCase()`, not `@Injectable()`
- [ ] Repository ports in domain; implementations in infrastructure
- [ ] Controllers are thin — delegate to use cases
- [ ] Domain errors use convention codes for HTTP mapping
- [ ] `pnpm architecture:check` passes

### Backend review points

- [ ] Value objects validate on `create()`
- [ ] Entities use `create()` / `reconstitute()` factories
- [ ] DTOs have class-validator decorators
- [ ] Response mappers separate domain from HTTP
- [ ] No business logic in repositories
- [ ] Module `exports` minimal and intentional

### Frontend review points

- [ ] No imports from `apps/backend`
- [ ] API types from `@draft-io/shared-types`
- [ ] Server Components by default
- [ ] Error and loading states handled
- [ ] No duplicated backend validation as source of truth

### Game design review points

- [ ] Formation slot rules enforced in domain
- [ ] Position codes from vocabulary module
- [ ] Rating bounds respected (1–99)
- [ ] Draft atomicity (pick + pool removal)
- [ ] Phase-appropriate scope (no simulation in Phase 1 PR)

### Testing review points

- [ ] Domain invariants have unit tests
- [ ] Use cases tested with mocked ports
- [ ] New endpoints have e2e tests
- [ ] Tests are deterministic
- [ ] No testing implementation trivia

### Security review points (when auth exists)

- [ ] Authorization on mutating endpoints
- [ ] User can only modify own teams/draft picks
- [ ] Input sanitization via DTO validation
- [ ] No secrets in code or logs

## Examples

### Example 1: Critical — layer violation

**Finding:** `create-team.use-case.ts` imports `PrismaTeamRepository`

**Feedback:**
> **Critical:** Application layer must depend on `TeamRepository` port, not Prisma implementation. Inject the interface token from domain; bind implementation in `teams.module.ts` only.

### Example 2: Suggestion — missing invariant test

**Finding:** `Team.assignPlayerToSlot` added without tests

**Feedback:**
> **Suggestion:** Add unit tests for duplicate player rejection and invalid slot index. These invariants are core to roster management.

### Example 3: Critical — cross-module entity import

**Finding:** `draft/domain/entities/draft-room.entity.ts` imports `Player` entity

**Feedback:**
> **Critical:** Draft domain must reference players by `PlayerId` only. Load player details in `MakeDraftPickUseCase` application layer.

### Example 4: Review summary template

```markdown
## Summary
Adds draft pick use case with pool management.

## Critical
- [ ] Fix presentation → infrastructure import in draft.controller.ts

## Suggestions
- Consider extracting pick timer logic to value object
- Add e2e test for concurrent pick rejection

## Verified
- [x] architecture:check passes
- [x] Unit tests for DraftRoom.makePick
- [x] Aligns with docs/game-design/draft-system.md
```

## Checklist

Reviewer completes before approving:

- [ ] Understands the change intent and scope
- [ ] No critical architecture violations
- [ ] Domain rules match game design docs
- [ ] Tests cover new behavior and error paths
- [ ] No scope creep unrelated to PR title
- [ ] CI would pass (typecheck, lint, test, architecture)
- [ ] No secrets or env files committed
- [ ] Migration files reviewed if schema changed
- [ ] Breaking API changes noted and shared-types updated
- [ ] PR size reasonable or split recommended

Author completes before requesting review:

- [ ] Self-review diff
- [ ] `pnpm typecheck && pnpm lint && pnpm test:unit`
- [ ] `pnpm architecture:check`
- [ ] Tests added for new logic
- [ ] Design doc updated if behavior changed

## Anti-patterns

| Anti-pattern | Review response |
|--------------|-----------------|
| "LGTM" on 2000-line PR | Request split per `split-to-prs` skill |
| Style-only review ignoring layers | Prioritize architecture first |
| Approving without tests | Block merge for untested domain logic |
| Nitpicking while missing layer violation | Focus critical issues first |
| Requesting rewrite to different pattern | Suggest only if violates project conventions |
| Ignoring game design doc drift | Flag behavior not in design docs |
| Approving `any` types in domain | Require proper VOs/types |
| Skipping migration review | Check schema matches entity model |
| Frontend approving backend-only PR without arch check | Run architecture:check |
| Debating formatting | Prettier handles it — focus on logic |
