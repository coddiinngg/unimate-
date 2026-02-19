create table if not exists public.scheduler_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  event_type text not null check (event_type in ('class', 'assignment', 'exam', 'meeting', 'personal')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_scheduler_events_user_id on public.scheduler_events(user_id);
create index if not exists idx_scheduler_events_class_id on public.scheduler_events(class_id);
create index if not exists idx_scheduler_events_date on public.scheduler_events(date);

alter table public.scheduler_events enable row level security;

create policy if not exists "scheduler events owner all"
  on public.scheduler_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
