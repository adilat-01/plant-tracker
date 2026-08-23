"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import {
  AuthFooterLink,
  AuthShell,
  FormError,
  SubmitButton,
  TextField,
} from "@/components/auth-ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      signIn(formData),
    null
  );

  return (
    <AuthShell title="התחברות" subtitle="ברוכה הבאה חזרה ל-Plant Manager">
      <form action={action} className="space-y-4">
        <FormError message={state?.error} />
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
          autoComplete="current-password"
        />
        <SubmitButton label="התחברי" pending={pending} />
      </form>
      <AuthFooterLink
        text="אין לך חשבון?"
        linkText="הירשמי"
        href="/signup"
      />
    </AuthShell>
  );
}
