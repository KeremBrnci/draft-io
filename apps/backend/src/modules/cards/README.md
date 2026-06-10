# Cards Module

## Purpose

Own **playable game assets** — card editions linked to player identities. Gameplay strength (`overall`) lives here, not on `Player`.

## Boundaries

| In scope                          | Out of scope (other modules / future) |
| --------------------------------- | ------------------------------------- |
| Card domain entity, types, rarity | Pack opening                          |
| Card ↔ Player relationship rules  | Draft, simulation, lobby              |
| Repository port                   | Automatic card generation on import   |

## Import rule

`data-providers` imports update **Player** only. Cards are created by game systems (admin, overall engine, events).

## Docs

- `docs/architecture/card-domain-overview.md`
- `docs/game-design/card-system.md`
