-- Online game lobbies and state
create table public.games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,  -- short join code (e.g. "ABCD")
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'round_over', 'game_over')),
  game_state jsonb,  -- serialized GameState, null until game starts
  target_score int not null default 100,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Seats in a game lobby
create table public.game_seats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  seat text not null check (seat in ('bottom', 'left', 'top', 'right')),
  player_id uuid references auth.users(id) on delete set null,
  player_name text not null,
  team text not null check (team in ('team1', 'team2')),
  is_ai boolean not null default false,
  created_at timestamptz default now() not null,
  unique(game_id, seat),
  unique(game_id, player_id)  -- one seat per player per game
);

-- Indexes
create index idx_games_code on public.games(code);
create index idx_games_owner on public.games(owner_id);
create index idx_game_seats_game on public.game_seats(game_id);

-- RLS
alter table public.games enable row level security;
alter table public.game_seats enable row level security;

-- Games: anyone authenticated can read, owner can update
create policy "Games are readable by authenticated users"
  on public.games for select
  to authenticated
  using (true);

create policy "Authenticated users can create games"
  on public.games for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owner can update their game"
  on public.games for update
  to authenticated
  using (auth.uid() = owner_id);

-- Seats: anyone authenticated can read seats, players can manage their own
create policy "Seats are readable by authenticated users"
  on public.game_seats for select
  to authenticated
  using (true);

create policy "Authenticated users can take a seat"
  on public.game_seats for insert
  to authenticated
  with check (
    is_ai = true
    or auth.uid() = player_id
  );

create policy "Players can leave their seat"
  on public.game_seats for delete
  to authenticated
  using (auth.uid() = player_id);

-- Owner can manage all seats (for AI placement and game start)
create policy "Owner can manage seats"
  on public.game_seats for all
  to authenticated
  using (
    exists (
      select 1 from public.games
      where games.id = game_seats.game_id
      and games.owner_id = auth.uid()
    )
  );

-- Enable realtime for both tables
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.game_seats;

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger games_updated_at
  before update on public.games
  for each row execute function public.update_updated_at();
