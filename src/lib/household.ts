import { createClient } from "@/lib/supabase/server";

export type Household = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

export async function getUserHousehold(): Promise<Household | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("household_members")
    .select("households(id, name, invite_code, created_at)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data?.households) return null;

  const household = data.households as unknown as Household;
  return household;
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return user;
}
