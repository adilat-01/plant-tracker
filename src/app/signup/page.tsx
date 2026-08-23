import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { requireUser } from "@/lib/household";

export default async function SignupPage() {
  const user = await requireUser();
  if (user) redirect("/");

  return <SignupForm />;
}
