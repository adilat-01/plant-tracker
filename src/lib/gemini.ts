import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export type PlantIdentification = {
  name_he: string;
  watering_interval_days: number;
  light_notes: string;
  care_tips: string;
};

const MODELS = ["gemini-2.5-flash", "gemini-3.6-flash"];

const IDENTIFY_PROMPT = `You are a botany expert. Analyze the plant in this image.

Return ONLY valid JSON (no markdown, no extra text) with exactly these fields:
{
  "name_he": "accurate Hebrew common name of the plant",
  "watering_interval_days": recommended watering frequency as a positive integer (days between waterings),
  "light_notes": "Hebrew description of light requirements",
  "care_tips": "Hebrew care tips (1-2 sentences)"
}

If you cannot identify the plant, use your best guess based on visible features.`;

function parseIdentification(text: string): PlantIdentification {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsed = JSON.parse(cleaned) as PlantIdentification;

  if (!parsed.name_he || !parsed.watering_interval_days) {
    throw new Error("Invalid identification response");
  }

  return {
    name_he: String(parsed.name_he),
    watering_interval_days: Math.max(
      1,
      Math.round(Number(parsed.watering_interval_days))
    ),
    light_notes: String(parsed.light_notes ?? ""),
    care_tips: String(parsed.care_tips ?? ""),
  };
}

export async function identifyPlantFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<PlantIdentification> {
  const genAI = new GoogleGenerativeAI(env.geminiApiKey());
  const normalizedMime =
    mimeType === "image/heic" || mimeType === "image/heif"
      ? "image/jpeg"
      : mimeType;

  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        IDENTIFY_PROMPT,
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: normalizedMime,
          },
        },
      ]);

      const text = result.response.text();
      return parseIdentification(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Gemini identification failed");
}
