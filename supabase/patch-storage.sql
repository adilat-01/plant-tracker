-- Plant Manager — Supabase Storage for plant images
-- Run in: Supabase Dashboard → SQL Editor

insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do update set public = true;

create or replace function public.storage_household_id(object_path text)
returns uuid
language sql
immutable
as $$
  select split_part(object_path, '/', 1)::uuid;
$$;

create policy "Household members can upload plant images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'plant-images'
    and public.is_household_member(public.storage_household_id(name))
  );

create policy "Household members can update plant images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'plant-images'
    and public.is_household_member(public.storage_household_id(name))
  );

create policy "Household members can delete plant images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'plant-images'
    and public.is_household_member(public.storage_household_id(name))
  );

create policy "Anyone can view plant images"
  on storage.objects for select
  to public
  using (bucket_id = 'plant-images');
