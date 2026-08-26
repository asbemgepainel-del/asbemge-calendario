import { createClient } from "@/lib/supabase/server";
import { getEvents, getSettings, getSpacingRules } from "@/lib/data";
import { computeConflicts } from "@/lib/conflicts";
import AdminCalendario from "@/components/admin/AdminCalendario";

export default async function AdminCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const supabase = await createClient();
  const [events, rules, settings] = await Promise.all([
    getEvents(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
  ]);

  const conflicts = computeConflicts(events, rules, settings);

  return <AdminCalendario events={events} conflicts={conflicts} initialDay={dia} />;
}
