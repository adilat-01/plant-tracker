"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "התחברות נכשלה. בדקי את האימייל והסיסמה." };
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
  }

  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("signups not allowed")) {
      return {
        error:
          "ההרשמה כבויה ב-Supabase. הפעילי: Authentication → Sign In / Providers → Allow new users to sign up.",
      };
    }

    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "האימייל כבר רשום. נסי להתחברי." };
    }

    return { error: `הרשמה נכשלה: ${error.message}` };
  }

  if (data.user && !data.session) {
    return {
      success: "נשלח אימייל לאימות. אחרי האישור התחברי שוב.",
    };
  }

  redirect("/setup");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
