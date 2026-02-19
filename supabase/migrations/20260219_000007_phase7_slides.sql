create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  topic text not null,
  slides_json jsonb not null default '[]'::jsonb,
  source_outline text,
  created_at timestamptz not null default now()
);

create index if not exists idx_slides_user_id on public.slides(user_id);
create index if not exists idx_slides_class_id on public.slides(class_id);

alter table public.slides enable row level security;

create policy if not exists "slides owner all"
  on public.slides
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
