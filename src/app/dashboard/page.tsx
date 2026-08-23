import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { DashboardView } from "@/components/dashboard-view";
import { getUserHousehold, requireUser } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";
import type { Plant } from "@/lib/plants";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const household = await getUserHousehold();
  if (!household) redirect("/setup");

  const supabase = await createClient();
  const [{ data: rooms }, { data: plants }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, name, sort_order")
      .eq("household_id", household.id)
      .order("sort_order"),
    supabase
      .from("plants")
      .select("*")
      .eq("household_id", household.id)
      .order("added_at", { ascending: false }),
  ]);

  return (
    <DashboardView
      householdName={household.name}
      inviteCode={household.invite_code}
      rooms={rooms ?? []}
      plants={(plants ?? []) as Plant[]}
      signOutButton={
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-100"
          >
            התנתקות
          </button>
        </form>
      }
    />
  );
}
