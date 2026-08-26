export type EventCategory = "esportivo" | "social";
export type EventStatus = "rascunho" | "confirmado" | "cancelado" | "concluido";
export type EventSize = "pequeno" | "medio" | "grande";
export type ConflictSeverity = "direto" | "proximidade";

export interface Location {
  id: string;
  name: string;
  capacity: number | null;
  notes: string | null;
  created_at: string;
}

export interface Director {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  modality: string | null;
  start_date: string; // ISO date, e.g. 2026-09-05
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location_id: string | null;
  responsible: string | null;
  size: EventSize;
  status: EventStatus;
  capacity: number | null;
  attachment_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Event joined with its location name, as used throughout the UI. */
export interface EventWithLocation extends EventRow {
  location: Location | null;
}

export interface SpacingRule {
  id: string;
  category_a: EventCategory;
  category_b: EventCategory;
  min_days: number;
}

export interface Settings {
  consider_size_in_conflicts: boolean;
  size_bonus_days: Record<EventSize, number>;
}

export interface EventConflict {
  a: EventRow;
  b: EventRow;
  gap: number;
  minDays: number;
  severity: ConflictSeverity;
}

export interface EventFormInput {
  id?: string;
  title: string;
  description: string;
  category: EventCategory;
  modality: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location_id: string;
  responsible: string;
  size: EventSize;
  status: EventStatus;
  capacity: string;
  attachment_url: string | null;
}
