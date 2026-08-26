export function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "";
  return parseDate(s).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function fmtDateShort(s: string | null | undefined): string {
  if (!s) return "";
  return parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function fmtDateMonthShort(s: string | null | undefined): string {
  if (!s) return "";
  return parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function daysUntil(s: string): number {
  return Math.round((parseDate(s).getTime() - parseDate(todayISO()).getTime()) / 86400000);
}
