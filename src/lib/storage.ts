import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const BUCKET = "plant-images";

export function getPublicImageUrl(path: string): string {
  return `${env.supabaseUrl()}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadPlantImage(
  householdId: string,
  file: File
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${householdId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return getPublicImageUrl(path);
}
