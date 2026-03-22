-- Ensure full row data is sent on Realtime updates (not just the changed columns)
alter table public.games replica identity full;
alter table public.game_seats replica identity full;
