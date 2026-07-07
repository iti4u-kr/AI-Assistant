-- AI Assistant 플랫폼: MVP 스키마
-- Supabase SQL Editor에 그대로 붙여넣어 실행하세요.

create table if not exists public.assistants (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  name text not null default '새 어시스턴트',
  description text not null default '',
  provider text not null default 'anthropic',        -- anthropic | openai | google
  model text not null default 'claude-sonnet-4-6',
  system_prompt text not null default '',
  temperature double precision not null default 0.7,
  is_published boolean not null default false,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assistants enable row level security;

-- 소유자: 전체 권한
create policy "owner_all" on public.assistants
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- 게시된 어시스턴트: 누구나 조회 가능 (공개 채팅 페이지용)
create policy "public_read_published" on public.assistants
  for select using (is_published = true);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assistants_touch on public.assistants;
create trigger trg_assistants_touch
  before update on public.assistants
  for each row execute function public.touch_updated_at();
