# Positions Module

## Purpose

Define the canonical set of football positions used across players, formations, and teams.

## Responsibilities

- Expose the `Position` value object and position codes
- List available positions (optionally goalkeeper-only filter)

## Public API

| Method | Endpoint            | Use Case               |
| ------ | ------------------- | ---------------------- |
| GET    | `/api/v1/positions` | `ListPositionsUseCase` |

## Dependencies

- None (foundational vocabulary module)

## Domain Rules

- Position codes: GK, LB, CB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF, LWB, RWB
- Invalid codes throw `InvalidPositionError`

## Test Strategy

- Unit: `Position` value object, `ListPositionsUseCase`
