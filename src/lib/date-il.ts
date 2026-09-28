/** Calendar helpers using Israel timezone */

const IL_TZ = "Asia/Jerusalem";

export function toIsraelDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Midnight Israel time for a YYYY-MM-DD key, as UTC ISO string */
export function israelDateKeyToIso(dateKey: string, hour = 12): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  // Approximate: create as UTC noon then adjust — better: use fixed offset for IL
  // Israel is UTC+3 in late September (DST / IDT)
  const utc = new Date(Date.UTC(y, m - 1, d, hour - 3, 0, 0));
  return utc.toISOString();
}

export function calendarDaysBetween(
  fromIso: string,
  toDate: Date = new Date()
): number {
  const fromKey = toIsraelDateKey(new Date(fromIso));
  const toKey = toIsraelDateKey(toDate);

  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);

  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);

  return Math.round((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

export function formatIsraelDateTime(iso: string): {
  dateStr: string;
  timeStr: string;
  daysAgo: number;
} {
  const date = new Date(iso);
  const daysAgo = calendarDaysBetween(iso);

  const timeStr = date.toLocaleTimeString("he-IL", {
    timeZone: IL_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = date.toLocaleDateString("he-IL", {
    timeZone: IL_TZ,
  });

  return { dateStr, timeStr, daysAgo };
}
