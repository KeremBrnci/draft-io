# Nations Module

## Purpose

Represent national teams or country affiliations for players and competitions.

## Responsibilities

- Nation aggregate skeleton (read/list)
- Nation code and name invariants

## Public API

| Method | Endpoint | Use Case |
|--------|----------|----------|
| GET | `/api/v1/nations` | `ListNationsUseCase` |

## Dependencies

- Prisma — persistence via `PrismaNationRepository` (skeleton)

## Domain Rules

- Nation code: ISO-style short code (domain validation TBD)
- Nation name: non-empty string

## Test Strategy

- Unit: to be added as domain rules solidify
- Integration: repository when Prisma schema is finalized
