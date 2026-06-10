# Players Module

## Purpose

Manage player cards — the core collectible units used in drafts, teams, and match simulation.

## Responsibilities

- Player aggregate lifecycle (create, update, read, list)
- Enforce player invariants (name, position, overall rating)
- Persist players via Prisma repository

## Public API

| Method | Endpoint | Use Case |
|--------|----------|----------|
| POST | `/api/v1/players` | `CreatePlayerUseCase` |
| GET | `/api/v1/players` | `ListPlayersUseCase` |
| GET | `/api/v1/players/:id` | `GetPlayerByIdUseCase` |
| PATCH | `/api/v1/players/:id` | `UpdatePlayerUseCase` |

## Dependencies

- `positions` module — `Position` value object for validation
- `@draft-io/shared-types` — `PlayerSummary` API contract
- Prisma — persistence via `PrismaPlayerRepository`

## Domain Rules

- Name: 1–100 characters, trimmed
- Position: one of 15 supported codes
- Overall rating: integer 1–99
- ID: valid UUID v4

## Test Strategy

- Unit: entity, value objects, use cases
- Integration: `PrismaPlayerRepository` (requires `DATABASE_URL`)
- E2E: controller with mocked use cases
