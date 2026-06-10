# AI Constitution

**Status:** Authoritative  
**Scope:** All AI agents contributing to draft.io  
**Last updated:** 2026-06-09

---

## Purpose

This document is the **highest-level rulebook** for draft.io. It binds every AI assistant — Cursor, Claude, Gemini, Copilot, OpenCode, and future tools — to a single development discipline.

The project will be maintained for multiple years by multiple agents. Without a constitution, architecture drifts, game rules leak into infrastructure, and agents implement features without planning. This document prevents that.

**Every agent must read this file before making structural or feature changes.**

---

## Rule Priority

When instructions conflict, **higher priority wins**.

| Priority | Document                               | Role                                                           |
| -------- | -------------------------------------- | -------------------------------------------------------------- |
| 1        | `docs/architecture/ai-constitution.md` | Supreme authority — workflows, precedence, forbidden behaviors |
| 2        | `.cursor/rules/architecture.mdc`       | Clean Architecture, layer boundaries, modular monolith         |
| 3        | `.cursor/rules/game-domain.mdc`        | Game rules ownership, domain integrity                         |
| 4        | `.cursor/rules/workflow.mdc`           | Mandatory planning and implementation process                  |
| 5        | `.cursor/rules/backend.mdc`            | NestJS, use cases, repositories, DTOs                          |
| 6        | `.cursor/rules/frontend.mdc`           | Next.js App Router, component boundaries                       |
| 7        | `.cursor/rules/testing.mdc`            | Coverage gates, test types, forbidden test patterns            |
| 8        | `.cursor/rules/naming.mdc`             | English-only naming conventions                                |

### Secondary rules (apply when relevant, never override above)

| Document                | When                                    |
| ----------------------- | --------------------------------------- |
| `prisma.mdc`            | Database, repositories, mappers         |
| `documentation.mdc`     | READMEs, ADRs, game-design docs         |
| `simulation-engine.mdc` | Match, chemistry, rating, draft engines |
| `feature-planning.mdc`  | New features and major changes          |
| `code-review.mdc`       | Pre-merge review                        |

### Skill precedence

Skills implement the constitution. Load skills in this order:

1. **project-context** — Always first for unfamiliar work
2. **feature-planning** — Before any major feature
3. **architecture** — Before structural changes
4. **domain-modeling** — Before new entities or game rules
5. **backend** or **frontend** — During implementation
6. **testing** — Alongside and after implementation
7. **code-review** — Before merge

Specialized skills (`game-design`, `simulation-engine`, `nest-module`) apply when their domain is touched.

### Decision hierarchy

When an agent must choose between approaches:

1. **Domain correctness** — Game rules and invariants are never compromised for convenience
2. **Architecture boundaries** — Clean Architecture layers are never violated
3. **Testability** — Solutions must be unit-testable; simulation must be deterministic
4. **Simplicity** — Prefer the smallest change that satisfies 1–3
5. **Speed** — Never sacrifice 1–4 for faster delivery

---

## Mandatory Development Lifecycle

Every feature — small, medium, or large — follows this lifecycle. **Steps may be abbreviated for trivial fixes; they are never skipped for major features.**

```
1. Feature Planning
2. Domain Impact Analysis
3. Architecture Review
4. Approval
5. Implementation
6. Testing
7. Code Review
8. Documentation Update
9. Release
```

### Step details

| Step                      | Skill / Doc                                     | Gate                                          |
| ------------------------- | ----------------------------------------------- | --------------------------------------------- |
| 1. Feature Planning       | `feature-planning` skill, `workflow.mdc`        | Written plan for medium/large features        |
| 2. Domain Impact Analysis | `domain-modeling`, `game-design`                | Affected aggregates and invariants identified |
| 3. Architecture Review    | `architecture` skill, `pnpm architecture:check` | No forbidden dependencies proposed            |
| 4. Approval               | Human or explicit user confirmation             | Major features require approval before code   |
| 5. Implementation         | `backend` / `frontend`, `nest-module`           | Layer rules followed                          |
| 6. Testing                | `testing` skill                                 | Domain rules tested; coverage gates pass      |
| 7. Code Review            | `code-review` skill, `ai-review-checklist.md`   | Findings addressed                            |
| 8. Documentation Update   | `documentation.mdc`                             | README, game-design, ADR updated              |
| 9. Release                | CI green                                        | All checks pass                               |

**Never skip planning.**  
**Never jump directly into implementation for major features.**

---

## Mandatory Skills

### Before implementation

| Skill              | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `project-context`  | Load vision, phase, and what is/isn't implemented  |
| `feature-planning` | Produce impact analysis and implementation plan    |
| `architecture`     | Validate layer placement and module boundaries     |
| `domain-modeling`  | Design entities, VOs, aggregates, repository ports |

### During implementation

| Skill               | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `backend`           | NestJS modules, use cases, DTOs                 |
| `frontend`          | Next.js pages, components, feature services     |
| `nest-module`       | Scaffold four-layer module structure            |
| `testing`           | Unit, integration, E2E test plans and code      |
| `game-design`       | When game rules change                          |
| `simulation-engine` | When randomness or simulation logic is involved |

### Before merge

| Skill         | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `code-review` | Severity-grouped findings (Critical / Major / Minor) |

---

## Forbidden Behaviors

Agents **must not**:

| Behavior                                                   | Why                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| Direct implementation without planning                     | Causes rework and architecture drift                   |
| Architecture violations                                    | Breaks long-term maintainability                       |
| Business logic in controllers                              | Presentation layer is transport only                   |
| Business logic in repositories                             | Infrastructure is persistence only                     |
| Domain entity leakage to API                               | Controllers return DTOs only                           |
| Untested business rules                                    | Domain invariants must have unit tests                 |
| Hidden simulation rules                                    | Randomness must be abstracted and seedable             |
| Implementing unrequested gameplay                          | Scope creep (lobby, draft, simulation without request) |
| Silently fixing unrelated audit findings                   | Changes scope without approval                         |
| `any`, `@ts-ignore`, or disabling lint/architecture checks | Hides defects                                          |
| Turkish or mixed-language identifiers                      | Naming standard violation                              |
| Flat NestJS modules without layers                         | Breaks modular monolith                                |

---

## Agent Onboarding Checklist

Every new agent session working on draft.io:

- [ ] Read `AGENTS.md`
- [ ] Read this constitution
- [ ] Load `project-context` skill
- [ ] Read `.cursor/rules/workflow.mdc`
- [ ] Confirm current phase in `docs/architecture/project-vision.md`
- [ ] For features: run `feature-planning` before writing code

---

## Related Documents

| Document                     | Path                                            |
| ---------------------------- | ----------------------------------------------- |
| Universal agent instructions | `AGENTS.md`                                     |
| Workflow rule                | `.cursor/rules/workflow.mdc`                    |
| Project vision               | `docs/architecture/project-vision.md`           |
| AI review checklist          | `docs/architecture/ai-review-checklist.md`      |
| Feature lifecycle            | `docs/architecture/feature-lifecycle.md`        |
| AI development standards     | `docs/architecture/ai-development-standards.md` |
| Dependency rules             | `docs/architecture/dependency-rules.md`         |

---

## Amendment Process

Changes to this constitution require:

1. Written rationale (ADR in `docs/decisions/`)
2. Update of dependent rules and skills
3. Human approval

Lower-priority rules may be updated without amending the constitution, provided they do not contradict it.
