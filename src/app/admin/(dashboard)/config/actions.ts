"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSpacingRuleMinDays(id: string, minDays: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("spacing_rules").update({ min_days: minDays }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function updateConsiderSize(value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("settings").update({ value }).eq("key", "consider_size_in_conflicts");
  if (error) throw error;
  revalidatePath("/admin");
}
