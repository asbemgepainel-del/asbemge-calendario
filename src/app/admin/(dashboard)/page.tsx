import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getSettings, getSpacingRules } from "@/lib/data";
import { computeConflicts } from "@/lib/conflicts";
import { fmtDateShort, todayISO } from "@/lib/format";
import { PageHeader, SectionTitle, EmptyNote, StatCard } from "@/components/admin/ui";
import { CategoryTag } from "@/components/admin/CategoryTag";

export default async function AdminPainelPage() {
  const supabase = await createClient();
  const [events, rules, settings] = await Promise.all([
    getEvents(supabase),
    getSpacingRules(supabase),
    getSettings(supabase),
  ]);

  const conflicts = computeConflicts(events, rules, settings);
  const active = events.filter((e) => e.status !== "cancelado");
  const esportivos = active.filter((e) => e.category === "esportivo").length;
  const sociais = active.filter((e) => e.category === "social").length;

  const upcoming = [...active]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .filter((e) => e.start_date >= todayISO())
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="Painel" subtitle="Visão geral do calendário do clube" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 26 }}>
        <StatCard label="Total de eventos" value={active.length} />
        <StatCard label="Esportivos" value={esportivos} accent="var(--gold)" />
        <StatCard label="Sociais" value={sociais} accent="var(--wine)" />
        <StatCard label="Conflitos ativos" value={conflicts.length} accent={conflicts.length ? "var(--alert)" : "var(--field)"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <div className="asb-card" style={{ padding: 18 }}>
          <SectionTitle>Próximos eventos</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 10 }}>
            {upcoming.length === 0 && <EmptyNote>Nenhum evento futuro cadastrado.</EmptyNote>}
            {upcoming.map((ev) => (
              <Link
                key={ev.id}
                href={`/admin/calendario?dia=${ev.start_date}`}
                className="asb-row-hover"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 8 }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-dim)", width: 54 }}>{fmtDateShort(ev.start_date)}</div>
                <div style={{ flex: 1, fontSize: 13.5 }}>{ev.title}</div>
                <CategoryTag category={ev.category} />
              </Link>
            ))}
          </div>
        </div>

        <div className="asb-card" style={{ padding: 18 }}>
          <SectionTitle>Conflitos de agenda</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {conflicts.length === 0 && <EmptyNote>Nenhum conflito no momento. Agenda respeitando as regras de espaçamento.</EmptyNote>}
            {conflicts.slice(0, 6).map((c, i) => (
              <div key={i} style={{ border: "1px solid rgba(217,119,87,0.3)", background: "var(--alert-soft)", borderRadius: 8, padding: "9px 11px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>
                  {c.a.title} <span style={{ color: "var(--ink-dim)", fontWeight: 400 }}>×</span> {c.b.title}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-dim)" }}>
                  {c.severity === "direto" ? "Mesma janela de datas" : `${c.gap} dia(s) de intervalo — mínimo exigido: ${c.minDays}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
