# Technical Specification: Domino Game Web App

## Overview

Technical architecture and implementation details for the domino game web application.

## Detailed Specifications

- [Architecture & Infrastructure](./technical/architecture.md)
- [Game Engine & State Management](./technical/game-engine.md)
- [Board Rendering & Tile Layout](./technical/board-rendering.md)
- [Networking & Real-Time Communication](./technical/networking.md)
- [Data Models & Storage](./technical/data-models.md)

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Framework      | Next.js (App Router)    |
| Language       | TypeScript              |
| Styling        | Tailwind CSS v4         |
| Real-Time      | WebSockets (TBD: Socket.IO / native WS / Ably / Pusher) |
| State Mgmt     | React state + game engine module |
| Backend        | Next.js API routes / serverless functions |
| Database       | TBD (Postgres / Redis for game state) |
| Deployment     | TBD (Vercel / self-hosted) |
| Package Mgr    | pnpm                    |

## High-Level Architecture

```
┌─────────────┐       WebSocket        ┌──────────────┐
│   Client     │ ◄────────────────────► │  Game Server  │
│  (Next.js)   │                        │  (WS + API)   │
└─────────────┘                        └──────┬───────┘
                                              │
                                       ┌──────▼───────┐
                                       │   Database    │
                                       └──────────────┘
```

## Key Technical Decisions

- **Server-authoritative game logic**: All moves validated server-side to prevent cheating
- **Optimistic UI updates**: Client predicts valid moves for responsiveness, server confirms
- **Stateless API routes** for lobby/matchmaking; **stateful WebSocket** connections for in-game play

## Non-Functional Requirements

- Latency: Move acknowledgement < 100ms (p95)
- Concurrent games: Support 100+ simultaneous games at launch
- Mobile-first responsive design
- Accessible (WCAG 2.1 AA)
