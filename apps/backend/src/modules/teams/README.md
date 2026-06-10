# Teams Module

## Purpose

Model user-managed squads with formation, manager, and starting eleven assignments.

## Responsibilities

- Team aggregate (create, read, list skeleton)
- Starting eleven slot assignments by player ID
- Future hooks for chemistry and team overall (not yet calculated)

## Public API

| Method | Endpoint | Use Case |
|--------|----------|----------|
| GET | `/api/v1/teams` | `ListTeamsUseCase` |

## Dependencies

- `formations` — formation code validation (future)
- `players` — player IDs referenced in starting eleven (by ID only)
- Prisma — persistence via `PrismaTeamRepository` (skeleton)

## Domain Rules

- Team ID: valid UUID v4
- Team name: 1–100 characters, trimmed
- Starting eleven: 11 slots, no duplicate player IDs
- Chemistry and team overall are nullable until engines exist

## Test Strategy

- Unit: `Team`, value objects, `ListTeamsUseCase`
- Integration: repository (when persistence is complete)
