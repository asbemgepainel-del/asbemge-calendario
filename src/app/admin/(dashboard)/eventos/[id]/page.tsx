import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getLocations, getSettings, getSpacingRules } from "@/lib/data";
import EventForm from "@/components/admin/EventForm";
import { updateEvent } from "../actions";

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [events, locations, rules, settings] = await Promise.all([
    getEvents(supabase),
    getLocations(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
  ]);

  const initial = events.find((e) => e.id === id);
  if (!initial) notFound();

  return (
    <EventForm
      initial={initial}
      events={events}
      locations={locations}
      rules={rules}
      settings={settings}
      action={updateEvent.bind(null, id)}
    />
  );
}
