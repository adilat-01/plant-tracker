-- Add light level to plants
-- Run in Supabase SQL Editor

alter table public.plants
  add column if not exists light_level text;

alter table public.plants
  drop constraint if exists plants_light_level_check;

alter table public.plants
  add constraint plants_light_level_check
  check (
    light_level is null
    or light_level in ('direct_sun', 'filtered_sun', 'bright_indirect', 'shade')
  );
