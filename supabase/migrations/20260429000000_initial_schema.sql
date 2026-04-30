-- clippt v2 — Initial schema
-- Phase 1a (BEN-294)
--
-- Tables: users, urls, saves, user_follows, tag_follows
-- Auth: RLS via app.current_user_id session variable (demo = 'ben')
-- Indexes: short_id lookups, foreign keys, common query patterns

-- ─── Extensions ────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── Users ─────────────────────────────────────

create table public.users (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,
  display_name text not null,
  avatar_url  text,
  identity_line text,
  joined_at   timestamptz not null default now()
);

comment on table public.users is 'Fictitious user roster for the v2 demo. 8 curated personas + Ben.';

-- ─── URLs ──────────────────────────────────────

create table public.urls (
  id              uuid primary key default gen_random_uuid(),
  short_id        text not null unique,
  url             text not null unique,
  title           text,
  description     text,
  og_image_url    text,
  skill_count     int,
  tag_suggestions jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.urls is 'Canonical URL records. Each unique URL gets one row with a base62 short_id for /url/[id] routes.';
comment on column public.urls.short_id is 'Base62 8-char nanoid. Used in /url/[id] route.';
comment on column public.urls.skill_count is 'Number of SKILL.md patterns found in repo (GitHub URLs only). Populated async.';
comment on column public.urls.tag_suggestions is 'Cached Haiku-generated tag suggestions. JSON array of strings. TTL 7 days.';

-- ─── Saves ─────────────────────────────────────

create table public.saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  url_id      uuid not null references public.urls(id) on delete cascade,
  notes       text not null default '',
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.saves is 'A save is an index entry: one user bookmarking one URL with notes and tags.';
comment on column public.saves.tags is 'Free-form user-generated tags. Lowercase, hyphenated. No controlled vocabulary.';

-- ─── User Follows ──────────────────────────────

create table public.user_follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  followed_id uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),

  unique (follower_id, followed_id),
  check (follower_id != followed_id)
);

comment on table public.user_follows is 'Asymmetric user follows (Twitter-style, not mutual).';

-- ─── Tag Follows ───────────────────────────────

create table public.tag_follows (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  tag         text not null,
  created_at  timestamptz not null default now(),

  unique (user_id, tag)
);

comment on table public.tag_follows is 'Users can follow tags. Manifests on /tag/[tag] hero, profile "tags you follow" section, and smart-tag suggestion priority weighting.';

-- ─── Indexes ───────────────────────────────────

-- URL lookups by short_id (covered by unique constraint, but explicit for clarity)
-- urls.short_id unique constraint already creates an index

-- Save queries by user (profile pages, network feed)
create index idx_saves_user_id on public.saves(user_id);

-- Save queries by URL (chorus page)
create index idx_saves_url_id on public.saves(url_id);

-- Save ordering by date (recent feeds)
create index idx_saves_created_at on public.saves(created_at desc);

-- Popular this week query
create index idx_saves_created_at_url on public.saves(created_at desc, url_id);

-- Follow lookups
create index idx_user_follows_follower on public.user_follows(follower_id);
create index idx_user_follows_followed on public.user_follows(followed_id);
create index idx_tag_follows_user on public.tag_follows(user_id);
create index idx_tag_follows_tag on public.tag_follows(tag);

-- GIN index on saves.tags for tag-based queries (e.g. WHERE tags @> ARRAY['tag'])
-- Not needed at v2 scale (~250 rows). Uncomment when row count exceeds ~10k.
-- create index idx_saves_tags_gin on public.saves using gin(tags);

-- ─── RLS ───────────────────────────────────────
--
-- Demo auth model: app.current_user_id is set as a Postgres session
-- variable at the start of each request. In v2 this is always 'ben'.
-- In v3, it comes from the Supabase Auth JWT.
--
-- Read access is public (demo product, no private data).
-- Write access is scoped to the current user.

alter table public.users enable row level security;
alter table public.urls enable row level security;
alter table public.saves enable row level security;
alter table public.user_follows enable row level security;
alter table public.tag_follows enable row level security;

-- Users: everyone can read, no one creates users via API (seed only)
create policy "Users are publicly readable"
  on public.users for select
  using (true);

-- URLs: everyone can read, anyone can insert (created as side effect of saving)
create policy "URLs are publicly readable"
  on public.urls for select
  using (true);

create policy "URLs can be created by authenticated context"
  on public.urls for insert
  with check (true);

create policy "URLs can be updated by authenticated context"
  on public.urls for update
  using (true);

-- Saves: everyone can read, only the save owner can insert/update/delete
create policy "Saves are publicly readable"
  on public.saves for select
  using (true);

create policy "Users can create their own saves"
  on public.saves for insert
  with check (
    user_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

create policy "Users can update their own saves"
  on public.saves for update
  using (
    user_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

create policy "Users can delete their own saves"
  on public.saves for delete
  using (
    user_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

-- User follows: everyone can read, only the follower can create/delete
create policy "User follows are publicly readable"
  on public.user_follows for select
  using (true);

create policy "Users can follow others"
  on public.user_follows for insert
  with check (
    follower_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

create policy "Users can unfollow others"
  on public.user_follows for delete
  using (
    follower_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

-- Tag follows: everyone can read, only the user can create/delete
create policy "Tag follows are publicly readable"
  on public.tag_follows for select
  using (true);

create policy "Users can follow tags"
  on public.tag_follows for insert
  with check (
    user_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

create policy "Users can unfollow tags"
  on public.tag_follows for delete
  using (
    user_id = (
      select id from public.users
      where handle = current_setting('app.current_user_handle', true)
    )
  );

-- ─── Demo auth RPC ─────────────────────────────
--
-- Called at the start of each server-side request to set the
-- current user context for RLS policies. In v3 this is replaced
-- by Supabase Auth JWT claims.

create or replace function public.set_current_user(handle text)
returns void as $$
begin
  perform set_config('app.current_user_handle', handle, true);
end;
$$ language plpgsql security definer;

-- ─── Updated-at trigger ────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_urls_updated_at
  before update on public.urls
  for each row execute function public.set_updated_at();

create trigger set_saves_updated_at
  before update on public.saves
  for each row execute function public.set_updated_at();
