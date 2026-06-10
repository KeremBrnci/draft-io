# AI Development Standards

## Purpose

Define how AI assistants (Cursor, Claude, Gemini, Copilot, and future tools) work on the draft.io codebase. This document is **subordinate** to the AI governance layer.

## Governance Layer (read first)

| Priority | Document                                                                 | Role                                                           |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 0        | [`AGENTS.md`](../../AGENTS.md)                                           | Universal entry point for all AI tools                         |
| 1        | [`ai-constitution.md`](./ai-constitution.md)                             | Supreme authority — workflows, precedence, forbidden behaviors |
| 2        | [`.cursor/rules/workflow.mdc`](../../.cursor/rules/workflow.mdc)         | Mandatory 10-step process                                      |
| 3        | [`project-context` skill](../../.claude/skills/project-context/SKILL.md) | Vision, phase, implemented vs planned                          |
| 4        | [`ai-review-checklist.md`](./ai-review-checklist.md)                     | Pre-merge verification                                         |

**Every session:** Load `project-context` → read `ai-constitution.md` → follow `workflow.mdc`.

## Before Implementation

1. Read **`docs/architecture/ai-constitution.md`**
2. Load **`project-context`** skill
3. Follow **`workflow.mdc`** (Steps 1–6 for major features)
4. Read relevant **Cursor rules** (`.cursor/rules/`)
5. Load matching **Claude skills** (`.claude/skills/`)
6. For features: run **`feature-planning`** skill first
7. For new modules: run **`nest-module`** skill
8. For game rules: run **`game-design`** skill
9. Check `docs/architecture/dependency-rules.md`

## During Implementation

### Cursor

- `architecture.mdc`, `naming.mdc`, and `workflow.mdc` always apply
- Other rules apply based on `globs` and task type
- Follow layer boundaries strictly

### Claude Skills

| Task                | Skill                             |
| ------------------- | --------------------------------- |
| Session start       | `project-context`                 |
| New features        | `feature-planning`                |
| Architecture review | `architecture`                    |
| Domain design       | `domain-modeling`                 |
| Backend code        | `backend` + `nest-module`         |
| Frontend code       | `frontend`                        |
| Tests               | `testing`                         |
| Game rules          | `game-design` + `domain-modeling` |
| Simulation          | `simulation-engine`               |
| Pre-merge review    | `code-review`                     |

## After Implementation

1. Run `pnpm lint && pnpm typecheck`
2. Run `pnpm architecture:check`
3. Run `pnpm test:unit` and `pnpm test:coverage`
4. Complete **`ai-review-checklist.md`**
5. Apply **`code-review`** skill
6. Update module README if module changed
7. Create ADR if architectural decision made

## AI Code Review Process

All AI-generated code is reviewed against `ai-review-checklist.md`:

1. **Architecture boundaries** — `pnpm architecture:check`
2. **Domain boundaries** — No entity leakage, no rules in infra/UI
3. **Testing** — Coverage gates, behavior-focused tests
4. **Naming** — English only, project conventions
5. **Documentation** — Honest implementation status
6. **Security** — Input validation, no secrets
7. **Workflow** — Planning completed for major features

## Forbidden AI Behaviors

See full list in `ai-constitution.md`. Summary:

- Direct implementation without planning (major features)
- Implementing gameplay features without explicit request
- Architecture violations
- Business logic in controllers or repositories
- Domain entity leakage
- Untested business rules
- Hidden simulation rules
- Adding `any` or `@ts-ignore`
- Skipping `architecture:check` or coverage gates

## Good AI Workflow

```
Session start → project-context skill
User request → feature-planning skill → domain-modeling skill
  → architecture review → approval (major features)
  → implementation (backend/frontend rules)
  → testing skill → ai-review-checklist → code-review skill → deliver
```

## Bad AI Workflow

```
User request → immediately edit 20 files → no tests → no architecture check
```

## Reference Documents

- `AGENTS.md`
- `docs/architecture/ai-constitution.md`
- `docs/architecture/project-vision.md`
- `docs/architecture/feature-lifecycle.md`
- `docs/standards/architecture-rules.md`
- `docs/standards/result-pattern.md`
- `docs/standards/shared-utils-policy.md`
- `docs/architecture/dependency-rules.md`
