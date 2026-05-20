-- ============================================================
-- NeuroBase AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- WALLETS
-- ============================================================
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  address text not null unique,
  chain_id integer default 8453, -- Base mainnet
  label text,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  status text default 'active' check (status in ('active', 'cancelled', 'expired')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- CHAT HISTORY
-- ============================================================
create table if not exists public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  session_id uuid default uuid_generate_v4(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

create index if not exists idx_chat_history_user_id on public.chat_history(user_id);
create index if not exists idx_chat_history_session_id on public.chat_history(session_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  wallet_address text not null,
  tx_hash text unique,
  chain_id integer default 8453,
  type text check (type in ('send', 'receive', 'swap', 'approve', 'mint', 'burn')),
  status text default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  from_address text,
  to_address text,
  value_eth text,
  value_usd numeric,
  gas_used text,
  gas_price text,
  block_number bigint,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

create index if not exists idx_transactions_wallet on public.transactions(wallet_address);

-- ============================================================
-- SWAPS
-- ============================================================
create table if not exists public.swaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  wallet_address text not null,
  tx_hash text unique,
  from_token text not null,
  to_token text not null,
  from_amount text not null,
  to_amount text,
  from_amount_usd numeric,
  to_amount_usd numeric,
  price_impact text,
  slippage text,
  gas_cost_usd numeric,
  protocol text default 'aerodrome',
  status text default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamp with time zone default now()
);

-- ============================================================
-- PORTFOLIOS
-- ============================================================
create table if not exists public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  wallet_address text not null,
  snapshot jsonb not null default '[]',
  total_value_usd numeric,
  risk_score integer,
  created_at timestamp with time zone default now()
);

create index if not exists idx_portfolios_user_id on public.portfolios(user_id);

-- ============================================================
-- WATCHLISTS
-- ============================================================
create table if not exists public.watchlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  token_symbol text not null,
  token_address text,
  token_name text,
  chain_id integer default 8453,
  added_at timestamp with time zone default now(),
  unique(user_id, token_symbol)
);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
create table if not exists public.ai_insights (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('market', 'portfolio', 'token', 'risk', 'alpha')),
  title text not null,
  content text not null,
  metadata jsonb default '{}',
  confidence_score integer,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists idx_ai_insights_type on public.ai_insights(type);
create index if not exists idx_ai_insights_expires on public.ai_insights(expires_at);

-- ============================================================
-- MARKET DATA (Cache)
-- ============================================================
create table if not exists public.market_data (
  id uuid default uuid_generate_v4() primary key,
  token_symbol text not null,
  token_address text,
  chain_id integer default 8453,
  price_usd numeric,
  price_change_24h numeric,
  volume_24h_usd numeric,
  market_cap_usd numeric,
  tvl_usd numeric,
  fetched_at timestamp with time zone default now()
);

create index if not exists idx_market_data_symbol on public.market_data(token_symbol);
create index if not exists idx_market_data_fetched on public.market_data(fetched_at);

-- ============================================================
-- NFT DATA
-- ============================================================
create table if not exists public.nft_data (
  id uuid default uuid_generate_v4() primary key,
  collection_address text not null,
  collection_name text,
  chain_id integer default 8453,
  floor_price_eth numeric,
  volume_24h_eth numeric,
  total_supply integer,
  holders integer,
  ai_summary text,
  rarity_data jsonb default '{}',
  fetched_at timestamp with time zone default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('whale_alert', 'price_alert', 'risk_alert', 'ai_insight', 'protocol_update')),
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all user tables
alter table public.users enable row level security;
alter table public.wallets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.chat_history enable row level security;
alter table public.transactions enable row level security;
alter table public.swaps enable row level security;
alter table public.portfolios enable row level security;
alter table public.watchlists enable row level security;
alter table public.notifications enable row level security;

-- Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can view own wallets" on public.wallets
  for all using (auth.uid() = user_id);

create policy "Users can manage own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

create policy "Users can view own chat history" on public.chat_history
  for all using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create policy "Users can view own swaps" on public.swaps
  for all using (auth.uid() = user_id);

create policy "Users can view own portfolios" on public.portfolios
  for all using (auth.uid() = user_id);

create policy "Users can manage own watchlist" on public.watchlists
  for all using (auth.uid() = user_id);

create policy "Users can view own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- Market data and AI insights are public read
create policy "Public can read market data" on public.market_data
  for select using (true);

create policy "Public can read AI insights" on public.ai_insights
  for select using (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at_column();

-- ============================================================
-- SEED DATA (Optional demo data)
-- ============================================================

-- Sample AI insights
insert into public.ai_insights (type, title, content, confidence_score, expires_at) values
('market', 'Base Ecosystem Bullish Momentum', 'The Base ecosystem is showing strong bullish signals with TVL growing 15% week-over-week. AERO and BRETT are leading the charge.', 78, now() + interval '24 hours'),
('alpha', 'Undervalued: Seamless Protocol', 'Seamless Finance V2 launches next week with 40% higher APY rates. Early liquidity providers could benefit significantly.', 71, now() + interval '12 hours'),
('risk', 'High-Risk Alert: New Meme Token Launch', 'Multiple new meme tokens launched today with unverified contracts. Exercise extreme caution before investing.', 85, now() + interval '6 hours');
