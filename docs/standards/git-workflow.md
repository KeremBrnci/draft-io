# Git Workflow

## Branch Strategy

We use **trunk-based development** with short-lived feature branches.

```
main (protected)
  ├── feature/DRAFT-123-player-search
  ├── fix/DRAFT-456-timer-bug
  └── chore/update-deps
```

### Branch Naming

| Prefix      | Use Case           | Example                              |
| ----------- | ------------------ | ------------------------------------ |
| `feature/`  | New functionality  | `feature/DRAFT-123-add-lobby-system` |
| `fix/`      | Bug fixes          | `fix/DRAFT-456-draft-timer-sync`     |
| `chore/`    | Maintenance, deps  | `chore/update-prisma`                |
| `docs/`     | Documentation only | `docs/testing-strategy`              |
| `refactor/` | Code restructuring | `refactor/extract-player-mapper`     |
| `test/`     | Test additions     | `test/player-use-case-coverage`      |
| `ci/`       | CI/CD changes      | `ci/add-integration-tests`           |

Format: `{prefix}/{ticket-id}-{short-description}` (ticket ID optional for small changes)

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | New feature                 |
| `fix`      | Bug fix                     |
| `docs`     | Documentation changes       |
| `style`    | Formatting, no logic change |
| `refactor` | Code restructuring          |
| `test`     | Adding or updating tests    |
| `chore`    | Maintenance, dependencies   |
| `ci`       | CI/CD configuration         |
| `perf`     | Performance improvement     |
| `build`    | Build system changes        |

### Scopes

Use module or package name:

- `players`, `draft`, `lobbies`, `auth`
- `backend`, `frontend`, `shared-types`
- `deps`, `ci`, `docker`

### Examples

```
feat(players): add create player use case
fix(draft): prevent duplicate picks in concurrent draft
docs(architecture): add clean architecture ADR
test(players): add overall rating boundary tests
chore(deps): bump nestjs to 11.1.2
ci: add PostgreSQL service to integration tests
```

### Rules

1. Subject line ≤ 72 characters
2. Use imperative mood ("add", not "added" or "adds")
3. No period at end of subject
4. Body explains **why**, not **what**
5. Reference issues in footer: `Closes DRAFT-123`

## Pull Request Checklist

Before requesting review:

### Code Quality

- [ ] Code follows [coding standards](./coding-standards.md)
- [ ] No `any` types or `@ts-ignore` (unless documented)
- [ ] Architecture dependency rules respected
- [ ] No business logic in controllers or DTOs
- [ ] Domain layer has zero framework imports

### Testing

- [ ] Unit tests added/updated for changed logic
- [ ] Integration tests added for new repositories
- [ ] E2E tests added for new API endpoints
- [ ] All tests pass locally
- [ ] Coverage meets targets (domain 95%+, application 90%+)

### Documentation

- [ ] ADR created for significant architectural decisions
- [ ] README updated if setup steps changed
- [ ] Public API changes documented

### Review

- [ ] PR title follows Conventional Commits
- [ ] PR description explains motivation and approach
- [ ] Self-review completed
- [ ] No unrelated changes included
- [ ] Environment variables documented in `.env.example`

### CI

- [ ] Lint passes
- [ ] Type check passes
- [ ] All CI jobs green

## Merge Strategy

- **Squash merge** into `main` for feature branches
- Squash commit message follows Conventional Commits format
- Delete branch after merge

## Protected Branch Rules (main)

- Require PR review (minimum 1 approval)
- Require CI checks to pass
- No direct pushes
- No force pushes
