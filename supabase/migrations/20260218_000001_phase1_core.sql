create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  university text,
  major text,
  grade text,
  created_at timestamptz not null default now()
);

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  name text not null,
  professor text,
  location text,
  color text not null default '#60A5FA',
  created_at timestamptz not null default now()
);

create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  weekday text not null check (weekday in ('Mon', 'Tue', 'Wed', 'Thu', 'Fri')),
  start_hour int not null check (start_hour between 0 and 23),
  end_hour int not null check (end_hour between 1 and 24),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.classes enable row level security;
alter table public.timetable_slots enable row level security;

create policy if not exists "profiles owner all"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "semesters owner all"
  on public.semesters
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "classes owner all"
  on public.classes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "slots owner all"
  on public.timetable_slots
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
