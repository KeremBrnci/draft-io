# Data Quality Review

## Why Inspect Before Rating

Overall calculation and card generation depend on complete player attributes. Importing from Transfermarkt produces uneven data:

- Roster endpoints return lightweight rows (no image, limited profile)
- Profile enrichment adds market value, birth date, image
- Some players remain incomplete after enrichment

We review data quality **before** designing the overall algorithm or generating base cards.

## Issue Codes (flag only — never delete)

| Code                             | Condition                                      |
| -------------------------------- | ---------------------------------------------- |
| `MISSING_MARKET_VALUE`           | `marketValue` is null                          |
| `INVALID_MARKET_VALUE`           | Negative or non-finite value                   |
| `MISSING_POSITION`               | Empty, `UNK`, or `UNKNOWN`                     |
| `MISSING_AGE`                    | `birthDate` is null                            |
| `MISSING_IMAGE`                  | `imageUrl` is null                             |
| `MISSING_CLUB`                   | `teamId` is null                               |
| `MISSING_COMPETITION`            | `leagueId` is null                             |
| `DUPLICATE_PROVIDER_EXTERNAL_ID` | More than one row per `(provider, externalId)` |

## API

- `GET /api/v1/admin/data-quality/summary` — counts and distributions
- `GET /api/v1/admin/data-quality/issues` — paginated flagged players

## Breakdowns

Summary includes:

- Players by competition, position, nationality
- Market value distribution buckets
- Age distribution buckets

## Admin UI

`/admin/data-quality` — metrics dashboard and issue browser.

## Next Steps After Review

When summary shows acceptable coverage (market value, age, position), proceed to overall algorithm design. See `data-readiness-for-rating.md`.
