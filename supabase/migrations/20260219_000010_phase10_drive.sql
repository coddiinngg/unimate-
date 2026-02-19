create table if not exists public.drive_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  name text not null,
  path text not null,
  mime_type text,
  size_bytes bigint,
  ai_tags jsonb not null default '[]'::jsonb,
  ai_summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_drive_files_user_id on public.drive_files(user_id);
create index if not exists idx_drive_files_class_id on public.drive_files(class_id);
create index if not exists idx_drive_files_path on public.drive_files(path);

alter table public.drive_files enable row level security;

create policy if not exists "drive files owner all"
  on public.drive_files
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
