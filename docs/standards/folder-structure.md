# Folder Structure

## Monorepo Layout

```
draft.io/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── apps/
│   ├── backend/            # NestJS API
│   └── frontend/           # Next.js application
├── packages/
│   ├── shared-types/       # Shared TypeScript types
│   └── shared-utils/       # Shared pure utilities
├── docs/
│   ├── architecture/       # System design docs
│   ├── standards/          # Coding standards
│   └── decisions/          # Architecture Decision Records
├── docker-compose.yml      # Local PostgreSQL + Redis
├── eslint.config.mjs       # Root ESLint config
├── tsconfig.base.json      # Shared TypeScript config
├── pnpm-workspace.yaml     # Workspace definition
└── package.json            # Root scripts
```

## Backend Structure

```
apps/backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── main.ts             # Application entry point
│   ├── app.module.ts       # Root module
│   ├── common/             # Shared kernel
│   │   ├── common.module.ts
│   │   ├── domain/         # Base Entity, ValueObject, Result
│   │   ├── errors/         # DomainError base class
│   │   ├── filters/        # HTTP exception filter
│   │   └── logging/        # Structured logger
│   ├── infrastructure/     # Cross-cutting infrastructure
│   │   ├── config/         # Environment validation
│   │   ├── database/       # Prisma service
│   │   └── redis/          # Redis client
│   └── modules/            # Feature modules
│       ├── auth/
│       ├── users/
│       ├── players/        # ★ Example module (fully implemented)
│       ├── formations/
│       ├── lobbies/
│       ├── draft/
│       ├── matches/
│       └── simulation/
└── test/
    ├── integration/        # Repository integration tests
    └── e2e/                # API endpoint tests
```

## Feature Module Structure

Each module follows the same four-layer pattern:

```
modules/players/
├── application/
│   ├── commands/           # Write operation inputs
│   ├── queries/            # Read operation inputs
│   └── use-cases/          # Application services
├── domain/
│   ├── entities/           # Aggregate roots
│   ├── value-objects/      # Immutable value types
│   ├── errors/             # Domain-specific errors
│   └── repositories/       # Port interfaces (contracts)
├── infrastructure/
│   ├── mappers/            # Domain ↔ persistence mapping
│   └── persistence/        # Repository implementations
├── presentation/
│   ├── controllers/        # HTTP controllers
│   └── dto/                # Request/response DTOs
└── players.module.ts       # NestJS module wiring
```

## Frontend Structure

```
apps/frontend/
├── e2e/                    # Playwright tests
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/         # Reusable UI components (future)
│   ├── features/           # Feature-specific UI logic (future)
│   ├── hooks/              # Custom React hooks (future)
│   └── lib/
│       └── api/            # API client utilities
├── next.config.ts
└── playwright.config.ts
```

## Shared Packages

```
packages/shared-types/
├── src/
│   ├── api/                # API contract types
│   ├── players/            # Player-related types
│   └── index.ts            # Public exports
└── README.md               # Usage guidelines

packages/shared-utils/
├── src/
│   ├── assert-never.ts
│   ├── clamp.ts
│   └── index.ts
└── README.md
```

## Documentation

```
docs/
├── architecture/
│   └── overview.md         # High-level system design
├── standards/
│   ├── architecture-rules.md
│   ├── coding-standards.md
│   ├── typescript-guidelines.md
│   ├── testing-strategy.md
│   ├── folder-structure.md
│   ├── naming-conventions.md
│   └── git-workflow.md
└── decisions/
    ├── 001-modular-monolith.md
    ├── 002-clean-architecture.md
    ├── 003-postgresql.md
    ├── 004-redis.md
    └── 005-prisma.md
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `{name}.entity.ts` | `player.entity.ts` |
| Value Object | `{name}.vo.ts` | `player-id.vo.ts` |
| Use Case | `{action}-{entity}.use-case.ts` | `create-player.use-case.ts` |
| Command | `{action}-{entity}.command.ts` | `create-player.command.ts` |
| Query | `{action}-{entity}.query.ts` | `get-player.query.ts` |
| Repository Port | `{entity}.repository.port.ts` | `player.repository.port.ts` |
| Repository Impl | `prisma-{entity}.repository.ts` | `prisma-player.repository.ts` |
| Mapper | `{entity}.mapper.ts` | `player.mapper.ts` |
| Controller | `{entities}.controller.ts` | `players.controller.ts` |
| Request DTO | `{action}-{entity}.dto.ts` | `create-player.dto.ts` |
| Response DTO | `{entity}-response.dto.ts` | `player-response.dto.ts` |
| Unit Test | `{file}.unit.test.ts` | `player.entity.unit.test.ts` |
| Module | `{feature}.module.ts` | `players.module.ts` |
