-- Plant Manager — Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

-- Households (shared homes with invite code)
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Membership: which users belong to which household
create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- Rooms within a household
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Plants
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  name_he text not null,
  watering_interval_days int not null,
  light_notes text,
  care_tips text,
  light_level text,
  image_url text,
  last_watered_at timestamptz,
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null
);

-- Row Level Security
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.rooms enable row level security;
alter table public.plants enable row level security;

-- Helper: is current user a member of this household?
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- households policies
create policy "Members can view their households"
  on public.households for select
  using (public.is_household_member(id));

create policy "Creators can view households they created"
  on public.households for select
  using (auth.uid() = created_by);

create policy "Authenticated users can create households"
  on public.households for insert
  with check (auth.uid() = created_by);

-- household_members policies
create policy "Members can view members of their households"
  on public.household_members for select
  using (public.is_household_member(household_id));

create policy "Users can join or be added to households"
  on public.household_members for insert
  with check (auth.uid() = user_id);

-- rooms policies
create policy "Members can view rooms"
  on public.rooms for select
  using (public.is_household_member(household_id));

create policy "Members can manage rooms"
  on public.rooms for all
  using (public.is_household_member(household_id));

-- plants policies
create policy "Members can view plants"
  on public.plants for select
  using (public.is_household_member(household_id));

create policy "Members can manage plants"
  on public.plants for all
  using (public.is_household_member(household_id));
