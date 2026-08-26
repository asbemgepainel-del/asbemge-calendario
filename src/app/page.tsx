import { createClient } from "@/lib/supabase/server";
import { getEvents, getLocations } from "@/lib/data";
import type { EventWithLocation } from "@/lib/types";
import PublicDashboard from "@/components/public/PublicDashboard";

export const revalidate = 0;

export default async function PublicPage() {
  const supabase = await createClient();
  const [events, locations] = await Promise.all([getEvents(supabase), getLocations(supabase)]);

  const locationById = new Map(locations.map((l) => [l.id, l]));
  const eventsWithLocation: EventWithLocation[] = events.map((e) => ({
    ...e,
    location: e.location_id ? (locationById.get(e.location_id) ?? null) : null,
  }));

  return <PublicDashboard events={eventsWithLocation} />;
}
