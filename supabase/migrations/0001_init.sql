-- Maria's Closet — initial schema.
-- Every table has RLS on and NO policies: Supabase's public (anon/authenticated)
-- API can't read or write anything. The app talks to Postgres server-side only,
-- through its API routes, behind the admin/owner cookie auth.

create table items (
  id            text primary key,
  name          text not null,
  category      text not null default '',
  brand         text,
  size          text not null default '',
  color         text not null default '',
  occasions     text[],
  price_per_day numeric not null default 0,
  retail_value  numeric,
  description   text not null default '',
  details       text[],
  image         text not null default '',
  video         text,
  frames        text[],
  fit           jsonb,
  closet        text,                       -- null = Maria's own closet
  accent        text not null default '#B8B1A3',
  unavailable   jsonb not null default '[]',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index items_closet_sort on items (closet, sort_order);

create table requests (
  id            text primary key,
  item_id       text references items (id) on delete set null,
  item_name     text not null,
  renter_name   text not null,
  contact       text not null,              -- personal data
  from_date     date not null,
  to_date       date not null,
  days          integer not null,
  total         numeric not null,
  message       text,
  method        text,
  referral_code text,
  referred_by   text,
  adjustments   jsonb,                      -- null until rewards are settled
  status        text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at    timestamptz not null default now()
);
create index requests_created on requests (created_at desc);
create index requests_status on requests (status);

create table owners (
  id            text primary key,
  closet        text not null,
  name          text not null,
  email         text not null,              -- personal data
  password_hash text not null,              -- secret
  bio           text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at    timestamptz not null default now()
);
create unique index owners_email on owners (lower(email));
create unique index owners_closet on owners (lower(closet));

create table reviews (
  id         text primary key,
  item_id    text not null references items (id) on delete cascade,
  name       text not null,
  rating     smallint not null check (rating between 1 and 5),
  text       text not null,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_item on reviews (item_id);

create table waitlist (
  id         text primary key,
  item_id    text not null references items (id) on delete cascade,
  item_name  text not null,
  contact    text not null,                 -- personal data
  created_at timestamptz not null default now()
);

create table gift_cards (
  id         text primary key,
  code       text not null unique,
  amount     numeric not null,
  from_name  text not null,
  to_name    text not null,
  message    text,
  created_at timestamptz not null default now()
);

create table lookbook (
  id         text primary key,
  kicker     text not null default '',
  title      text not null default '',
  caption    text not null default '',
  accent     text not null default '#B8B1A3',
  image      text,
  video      text,
  item_id    text references items (id) on delete set null,
  closet     text,                          -- null = Maria's homepage edit
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index lookbook_closet_sort on lookbook (closet, sort_order);

create table referrals (
  code       text primary key,
  name       text not null,
  contact    text not null unique,          -- normalised; personal data
  created_at timestamptz not null default now()
);

create table credits (
  id         text primary key,
  contact    text not null,                 -- normalised; personal data
  amount     numeric not null,
  reason     text not null,
  request_id text references requests (id) on delete set null,
  created_at timestamptz not null default now()
);
create index credits_contact on credits (contact);

create table saves (
  item_id text primary key references items (id) on delete cascade,
  count   integer not null default 0 check (count >= 0)
);

-- Atomic +1/-1 for the anonymous wishlist counter.
create function bump_save(p_item text, p_delta integer) returns void
language sql as $$
  insert into saves (item_id, count) values (p_item, greatest(0, p_delta))
  on conflict (item_id) do update set count = greatest(0, saves.count + p_delta);
$$;

create table settings (
  key        text primary key,              -- 'site' | 'rewards'
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Lock everything down.
do $$
declare t text;
begin
  foreach t in array array['items','requests','owners','reviews','waitlist','gift_cards',
                           'lookbook','referrals','credits','saves','settings'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on all tables in schema public from anon, authenticated;
    revoke all on function bump_save(text, integer) from public, anon, authenticated;
  end if;
end $$;

-- Public media bucket (Supabase only): anyone can view, only the server can sign uploads.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('media', 'media', true, 52428800,
            array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','video/mp4','video/webm'])
    on conflict (id) do update set public = excluded.public,
      file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;
