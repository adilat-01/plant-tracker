"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ROOMS = ["סלון", "גינה", "כניסה קדמית"];

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function createHousehold(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "נא לתת שם לבית" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "יש להתחבר מחדש" };
  }

  const { data: existingMember } = await supabase
    .from("household_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    redirect("/dashboard");
  }

  const inviteCode = generateInviteCode();
  const admin = createAdminClient();

  const { data: household, error: householdError } = await admin
    .from("households")
    .insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select("id, invite_code")
    .single();

  if (householdError || !household) {
    return { error: `יצירת הבית נכשלה: ${householdError?.message ?? "שגיאה לא ידועה"}` };
  }

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    return { error: `הוספתך לבית נכשלה: ${memberError.message}` };
  }

  const rooms = DEFAULT_ROOMS.map((roomName, index) => ({
    household_id: household.id,
    name: roomName,
    sort_order: index,
  }));

  const { error: roomsError } = await supabase.from("rooms").insert(rooms);

  if (roomsError) {
    return { error: `יצירת החדרים נכשלה: ${roomsError.message}` };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinHousehold(formData: FormData) {
  const inviteCode = String(formData.get("invite_code") ?? "")
    .trim()
    .toUpperCase();

  if (!inviteCode) {
    return { error: "נא להזין קוד שיתוף" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "יש להתחבר מחדש" };
  }

  const { data: existingMember } = await supabase
    .from("household_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: household, error: lookupError } = await admin
    .from("households")
    .select("id")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (lookupError || !household) {
    return { error: "קוד שיתוף לא נמצא. בדקי ונסי שוב." };
  }

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: user.id,
    role: "member",
  });

  if (memberError) {
    return { error: "הצטרפות לבית נכשלה. ייתכן שכבר הצטרפת." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
