---
name: domain-modeling
description: >-
  Models draft.io domain aggregates, entities, value objects, invariants, and
  repository ports using DDD and Clean Architecture. Use when designing domain
  models, encoding game rules in entities, or refactoring anemic data models.
---

# Domain Modeling

## Governance

Mandatory before implementation (lifecycle Step 2). Subordinate to `game-domain.mdc` and `ai-constitution.md`.

| Document | Path |
|----------|------|
| AI Constitution | `docs/architecture/ai-constitution.md` |
| Workflow | `.cursor/rules/workflow.mdc` |
| Universal instructions | `AGENTS.md` |
| Project context | `.claude/skills/project-context/SKILL.md` |

## Purpose

Guide domain-driven design for **draft.io** backend modules: express football game rules as rich domain models with enforced invariants, immutable value objects, and clear aggregate boundaries. The domain layer is framework-free and persistence-ignorant.

## When to use

- Designing a new aggregate (Player, Team, DraftRoom, Match)
- Creating value objects for validated primitives
- Defining domain errors and invariants
- Deciding what belongs inside vs outside an aggregate
- Reviewing whether logic should move from use case to entity
- Modeling game rules (formation fit, draft picks, chemistry links)

## Required inputs

1. **Aggregate name** — Consistency boundary owner
2. **Invariants** — Rules that must always hold
3. **Lifecycle** — Creation, mutation, deletion events
4. **References** — Other aggregates by ID only
5. **Value types** — Which primitives need validation wrappers?

## Rules

### Building blocks

| Concept | Purpose | Example |
|---------|---------|---------|
| **Entity** | Identity + mutable state | `Player`, `Team`, `DraftRoom` |
| **Value Object** | Immutable validated value | `PlayerId`, `OverallRating`, `Position` |
| **Aggregate Root** | Entity that guards consistency | `Team` owns `startingEleven` slots |
| **Domain Error** | Business rule violation | `InvalidSlotPositionError` |
| **Repository Port** | Persistence contract | `PlayerRepository` interface |
| **Domain Service** | Logic spanning entities (rare) | `ChemistryCalculator` (future) |

### Entity pattern

Extend `Entity<IdType>` from `common/domain/entity.ts`:

```typescript
export class Player extends Entity<PlayerId> {
  private constructor(props: PlayerProps) { super(props.id); /* ... */ }

  static create(props: CreatePlayerProps): Player { /* new entity */ }
  static reconstitute(props: PlayerProps): Player { /* from DB */ }

  updatePosition(position: Position): void {
    this._position = position;
    this._updatedAt = new Date();
  }
}
```

- **Private constructor** — force factory usage
- **`create()`** — new aggregate, sets timestamps
- **`reconstitute()`** — hydrate from persistence without side effects
- **Getters** return value objects, not primitives
- **Mutation methods** enforce invariants; throw domain errors on violation

### Value object pattern

```typescript
export class OverallRating {
  private constructor(private readonly _value: number) {}

  static create(value: number): OverallRating {
    if (!Number.isInteger(value) || value < 1 || value > 99) {
      throw new InvalidOverallRatingError(value);
    }
    return new OverallRating(value);
  }

  get value(): number { return this._value; }
  equals(other: OverallRating): boolean { return this._value === other._value; }
}
```

- Immutable after creation
- Validation in `create()` factory
- No setters
- `equals()` for comparison

### ID value objects

```typescript
export class PlayerId {
  private constructor(private readonly _value: string) {}
  static create(value: string): PlayerId { /* validate UUID */ }
  static generate(uuid: string): PlayerId { return new PlayerId(uuid); }
  get value(): string { return this._value; }
}
```

### Domain errors

```typescript
export class PlayerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Player not found: ${id}`, 'PLAYER_NOT_FOUND');
  }
}
```

- Extend `DomainError`
- Code follows HTTP mapping conventions (see backend skill)
- No `HttpStatus`, no `statusCode`

### Aggregate boundaries (draft.io)

| Aggregate | Root | Enforces |
|-----------|------|----------|
| Player | `Player` | Valid name, position, rating |
| Team | `Team` | 11 slots, formation fit, unique players |
| Nation | `Nation` | Identity invariants |
| League | `League` | Team membership, season |
| DraftRoom | `DraftRoom` | Pick order, pool state, turn (future) |
| Match | `Match` | Status transitions, result immutability (future) |

**Not aggregates:** `Formation` (immutable template), `Position` (vocabulary VO)

### Cross-aggregate references

```typescript
// Team entity — correct
private _playerIds: PlayerId[];  // references by ID

