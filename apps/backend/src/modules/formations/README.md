# Formations Module

## Purpose

Provide read-only access to supported football formations and their slot layouts for team building and simulation.

## Responsibilities

- Define formation templates (4-4-2, 4-3-3, etc.)
- Validate formation codes and slot invariants
- Serve formation catalog via in-memory repository

## Public API

| Method | Endpoint                   | Use Case                |
| ------ | -------------------------- | ----------------------- |
| GET    | `/api/v1/formations`       | `ListFormationsUseCase` |
| GET    | `/api/v1/formations/:code` | `GetFormationUseCase`   |

## Dependencies

- `positions` module — `PositionCode` for slot allowed positions
- `@draft-io/shared-types` — formation API contracts

## Domain Rules

- Formation code must be one of five supported templates
- Each formation has exactly 11 slots (index 1–11)
- Each slot must allow at least one position

## Test Strategy

- Unit: `Formation`, `FormationCode`, `FormationSlot`, use cases
- No database persistence in this phase
