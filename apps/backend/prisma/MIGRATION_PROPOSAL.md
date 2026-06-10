# Prisma Migration Proposal — Card Reference Model

**Status:** Proposed — do not auto-apply.

See [docs/architecture/card-migration-plan.md](../../docs/architecture/card-migration-plan.md) for full rollout.

## New Tables

- `card_types` — edition families (BASE, HERO, TOTY, …)
- `card_rarities` — collectible tiers
- `card_templates` — presentation config
- `cards` — playable assets with FK references

## Card Model (target)

| Column             | Type                     |
| ------------------ | ------------------------ |
| `player_id`        | UUID FK → players        |
| `card_type_id`     | UUID FK → card_types     |
| `card_rarity_id`   | UUID FK → card_rarities  |
| `card_template_id` | UUID FK → card_templates |
| `overall`          | SMALLINT                 |
| `overall_source`   | VARCHAR                  |
| `card_version`     | VARCHAR                  |
| `release_date`     | DATE nullable            |
| `is_active`        | BOOLEAN                  |

## Indexes

- `cards(player_id)`
- `cards(card_type_id)`
- `cards(card_rarity_id)`
- `cards(overall)`

## Apply

```bash
pnpm --filter @draft-io/backend db:migrate
```

Review SQL before production.
