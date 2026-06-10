# AI Review Checklist

**Purpose:** Mandatory pre-merge verification for all AI-generated and AI-assisted code.  
**Authority:** Subordinate to `ai-constitution.md`; implements Step 7 (Code Review) of the development lifecycle.  
**Used with:** `code-review` skill, `pnpm` verification commands

---

## How to Use

1. Complete implementation and tests.
2. Run verification commands (see bottom).
3. Walk every section below; mark pass/fail.
4. Group failures by severity: **Critical**, **Major**, **Minor**.
5. **Critical** and **Major** items block merge. **Minor** items should be fixed or explicitly deferred with rationale.

---

## 1. Architecture

| # | Check | Pass |
|---|-------|------|
| A1 | Code lives in correct layer (`domain/`, `application/`, `infrastructure/`, `presentation/`) | ☐ |
| A2 | No NestJS imports in domain or application layers | ☐ |
| A3 | No Prisma imports in domain or application layers | ☐ |
| A4 | Application does not import infrastructure or presentation | ☐ |
| A5 | Domain does not import application, infrastructure, or presentation | ☐ |
| A6 | Presentation does not import infrastructure (except `*.module.ts` wiring) | ☐ |
| A7 | `pnpm architecture:check` passes | ☐ |
| A8 | No new circular dependencies between modules | ☐ |
| A9 | Cross-module references use IDs, not embedded entities | ☐ |
| A10 | New module follows four-layer structure (reference: `players/`) | ☐ |

**Critical if:** A2–A6 violated. **Major if:** A7–A10 failed.

---

## 2. Domain Boundaries

| # | Check | Pass |
|---|-------|------|
| D1 | Game rules live in domain/application only | ☐ |
| D2 | Controllers return DTOs — no domain entities in responses | ☐ |
| D3 | Presentation mappers translate entity → DTO | ☐ |
| D4 | Repository implementations contain no business logic | ☐ |
| D5 | DTOs do not encode game rules (validation format only) | ☐ |
| D6 | Domain errors are framework-agnostic | ☐ |
| D7 | Error mapping uses convention-based HTTP mapper, not per-module hacks | ☐ |
| D8 | Value objects enforce invariants at creation | ☐ |
| D9 | Aggregates protect consistency boundaries | ☐ |
| D10 | Simulation/randomness abstracted behind ports (if applicable) | ☐ |

**Critical if:** D1, D2, D4, D10 violated. **Major if:** D3, D5–D9 failed.

---

## 3. Testing

| # | Check | Pass |
|---|-------|------|
| T1 | New domain rules have unit tests | ☐ |
| T2 | New use cases have unit tests with mocked ports | ☐ |
| T3 | Tests assert behavior, not implementation details | ☐ |
| T4 | No snapshot-only tests for domain logic | ☐ |
| T5 | `pnpm test:unit` passes | ☐ |
| T6 | `pnpm test:coverage` meets thresholds (domain 90%, app 85%, overall 80%) | ☐ |
| T7 | Integration tests added for new Prisma repositories (if applicable) | ☐ |
| T8 | E2E tests for new API endpoints (if applicable) | ☐ |
| T9 | Simulation tests use fixed seeds (if applicable) | ☐ |
| T10 | Tests do not depend on execution order or wall-clock time | ☐ |

**Critical if:** T1–T2 missing for new business logic. **Major if:** T5–T6 failed.

---

## 4. Naming

| # | Check | Pass |
|---|-------|------|
| N1 | English only — no Turkish identifiers | ☐ |
| N2 | Classes/entities/VOs: PascalCase | ☐ |
| N3 | Methods/variables: camelCase | ☐ |
| N4 | Folders: kebab-case | ☐ |
| N5 | Use case names: `{Verb}{Noun}UseCase` | ☐ |
| N6 | Repository ports: `{Entity}Repository` | ☐ |
| N7 | DTOs: `{Action}{Entity}Dto` / `{Entity}ResponseDto` | ☐ |
| N8 | No ambiguous abbreviations (`mgr`, `tmp`, `data`) | ☐ |

