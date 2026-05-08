-- ============================================
-- StoreForge — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- STORES table
-- One row per tenant/client store
-- ============================================
create table if not exists stores (
  id              uuid primary key default uuid_generate_v4(),
  admin_name      text not null,
  admin_email     text not null unique,
  password_hash   text not null,
  store_name      text not null,
  slug            text not null unique,
  location        text not null,
  phone           text not null,
  store_type      text not null check (store_type in (
                    'fashion','electronics','food','beauty',
                    'home','sports','books','jewelry','toys','other'
                  )),
  is_active       boolean not null default true,
  custom_domain   text unique,               -- for future: nike.com
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast slug lookups (used on every page visit)
create index if not exists idx_stores_slug on stores(slug);
create index if not exists idx_stores_email on stores(admin_email);
create index if not exists idx_stores_custom_domain on stores(custom_domain);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stores_updated_at
  before update on stores
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table stores enable row level security;

-- Public can read active stores (for the storefront page)
create policy "Public can view active stores"
  on stores for select
  using (is_active = true);

-- Only service role (server) can insert/update/delete
-- (We use supabaseAdmin with service role key for writes)

-- ============================================
-- PRODUCTS table (ready for future use)
-- ============================================
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  store_id    uuid not null references stores(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric(10, 2) not null default 0,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_products_store_id on products(store_id);

alter table products enable row level security;

create policy "Public can view active products"
  on products for select
  using (is_active = true);
