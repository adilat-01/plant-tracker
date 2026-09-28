import {
  calendarDaysBetween,
  formatIsraelDateTime,
  israelDateKeyToIso,
  toIsraelDateKey,
} from "@/lib/date-il";

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
  if (choice === "unknown") return null;

  const todayKey = toIsraelDateKey();
  if (choice === "today") {
    return new Date().toISOString();
  }

  // yesterday in Israel calendar
  const [y, m, d] = todayKey.split("-").map(Number);
  const yesterday = new Date(Date.UTC(y, m - 1, d));
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  return israelDateKeyToIso(yesterdayKey, 12);
}

export function formatLastWatered(iso: string | null): string {
  if (!iso) return "לא ידוע מתי הושקה";

  const { dateStr, timeStr, daysAgo } = formatIsraelDateTime(iso);

  if (daysAgo === 0) return `היום בשעה ${timeStr}`;
  if (daysAgo === 1) return `אתמול בשעה ${timeStr}`;
  return `${dateStr} בשעה ${timeStr}`;
}

export { calendarDaysBetween };
