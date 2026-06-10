# Card Domain Review

**Date:** Pre-refactor snapshot  
**Scope:** `apps/backend/src/modules/cards` and `prisma/schema.prisma` `Card` model  
**Purpose:** Identify weaknesses before making CardType/CardRarity database-driven and adding CardTemplate.

---

## Current Design

### Domain layer

| Artifact | Status |
|----------|--------|
| `Card` entity | Exists — owns `overall`, `overallSource`, `playerId` |
| `CardType` | **Enum** (`BASE`, `SPECIAL`, `HERO`, `ICON`, `PRIME_ICON`, `EVENT`) |
| `CardRarity` | **Enum** (`COMMON` → `LEGENDARY`) |
| `CardOverallSource` | Enum (`CALCULATED`, `MANUAL_OVERRIDE`) — acceptable for engine provenance |
| `CardTemplate` | **Does not exist** |
| `CardMetadata` | **Does not exist** |
| Repositories | `CardRepository` port only — **no Prisma implementation** |
| Application | README stubs only — **no use cases** |
| Presentation | README stubs only — **no API** |

### Database (proposed, not migrated)

Single `cards` table with string columns:

- `card_type` VARCHAR(32)
- `rarity` VARCHAR(32)

No `card_types`, `card_rarities`, or `card_templates` tables.

### Shared types

`CardSummary` exposes closed union types `CardType` and `CardRarity` — requires package publish to add promotions.

### Player relationship

Correct: `Player` has no `overall`. `Card.playerId` references identity UUID. Import pipeline does not create cards.

---

## Weaknesses

### 1. Enum-locked card types

Adding `TOTY`, `TOTS`, `TOTW`, `Flashback`, `Moments`, `Road To Final`, etc. requires:

1. TypeScript enum change
2. Shared-types union update
3. Deploy backend + frontend

**Violates requirement:** promotions must be addable without code deployment.

### 2. No presentation layer separation

Visual configuration (background, border, colors) is not modeled. Risk: future devs add `backgroundImage` to `Card` — couples gameplay asset to UI skin.

### 3. No metadata extension point

Event-specific data (`eventName`, `seasonName`, `promoName`) has no home. Risk: ad-hoc JSON on `Card` without schema.

### 4. String FKs instead of reference entities

`card_type` and `rarity` as free strings lack:

- Referential integrity
- Admin deactivation (`isActive`)
- Display names separate from codes
- Sort order for rarities

### 5. Incomplete persistence layer

Domain exists but cards cannot be read/written — blocks API foundation and migration backfill.

### 6. No template indirection

Hero vs Icon vs Prime Icon need different visual templates. Without `CardTemplate`, each card would duplicate presentation config.

---

## Future Risks

| Risk | Impact | Likelihood |
|------|--------|------------|
| Enum exhaustion | Cannot ship weekly promos | **High** |
| Visual fields on Card | Bloated aggregate, inconsistent UI | Medium |
| Missing metadata schema | Unqueryable event cards | Medium |
| Migration without seed | Empty `card_types` breaks FK inserts | Medium |
| `startingEleven` still player IDs | Simulation uses wrong identity | High (separate track) |
| Overall engine writes to wrong layer | If re-added to Player | Low (guarded by domain) |

---

## Recommended Changes

### A. Replace enums with reference entities

| Entity | Storage | Key fields |
|--------|---------|------------|
| `CardType` | `card_types` | `code`, `name`, `isActive` |
| `CardRarity` | `card_rarities` | `code`, `sortOrder`, `isActive` |
| `CardTemplate` | `card_templates` | `cardTypeId`, visual keys (no rendering) |

`Card` holds UUID FKs: `cardTypeId`, `cardRarityId`, `cardTemplateId`.

### B. Card aggregate slim-down

**Keep on Card:** `overall`, `cardVersion`, `releaseDate`, `isActive`, `overallSource`  
**Remove from Card:** any visual/presentation fields  
**Future:** `CardMetadata` as optional JSON or side table (document only this sprint)

### C. Repository + API foundation

- `CardRepository`, `CardTypeRepository`, `CardRarityRepository`, `CardTemplateRepository`
- Prisma implementations
- `GET /cards`, `GET /cards/:id`, `GET /players/:id/cards` with filters

### D. Shared types

Replace closed unions with `code: string` + optional embedded reference summaries for API responses.

### E. Seed strategy

Migration includes seed rows for `BASE`, `HERO`, `ICON`, `PRIME_ICON` and default rarities/templates — enables FK without deploy.

---

## Decision Log (this sprint)

| Decision | Rationale |
|----------|-----------|
| DB-driven CardType/CardRarity | Unlimited future promos |
| CardTemplate separate entity | Presentation vs gameplay separation |
| CardMetadata documented only | Avoid premature JSON schema lock-in |
| No admin CRUD for types yet | Read-only API foundation first |
| Keep `CardOverallSource` enum | Engine provenance is code-owned, not content |

---

## Post-refactor verification checklist

- [ ] No `CardType` / `CardRarity` enums in backend
- [ ] Prisma proposal includes 4 tables + indexes
- [ ] Card entity uses UUID FKs only
- [ ] Domain tests for all entities
- [ ] API returns cards with type/rarity codes
- [ ] Architecture check passes
- [ ] Import pipeline still does not create cards
