export const LIGHT_LEVELS = [
  { value: "direct_sun", label: "שמש ישירה ☀️" },
  { value: "filtered_sun", label: "שמש מסוננת 🌤️" },
  { value: "bright_indirect", label: "אור עקיף / מואר 🌥️" },
  { value: "shade", label: "צל 🌿" },
] as const;

export type LightLevel = (typeof LIGHT_LEVELS)[number]["value"];

export type LastWateredChoice = "today" | "yesterday" | "unknown";

export function getLightLevelLabel(value: string | null): string {
  return LIGHT_LEVELS.find((l) => l.value === value)?.label ?? "לא צוין";
}

export function resolveLastWateredAt(
  choice: LastWateredChoice
): string | null {
  const now = new Date();

  if (choice === "today") {
    return now.toISOString();
  }

  if (choice === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }

  return null;
}

export function formatLastWatered(iso: string | null): string {
  if (!iso) return "לא ידוע מתי הושקה";

  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString("he-IL");

  if (diffDays === 0) return `היום בשעה ${time}`;
  if (diffDays === 1) return `אתמול בשעה ${time}`;
  return `${dateStr} בשעה ${time}`;
}
