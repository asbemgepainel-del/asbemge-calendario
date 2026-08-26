import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getSettings, getSpacingRules } from "@/lib/data";
import { computeConflicts } from "@/lib/conflicts";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [events, rules, settings, { data: director }] = await Promise.all([
    getEvents(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
    supabase.from("directors").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const conflicts = computeConflicts(events, rules, settings);

  return (
    <AdminShell conflictCount={conflicts.length} directorName={director?.full_name ?? user.email ?? null}>
      {children}
    </AdminShell>
  );
}
