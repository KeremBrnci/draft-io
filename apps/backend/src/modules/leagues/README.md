# Leagues Module

## Purpose

Represent competitive leagues that group teams and seasons.

## Responsibilities

- League aggregate skeleton (read/list)
- League name and metadata invariants

## Public API

| Method | Endpoint | Use Case |
|--------|----------|----------|
| GET | `/api/v1/leagues` | `ListLeaguesUseCase` |

## Dependencies

- Prisma — persistence via `PrismaLeagueRepository` (skeleton)

## Domain Rules

- League name: non-empty, bounded length (domain validation TBD)
- Leagues reference teams by ID only (no circular imports)

## Test Strategy

- Unit: to be added as domain rules solidify
- Integration: repository when Prisma schema is finalized
