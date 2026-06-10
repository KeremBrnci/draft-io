# Card Domain Overview

## Architecture

```
Player (identity)
    │
    ├── 1:N ── Card (gameplay asset)
    │              ├── cardTypeId  → CardType (reference)
    │              ├── cardRarityId → CardRarity (reference)
    │              └── cardTemplateId → CardTemplate (presentation)
    │
    └── never owns overall, rarity, or visuals
```

## Module Layout

```
cards/
├── domain/
│   ├── entities/     Card, CardType, CardRarity, CardTemplate
│   ├── models/       CardMetadata (future, documented)
│   ├── repositories/ 4 repository ports
│   └── value-objects/ CardId, CardOverall, ReferenceId, ReferenceCode
├── application/
│   ├── use-cases/    ListCards, GetCardById, ListCardsByPlayer
│   └── services/     CardEnrichmentService
├── infrastructure/
│   ├── mappers/
│   └── persistence/  Prisma implementations
└── presentation/
    ├── controllers/  CardsController, PlayerCardsController
    └── dto/          ListCardsQueryDto (filters)
```

## Card Aggregate

| Field | Notes |
|-------|-------|
| `playerId` | Identity FK (UUID string in domain) |
| `cardTypeId` | Reference data — not enum |
| `cardRarityId` | Reference data — not enum |
| `cardTemplateId` | Presentation config FK |
| `overall` | Gameplay strength (1–99) |
| `overallSource` | `CALCULATED` \| `MANUAL_OVERRIDE` |
| `cardVersion` | Edition label |
| `releaseDate` | Optional go-live date |
| `isActive` | Draft pool eligibility |

**Not on Card:** images, colors, event metadata (future `CardMetadata`).

## Reference Entities

### CardType

`id`, `code`, `name`, `description`, `isActive`, timestamps

### CardRarity

`id`, `code`, `name`, `description`, `sortOrder`, `isActive`, timestamps

### CardTemplate

`id`, `cardTypeId`, visual keys, `isActive`, timestamps

## API Foundation (read-only)

| Method | Path | Filters |
|--------|------|---------|
| GET | `/api/v1/cards` | `cardType`, `cardRarity`, `minOverall`, `maxOverall`, `isActive` |
| GET | `/api/v1/cards/:id` | — |
| GET | `/api/v1/players/:playerId/cards` | same as list |

Response: `CardSummary` with resolved `cardTypeCode`, `cardRarityCode`, `cardTemplateName`.

## Import Pipeline

**Does not create cards.** See `player-card-separation.md`.

## Dependency Rules

| From | To | Allowed |
|------|-----|---------|
| `cards` domain | `players` domain | No — `playerId` string only |
| `data-providers` | `cards` | No |
| `draft` (future) | `cards` | Yes — via use cases |
| `simulation` (future) | `cards` | Yes |

## Related Docs

- [card-domain-review.md](./card-domain-review.md) — pre-refactor analysis
- [card-type-strategy.md](./card-type-strategy.md) — why DB-driven types
- [card-template-system.md](./card-template-system.md) — presentation layer
- [card-migration-plan.md](./card-migration-plan.md) — DB rollout
- [../game-design/card-system.md](../game-design/card-system.md)
