# Card Type Strategy

## Why Database-Driven Types

Football games ship weekly promotions: TOTY, TOTS, TOTW, Flashback, Moments, World Cup, Road To Final, Centurions, community events.

**Enums fail** because every new promo requires:

- TypeScript enum edit
- Shared-types publish
- Backend deploy
- Frontend deploy

**Reference tables succeed** because ops/admin inserts a row:

```sql
INSERT INTO card_types (code, name, description, is_active)
VALUES ('TOTY', 'Team of the Year', 'Annual TOTY promo', true);
```

No code deployment required.

## Why Enums Are Avoided

| Approach | Add TOTY | Add custom event |
|----------|----------|------------------|
| `enum CardType` | Code change + deploy | Code change + deploy |
| `card_types` table | SQL insert | SQL insert |

`CardRarity` follows the same strategy with `sortOrder` for display and pack weights.

## Current Types (seed)

| Code | Name |
|------|------|
| `BASE` | Base Card |
| `HERO` | Hero Card |
| `ICON` | Icon Card |
| `PRIME_ICON` | Prime Icon |

## Future Types (data only)

`TOTY`, `TOTS`, `TOTW`, `FUTURE_STARS`, `FLASHBACK`, `MOMENTS`, `WORLD_CUP`, `EURO`, `ROAD_TO_FINAL`, `CENTURIONS`, `COMMUNITY_EVENT`, …

Domain code references types by **UUID** (`cardTypeId`) or **code** string at API boundary — never by enum switch.

## Hero / Icon / TOTY Flow

1. Admin inserts `card_types` row for `TOTY`
2. Admin inserts `card_templates` row linked to type
3. Card creation use case (future) picks type + template + rarity
4. Draft pool filters by `cardType.code` query param
5. Simulation reads `Card.overall` — type affects presentation, not formula (unless future traits)

## Gameplay Consumption

| System | Uses |
|--------|------|
| Draft | `cardId`, `overall`, `isActive`, optional `cardTypeCode` filter |
| Team squad | `cardId` in `startingEleven` slots |
| Simulation | `Card.overall` per slot |
| Chemistry (future) | `card.playerId` → nationality links |
| UI | `cardTemplate` + `cardType.name` |

## Player Boundary

`Player` has no `cardType`, `rarity`, or `overall`. Import creates players only. Cards are always game-owned.
