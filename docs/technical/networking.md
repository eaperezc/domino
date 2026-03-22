# Networking & Real-Time Communication

## WebSocket Protocol

### Connection
- Client connects with game ID and player token
- Server authenticates and adds player to game room
- Heartbeat ping/pong every 30s

### Message Format

```typescript
interface WSMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}
```

### Client → Server Events

| Event            | Payload                          | Description              |
| ---------------- | -------------------------------- | ------------------------ |
| `play_tile`      | `{ tile, end }`                  | Place a tile             |
| `draw_tile`      | `{}`                             | Draw from boneyard       |
| `pass_turn`      | `{}`                             | Pass (when unable to play)|
| `player_ready`   | `{}`                             | Ready up in lobby        |

### Server → Client Events

| Event            | Payload                          | Description              |
| ---------------- | -------------------------------- | ------------------------ |
| `game_state`     | `{ state }`                      | Full state sync          |
| `tile_played`    | `{ playerId, tile, end }`        | A tile was placed        |
| `tile_drawn`     | `{ playerId, tile? }`            | Tile drawn (own tile visible, opponent's hidden) |
| `turn_changed`   | `{ playerId }`                   | Next player's turn       |
| `round_over`     | `{ scores, winner }`             | Round ended              |
| `game_over`      | `{ finalScores, winner }`        | Game ended               |
| `player_joined`  | `{ player }`                     | New player in lobby      |
| `player_left`    | `{ playerId }`                   | Player disconnected      |
| `error`          | `{ message, code }`              | Invalid action           |

## Reconnection Strategy

1. Client detects disconnect
2. Exponential backoff reconnect attempts (1s, 2s, 4s, 8s, max 30s)
3. On reconnect, server sends full game state
4. Grace period of 60s before player is forfeited
