-- ============================================
-- FPL (Franchise Premier League) Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── SEASONS ───
create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ─── SPLITS ───
create table splits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season_id uuid references seasons(id) on delete cascade,
  start_date date,
  end_date date,
  sort_order integer default 0,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ─── DIVISIONS ───
create table divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season_id uuid references seasons(id) on delete cascade,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── TEAMS ───
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null,
  color_primary text default '#0e3050',
  color_accent text default '#1a8fc4',
  logo_url text,
  division_id uuid references divisions(id) on delete set null,
  season_id uuid references seasons(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── PLAYERS ───
create table players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  riot_game_name text,
  riot_tag_line text,
  riot_puuid text,
  created_at timestamptz default now()
);

-- ─── ROSTERS ───
create table rosters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  split_id uuid references splits(id) on delete set null,
  role text, -- Top, Jungle, Mid, ADC, Support, Fill, Sub
  is_captain boolean default false,
  is_starter boolean default true,
  left_at timestamptz,
  created_at timestamptz default now()
);

-- ─── MATCHES ───
create table matches (
  id uuid primary key default gen_random_uuid(),
  split_id uuid references splits(id) on delete set null,
  team_blue_id uuid not null references teams(id) on delete cascade,
  team_red_id uuid not null references teams(id) on delete cascade,
  status text default 'scheduled', -- scheduled, live, completed
  scheduled_at timestamptz,
  completed_at timestamptz,
  match_format text default 'bo1', -- bo1, bo3, bo5
  season_phase text default 'Regular', -- Regular, Playoffs
  winner_team_id uuid references teams(id) on delete set null,
  score_blue integer default 0,
  score_red integer default 0,
  created_at timestamptz default now()
);

-- ─── GAMES (individual games within a match) ───
create table games (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  riot_match_id text,
  blue_team_id uuid not null references teams(id),
  red_team_id uuid not null references teams(id),
  winner_team_id uuid references teams(id),
  game_duration integer, -- seconds
  game_started_at timestamptz,
  created_at timestamptz default now()
);

-- ─── PLAYER GAME STATS ───
create table player_game_stats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid references teams(id),
  champion_name text,
  kills integer default 0,
  deaths integer default 0,
  assists integer default 0,
  total_minions_killed integer default 0,
  neutral_minions_killed integer default 0,
  vision_score integer default 0,
  total_damage_dealt_to_champions integer default 0,
  gold_earned integer default 0,
  win boolean default false,
  is_mvp boolean default false,
  created_at timestamptz default now()
);

-- ─── STANDINGS ───
create table standings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  split_id uuid references splits(id) on delete set null,
  wins integer default 0,
  losses integer default 0,
  streak text, -- e.g. 'W3', 'L1'
  created_at timestamptz default now(),
  unique(team_id, split_id)
);

-- ─── PLAYER APPLICATIONS (public sign up form) ───
create table player_applications (
  id uuid primary key default gen_random_uuid(),
  discord_username text not null,
  opgg_link text not null,
  primary_role text not null, -- Top, Jungle, Mid, ADC, Support
  secondary_role text,
  current_rank text not null, -- Platinum 4 through Diamond 1
  peak_rank text not null,
  status text default 'pending', -- pending, approved, denied
  admin_notes text,
  created_at timestamptz default now()
);

-- ─── TWITCH EMBEDS ───
create table twitch_embeds (
  id uuid primary key default gen_random_uuid(),
  embed_type text not null, -- channel, clip, youtube
  channel_name text,
  clip_url text,
  title text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table seasons enable row level security;
alter table splits enable row level security;
alter table divisions enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table rosters enable row level security;
alter table matches enable row level security;
alter table games enable row level security;
alter table player_game_stats enable row level security;
alter table standings enable row level security;
alter table player_applications enable row level security;
alter table twitch_embeds enable row level security;

-- Public read access for all tables (anyone can view)
create policy "Public read" on seasons for select using (true);
create policy "Public read" on splits for select using (true);
create policy "Public read" on divisions for select using (true);
create policy "Public read" on teams for select using (true);
create policy "Public read" on players for select using (true);
create policy "Public read" on rosters for select using (true);
create policy "Public read" on matches for select using (true);
create policy "Public read" on games for select using (true);
create policy "Public read" on player_game_stats for select using (true);
create policy "Public read" on standings for select using (true);
create policy "Public read" on twitch_embeds for select using (true);

-- Player applications: anyone can INSERT (sign up), only admins can read/update
create policy "Anyone can apply" on player_applications for insert with check (true);
create policy "Admins read applications" on player_applications for select using (
  auth.jwt() ->> 'role' = 'admin' or
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admins update applications" on player_applications for update using (
  auth.jwt() ->> 'role' = 'admin' or
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Admin write access (insert, update, delete) for all other tables
-- Checks for admin role in JWT app_metadata
create policy "Admin write" on seasons for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on splits for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on divisions for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on teams for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on players for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on rosters for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on matches for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on games for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on player_game_stats for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on standings for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Admin write" on twitch_embeds for all using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_teams_active on teams(is_active);
create index idx_matches_status on matches(status);
create index idx_matches_scheduled on matches(scheduled_at);
create index idx_rosters_team on rosters(team_id);
create index idx_rosters_player on rosters(player_id);
create index idx_standings_team on standings(team_id);
create index idx_player_stats_player on player_game_stats(player_id);
create index idx_player_stats_game on player_game_stats(game_id);
create index idx_applications_status on player_applications(status);


-- ============================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or via API)
-- ============================================
-- Create these buckets in Supabase Storage:
--   1. team-logos (public)
--   2. articles_images (public) -- can skip if not using articles
--
-- To create via SQL:
-- insert into storage.buckets (id, name, public) values ('team-logos', 'team-logos', true);
