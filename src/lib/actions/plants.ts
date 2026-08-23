"use server";

import { revalidatePath } from "next/cache";
import { identifyPlantFromImage } from "@/lib/gemini";
import { getUserHousehold } from "@/lib/household";
import {
  LIGHT_LEVELS,
  resolveLastWateredAt,
  type LastWateredChoice,
  type LightLevel,
} from "@/lib/plant-form";
import { createClient } from "@/lib/supabase/server";
import { uploadPlantImage, deletePlantImage } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/octet-stream",
]);

export type PlantPreview = {
  name_he: string;
  confirmation_question: string | null;
  watering_interval_days: number;
  light_notes: string;
  care_tips: string;
  image_url: string;
  room_id: string;
  light_level: LightLevel;
  last_watered_at: string | null;
  user_guess_name: string | null;
};

function resolveMimeType(file: File): string {
  if (
    file.type &&
    ALLOWED_TYPES.has(file.type) &&
    file.type !== "application/octet-stream"
  ) {
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

function isValidLightLevel(value: string): value is LightLevel {
  return LIGHT_LEVELS.some((level) => level.value === value);
}

function isValidLastWateredChoice(value: string): value is LastWateredChoice {
  return value === "today" || value === "yesterday" || value === "unknown";
}

function mapActionError(message: string): string {
  if (message.includes("Image upload failed")) {
    return "העלאת התמונה נכשלה. הריצי את supabase/patch-storage.sql ב-Supabase.";
  }
  if (message.toLowerCase().includes("api key")) {
    return "מפתח Gemini לא תקין. בדקי את GEMINI_API_KEY ב-Vercel.";
  }
  if (message.includes("light_level")) {
    return "חסרה עמודת light_level. הריצי את supabase/patch-plant-light.sql ב-Supabase.";
  }
  return message;
}

async function validateRoom(roomId: string, householdId: string) {
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .eq("household_id", householdId)
    .maybeSingle();

  return Boolean(room);
}

export async function identifyPlant(
  _prev: { error?: string; preview?: PlantPreview } | null,
  formData: FormData
) {
  const roomId = String(formData.get("room_id") ?? "");
  const userGuessName = String(formData.get("user_guess_name") ?? "").trim();
  const lightLevel = String(formData.get("light_level") ?? "");
  const lastWateredChoice = String(formData.get("last_watered") ?? "");
  const file = formData.get("image");

  if (!roomId) return { error: "נא לבחור חדר" };
  if (!isValidLightLevel(lightLevel)) return { error: "נא לבחור רמת אור" };
  if (!isValidLastWateredChoice(lastWateredChoice)) {
    return { error: "נא לבחור מתי הושקה לאחרונה" };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "נא להעלות תמונה של הצמח" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "התמונה גדולה מדי (מקסימום 10MB)" };
  }
  if (!isImageFile(file)) {
    return { error: "סוג קובץ לא נתמך. השתמשי ב-JPG, PNG או WebP" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "יש להתחבר מחדש" };

  const household = await getUserHousehold();
  if (!household) return { error: "לא נמצא בית" };

  if (!(await validateRoom(roomId, household.id))) {
    return { error: "החדר שנבחר לא תקין" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = resolveMimeType(file);
    const identification = await identifyPlantFromImage(buffer, mimeType, {
      userGuessName: userGuessName || null,
      lightLevel,
    });
    const imageUrl = await uploadPlantImage(household.id, file);

    const preview: PlantPreview = {
      name_he: identification.name_he,
      confirmation_question: identification.confirmation_question,
      watering_interval_days: identification.watering_interval_days,
      light_notes: identification.light_notes,
      care_tips: identification.care_tips,
      image_url: imageUrl,
      room_id: roomId,
      light_level: lightLevel,
      last_watered_at: resolveLastWateredAt(lastWateredChoice),
      user_guess_name: userGuessName || null,
    };

    return { preview };
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה";
    return { error: mapActionError(message) };
  }
}

export async function savePlant(preview: PlantPreview) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "יש להתחבר מחדש" };

  const household = await getUserHousehold();
  if (!household) return { error: "לא נמצא בית" };

  if (!preview.image_url.includes(household.id)) {
    return { error: "תמונה לא תקינה" };
  }

  if (!(await validateRoom(preview.room_id, household.id))) {
    return { error: "החדר לא תקין" };
  }

  const { error: insertError } = await supabase.from("plants").insert({
    household_id: household.id,
    room_id: preview.room_id,
    name_he: preview.name_he,
    watering_interval_days: preview.watering_interval_days,
    light_notes: preview.light_notes,
    care_tips: preview.care_tips,
    light_level: preview.light_level,
    image_url: preview.image_url,
    last_watered_at: preview.last_watered_at,
    added_by: user.id,
  });

  if (insertError) {
    return { error: mapActionError(insertError.message) };
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

export async function deletePlant(plantId: string) {
  const supabase = await createClient();
  const household = await getUserHousehold();

  if (!household) {
    return { error: "לא נמצא בית" };
  }

  const { data: plant } = await supabase
    .from("plants")
    .select("id, image_url")
    .eq("id", plantId)
    .eq("household_id", household.id)
    .maybeSingle();

  if (!plant) {
    return { error: "הצמח לא נמצא" };
  }

  const { error } = await supabase
    .from("plants")
    .delete()
    .eq("id", plantId)
    .eq("household_id", household.id);

  if (error) {
    return { error: "מחיקת הצמח נכשלה" };
  }

  if (plant.image_url) {
    try {
      await deletePlantImage(plant.image_url);
    } catch {
      // Plant row deleted — orphaned image is acceptable
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}
