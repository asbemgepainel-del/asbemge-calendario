import { Trophy, PartyPopper, AlertTriangle } from "lucide-react";
import type { EventCategory } from "@/lib/types";

export const CATEGORY_META: Record<EventCategory, { label: string; color: string; soft: string; Icon: typeof Trophy }> = {
  esportivo: { label: "Esportivo", color: "var(--gold)", soft: "var(--gold-soft)", Icon: Trophy },
  social: { label: "Social", color: "var(--wine)", soft: "var(--wine-soft)", Icon: PartyPopper },
};

export function CategoryTag({ category, size = 12 }: { category: EventCategory; size?: number }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500,
        padding: "3px 9px", borderRadius: 999, background: meta.soft, color: meta.color,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={size} /> {meta.label}
    </span>
  );
}

export function ConflictBadge({ count }: { count: number | undefined }) {
  if (!count) return null;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500,
        padding: "2px 8px", borderRadius: 999, background: "var(--alert-soft)", color: "var(--alert)",
      }}
    >
      <AlertTriangle size={11} /> {count}
    </span>
  );
}
