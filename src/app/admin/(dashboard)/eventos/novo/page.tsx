import { createClient } from "@/lib/supabase/server";
import { getEvents, getLocations, getSettings, getSpacingRules } from "@/lib/data";
import EventForm from "@/components/admin/EventForm";
import { createEvent } from "../actions";

export default async function NovoEventoPage() {
  const supabase = await createClient();
  const [events, locations, rules, settings] = await Promise.all([
    getEvents(supabase),
    getLocations(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
  ]);

  return (
    <EventForm events={events} locations={locations} rules={rules} settings={settings} action={createEvent} />
  );
}
