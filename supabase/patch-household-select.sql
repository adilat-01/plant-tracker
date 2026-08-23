-- Run once if household creation failed before the code fix
create policy "Creators can view households they created"
  on public.households for select
  using (auth.uid() = created_by);
