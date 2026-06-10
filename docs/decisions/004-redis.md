# ADR 004: Redis for Cache and Pub/Sub

## Status

Accepted

## Date

2026-06-09

## Context

draft.io requires real-time features (lobby state, draft room updates, live match events) and performance optimization (caching player cards, session data). We need a fast in-memory data store with pub/sub capabilities.

Options considered:

1. **Redis** — In-memory, pub/sub, data structures, mature
2. **Memcached** — Simple caching only, no pub/sub
3. **PostgreSQL LISTEN/NOTIFY** — Built-in but limited throughput

## Decision

Use **Redis 7** for caching, session storage, and pub/sub messaging.

## Rationale

- **Pub/Sub** — Essential for real-time draft room updates and lobby state synchronization
- **Socket.IO adapter** — Redis adapter enables horizontal scaling of WebSocket connections (future)
- **Data structures** — Sorted sets for leaderboards, hashes for lobby state, lists for draft queues
- **TTL support** — Automatic expiration for session data and cache entries
- **Performance** — Sub-millisecond reads for hot data (player cards, formation templates)
- **Proven at scale** — Used by Discord, Twitter, and gaming platforms for real-time features

## Usage Patterns

| Pattern | Redis Feature | Example |
|---------|--------------|---------|
| Draft room state | Hash | `draft:room:{id}:state` |
| Pick queue | List | `draft:room:{id}:queue` |
| Lobby pub/sub | Pub/Sub | `lobby:{id}:events` |
| Player card cache | String (JSON) | `cache:player:{id}` with TTL |
| Session storage | Hash with TTL | `session:{token}` |
| Leaderboard | Sorted Set | `league:{id}:standings` |

## Key Naming Convention

```
{namespace}:{entity}:{id}:{attribute}
```

Use hash tags `{id}` for cluster slot affinity on multi-key operations.

## Consequences

### Positive

- Enables real-time features without polling
- Reduces database load via caching
- Socket.IO horizontal scaling path
- Rich data structures for game state

### Negative

- Additional infrastructure to manage
- Cache invalidation complexity
- Data loss risk on restart (mitigated by persistence config for critical state)
- Not a source of truth — PostgreSQL remains authoritative

## Infrastructure

- **Local**: Docker Compose (`redis:7-alpine`)
- **Production**: TBD (Upstash, ElastiCache, or self-hosted)

## Rules

- PostgreSQL is always the source of truth
- Redis state must be reconstructable from PostgreSQL
- Set TTL on all cache keys
- Use pub/sub for notifications, not state persistence
