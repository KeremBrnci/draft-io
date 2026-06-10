# Architecture Overview

## System Context

draft.io is a football draft and simulation game platform. Users create lobbies, draft player cards, build squads with chemistry bonuses, and simulate matches across leagues and seasons.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │     │ Mobile App  │     │  Admin UI   │
│  (Next.js)  │     │   (future)  │     │   (future)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │ REST / WebSocket
                    ┌──────┴──────┐
                    │   Backend   │
                    │   (NestJS)  │
                    │  Modular    │
                    │  Monolith   │
                    └──┬──────┬───┘
                       │      │
              ┌────────┘      └────────┐
              │                        │
       ┌──────┴──────┐         ┌──────┴──────┐
       │ PostgreSQL  │         │    Redis    │
       │  (Primary)  │         │ Cache/PubSub│
       └─────────────┘         └─────────────┘
```

## Module Architecture

Each backend module is a self-contained bounded context:

```
┌─────────────────────────────────────────────┐
│                  Module                      │
│  ┌─────────────┐                            │
│  │Presentation │  Controllers, DTOs          │
│  └──────┬──────┘                            │
│         │                                    │
│  ┌──────┴──────┐                            │
│  │Application  │  Use Cases, Commands       │
│  └──────┬──────┘                            │
│         │                                    │
│  ┌──────┴──────┐     ┌─────────────┐       │
│  │   Domain    │◄────│Infrastructure│       │
│  │  Entities   │     │ Repositories │       │
│  │  Value Objs │     │   Mappers    │       │
│  │  Ports      │     │  Ext. APIs   │       │
│  └─────────────┘     └─────────────┘       │
└─────────────────────────────────────────────┘
```

## Planned Modules

| Module       | Status      | Description                    |
| ------------ | ----------- | ------------------------------ |
| `auth`       | Placeholder | JWT/session authentication     |
| `users`      | Placeholder | User registration and profiles |
| `players`    | **Example** | Player card management         |
| `formations` | Placeholder | Tactical formation definitions |
| `lobbies`    | Placeholder | Lobby creation and matchmaking |
| `draft`      | Placeholder | Draft room with pick order     |
| `matches`    | Placeholder | Match scheduling and results   |
| `simulation` | Placeholder | Match engine and chemistry     |

## Data Flow Example: Create Player

```
HTTP POST /api/v1/players
        │
        ▼
┌──────────────────┐
│ PlayersController │  Validates CreatePlayerDto
└────────┬─────────┘
         │ CreatePlayerCommand
         ▼
┌──────────────────┐
│CreatePlayerUseCase│  Creates domain Player entity
└────────┬─────────┘
         │ Player entity
         ▼
┌──────────────────────┐
│PrismaPlayerRepository │  Maps to Prisma, persists
└────────┬─────────────┘
         │
         ▼
    PostgreSQL
```

## Realtime Architecture (Future)

```
Client ←──WebSocket──→ Socket.IO Gateway
                            │
                       Redis Pub/Sub
                            │
                    ┌───────┴───────┐
                    │  Backend Pod  │
                    │  Backend Pod  │
                    └───────────────┘
```

Redis pub/sub enables horizontal scaling of WebSocket connections across multiple backend instances.

## Shared Packages

```
@draft-io/shared-types  ──→  API contracts (frontend ↔ backend)
@draft-io/shared-utils  ──→  Pure utilities (all packages)
```

## Key Principles

1. **Domain is king** — Business rules live in domain entities and value objects
2. **Ports and adapters** — Infrastructure implements domain-defined interfaces
3. **Module independence** — Modules communicate through application services or events
4. **Test pyramid** — Heavy unit tests on domain, integration on infrastructure, E2E on API
5. **No premature optimization** — Build for correctness first, scale when needed

## Related Documents

- [Architecture Rules](../standards/architecture-rules.md)
- [Folder Structure](../standards/folder-structure.md)
- [ADR 001: Modular Monolith](../decisions/001-modular-monolith.md)
- [ADR 002: Clean Architecture](../decisions/002-clean-architecture.md)
