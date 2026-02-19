create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  prompt text not null,
  style text,
  image_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_designs_user_id on public.designs(user_id);
create index if not exists idx_designs_class_id on public.designs(class_id);

alter table public.designs enable row level security;

create policy if not exists "designs owner all"
  on public.designs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
