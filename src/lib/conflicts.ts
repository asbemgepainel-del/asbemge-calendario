import type { EventCategory, EventConflict, EventRow, EventSize, Settings, SpacingRule } from "./types";
import { parseDate } from "./format";

/** Portado de reference/asbemge-calendario.jsx (dateGapDays, computeConflicts, conflictsForEvent). */

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function ruleKey(catA: EventCategory, catB: EventCategory): string {
  return [catA, catB].sort().join("_");
}

export function dateGapDays(
  a: Pick<EventRow, "start_date" | "end_date">,
  b: Pick<EventRow, "start_date" | "end_date">,
): number {
  const aStart = parseDate(a.start_date);
  const aEnd = parseDate(a.end_date || a.start_date);
  const bStart = parseDate(b.start_date);
  const bEnd = parseDate(b.end_date || b.start_date);
  if (aEnd < bStart) return diffDays(aEnd, bStart);
  if (bEnd < aStart) return diffDays(bEnd, aStart);
  return 0;
}

export function rulesToMap(rules: SpacingRule[]): Record<string, number> {
  const map: Record<string, number> = {};
  rules.forEach((r) => {
    map[ruleKey(r.category_a, r.category_b)] = r.min_days;
  });
  return map;
}

export function getMinDays(
  catA: EventCategory,
  catB: EventCategory,
  rulesMap: Record<string, number>,
  settings: Settings,
  sizeA: EventSize,
  sizeB: EventSize,
): number {
  let min = rulesMap[ruleKey(catA, catB)] ?? 3;
  if (settings.consider_size_in_conflicts) {
    const bonus = Math.max(
      settings.size_bonus_days[sizeA] || 0,
      settings.size_bonus_days[sizeB] || 0,
    );
    min += bonus;
  }
  return min;
}

export function computeConflicts(
  events: EventRow[],
  rules: SpacingRule[],
  settings: Settings,
): EventConflict[] {
  const rulesMap = rulesToMap(rules);
  const active = events.filter((e) => e.status !== "cancelado");
  const conflicts: EventConflict[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const gap = dateGapDays(a, b);
      const minDays = getMinDays(a.category, b.category, rulesMap, settings, a.size, b.size);
      if (gap < minDays) {
        conflicts.push({ a, b, gap, minDays, severity: gap === 0 ? "direto" : "proximidade" });
      }
    }
  }
  return conflicts;
}

export function conflictCountByEventId(conflicts: EventConflict[]): Record<string, number> {
  const map: Record<string, number> = {};
  conflicts.forEach((c) => {
    map[c.a.id] = (map[c.a.id] || 0) + 1;
    map[c.b.id] = (map[c.b.id] || 0) + 1;
  });
  return map;
}

export interface DraftConflict {
  other: EventRow;
  gap: number;
  minDays: number;
  severity: "direto" | "proximidade";
}

export function conflictsForEvent(
  draftEvent: Pick<EventRow, "start_date" | "end_date" | "category" | "size">,
  allEvents: EventRow[],
  rules: SpacingRule[],
  settings: Settings,
  excludeId?: string,
): DraftConflict[] {
  const rulesMap = rulesToMap(rules);
  const others = allEvents.filter((e) => e.id !== excludeId && e.status !== "cancelado");
  const out: DraftConflict[] = [];
  for (const other of others) {
    const gap = dateGapDays(draftEvent, other);
    const minDays = getMinDays(
      draftEvent.category,
      other.category,
      rulesMap,
      settings,
      draftEvent.size,
      other.size,
    );
    if (gap < minDays) out.push({ other, gap, minDays, severity: gap === 0 ? "direto" : "proximidade" });
  }
  return out;
}
