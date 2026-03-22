# Multiplayer & Matchmaking

## Real-Time Multiplayer

### Connection Flow
1. Player creates or joins a game room
2. WebSocket connection established
3. Server manages game state and broadcasts updates
4. Reconnection handling for dropped connections

### Room Management
- Unique room codes for private games
- Quick match queue for public games
- Host can kick players in lobby
- Game persists briefly if a player disconnects (grace period for reconnect)

### Turn Management
- Server enforces turn order
- Optional turn timer (30s / 60s / unlimited)
- Auto-pass on timeout (after drawing if possible)

## Matchmaking (Phase 2)

- ELO-based rating system
- Match players within similar skill ranges
- Queue with estimated wait time
- Expand search range over time if no match found

## Anti-Cheat

- Server-authoritative: clients never see opponents' tiles
- Move validation on server — invalid moves rejected
- Rate limiting on actions
