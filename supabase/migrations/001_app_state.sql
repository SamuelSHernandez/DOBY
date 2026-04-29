-- DOBY persistent storage.
--
-- One row per user containing the entire DobyState as JSONB. The app
-- already serializes its full state to a single localStorage key, so
-- mirroring that to one column avoids any per-slice schema work and
-- keeps client-side type changes from forcing migrations server-side.

create table public.app_state (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on every change so clients can do
-- last-write-wins comparisons.
create or replace function public.handle_app_state_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_state_updated_at
  before update on public.app_state
  for each row execute function public.handle_app_state_updated_at();

-- RLS: users can only read/write their own row.
alter table public.app_state enable row level security;

create policy "Users own app_state select"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy "Users own app_state insert"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy "Users own app_state update"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own app_state delete"
  on public.app_state for delete
  using (auth.uid() = user_id);