**Major if:** N1 violated. **Minor if:** N2–N8 inconsistent.

---

## 5. Documentation

| # | Check | Pass |
|---|-------|------|
| DOC1 | Module README updated if public API changed | ☐ |
| DOC2 | Game-design doc updated if game rules changed | ☐ |
| DOC3 | ADR created for significant architectural decisions | ☐ |
| DOC4 | Implementation status honest ("Not implemented" vs "Implemented") | ☐ |
| DOC5 | New env vars documented in README or `.env.example` | ☐ |
| DOC6 | `shared-types` changes reflected in API contract docs | ☐ |

**Major if:** DOC2, DOC4 missing for game rule changes. **Minor if:** DOC1, DOC3, DOC5, DOC6.

---

## 6. Security

| # | Check | Pass |
|---|-------|------|
| S1 | No secrets, API keys, or credentials in code | ☐ |
| S2 | External input validated at presentation boundary (class-validator) | ☐ |
| S3 | No SQL injection vectors (Prisma parameterized queries only) | ☐ |
| S4 | Auth checks on protected endpoints (when auth exists) | ☐ |
| S5 | No sensitive data in logs or error messages | ☐ |
| S6 | Rate limiting considered for public endpoints (future) | ☐ |
| S7 | WebSocket events validated when implemented | ☐ |

**Critical if:** S1, S3 violated. **Major if:** S2, S5 failed on user-facing endpoints.

---

## 7. Performance

| # | Check | Pass |
|---|-------|------|
| P1 | No N+1 queries in repository methods | ☐ |
| P2 | List endpoints paginated or bounded (when data grows) | ☐ |
| P3 | No unbounded in-memory collections for production paths | ☐ |
| P4 | Heavy computation in domain services, not controllers | ☐ |
| P5 | Redis/cache used for ephemeral state (lobby/draft future) | ☐ |

**Major if:** P1, P3 on hot paths. **Minor:** P2, P4, P5 for new features.

---

## 8. Future Extensibility

| # | Check | Pass |
|---|-------|------|
| E1 | New code uses ports/interfaces for external dependencies | ☐ |
| E2 | Feature can be extended without modifying unrelated modules | ☐ |
| E3 | Event hooks considered for cross-module notifications | ☐ |
| E4 | No hardcoded magic numbers for game rules (use constants/domain) | ☐ |
| E5 | API versioning respected (`/api/v1/`) | ☐ |
| E6 | Change does not block roadmap phases (lobby, draft, simulation) | ☐ |

**Major if:** E1, E2 violated for new modules. **Minor:** E3–E6.

---

## 9. Workflow Compliance

| # | Check | Pass |
|---|-------|------|
| W1 | Feature was planned before implementation (major features) | ☐ |
| W2 | User approval obtained for major features | ☐ |
| W3 | Scope limited to requested change — no drive-by refactors | ☐ |
| W4 | Unrequested gameplay (lobby/draft/sim) not implemented | ☐ |
| W5 | Governance docs consulted (`ai-constitution.md`, `AGENTS.md`) | ☐ |

**Critical if:** W4 violated. **Major if:** W1–W2 failed for major features.

---

## Verification Commands

```bash
pnpm lint
pnpm typecheck
pnpm architecture:check
pnpm test:unit
pnpm test:coverage
pnpm --filter @draft-io/backend test:e2e
```

---

## Severity Summary Template

Use this format in review output:

```markdown
## Critical (must fix before merge)
- [ ] ...

## Major (must fix before merge)
- [ ] ...

## Minor (fix or defer with rationale)
- [ ] ...

## Passed
- Architecture check, unit tests, ...
```

---

## Related Documents

- `docs/architecture/ai-constitution.md`
- `.cursor/rules/code-review.mdc`
- `.claude/skills/code-review/SKILL.md`
- `AGENTS.md`
