import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Pinged daily by a Vercel Cron Job (see vercel.json) so the Supabase free-tier
// project sees regular activity and never hits its auto-pause-after-inactivity threshold.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error } = await supabase.from("events").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
