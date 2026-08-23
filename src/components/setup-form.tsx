"use client";

import { useActionState } from "react";
import { createHousehold, joinHousehold } from "@/lib/actions/household";
import {
  AuthShell,
  FormError,
  SubmitButton,
  TextField,
} from "@/components/auth-ui";

export function SetupForm() {
  const [createState, createAction, createPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      createHousehold(formData),
    null
  );

  const [joinState, joinAction, joinPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      joinHousehold(formData),
    null
  );

  return (
    <AuthShell
      title="הגדרת בית"
      subtitle="צרי בית חדש או הצטרפי לבית קיים עם קוד שיתוף"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-900">בית חדש</h2>
          <form action={createAction} className="space-y-3">
            <FormError message={createState?.error} />
            <TextField
              id="household-name"
              name="name"
              label="שם הבית"
              placeholder='למשל: "הבית בבנימינה"'
            />
            <SubmitButton label="צרי בית חדש" pending={createPending} />
          </form>
        </section>

        <div className="border-t border-emerald-100 pt-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-emerald-900">
              הצטרפות לבית קיים
            </h2>
            <form action={joinAction} className="space-y-3">
              <FormError message={joinState?.error} />
              <TextField
                id="invite-code"
                name="invite_code"
                label="קוד שיתוף"
                placeholder="למשל: ABC123"
                autoComplete="off"
              />
              <SubmitButton label="הצטרפי לבית" pending={joinPending} />
            </form>
          </section>
        </div>
      </div>
    </AuthShell>
  );
}
