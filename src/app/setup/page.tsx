import { redirect } from "next/navigation";
import { SetupForm } from "@/components/setup-form";
import { getUserHousehold, requireUser } from "@/lib/household";

export default async function SetupPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const household = await getUserHousehold();
  if (household) redirect("/dashboard");

  return <SetupForm />;
}
