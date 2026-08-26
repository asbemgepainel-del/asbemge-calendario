"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";
import type { EventCategory, EventRow, EventSize, EventStatus, Location, Settings, SpacingRule } from "@/lib/types";
import { conflictsForEvent } from "@/lib/conflicts";
import { fmtDate, todayISO } from "@/lib/format";

const SIZE_LABELS: Record<EventSize, string> = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

export default function EventForm({
  initial, events, locations, rules, settings, action,
}: {
  initial?: EventRow;
  events: EventRow[];
  locations: Location[];
  rules: SpacingRule[];
  settings: Settings;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? "esportivo");
  const [size, setSize] = useState<EventSize>(initial?.size ?? "medio");
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayISO());
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");

  const liveConflicts = useMemo(() => {
    if (!startDate) return [];
    return conflictsForEvent(
      { start_date: startDate, end_date: endDate || null, category, size },
      events,
      rules,
      settings,
      initial?.id,
    );
  }, [startDate, endDate, category, size, events, rules, settings, initial?.id]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,16,13,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div className="asb-root asb-scroll" style={{ width: 560, maxHeight: "88vh", overflowY: "auto", padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600 }}>
            {initial ? "Editar evento" : "Novo evento"}
          </div>
          <Link href="/admin/eventos" className="asb-btn" style={{ padding: 6, border: "none" }}>
            <X size={16} />
          </Link>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="asb-label" htmlFor="title">Título</label>
            <input className="asb-input" id="title" name="title" defaultValue={initial?.title} placeholder="Ex: Torneio de Futebol Society" required />
          </div>

          <div>
            <label className="asb-label" htmlFor="description">Descrição</label>
            <textarea className="asb-textarea" id="description" name="description" rows={2} defaultValue={initial?.description ?? ""} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="category">Categoria</label>
              <select className="asb-select" id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
                <option value="esportivo">Esportivo</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="asb-label" htmlFor="modality">Modalidade {category === "social" && "(opcional)"}</label>
              <input className="asb-input" id="modality" name="modality" defaultValue={initial?.modality ?? ""} placeholder="Ex: Futebol, Natação..." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="start_date">Data de início</label>
              <input className="asb-input" id="start_date" name="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="asb-label" htmlFor="end_date">Data final (se +1 dia)</label>
              <input className="asb-input" id="end_date" name="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="start_time">Horário de início</label>
              <input className="asb-input" id="start_time" name="start_time" type="time" defaultValue={initial?.start_time ?? ""} />
            </div>
            <div>
              <label className="asb-label" htmlFor="end_time">Horário final</label>
              <input className="asb-input" id="end_time" name="end_time" type="time" defaultValue={initial?.end_time ?? ""} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="location_id">Local</label>
              <select className="asb-select" id="location_id" name="location_id" defaultValue={initial?.location_id ?? ""}>
                <option value="">Selecione...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="asb-label" htmlFor="responsible">Responsável</label>
              <input className="asb-input" id="responsible" name="responsible" defaultValue={initial?.responsible ?? ""} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="size">Porte do evento</label>
              <select className="asb-select" id="size" name="size" value={size} onChange={(e) => setSize(e.target.value as EventSize)}>
                {(Object.keys(SIZE_LABELS) as EventSize[]).map((k) => (
                  <option key={k} value={k}>{SIZE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="asb-label" htmlFor="status">Status</label>
              <select className="asb-select" id="status" name="status" defaultValue={initial?.status ?? ("confirmado" as EventStatus)}>
                <option value="rascunho">Rascunho</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label" htmlFor="capacity">Capacidade (opcional)</label>
              <input className="asb-input" id="capacity" name="capacity" type="number" min={0} defaultValue={initial?.capacity ?? ""} />
            </div>
            <div>
              <label className="asb-label" htmlFor="attachment">Arte / pôster do evento</label>
              <input className="asb-input" id="attachment" name="attachment" type="file" accept="image/*" style={{ padding: 6 }} />
            </div>
          </div>

          {liveConflicts.length > 0 && (
            <div style={{ padding: 12, borderRadius: 8, background: "var(--alert-soft)", border: "1px solid rgba(217,119,87,0.35)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--alert)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={13} /> Conflito de agenda detectado
              </div>
              {liveConflicts.map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 2 }}>
                  <strong style={{ color: "var(--ink)" }}>{c.other.title}</strong> ({fmtDate(c.other.start_date)}) —{" "}
                  {c.severity === "direto" ? "mesma janela de datas" : `${c.gap} dia(s) de intervalo, mínimo exigido ${c.minDays}`}
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 6, fontStyle: "italic" }}>
                Isso é apenas um alerta — você pode manter o cadastro mesmo assim.
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <Link href="/admin/eventos" className="asb-btn">Cancelar</Link>
            <button className="asb-btn asb-btn-primary" type="submit">
              <Check size={14} /> Salvar evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
