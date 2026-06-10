# ADR 003: PostgreSQL as Primary Database

## Status

Accepted

## Date

2026-06-09

## Context

draft.io requires persistent storage for users, player cards, draft state, match results, league standings, and season data. The data model includes relational entities with complex queries and transactional requirements.

Options considered:

1. **PostgreSQL** — Relational, ACID, JSON support, mature ecosystem
2. **MongoDB** — Document store, flexible schema
3. **MySQL** — Relational, widely deployed

## Decision

Use **PostgreSQL 16** as the primary database.

## Rationale

- **Relational integrity** — Draft picks, roster assignments, and league standings are inherently relational
- **ACID transactions** — Draft operations require atomic multi-row updates (pick + roster + timer)
- **JSON support** — `jsonb` columns for flexible player attributes and simulation parameters without sacrificing queryability
- **Prisma support** — First-class Prisma support with migrations and type generation
- **Advanced features** — Full-text search, window functions for leaderboards, partial indexes
- **Ecosystem** — Neon, Supabase, RDS, and self-hosted options for production

## Data Model Strategy

- **Normalized schema** for core entities (users, players, leagues, matches)
- **JSONB columns** for extensible attributes (player card stats, chemistry parameters)
- **Prisma migrations** for schema versioning
- **Soft deletes** where audit trail is needed (future)

## Consequences

### Positive

- Strong consistency guarantees for draft and match operations
- Rich query capabilities for leaderboards and statistics
- Excellent Prisma integration
- JSONB bridges relational and document patterns

### Negative

- Schema migrations required for structural changes
- Horizontal scaling requires read replicas or sharding (not needed initially)
- Local development requires Docker or cloud database

## Infrastructure

- **Local**: Docker Compose (`postgres:16-alpine`)
- **Production**: TBD (Neon, Supabase, or managed RDS)
