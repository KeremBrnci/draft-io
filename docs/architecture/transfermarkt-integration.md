# Transfermarkt Integration

## Data Ownership

Transfermarkt is a **data source only**. PostgreSQL is the source of truth for gameplay.

```
Transfermarkt API → Import Pipeline → PostgreSQL → Game Systems
```

Gameplay must never call Transfermarkt directly.

## Authentication

| Variable | Required | Default |
|----------|----------|---------|
| `TRANSFERMARKT_API_KEY` | No (felipeall fly.dev is keyless) | — |
| `TRANSFERMARKT_BASE_URL` | No | `https://transfermarkt-api.fly.dev` |
| `TRANSFERMARKT_RPS_LIMIT` | No | `2` |
| `TRANSFERMARKT_TIMEOUT_MS` | No | `10000` |
| `TRANSFERMARKT_RETRY_ATTEMPTS` | No | `2` |

The public [felipeall/transfermarkt-api](https://github.com/felipeall/transfermarkt-api) deployment does **not** require an API key. `TRANSFERMARKT_API_KEY` is optional (for private gateways that use `X-API-Key`). Countries are bootstrapped from a local seed list because the upstream API has no `/countries` endpoint.

## Import Order

1. **Countries** — `POST /admin/imports/countries/import`
2. **Competitions** — per country: `POST /admin/imports/competitions/import`
3. **Clubs** — search + import team
4. **Players** — search/import individual or `clubs/import-players` for full roster
5. **Profile sync** — `POST /admin/imports/players/sync-profile` enriches market value, positions, nationality

## External ID Policy

- Internal UUID is always the primary key
- `provider = TRANSFERMARKT`, `externalId` = Transfermarkt numeric ID (e.g. `28003`)
- Unique constraint on `(provider, externalId)` — re-import updates in place

## Player Overall

Transfermarkt imports set `overall = null` and `overallSource = null`. No placeholder rating. The overall engine will assign ratings in a later phase.

## Market Value

Stored as numeric EUR cents/value from API (integer). Currency in `marketValueCurrency` (default `EUR`). Not used for gameplay yet.

## Admin UI

Frontend: `/admin/imports` — tabs for Countries, Competitions, Clubs, Players.

## Idempotency

All import use cases upsert by `(provider, externalId)`. Manual overall overrides are preserved on player re-import when set.
