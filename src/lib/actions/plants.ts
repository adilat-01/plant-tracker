"use server";

import { revalidatePath } from "next/cache";
import { identifyPlantFromImage } from "@/lib/gemini";
import { getUserHousehold } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";
import { uploadPlantImage } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/octet-stream",
]);

function resolveMimeType(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type) && file.type !== "application/octet-stream") {
    return file.type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/jpeg",
    heif: "image/jpeg",
  };

  return byExt[ext ?? ""] ?? "image/jpeg";
}

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

export async function addPlant(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const roomId = String(formData.get("room_id") ?? "");
  const file = formData.get("image");

  if (!roomId) {
    return { error: "נא לבחור חדר" };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "נא להעלות תמונה של הצמח" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "התמונה גדולה מדי (מקסימום 5MB)" };
  }

  if (!isImageFile(file)) {
    return { error: "סוג קובץ לא נתמך. השתמשי ב-JPG, PNG או WebP" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "יש להתחבר מחדש" };
  }

  const household = await getUserHousehold();
  if (!household) {
    return { error: "לא נמצא בית. הגדרי בית קודם." };
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .eq("household_id", household.id)
    .maybeSingle();

  if (!room) {
    return { error: "החדר שנבחר לא תקין" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = resolveMimeType(file);
    const identification = await identifyPlantFromImage(buffer, mimeType);
    const imageUrl = await uploadPlantImage(household.id, file);

    const { error: insertError } = await supabase.from("plants").insert({
      household_id: household.id,
      room_id: roomId,
      name_he: identification.name_he,
      watering_interval_days: identification.watering_interval_days,
      light_notes: identification.light_notes,
      care_tips: identification.care_tips,
      image_url: imageUrl,
      last_watered_at: new Date().toISOString(),
      added_by: user.id,
    });

    if (insertError) {
      return { error: `שמירת הצמח נכשלה: ${insertError.message}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה";

    if (message.includes("Image upload failed")) {
      return {
        error:
          "העלאת התמונה נכשלה. הריצי את supabase/patch-storage.sql ב-Supabase.",
      };
    }

    if (message.toLowerCase().includes("api key")) {
      return { error: "מפתח Gemini לא תקין. בדקי את GEMINI_API_KEY ב-Vercel." };
    }

    if (message.includes("no longer available") || message.includes("NOT_FOUND")) {
      return { error: "מודל Gemini לא זמין. נסי שוב בעוד דקה." };
    }

    return { error: `שגיאה: ${message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function waterPlant(plantId: string) {
  const supabase = await createClient();
  const household = await getUserHousehold();

  if (!household) {
    return { error: "לא נמצא בית" };
  }

  const { error } = await supabase
    .from("plants")
    .update({ last_watered_at: new Date().toISOString() })
    .eq("id", plantId)
    .eq("household_id", household.id);

  if (error) {
    return { error: "עדכון ההשקיה נכשל" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
