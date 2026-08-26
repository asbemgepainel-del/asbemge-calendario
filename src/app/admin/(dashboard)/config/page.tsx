import { createClient } from "@/lib/supabase/server";
import { getSettings, getSpacingRules } from "@/lib/data";
import ConfigForm from "@/components/admin/ConfigForm";

export default async function AdminConfigPage() {
  const supabase = await createClient();
  const [rules, settings] = await Promise.all([getSpacingRules(supabase), getSettings(supabase)]);

  return <ConfigForm rules={rules} considerSize={settings.consider_size_in_conflicts} />;
}
