create table if not exists public.video_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  source_url text not null,
  video_id text not null,
  transcript text,
  summary text,
  key_points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_video_summaries_user_id on public.video_summaries(user_id);
create index if not exists idx_video_summaries_class_id on public.video_summaries(class_id);
create index if not exists idx_video_summaries_video_id on public.video_summaries(video_id);

alter table public.video_summaries enable row level security;

create policy if not exists "video summaries owner all"
  on public.video_summaries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
