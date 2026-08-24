export type DateInput = Date | string | number | null | undefined;

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = MONTHS_FULL.map((m) => m.slice(0, 3));
const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAYS_SHORT = DAYS_FULL.map((d) => d.slice(0, 3));

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const date = input instanceof Date ? input : new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const TOKEN_REGEX =
  /YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a/g;

export function formatDate(input: DateInput, pattern = "MMM D, YYYY"): string {
  const date = toDate(input);
  if (!date) return "—";

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;

  const values: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: MONTHS_FULL[date.getMonth()],
    MMM: MONTHS_SHORT[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: pad(date.getDate()),
    D: String(date.getDate()),
    dddd: DAYS_FULL[date.getDay()],
    ddd: DAYS_SHORT[date.getDay()],
    HH: pad(hours24),
    H: String(hours24),
    hh: pad(hours12),
    h: String(hours12),
    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
    A: hours24 < 12 ? "AM" : "PM",
    a: hours24 < 12 ? "am" : "pm",
  };

  return pattern.replace(TOKEN_REGEX, (token) => values[token]);
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

export function formatRelativeTime(input: DateInput, locale = "en"): string {
  const date = toDate(input);
  if (!date) return "—";

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  if (absMs < 1000) return "just now";

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (absMs >= ms || unit === "second") {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return "just now";
}

export function formatSmartDate(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs >= 0 && diffMins < 1) return "Just now";
  if (diffMs >= 0 && diffMins < 60) return `${diffMins}m ago`;

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${formatDate(date, "h:mm A")}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${formatDate(date, "h:mm A")}`;
  }

  if (diffDays >= 0 && diffDays < 7) return formatDate(date, "dddd");

  return date.getFullYear() === now.getFullYear()
    ? formatDate(date, "MMM D")
    : formatDate(date, "MMM D, YYYY");
}

export function formatDateRange(start: DateInput, end: DateInput): string {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return "—";

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${formatDate(startDate, "MMM D")}–${formatDate(endDate, "D, YYYY")}`;
  }
  if (sameYear) {
    return `${formatDate(startDate, "MMM D")} – ${formatDate(endDate, "MMM D, YYYY")}`;
  }
  return `${formatDate(startDate, "MMM D, YYYY")} – ${formatDate(endDate, "MMM D, YYYY")}`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
