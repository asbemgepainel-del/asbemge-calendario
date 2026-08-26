"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, Users, Flag } from "lucide-react";
import type { EventCategory, EventConflict, EventRow } from "@/lib/types";
import { parseDate, todayISO, fmtDate } from "@/lib/format";
import { conflictCountByEventId as computeConflictCountByEventId } from "@/lib/conflicts";
import { PageHeader, EmptyNote } from "@/components/admin/ui";
import { CategoryTag } from "@/components/admin/CategoryTag";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

type Subview = "anual" | "mensal" | "dia";
type CatFilter = "todos" | EventCategory;

export default function AdminCalendario({
  events, conflicts, initialDay,
}: {
  events: EventRow[];
  conflicts: EventConflict[];
  initialDay?: string;
}) {
  const [subview, setSubview] = useState<Subview>(initialDay ? "dia" : "mensal");
  const [catFilter, setCatFilter] = useState<CatFilter>("todos");
  const [refMonth, setRefMonth] = useState(() => (initialDay ? parseDate(initialDay) : new Date()));
  const [selectedDay, setSelectedDay] = useState(initialDay || todayISO());

  const filteredEvents = useMemo(() => {
    if (catFilter === "todos") return events;
    return events.filter((e) => e.category === catFilter);
  }, [events, catFilter]);

  const conflictCountByEventId = useMemo(() => computeConflictCountByEventId(conflicts), [conflicts]);

  return (
    <div>
      <PageHeader
        title="Calendário"
        subtitle="Visualização anual, mensal e diária dos eventos"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            {(["anual", "mensal", "dia"] as Subview[]).map((v) => (
              <button key={v} className="asb-btn" onClick={() => setSubview(v)} style={{ background: subview === v ? "var(--bg-elev-2)" : "transparent", textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {(["todos", "esportivo", "social"] as CatFilter[]).map((c) => (
          <button
            key={c}
            className="asb-btn"
            onClick={() => setCatFilter(c)}
            style={{
              background: catFilter === c ? (c === "esportivo" ? "var(--gold-soft)" : c === "social" ? "var(--wine-soft)" : "var(--bg-elev-2)") : "transparent",
              color: catFilter === c && c !== "todos" ? (c === "esportivo" ? "var(--gold)" : "var(--wine)") : "var(--ink)",
              textTransform: "capitalize",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {subview === "anual" && (
        <AnnualView
          events={filteredEvents}
          year={refMonth.getFullYear()}
          onOpenMonth={(m) => {
            setRefMonth(new Date(refMonth.getFullYear(), m, 1));
            setSubview("mensal");
          }}
        />
      )}
      {subview === "mensal" && (
        <MonthlyView
          events={filteredEvents}
          conflictCountByEventId={conflictCountByEventId}
          refMonth={refMonth}
          setRefMonth={setRefMonth}
          onOpenDay={(d) => {
            setSelectedDay(d);
            setSubview("dia");
          }}
        />
      )}
      {subview === "dia" && (
        <DailyView events={events} conflicts={conflicts} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      )}
    </div>
  );
}

function eventsByDateMap(events: EventRow[]) {
  const map: Record<string, EventRow[]> = {};
  events.forEach((e) => {
    const start = parseDate(e.start_date);
    const end = parseDate(e.end_date || e.start_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      (map[key] = map[key] || []).push(e);
    }
  });
  return map;
}

function AnnualView({ events, year, onOpenMonth }: { events: EventRow[]; year: number; onOpenMonth: (m: number) => void }) {
  const eventsByDate = useMemo(() => eventsByDateMap(events), [events]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {MONTH_NAMES.map((name, m) => (
        <button
          key={m}
          className="asb-card"
          style={{ padding: 12, cursor: "pointer", textAlign: "left", border: "1px solid var(--line)" }}
          onClick={() => onOpenMonth(m)}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{name}</div>
          <MiniMonthGrid year={year} month={m} eventsByDate={eventsByDate} />
        </button>
      ))}
    </div>
  );
}

function MiniMonthGrid({ year, month, eventsByDate }: { year: number; month: number; eventsByDate: Record<string, EventRow[]> }) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
      {WEEKDAY_LETTERS.map((l, i) => (
        <div key={i} style={{ fontSize: 8.5, color: "var(--ink-dim)", textAlign: "center" }}>{l}</div>
      ))}
      {cells.map((d, i) => {
        if (!d) return <div key={i} />;
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayEvents = eventsByDate[key] || [];
        const hasSport = dayEvents.some((e) => e.category === "esportivo");
        const hasSocial = dayEvents.some((e) => e.category === "social");
        return (
          <div key={i} style={{ position: "relative", textAlign: "center", fontSize: 9.5, fontFamily: "var(--font-mono)", color: "var(--ink-dim)", padding: "2px 0" }}>
            {d}
            {(hasSport || hasSocial) && (
              <div style={{ display: "flex", gap: 1.5, justifyContent: "center", marginTop: 1 }}>
                {hasSport && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--gold)" }} />}
                {hasSocial && <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--wine)" }} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MonthlyView({
  events, conflictCountByEventId, refMonth, setRefMonth, onOpenDay,
}: {
  events: EventRow[];
  conflictCountByEventId: Record<string, number>;
  refMonth: Date;
  setRefMonth: (d: Date) => void;
  onOpenDay: (d: string) => void;
}) {
  const year = refMonth.getFullYear();
  const month = refMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => eventsByDateMap(events), [events]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="asb-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="asb-btn" onClick={() => setRefMonth(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
          <button className="asb-btn" onClick={() => setRefMonth(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((l) => (
          <div key={l} style={{ fontSize: 10.5, color: "var(--ink-dim)", textAlign: "center", paddingBottom: 4 }}>{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayEvents = eventsByDate[key] || [];
          const hasConflict = dayEvents.some((e) => conflictCountByEventId[e.id]);
          return (
            <button
              key={i}
              onClick={() => onOpenDay(key)}
              style={{
                minHeight: 74, borderRadius: 8, padding: "6px 6px", cursor: "pointer", textAlign: "left",
                border: hasConflict ? "1px solid rgba(217,119,87,0.45)" : "1px solid var(--line)",
                background: key === todayISO() ? "rgba(201,162,39,0.07)" : "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)" }}>{d}</span>
                {hasConflict && <AlertTriangle size={11} color="var(--alert)" />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    style={{
                      fontSize: 9.5, padding: "2px 5px", borderRadius: 4, background: e.category === "esportivo" ? "var(--gold-soft)" : "var(--wine-soft)",
                      color: e.category === "esportivo" ? "var(--gold)" : "var(--wine)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 2 && <div style={{ fontSize: 9, color: "var(--ink-dim)" }}>+{dayEvents.length - 2}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DailyView({
  events, conflicts, selectedDay, setSelectedDay,
}: {
  events: EventRow[];
  conflicts: EventConflict[];
  selectedDay: string;
  setSelectedDay: (d: string) => void;
}) {
  const dayEvents = events.filter((e) => {
    const start = e.start_date;
    const end = e.end_date || e.start_date;
    return selectedDay >= start && selectedDay <= end && e.status !== "cancelado";
  });
  const dayConflicts = conflicts.filter((c) => dayEvents.some((e) => e.id === c.a.id || e.id === c.b.id));

  function shiftDay(delta: number) {
    const d = parseDate(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d.toISOString().slice(0, 10));
  }

  return (
    <div className="asb-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{fmtDate(selectedDay)}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="asb-btn" onClick={() => shiftDay(-1)}><ChevronLeft size={14} /></button>
          <button className="asb-btn" onClick={() => shiftDay(1)}><ChevronRight size={14} /></button>
        </div>
      </div>

      {dayConflicts.length > 0 && (
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: "var(--alert-soft)", border: "1px solid rgba(217,119,87,0.35)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--alert)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={13} /> {dayConflicts.length} conflito(s) envolvendo eventos deste dia
          </div>
          {dayConflicts.map((c, i) => (
            <div key={i} style={{ fontSize: 11.5, color: "var(--ink-dim)" }}>
              {c.a.title} × {c.b.title} — {c.gap} dia(s) de intervalo, mínimo {c.minDays}
            </div>
          ))}
        </div>
      )}

      {dayEvents.length === 0 && <EmptyNote>Nenhum evento cadastrado para esta data.</EmptyNote>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dayEvents.map((ev) => (
          <Link key={ev.id} href={`/admin/eventos/${ev.id}`} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 14, display: "block", color: "inherit", textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{ev.title}</div>
              <CategoryTag category={ev.category} />
            </div>
            {ev.description && <div style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 6 }}>{ev.description}</div>}
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12 }}>
              {ev.responsible && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-dim)" }}><Users size={12} /> {ev.responsible}</span>}
              {ev.modality && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-dim)" }}><Flag size={12} /> {ev.modality}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
