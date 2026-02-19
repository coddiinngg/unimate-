create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  audio_uri text,
  duration_millis int not null default 0,
  transcript text,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_meetings_user_id on public.meetings(user_id);
create index if not exists idx_meetings_class_id on public.meetings(class_id);

alter table public.meetings enable row level security;

create policy if not exists "meetings owner all"
  on public.meetings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
