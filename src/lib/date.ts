// Day-string helpers. `Date#toISOString()` always converts to UTC, which
// rolls the date back near local midnight in any timezone ahead of UTC
// (e.g. Yekaterinburg, UTC+5) — right when a user's "today" has already
// flipped but the UTC calendar day hasn't yet. Always derive day strings
// from local Y/M/D components on the client, so the app follows whatever
// timezone the device itself is set to (works the same for a browser tab
// or an iOS home-screen PWA).

export function fmtDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return fmtDay(new Date());
}

// Server-side (cron) has no "device" — pin it to the app owner's timezone
// instead of relying on the Vercel function's process timezone (UTC).
export const APP_TZ = "Asia/Yekaterinburg";

export function todayInTZ(tz: string, offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
