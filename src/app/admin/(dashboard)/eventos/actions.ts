"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventCategory, EventSize, EventStatus } from "@/lib/types";

function readEventFields(formData: FormData) {
  const capacityRaw = String(formData.get("capacity") || "").trim();
  return {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category")) as EventCategory,
    modality: String(formData.get("modality") || "").trim() || null,
    start_date: String(formData.get("start_date")),
    end_date: String(formData.get("end_date") || "").trim() || null,
    start_time: String(formData.get("start_time") || "").trim() || null,
    end_time: String(formData.get("end_time") || "").trim() || null,
    location_id: String(formData.get("location_id") || "").trim() || null,
    responsible: String(formData.get("responsible") || "").trim() || null,
    size: String(formData.get("size")) as EventSize,
    status: String(formData.get("status")) as EventStatus,
    capacity: capacityRaw ? Number(capacityRaw) : null,
  };
}

async function uploadArtIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  formData: FormData,
): Promise<string | undefined> {
  const file = formData.get("attachment") as File | null;
  if (!file || file.size === 0) return undefined;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${eventId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("event-art").upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from("event-art").getPublicUrl(path);
  return data.publicUrl;
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const fields = readEventFields(formData);

  if (!fields.title || !fields.start_date) {
    throw new Error("Título e data de início são obrigatórios.");
  }

  const { data: inserted, error } = await supabase.from("events").insert(fields).select("id").single();
  if (error) throw error;

  const attachmentUrl = await uploadArtIfPresent(supabase, inserted.id, formData);
  if (attachmentUrl) {
    await supabase.from("events").update({ attachment_url: attachmentUrl }).eq("id", inserted.id);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/eventos");
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = readEventFields(formData);

  if (!fields.title || !fields.start_date) {
    throw new Error("Título e data de início são obrigatórios.");
  }

  const attachmentUrl = await uploadArtIfPresent(supabase, id, formData);

  const { error } = await supabase
    .from("events")
    .update({ ...fields, ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}) })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/eventos");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/");
}
