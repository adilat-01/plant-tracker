-- Ensure plants can be updated by household members
-- (fixes silent watering update failures)

drop policy if exists "Members can manage plants" on public.plants;
drop policy if exists "Members can update plants" on public.plants;
drop policy if exists "Members can insert plants" on public.plants;
drop policy if exists "Members can delete plants" on public.plants;

create policy "Members can insert plants"
  on public.plants for insert
  with check (public.is_household_member(household_id));

create policy "Members can update plants"
  on public.plants for update
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "Members can delete plants"
  on public.plants for delete
  using (public.is_household_member(household_id));
