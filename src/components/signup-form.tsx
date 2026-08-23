"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import {
  AuthFooterLink,
  AuthShell,
  FormError,
  FormSuccess,
  SubmitButton,
  TextField,
} from "@/components/auth-ui";

export function SignupForm() {
  const [state, action, pending] = useActionState(
    async (
      _prev: { error?: string; success?: string } | null,
      formData: FormData
    ) => signUp(formData),
    null
  );

  return (
    <AuthShell title="הרשמה" subtitle="צרי חשבון חדש לניהול הצמחים">
      <form action={action} className="space-y-4">
        <FormError message={state?.error} />
        <FormSuccess message={state?.success} />
        <TextField
          id="email"
          name="email"
          label="אימייל"
          type="email"
          autoComplete="email"
        />
        <TextField
          id="password"
          name="password"
          label="סיסמה"
          type="password"
          autoComplete="new-password"
          placeholder="לפחות 6 תווים"
        />
        <SubmitButton label="הירשמי" pending={pending} />
      </form>
      <AuthFooterLink
        text="כבר יש לך חשבון?"
        linkText="התחברי"
        href="/login"
      />
    </AuthShell>
  );
}
