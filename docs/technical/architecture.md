# Architecture & Infrastructure

## Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home / landing
│   ├── lobby/[id]/         # Game lobby
│   └── game/[id]/          # Active game
├── components/             # React components
│   ├── board/              # Board renderer (visual layout, positions, rotations)
│   ├── tiles/              # Domino tile rendering (SVG/canvas)
│   ├── lobby/              # Lobby UI
│   └── ui/                 # Shared UI primitives
├── lib/                    # Shared utilities
│   ├── engine/             # Game engine — pure logic, no visual concerns
│   ├── renderer/           # Layout algorithm — converts engine state to positions
│   └── ws/                 # WebSocket client helpers
└── server/                 # Server-side game logic
    ├── game-manager.ts     # Active game orchestration
    └── ws-handler.ts       # WebSocket message handling
```

## Deployment Architecture

### Phase 1 — Simple
- Vercel for Next.js frontend + API routes
- Separate lightweight WS server (e.g., on Railway / Fly.io)
- In-memory game state (acceptable for MVP scale)

### Phase 2 — Scalable
- Redis for shared game state across server instances
- Postgres for persistent data (accounts, stats, history)
- Load balancer with sticky sessions for WS connections

## Key Principles
- **Engine ≠ Renderer**: Game logic is a pure TypeScript module with zero visual concerns. The renderer is a separate layer that reads engine state and computes tile positions/rotations. See [board-rendering.md](./board-rendering.md) for details.
- Same game engine runs on client (for prediction) and server (for authority)
- The renderer can be swapped (SVG, canvas, 3D) without touching game logic
- Minimal external dependencies