// Team entity — wrong
private _players: Player[];      // never embed other aggregate
```

Validate referenced IDs exist in **application layer** (use case), not in entity constructor from raw strings without context.

### Shared vocabulary across modules

`Position` VO lives in `positions` module. Other modules may import **value objects** from shared vocabulary modules — not entities.

Import direction: `players/domain` → `positions/domain/value-objects/position.vo` ✅

### Repository ports

```typescript
export interface PlayerRepository {
  save(player: Player): Promise<void>;
  findById(id: PlayerId): Promise<Player | null>;
  findAll(query: ListPlayersCriteria): Promise<Player[]>;
}

export const PLAYER_REPOSITORY = Symbol('PlayerRepository');
```

- Interface in `domain/repositories/`
- Methods use domain types only
- No `saveOrUpdate` ambiguity — explicit `save`/`delete`

### Where logic lives

| Logic | Location |
|-------|----------|
| Rating must be 1–99 | `OverallRating` VO |
| Slot accepts position | `Team` entity or `FormationSlot` VO |
| Player exists | Use case (application) |
| Pick is current player's turn | `DraftRoom` entity |
| Chemistry score calculation | Domain service (simulation module) |
| HTTP response shape | Presentation mapper |

## Examples

### Example 1: Team starting eleven invariant

```typescript
assignPlayerToSlot(playerId: PlayerId, slotIndex: number, formation: Formation): void {
  const slot = formation.getSlot(slotIndex);
  if (!slot) throw new InvalidSlotIndexError(slotIndex);
  if (this._playerIds.includes(playerId)) {
    throw new DuplicatePlayerInLineupError(playerId.value);
  }
  // Position check requires player position — validated in use case
  // after loading Player by ID, then call:
  this._slots[slotIndex] = playerId;
}
```

### Example 2: Draft pick state machine

```typescript
// DraftRoom entity
makePick(playerId: PlayerId, pickerId: UserId): DraftPick {
  if (this._status !== 'IN_PROGRESS') throw new DraftNotActiveError();
  if (this.currentPickerId !== pickerId) throw new NotYourTurnError();
  if (!this._pool.has(playerId)) throw new PlayerNotInPoolError();
  
  const pick = DraftPick.create({ round, pickNumber, playerId, pickerId });
  this._pool.remove(playerId);
  this._picks.push(pick);
  this.advanceTurn();
  return pick;
}
```

### Example 3: Reconstitute vs create

```typescript
// Use case — creating new
const player = Player.create({ id: PlayerId.generate(uuid), /* ... */ });

// Repository mapper — loading existing
const player = Player.reconstitute({
  id: PlayerId.create(record.id),
  name: PlayerName.create(record.displayName),
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});
```

## Checklist

- [ ] Aggregate root identified; child objects accessed only through root
- [ ] Entities have private constructors + factory methods
- [ ] Primitives wrapped in value objects where validation applies
- [ ] Domain errors for every invariant violation
- [ ] No NestJS, Prisma, or HTTP imports in domain
- [ ] Cross-aggregate refs are IDs only
- [ ] Repository port defined with symbol token
- [ ] Mutation methods update `updatedAt` where applicable
- [ ] Unit tests for all invariants and edge cases
- [ ] Game rules traceable to `docs/game-design/` section

## Anti-patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Anemic entities (only getters/setters) | Behavior methods with invariants |
| Public constructors | Factory methods |
| `string` for player ID everywhere | `PlayerId` value object |
| Validation only in DTOs | VO/entity enforces rules |
| `any` or unvalidated `number` for rating | `OverallRating.create()` |
| Entity importing Prisma types | Mapper in infrastructure |
| Two aggregates in one transaction without orchestration | Use case coordinates |
| Domain service for single-entity logic | Put on entity |
| Mutable value objects | New instance on change |
| `reconstitute` running business validations | Only structural integrity on load |
