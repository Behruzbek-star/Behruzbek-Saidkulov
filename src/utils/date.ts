export const DAY_MS = 86400000;

export function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function toDayKey(dateIso: string) {
  return new Date(dateIso).toISOString().slice(0, 10);
}

export function formatPct(value: number) {
  return `${Math.round(value)}%`;
}
