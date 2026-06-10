# Data Readiness for Rating

## Overall Is Postponed

This sprint imports and inspects football data only. No overall calculation, no cards, no draft.

## Why

Rating formulas need reliable inputs. Guessing overall from incomplete imports produces bad gameplay and hard-to-debug card pools.

## Required Before Overall Design

| Field                 | Required?          | Blocks rating?                    |
| --------------------- | ------------------ | --------------------------------- |
| `primaryPosition`     | Yes                | Yes — position weights            |
| `birthDate` / age     | Yes                | Yes — age curves                  |
| `marketValue`         | Strongly preferred | Yes for market-calibrated tiers   |
| `teamId` / `leagueId` | Preferred          | Chemistry later, not base overall |
| `imageUrl`            | No                 | UI only                           |
| `nationality`         | Preferred          | Chemistry later                   |

## Acceptable Gaps

- Missing images — cards can use placeholders
- Retired/inactive status — exclude from draft pool via `isActive` later
- Secondary positions empty — use primary only initially

## Unacceptable Gaps

- > 20% players missing position or age in target leagues
- Market value missing for most squad players
- Duplicate `(provider, externalId)` rows

## Workflow

1. Run full import pipeline for 8 target competitions
2. Review `/admin/data-quality`
3. Re-run enrichment or retry failed imports
4. When metrics pass internal thresholds → overall algorithm sprint
5. Then base card generation → draft card pool

## What This Sprint Delivers

- ~8 competitions, ~150–200 clubs, ~3,500–5,000 players (target)
- Visibility into missing data
- Distribution charts for market value, age, position
