# Card Template System

## Purpose

Separate **gameplay** (`Card`) from **presentation** (`CardTemplate`).

Players see card art, borders, and animations. Simulation and draft consume `Card.overall` only.

## CardTemplate Entity

| Field | Role |
|-------|------|
| `cardTypeId` | Which edition family uses this skin |
| `name` | Admin label (e.g. "Icon White Template") |
| `backgroundImage` | Asset URL/key (future CDN) |
| `borderImage` | Border asset |
| `animationKey` | Client animation identifier |
| `primaryColor`, `secondaryColor` | Theme tokens for UI |
| `isActive` | Hide deprecated templates |

`Card` holds `cardTemplateId` FK — not inline images.

## Examples

| Template | Card Type | Notes |
|----------|-----------|-------|
| Base Gold Template | BASE | Default gold frame |
| Hero Orange Template | HERO | Orange hero styling |
| Icon White Template | ICON | White icon frame |
| Prime Diamond Template | PRIME_ICON | Premium prime styling |

No image generation or rendering in backend this phase.

## CardMetadata (future)

Documented interface for event-specific data — **not persisted yet**.

```typescript
interface CardMetadata {
  eventName?: string;    // "TOTY 2026"
  seasonName?: string;   // "2025-26"
  promoName?: string;    // "Road To Final"
  campaignCode?: string;
}
```

Future options:

1. `cards.metadata` JSONB column with validated schema
2. `card_metadata` side table (normalized, queryable)

Promotion queries (e.g. "all TOTY cards") need metadata — design before first promo ship.

## Client Consumption (future)

```
GET /cards/:id
  → card.overall (gameplay)
  → cardTemplate.backgroundImage (UI)
  → cardType.code (badge label)
```

## Rules

- Never add `backgroundImage` to `Card` entity
- Templates can be swapped without changing gameplay stats
- Multiple templates per type allowed (seasonal reskins)
