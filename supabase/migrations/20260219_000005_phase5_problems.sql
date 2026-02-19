create table if not exists public.problem_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  topic text not null,
  generated_raw text,
  created_at timestamptz not null default now()
);

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.problem_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  answer text,
  explanation text,
  sort_order int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.problem_attempts (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.problem_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score int not null default 0,
  feedback text,
  created_at timestamptz not null default now()
);

create index if not exists idx_problem_sets_user_id on public.problem_sets(user_id);
create index if not exists idx_problem_sets_class_id on public.problem_sets(class_id);
create index if not exists idx_problems_set_id on public.problems(set_id);
create index if not exists idx_problem_attempts_set_id on public.problem_attempts(set_id);

alter table public.problem_sets enable row level security;
alter table public.problems enable row level security;
alter table public.problem_attempts enable row level security;

create policy if not exists "problem sets owner all"
  on public.problem_sets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "problems owner all"
  on public.problems
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "problem attempts owner all"
  on public.problem_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
