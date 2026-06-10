# Card Migration Plan

## Current State (pre-migration DB)

| Area          | Status                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| Domain        | Reference entities + Card with UUID FKs                                       |
| Prisma schema | Proposed — 4 card tables                                                      |
| API           | Read-only `GET /cards`, `GET /cards/:id`, `GET /players/:id/cards`            |
| DB            | May still have old `cards` with string `card_type`/`rarity` OR no card tables |
| Seed data     | Not applied                                                                   |

## Target State

```
card_types ──┬── card_templates
             └── cards ── players
card_rarities ──── cards
```

### Tables

| Table            | Purpose                                |
| ---------------- | -------------------------------------- |
| `card_types`     | BASE, HERO, TOTY, … (admin-insertable) |
| `card_rarities`  | COMMON → LEGENDARY (+ future)          |
| `card_templates` | Visual config per type                 |
| `cards`          | Playable assets with FK references     |

## Required Migrations

### Step 1 — Create reference tables

Create `card_types`, `card_rarities`, `card_templates` with UUID PKs and unique `code` on types/rarities.

### Step 2 — Seed reference data

```sql
-- card_types (examples)
INSERT INTO card_types (id, code, name, description, is_active) VALUES
  (gen_random_uuid(), 'BASE', 'Base Card', 'Default edition', true),
  (gen_random_uuid(), 'HERO', 'Hero Card', 'Hero edition', true),
  (gen_random_uuid(), 'ICON', 'Icon Card', 'Icon edition', true),
  (gen_random_uuid(), 'PRIME_ICON', 'Prime Icon', 'Prime icon edition', true);

-- card_rarities
INSERT INTO card_rarities (id, code, name, sort_order, is_active) VALUES
  (gen_random_uuid(), 'COMMON', 'Common', 10, true),
  (gen_random_uuid(), 'RARE', 'Rare', 20, true),
  (gen_random_uuid(), 'EPIC', 'Epic', 30, true),
  (gen_random_uuid(), 'LEGENDARY', 'Legendary', 40, true);
```

Add templates per type in `card_templates` seed script.

### Step 3 — Create or alter `cards`

If old `cards` table exists with string enums:

1. Add nullable FK columns
2. Backfill FKs from code mapping
3. Drop old string columns
4. Add FK constraints

If no `cards` table: create fresh per `schema.prisma`.

### Step 4 — Application deploy

Deploy backend with new repositories after migration succeeds.

## Risks

| Risk                           | Mitigation                               |
| ------------------------------ | ---------------------------------------- |
| Empty reference tables         | Block deploy; run seed in same migration |
| Orphan cards after FK add      | Validate backfill script in staging      |
| API returns empty lists        | Expected until cards created manually    |
| Old clients expect enum unions | `cardTypeCode` string in `CardSummary`   |
| Rollback drops data            | Backup before migration; test on copy    |

## Rollback Strategy

1. Keep migration SQL in version control
2. Rollback migration reverses table creation (data loss on new tables)
3. If cards were backfilled from legacy `players.overall`, retain backup snapshot
4. Application rollback to prior tag if API contract breaks consumers

## Do Not Auto-Execute

Migrations are **proposed only**. Run manually:

```bash
pnpm --filter @draft-io/backend db:migrate
```

Review generated SQL before applying to production.
