# ADR 005: Prisma as ORM

## Status

Accepted

## Date

2026-06-09

## Context

We need an ORM for PostgreSQL that integrates with NestJS, provides type-safe database access, and supports migrations. The ORM must not leak into the domain layer.

Options considered:

1. **Prisma** — Schema-first, type generation, migration tooling
2. **TypeORM** — Decorator-based, NestJS native integration
3. **Drizzle** — SQL-first, lightweight, growing ecosystem
4. **Knex + raw SQL** — Maximum control, no type generation

## Decision

Use **Prisma** as the ORM, confined to the **infrastructure layer** only.

## Rationale

- **Type safety** — Auto-generated types from schema (`@prisma/client`)
- **Migration tooling** — `prisma migrate` for versioned schema changes
- **Schema as documentation** — `schema.prisma` serves as data model reference
- **Repository pattern fit** — Prisma client used only in repository implementations, never in domain
- **Developer experience** — Prisma Studio for local data inspection
- **NestJS integration** — Well-established pattern with `PrismaService`

## Architecture Constraint

Prisma types and client **must never** appear in:

- Domain layer (entities, value objects, errors)
- Application layer (use cases, commands, queries)
- Presentation layer (controllers, DTOs)

Prisma is used exclusively in:

- `infrastructure/persistence/` — Repository implementations
- `infrastructure/mappers/` — Domain ↔ Prisma record mapping
- `infrastructure/database/` — `PrismaService` wrapper

## Mapping Pattern

```
Prisma Record → PlayerMapper.toDomain() → Domain Entity
Domain Entity → PlayerMapper.toPersistence() → Prisma Input
```

Domain entities are always reconstructed through mappers, never by passing Prisma records directly.

## Consequences

### Positive

- Type-safe database queries with auto-completion
- Declarative schema with migration history
- Clean separation via repository pattern
- Easy to mock in tests (mock `PlayerRepositoryPort`, not Prisma)

### Negative

- Generated client adds build step (`prisma generate`)
- N+1 query risk (mitigated by `include` and query optimization)
- Prisma-specific query syntax in infrastructure layer
- Schema changes require migration generation

## Migration Workflow

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate migration
pnpm --filter @draft-io/backend db:migrate

# 3. Prisma client auto-regenerates
# 4. Update mapper if schema changed
# 5. Update integration tests
```
