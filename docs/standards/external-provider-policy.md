# External Provider Policy

## Shared Kernel

`ExternalProvider` lives in:

- Backend: `apps/backend/src/core/external-reference/external-provider.ts`
- API contracts: `@draft-io/shared-types`

Supported values: `SPORTDB`, `TRANSFERMARKT`, `SPORTMONKS`, `API_FOOTBALL`, `SOFASCORE`.

## Dependency Rules

| Module                                 | May import `ExternalProvider` | Must NOT import         |
| -------------------------------------- | ----------------------------- | ----------------------- |
| `players` / `teams` / `leagues` domain | Yes (from core)               | `data-providers`        |
| `data-providers`                       | Yes (from core)               | Feature domain entities |
| `core`                                 | —                             | Any feature module      |

`data-providers/domain/enums/data-provider.enum.ts` re-exports a deprecated `DataProvider` alias for backward compatibility inside the data-providers module only.

## External ID Policy

- External IDs are **not** primary keys.
- Internal UUID (`id`) is the game-owned identifier used in drafts, teams, and references.
- `(provider, externalId)` is unique in PostgreSQL for idempotent imports.
- Provider IDs may change format or collide across providers — never use them as sole identity.

## Why Data Is Imported First

Gameplay reads **PostgreSQL only**. External APIs are used during admin import, not during draft, match simulation, or lobby flows. This ensures:

- Predictable latency during gameplay
- No rate-limit surprises mid-match
- Game-owned overall ratings (never trusted from provider hints)
- Offline-capable data after import

## Import Idempotency

Re-importing the same `(provider, externalId)` **updates** the existing row:

- Player: refreshes provider fields; preserves `MANUAL_OVERRIDE` overall
- Team: refreshes name/country/logo; preserves squad/game fields
- League: refreshes search-derived metadata

No duplicate rows are created.
