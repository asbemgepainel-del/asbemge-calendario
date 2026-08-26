import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventRow, Location, Settings, SpacingRule } from "./types";

const DEFAULT_SETTINGS: Settings = {
  consider_size_in_conflicts: true,
  size_bonus_days: { pequeno: 0, medio: 0, grande: 2 },
};

export async function getEvents(supabase: SupabaseClient): Promise<EventRow[]> {
  const { data, error } = await supabase.from("events").select("*").order("start_date");
  if (error) throw error;
  return data ?? [];
}

export async function getLocations(supabase: SupabaseClient): Promise<Location[]> {
  const { data, error } = await supabase.from("locations").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSpacingRules(supabase: SupabaseClient): Promise<SpacingRule[]> {
  const { data, error } = await supabase.from("spacing_rules").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getSettings(supabase: SupabaseClient): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    consider_size_in_conflicts:
      map.consider_size_in_conflicts ?? DEFAULT_SETTINGS.consider_size_in_conflicts,
    size_bonus_days: map.size_bonus_days ?? DEFAULT_SETTINGS.size_bonus_days,
  };
}
