# Naming Conventions

## General Rules

- **English only** for code, comments, and documentation
- **camelCase** for variables, functions, methods, and properties
- **PascalCase** for classes, interfaces, types, and enums
- **SCREAMING_SNAKE_CASE** for constants and DI tokens
- **kebab-case** for file names (except class files which use dot notation)

## TypeScript

### Classes

```typescript
class Player extends Entity<PlayerId> { ... }
class CreatePlayerUseCase { ... }
class PrismaPlayerRepository implements PlayerRepositoryPort { ... }
```

### Interfaces

Prefer `interface` for object shapes. Suffix ports with `Port`:

```typescript
interface PlayerRepositoryPort { ... }
interface CreatePlayerCommand { ... }
```

### Types

```typescript
type PlayerPositionValue = 'GK' | 'CB' | 'ST';
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

### Constants and DI Tokens

```typescript
export const PLAYER_REPOSITORY = Symbol('PLAYER_REPOSITORY');
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const MAX_DISPLAY_NAME_LENGTH = 100;
const MIN_RATING = 1;
```

### Functions and Methods

Use verb phrases:

```typescript
function createPlayer(props: CreatePlayerProps): Player { ... }
async function execute(command: CreatePlayerCommand): Promise<Player> { ... }
static toDomain(record: PrismaPlayer): Player { ... }
static fromDomain(player: Player): PlayerResponseDto { ... }
```

## Database (Prisma)

- **Models**: PascalCase singular (`Player`, `League`)
- **Table names**: snake_case plural via `@@map` (`players`, `leagues`)
- **Columns**: snake_case via `@map` (`display_name`, `overall_rating`)

```prisma
model Player {
  displayName   String @map("display_name")
  overallRating Int    @map("overall_rating")
  @@map("players")
}
```

## API Endpoints

- **Base prefix**: `/api/v1`
- **Resources**: plural nouns, kebab-case (`/players`, `/draft-rooms`)
- **Actions**: HTTP verbs, not verb URLs (`POST /players`, not `POST /createPlayer`)

## Redis Keys

Use colon-separated namespaces with hash tags for cluster compatibility:

```
draft:lobby:{lobbyId}:state
draft:draft:{draftId}:picks
draft:cache:player:{playerId}
```

## Environment Variables

- **SCREAMING_SNAKE_CASE**
- Prefix public frontend vars with `NEXT_PUBLIC_`

```
DATABASE_URL
REDIS_HOST
NEXT_PUBLIC_API_URL
```

## Git

See [git-workflow.md](./git-workflow.md) for branch and commit conventions.

### Branches

```
feature/DRAFT-123-add-player-search
fix/DRAFT-456-draft-timer-race-condition
chore/update-dependencies
docs/architecture-overview
```

### Commits (Conventional Commits)

```
feat(players): add create player use case
fix(draft): resolve timer desync on reconnect
docs(architecture): add modular monolith ADR
test(players): add overall rating validation tests
chore(deps): update prisma to 6.9.0
refactor(players): extract player mapper
ci: add integration test workflow
```

## Test Descriptions

```typescript
describe('Player', () => {
  it('creates a valid player with trimmed display name', () => { ... });
  it('rejects empty display names', () => { ... });
});
```

Use present tense, describe behavior not implementation.

## Package Names

```
@draft-io/backend
@draft-io/frontend
@draft-io/shared-types
@draft-io/shared-utils
```
