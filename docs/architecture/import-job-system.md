# Import Job System

## Purpose

Track football data imports (competition → clubs → players → enrichment) with progress, logs, and retry support.

## Job Model

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `provider` | e.g. `TRANSFERMARKT` |
| `jobType` | `COMPETITION`, `CLUBS`, `PLAYERS`, `ENRICHMENT`, `PIPELINE` |
| `targetCompetition` | Transfermarkt competition code (`GB1`, `L1`, …) |
| `status` | See statuses below |
| `totalRecords` / `processedRecords` / `failedRecords` | Progress counters |
| `startedAt` / `finishedAt` | Timestamps |
| `errorMessage` | Fatal error summary |

## Statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Created, not started |
| `RUNNING` | In progress |
| `COMPLETED` | All records succeeded |
| `PARTIAL` | Finished with some failures |
| `FAILED` | Fatal error — job aborted |

## Related Tables

- `import_job_logs` — step messages (`INFO`, `WARN`, `ERROR`)
- `import_failed_records` — per-record failures for retry

## Pipeline Flow

```
POST /admin/imports/competitions/:id
  1. Import competition (league row)
  2. Import clubs from provider API
  3. Import club rosters
  4. Enrich player profiles (full Transfermarkt profile)
```

Bulk: `POST /admin/imports/target-competitions` runs pipeline for all 8 curated leagues.

## Idempotency

Imports upsert by `(provider, externalId)`. Re-running jobs updates existing rows — safe to retry.

## Retry

`POST /admin/imports/jobs/:id/retry` re-processes unresolved `import_failed_records` from a `PARTIAL` or `FAILED` job.

## Rules

- Gameplay never calls external APIs — only import use cases do
- All imported data stored in PostgreSQL
- Failed records are flagged, not deleted
