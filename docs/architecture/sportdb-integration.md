# SportDB Integration

## Authentication

SportDB requests use the `X-API-Key` header.

| Variable | Required | Default |
|----------|----------|---------|
| `SPORTDB_API_KEY` | Yes (for live calls) | — |
| `SPORTDB_BASE_URL` | No | `https://api.sportdb.dev/api/flashscore` |
| `SPORTDB_RPS_LIMIT` | No | `2` (conservative vs free-tier 3 RPS) |
| `SPORTDB_TIMEOUT_MS` | No | `10000` |
| `SPORTDB_RETRY_ATTEMPTS` | No | `2` |

If `SPORTDB_API_KEY` is missing, the application still boots in development/test. SportDB calls fail with `ProviderConfigurationError`.

## Supported Routes

| Operation | Route |
|-----------|-------|
| Player search | `GET /search?q={query}&type=player` |
| Team search | `GET /search?q={query}&type=team` |
| Competition search | `GET /search?q={query}&type=competition` |
| Player detail | `GET /player/{playerSlug}/{playerId}` |
| Team detail | `GET /team/{teamSlug}/{teamId}` |

Competition detail routes are path-dependent (country/competition segments). League import currently maps **search results only**.

## HTTP Client

`SportDbHttpClient` (`data-providers/infrastructure/sportdb/http/`) provides:

- Base URL resolution
- API key header injection
- Token-bucket rate limiting
- Timeout via `AbortController`
- Retries for network errors, timeouts, HTTP 429, HTTP 500–599
- No retry for 400, 401, 403, 404

## Admin API

Routes under `/api/v1/admin/imports` (auth to be added):

- `POST .../players/search`
- `POST .../players`
- `POST .../teams/search`
- `POST .../teams`
- `POST .../leagues/search`

Controllers return presentation DTOs only — no domain entity leakage.

## Manual Smoke Test

```bash
SPORTDB_API_KEY=... pnpm --filter @draft-io/backend sportdb:smoke
```

Skipped when API key is absent. Not run in CI.

## Fixtures

Unit tests use JSON fixtures in `apps/backend/test/fixtures/sportdb/`. No live API in CI.
