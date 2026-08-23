import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { getLightLevelLabel, type LightLevel } from "@/lib/plant-form";

export type PlantIdentification = {
  name_he: string;
  confirmation_question: string | null;
  watering_interval_days: number;
  light_notes: string;
  care_tips: string;
};

const MODELS = ["gemini-2.5-flash", "gemini-3.6-flash"];

function buildPrompt(userGuessName: string | null, lightLevel: LightLevel): string {
  const lightLabel = getLightLevelLabel(lightLevel);

  return `You are a botany expert helping manage houseplants in Israel.

Analyze the plant in this image.

Context from the user:
- User's name guess (may be wrong or empty): ${userGuessName ?? "not provided"}
- Light level where the plant is placed: ${lightLabel}

Return ONLY valid JSON (no markdown) with exactly these fields:
{
  "name_he": "accurate Hebrew common name of the plant",
  "confirmation_question": "If the user provided a name guess that differs from your identification, write a short Hebrew question like 'האם התכוונת לפוטוס מנומר?' — otherwise null",
  "watering_interval_days": recommended days between waterings as a positive integer, adjusted for the stated light level and typical Israeli home conditions,
  "light_notes": "Hebrew: how the chosen light level affects this specific plant",
  "care_tips": "Hebrew care tips (1-2 sentences) tailored to the light level"
}

If you cannot identify the plant confidently, give your best guess based on visible features.`;
}

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
    confirmation_question: parsed.confirmation_question
      ? String(parsed.confirmation_question)
      : null,
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
  mimeType: string,
  options: {
    userGuessName?: string | null;
    lightLevel: LightLevel;
  }
): Promise<PlantIdentification> {
  const genAI = new GoogleGenerativeAI(env.geminiApiKey());
  const normalizedMime =
    mimeType === "image/heic" || mimeType === "image/heif"
      ? "image/jpeg"
      : mimeType;

  const prompt = buildPrompt(
    options.userGuessName?.trim() || null,
    options.lightLevel
  );

  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        prompt,
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
