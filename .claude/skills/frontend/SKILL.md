---
name: frontend
description: >-
  Builds draft.io Next.js 15 frontend — App Router, API client, shared types,
  Server/Client Components, and Playwright e2e. Use when creating pages, UI
  components, API integration, client state, or frontend tests.
---

# Frontend

## Governance

Use during implementation (lifecycle Step 5). Subordinate to `ai-constitution.md` and `workflow.mdc`.

| Document | Path |
|----------|------|
| AI Constitution | `docs/architecture/ai-constitution.md` |
| Workflow | `.cursor/rules/workflow.mdc` |
| Universal instructions | `AGENTS.md` |
| Project context | `.claude/skills/project-context/SKILL.md` |

## Purpose

Guide development of the **draft.io** Next.js 15 frontend (`apps/frontend`) as a presentation layer that consumes the NestJS backend API. The frontend displays draft rooms, player browsers, team builders, and match results — it does not own business rules.

## When to use

- Creating pages, layouts, or UI components
- Integrating with backend REST APIs
- Choosing Server vs Client Components
- Adding frontend unit tests (Vitest) or e2e tests (Playwright)
- Sharing types with backend via `@draft-io/shared-types`
- Building real-time UI (Socket.IO client — future phases)

## Required inputs

1. **User journey** — Which screen or flow? (player browser, draft board, lobby, match viewer)
2. **API endpoints** — Existing or planned backend routes
3. **Data freshness** — Static, SSR, client-fetched, or real-time?
4. **Interactivity** — Does it need client-side state, timers, or WebSocket?
5. **Design reference** — Mockups, Figma, or game-design doc constraints

## Rules

### Project structure

```
apps/frontend/src/
├── app/                    # App Router pages and layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── lib/
    └── api/                # HTTP client and API functions
        ├── client.ts
        └── client.test.ts
```

Expand with feature folders as the app grows:

```
src/
├── app/(game)/draft/[id]/page.tsx
├── components/             # Reusable UI components
├── features/               # Feature-specific modules (draft, lobby, players)
└── lib/api/                # Typed API functions per resource
```

### API integration

- All HTTP calls go through `lib/api/client.ts` (or extensions thereof)
- Use `@draft-io/shared-types` for response shapes (`ApiOperationResult<T>`)
- Backend base URL from environment: `NEXT_PUBLIC_API_URL`
- Handle errors explicitly — map HTTP status to user-facing messages
- Never import from `apps/backend/src/` — API is the only boundary

```typescript
// lib/api/players.ts
import { apiClient } from './client';
import type { PlayerResponse } from '@draft-io/shared-types';

export async function listPlayers(): Promise<PlayerResponse[]> {
  const res = await apiClient.get<{ data: PlayerResponse[] }>('/players');
  return res.data;
}
```

### Server vs Client Components

| Use Server Component | Use Client Component (`'use client'`) |
|---------------------|-------------------------------------|
| Data fetching on render | onClick, onChange handlers |
| SEO-critical content | useState, useEffect, useRef |
| No interactivity | Browser APIs (localStorage, WebSocket) |
| Initial page load | Animations, drag-and-drop (draft board) |

- Default to Server Components
- Push `'use client'` to leaf components (buttons, timers, draft pick cards)
- Pass serializable props from server to client components

### Styling

- `globals.css` for base styles and CSS variables
- Prefer CSS modules or co-located styles matching existing patterns
- Design tokens for game UI (card rarity, position colors, chemistry indicators) — define centrally when UI expands

### State management

- **Server state:** fetch in Server Components or use React `cache()` for deduplication
- **Client state:** `useState` / `useReducer` for local UI; avoid global state until needed
- **Real-time (future):** Socket.IO client in a client provider; optimistic UI for draft picks
- Backend remains source of truth — refetch or sync on WebSocket events

### Testing

- **Unit:** Vitest for pure functions, API client mocks (`client.test.ts` pattern)
- **E2e:** Playwright in `apps/frontend` — `pnpm test:e2e`
- Test user-visible behavior, not implementation details

### Monorepo scripts

```bash
pnpm dev:frontend          # Next.js dev server :3000
pnpm --filter @draft-io/frontend typecheck
pnpm --filter @draft-io/frontend test:unit
pnpm --filter @draft-io/frontend test:e2e
```

## Examples

### Example 1: Player browser page (Server Component)

```tsx
// app/players/page.tsx
import { listPlayers } from '@/lib/api/players';

export default async function PlayersPage() {
  const players = await listPlayers();
  return (
    <main>
      <h1>Players</h1>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.displayName} — {p.position} ({p.overallRating})</li>
        ))}
      </ul>
    </main>
  );
}
```

### Example 2: Draft pick timer (Client Component)

```tsx
'use client';
import { useEffect, useState } from 'react';

export function PickTimer({ deadline, onExpire }: { deadline: Date; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);
  return <span>{secondsLeft}s</span>;
}
```

### Example 3: API error handling

```typescript
export async function getPlayer(id: string): Promise<PlayerResponse | null> {
  try {
    const res = await apiClient.get<{ data: PlayerResponse }>(`/players/${id}`);
    return res.data;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}
```

## Checklist

- [ ] No imports from `apps/backend`
- [ ] API types from `@draft-io/shared-types` or generated from backend DTOs
- [ ] Server Component by default; `'use client'` only where needed
- [ ] Loading and error UI for async data
- [ ] Environment variables prefixed `NEXT_PUBLIC_` for client exposure
- [ ] Accessible markup (labels, keyboard nav for draft actions)
- [ ] Unit tests for API helpers and pure UI logic
- [ ] Playwright e2e for critical flows when UI stabilizes
- [ ] `typecheck` and `lint` pass
- [ ] No business rules duplicated from backend (display formatting only)

## Anti-patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Fetching API in every child component | Fetch at page/layout level, pass props |
| `'use client'` on entire pages | Leaf client components only |
| Hardcoded `http://localhost:3001` | `NEXT_PUBLIC_API_URL` env var |
| Duplicating position validation logic | Trust backend; show backend error messages |
| Importing Prisma or NestJS types | Use shared-types package |
| Global Redux for two screens | Local state until complexity warrants |
| Skipping loading states | Skeleton or spinner during fetch |
| Inline fetch without error boundary | Centralized API client with typed errors |
| Storing authoritative draft state only in client | Sync with server/WebSocket |
| CSS-in-JS library without team consensus | Match existing `globals.css` approach |
