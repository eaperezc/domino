# Data Models & Storage

## Phase 1 — In-Memory

Game state lives entirely in server memory. No persistence needed for MVP.

- Games are ephemeral — lost on server restart
- Player identity via local storage token
- Acceptable for small-scale testing and MVP

## Phase 2 — Persistent Storage

### Redis (Game State Cache)
- Active game state stored in Redis for multi-instance support
- TTL on game keys (auto-cleanup of abandoned games)
- Pub/sub for cross-instance WS message routing

### Postgres (Persistent Data)

```sql
-- Players
CREATE TABLE players (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email       TEXT UNIQUE,
  elo_rating  INT DEFAULT 1200,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Games (completed)
CREATE TABLE games (
  id          UUID PRIMARY KEY,
  variant     TEXT NOT NULL DEFAULT 'draw',
  player_count INT NOT NULL,
  winner_id   UUID REFERENCES players(id),
  target_score INT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Game participants
CREATE TABLE game_players (
  game_id     UUID REFERENCES games(id),
  player_id   UUID REFERENCES players(id),
  final_score INT,
  PRIMARY KEY (game_id, player_id)
);
```
