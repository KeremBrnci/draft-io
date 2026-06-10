# draft.io

Football draft and simulation game platform — architecture foundation.

## AI Contributors

All AI agents (Cursor, Claude, Copilot, etc.) must read **[AGENTS.md](AGENTS.md)** and **[docs/architecture/ai-constitution.md](docs/architecture/ai-constitution.md)** before making changes. Load the `project-context` skill and follow `.cursor/rules/workflow.mdc`.

## Tech Stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Frontend        | Next.js 15 (App Router), TypeScript |
| Backend         | NestJS, TypeScript                  |
| Database        | PostgreSQL                          |
| Cache / PubSub  | Redis                               |
| ORM             | Prisma                              |
| Testing         | Vitest, Playwright                  |
| Package Manager | pnpm workspaces                     |

## Repository Structure

```
apps/
  frontend/     # Next.js application
  backend/      # NestJS modular monolith
packages/
  shared-types/ # Cross-boundary TypeScript types
  shared-utils/ # Pure utility functions
docs/
  architecture/ # System design documentation
  standards/    # Coding standards and conventions
  decisions/    # Architecture Decision Records (ADRs)
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for PostgreSQL and Redis)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Generate Prisma client and run migrations
pnpm --filter @draft-io/backend db:generate
pnpm --filter @draft-io/backend db:migrate

# Build shared packages
pnpm --filter @draft-io/shared-types build
pnpm --filter @draft-io/shared-utils build

# Start development servers
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1

## Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `pnpm dev`              | Start all apps in parallel    |
| `pnpm build`            | Build all packages and apps   |
| `pnpm lint`             | Lint all packages             |
| `pnpm typecheck`        | Type-check all packages       |
| `pnpm test`             | Run all unit tests            |
| `pnpm test:integration` | Run backend integration tests |
| `pnpm test:e2e`         | Run frontend Playwright tests |

## Architecture

This project follows **Clean Architecture** within a **Modular Monolith** pattern. Each backend feature module contains four layers:

- **Domain** — Pure business logic, no framework dependencies
- **Application** — Use cases, commands, queries
- **Infrastructure** — Repositories, database, external services
- **Presentation** — Controllers, DTOs, validation

See [docs/standards/architecture-rules.md](docs/standards/architecture-rules.md) for dependency rules.

## Documentation

- [Architecture Rules](docs/standards/architecture-rules.md)
- [Coding Standards](docs/standards/coding-standards.md)
- [Testing Strategy](docs/standards/testing-strategy.md)
- [Git Workflow](docs/standards/git-workflow.md)
- [ADRs](docs/decisions/)
