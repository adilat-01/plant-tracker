import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { requireUser } from "@/lib/household";

export default async function LoginPage() {
  const user = await requireUser();
  if (user) redirect("/");

  return <LoginForm />;
}
