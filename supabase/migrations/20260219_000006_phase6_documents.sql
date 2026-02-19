create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_class_id on public.documents(class_id);

alter table public.documents enable row level security;

create policy if not exists "documents owner all"
  on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
