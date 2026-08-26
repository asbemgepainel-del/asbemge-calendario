import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getSettings, getSpacingRules } from "@/lib/data";
import { computeConflicts, conflictCountByEventId as computeConflictCountByEventId } from "@/lib/conflicts";
import { fmtDateShort } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";
import { CategoryTag, ConflictBadge } from "@/components/admin/CategoryTag";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import { deleteEvent } from "./actions";

export default async function AdminEventosPage() {
  const supabase = await createClient();
  const [events, rules, settings] = await Promise.all([
    getEvents(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
  ]);

  const conflicts = computeConflicts(events, rules, settings);
  const conflictCountByEventId = computeConflictCountByEventId(conflicts);
  const sorted = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <div>
      <PageHeader title="Eventos" subtitle="Todos os eventos cadastrados no clube" />
      <div className="asb-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["Data", "Evento", "Categoria", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ev) => (
              <tr key={ev.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--ink-dim)" }}>{fmtDateShort(ev.start_date)}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {ev.title}
                    <ConflictBadge count={conflictCountByEventId[ev.id]} />
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}><CategoryTag category={ev.category} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontSize: 11.5, color: ev.status === "cancelado" ? "var(--alert)" : "var(--field)" }}>{ev.status}</span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <Link href={`/admin/eventos/${ev.id}`} className="asb-btn" style={{ padding: "5px 8px" }}>
                      <Pencil size={12} />
                    </Link>
                    <DeleteEventButton action={deleteEvent.bind(null, ev.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "16px 14px", color: "var(--ink-dim)", fontSize: 12.5 }}>Nenhum evento cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
