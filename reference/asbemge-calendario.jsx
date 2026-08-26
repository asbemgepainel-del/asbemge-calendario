import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, CalendarDays, ListPlus, Settings, AlertTriangle,
  ChevronLeft, ChevronRight, Trash2, Pencil, X, Check, MapPin, Trophy,
  PartyPopper, Clock, Users, Flag
} from "lucide-react";

/* ============================================================
   Tokens de design
   - fundo: verde-tinta profundo (campo à noite)
   - dourado: eventos esportivos (troféu)
   - vinho: eventos sociais (festa)
   - mono para números/datas (placar)
   ============================================================ */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .asb-root {
    --bg: #12211B;
    --bg-elev: #1A2E26;
    --bg-elev-2: #213A30;
    --line: rgba(243,238,225,0.12);
    --line-strong: rgba(243,238,225,0.22);
    --ink: #F3EEE1;
    --ink-dim: #A9B5AC;
    --gold: #C9A227;
    --gold-soft: rgba(201,162,39,0.16);
    --wine: #B24A5B;
    --wine-soft: rgba(178,74,91,0.16);
    --field: #4E8C5B;
    --alert: #D97757;
    --alert-soft: rgba(217,119,87,0.18);
    --font-display: 'Fraunces', serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-body);
    min-height: 100%;
    border-radius: 16px;
    overflow: hidden;
  }
  .asb-root * { box-sizing: border-box; }
  .asb-root ::selection { background: var(--gold-soft); }
  .asb-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .asb-scroll::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 4px; }
  .asb-btn {
    font-family: var(--font-body); font-weight: 500; font-size: 13px;
    border-radius: 8px; padding: 8px 14px; cursor: pointer;
    border: 1px solid var(--line-strong); background: transparent; color: var(--ink);
    display: inline-flex; align-items: center; gap: 6px; transition: all .15s ease;
  }
  .asb-btn:hover { background: rgba(243,238,225,0.06); border-color: var(--ink-dim); }
  .asb-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .asb-btn-primary { background: var(--gold); color: #201A05; border-color: var(--gold); }
  .asb-btn-primary:hover { background: #DDB53A; }
  .asb-input, .asb-select, .asb-textarea {
    width: 100%; background: var(--bg); border: 1px solid var(--line-strong);
    color: var(--ink); border-radius: 8px; padding: 9px 10px; font-family: var(--font-body);
    font-size: 13.5px;
  }
  .asb-input:focus, .asb-select:focus, .asb-textarea:focus {
    outline: none; border-color: var(--gold);
  }
  .asb-label { font-size: 11.5px; color: var(--ink-dim); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; display: block; }
  .asb-card {
    background: var(--bg-elev); border: 1px solid var(--line); border-radius: 12px;
  }
  @media (prefers-reduced-motion: reduce) { .asb-root * { transition: none !important; } }
`;

/* ============================================================
   Dados / regras
   ============================================================ */
const CATEGORY_META = {
  esportivo: { label: "Esportivo", color: "var(--gold)", soft: "var(--gold-soft)", Icon: Trophy },
  social:    { label: "Social",    color: "var(--wine)", soft: "var(--wine-soft)", Icon: PartyPopper },
};

const SIZE_META = {
  pequeno: { label: "Pequeno", bonus: 0 },
  medio:   { label: "Médio",   bonus: 0 },
  grande:  { label: "Grande",  bonus: 2 },
};

const LOCATIONS = ["Quadra Poliesportiva", "Salão de Festas", "Piscina", "Campo Society", "Quadra de Tênis"];

const SEED_EVENTS = [
  { id: "1", title: "Torneio de Futebol Society — Classificatória", description: "Fase classificatória do torneio interno de futebol society.", category: "esportivo", modality: "Futebol", startDate: "2026-09-05", endDate: "", location: "Campo Society", responsible: "Marcos Lima", size: "grande", status: "confirmado" },
  { id: "2", title: "Aula Aberta de Natação", description: "Aula experimental aberta aos sócios.", category: "esportivo", modality: "Natação", startDate: "2026-09-07", endDate: "", location: "Piscina", responsible: "Ana Beatriz", size: "pequeno", status: "confirmado" },
  { id: "3", title: "Festa Junina do Asbemge", description: "Festa junina tradicional do clube.", category: "social", modality: "", startDate: "2026-09-20", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social", size: "grande", status: "confirmado" },
  { id: "4", title: "Reunião de Diretoria", description: "Reunião mensal ordinária da diretoria.", category: "social", modality: "", startDate: "2026-09-22", endDate: "", location: "Salão de Festas", responsible: "Presidência", size: "pequeno", status: "confirmado" },
  { id: "5", title: "Aula de Ginástica Funcional", description: "Aula semanal de funcional ao ar livre.", category: "esportivo", modality: "Funcional", startDate: "2026-09-30", endDate: "", location: "Quadra Poliesportiva", responsible: "Carla Nunes", size: "pequeno", status: "confirmado" },
  { id: "6", title: "Campeonato de Tênis", description: "Campeonato interno de tênis, chave única.", category: "esportivo", modality: "Tênis", startDate: "2026-10-10", endDate: "2026-10-11", location: "Quadra de Tênis", responsible: "Marcos Lima", size: "medio", status: "confirmado" },
  { id: "7", title: "Torneio de Beach Tennis", description: "Torneio aberto de beach tennis.", category: "esportivo", modality: "Beach Tennis", startDate: "2026-10-25", endDate: "", location: "Quadra Poliesportiva", responsible: "André", size: "medio", status: "confirmado" },
  { id: "8", title: "Aniversário do Clube", description: "Celebração de aniversário de fundação do Asbemge.", category: "social", modality: "", startDate: "2026-11-15", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social", size: "grande", status: "confirmado" },
  { id: "9", title: "Torneio Interno de Vôlei", description: "Torneio interno entre equipes de sócios.", category: "esportivo", modality: "Vôlei", startDate: "2026-11-02", endDate: "", location: "Quadra Poliesportiva", responsible: "Marcos Lima", size: "medio", status: "confirmado" },
  { id: "10", title: "Confraternização de Fim de Ano", description: "Festa de encerramento do calendário social do ano.", category: "social", modality: "", startDate: "2026-12-13", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social", size: "grande", status: "confirmado" },
];

const DEFAULT_RULES = { esportivo_esportivo: 3, social_social: 5, esportivo_social: 1 };

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAY_LETTERS = ["D","S","T","Q","Q","S","S"];

/* ============================================================
   Helpers de data / conflito
   ============================================================ */
function parseDate(s) { return new Date(s + "T00:00:00"); }
function diffDays(a, b) { return Math.round((b - a) / 86400000); }
function ruleKey(catA, catB) { return [catA, catB].sort().join("_"); }

function dateGapDays(a, b) {
  const aStart = parseDate(a.startDate), aEnd = parseDate(a.endDate || a.startDate);
  const bStart = parseDate(b.startDate), bEnd = parseDate(b.endDate || b.startDate);
  if (aEnd < bStart) return diffDays(aEnd, bStart);
  if (bEnd < aStart) return diffDays(bEnd, aStart);
  return 0;
}

function getMinDays(catA, catB, rules, considerSize, sizeA, sizeB) {
  let min = rules[ruleKey(catA, catB)] ?? 3;
  if (considerSize) {
    const bonus = Math.max(SIZE_META[sizeA]?.bonus || 0, SIZE_META[sizeB]?.bonus || 0);
    min += bonus;
  }
  return min;
}

function computeConflicts(events, rules, considerSize) {
  const active = events.filter(e => e.status !== "cancelado");
  const conflicts = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      const gap = dateGapDays(a, b);
      const minDays = getMinDays(a.category, b.category, rules, considerSize, a.size, b.size);
      if (gap < minDays) {
        conflicts.push({ a, b, gap, minDays, severity: gap === 0 ? "direto" : "proximidade" });
      }
    }
  }
  return conflicts;
}

function conflictsForEvent(draftEvent, allEvents, rules, considerSize, excludeId) {
  const others = allEvents.filter(e => e.id !== excludeId && e.status !== "cancelado");
  const out = [];
  for (const other of others) {
    const gap = dateGapDays(draftEvent, other);
    const minDays = getMinDays(draftEvent.category, other.category, rules, considerSize, draftEvent.size, other.size);
    if (gap < minDays) out.push({ other, gap, minDays, severity: gap === 0 ? "direto" : "proximidade" });
  }
  return out;
}

function fmtDate(s) {
  if (!s) return "";
  const d = parseDate(s);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateShort(s) {
  const d = parseDate(s);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/* ============================================================
   Componentes utilitários
   ============================================================ */
function CategoryTag({ category, size = 12 }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500,
      padding: "3px 9px", borderRadius: 999, background: meta.soft, color: meta.color,
      fontFamily: "var(--font-body)", whiteSpace: "nowrap"
    }}>
      <Icon size={size} /> {meta.label}
    </span>
  );
}

function ConflictBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 999, background: "var(--alert-soft)", color: "var(--alert)"
    }}>
      <AlertTriangle size={11} /> {count}
    </span>
  );
}

/* ============================================================
   App principal
   ============================================================ */
export default function AsbemgeCalendario() {
  const [events, setEvents] = useState(SEED_EVENTS);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [considerSize, setConsiderSize] = useState(true);
  const [view, setView] = useState("dashboard");
  const [calSubview, setCalSubview] = useState("mensal");
  const [catFilter, setCatFilter] = useState("todos");
  const [refMonth, setRefMonth] = useState(new Date(2026, 8, 1)); // set 2026
  const [selectedDay, setSelectedDay] = useState(todayISO());
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const conflicts = useMemo(() => computeConflicts(events, rules, considerSize), [events, rules, considerSize]);

  const conflictCountByEventId = useMemo(() => {
    const map = {};
    conflicts.forEach(c => {
      map[c.a.id] = (map[c.a.id] || 0) + 1;
      map[c.b.id] = (map[c.b.id] || 0) + 1;
    });
    return map;
  }, [conflicts]);

  const filteredEvents = useMemo(() => {
    if (catFilter === "todos") return events;
    return events.filter(e => e.category === catFilter);
  }, [events, catFilter]);

  function saveEvent(ev) {
    setEvents(prev => {
      const exists = prev.some(e => e.id === ev.id);
      return exists ? prev.map(e => (e.id === ev.id ? ev : e)) : [...prev, ev];
    });
    setShowForm(false);
    setEditingEvent(null);
  }
  function deleteEvent(id) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const upcoming = useMemo(() => {
    return [...events]
      .filter(e => e.status !== "cancelado")
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .filter(e => e.startDate >= todayISO())
      .slice(0, 6);
  }, [events]);

  return (
    <div className="asb-root" style={{ display: "flex", minHeight: 640 }}>
      <style>{TOKENS}</style>

      {/* Sidebar */}
      <div style={{ width: 208, borderRight: "1px solid var(--line)", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ padding: "0 8px 22px 8px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.01em" }}>Asbemge</div>
          <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 2 }}>Esportes &amp; Eventos</div>
        </div>
        <NavItem icon={LayoutDashboard} label="Painel" active={view === "dashboard"} onClick={() => setView("dashboard")} />
        <NavItem icon={CalendarDays} label="Calendário" active={view === "calendario"} onClick={() => setView("calendario")} />
        <NavItem icon={ListPlus} label="Eventos" active={view === "eventos"} onClick={() => setView("eventos")} />
        <NavItem icon={Settings} label="Configurações" active={view === "config"} onClick={() => setView("config")} />
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button className="asb-btn asb-btn-primary" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => { setEditingEvent(null); setShowForm(true); }}>
            <ListPlus size={14} /> Novo evento
          </button>
          {conflicts.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--alert)", display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}>
              <AlertTriangle size={13} /> {conflicts.length} conflito{conflicts.length > 1 ? "s" : ""} ativo{conflicts.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="asb-scroll" style={{ flex: 1, padding: "26px 30px", overflowY: "auto", maxHeight: 760 }}>
        {view === "dashboard" && (
          <Dashboard events={events} conflicts={conflicts} upcoming={upcoming} onSelectDay={(d) => { setSelectedDay(d); setCalSubview("dia"); setView("calendario"); }} />
        )}

        {view === "calendario" && (
          <CalendarioView
            events={filteredEvents}
            allEvents={events}
            conflicts={conflicts}
            conflictCountByEventId={conflictCountByEventId}
            subview={calSubview} setSubview={setCalSubview}
            catFilter={catFilter} setCatFilter={setCatFilter}
            refMonth={refMonth} setRefMonth={setRefMonth}
            selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            onEdit={(ev) => { setEditingEvent(ev); setShowForm(true); }}
          />
        )}

        {view === "eventos" && (
          <EventosView
            events={events}
            conflictCountByEventId={conflictCountByEventId}
            onEdit={(ev) => { setEditingEvent(ev); setShowForm(true); }}
            onDelete={deleteEvent}
          />
        )}

        {view === "config" && (
          <ConfigView rules={rules} setRules={setRules} considerSize={considerSize} setConsiderSize={setConsiderSize} />
        )}
      </div>

      {showForm && (
        <EventForm
          initial={editingEvent}
          events={events}
          rules={rules}
          considerSize={considerSize}
          onCancel={() => { setShowForm(false); setEditingEvent(null); }}
          onSave={saveEvent}
        />
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="asb-btn" style={{
      justifyContent: "flex-start", border: "none", background: active ? "rgba(201,162,39,0.12)" : "transparent",
      color: active ? "var(--gold)" : "var(--ink-dim)", fontWeight: active ? 600 : 500, padding: "9px 10px"
    }}>
      <Icon size={16} /> {label}
    </button>
  );
}

/* ============================================================
   Painel (Dashboard)
   ============================================================ */
function Dashboard({ events, conflicts, upcoming, onSelectDay }) {
  const active = events.filter(e => e.status !== "cancelado");
  const esportivos = active.filter(e => e.category === "esportivo").length;
  const sociais = active.filter(e => e.category === "social").length;

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
            {upcoming.map(ev => (
              <div key={ev.id} onClick={() => onSelectDay(ev.startDate)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(243,238,225,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-dim)", width: 54 }}>{fmtDateShort(ev.startDate)}</div>
                <div style={{ flex: 1, fontSize: 13.5 }}>{ev.title}</div>
                <CategoryTag category={ev.category} />
              </div>
            ))}
          </div>
        </div>

        <div className="asb-card" style={{ padding: 18 }}>
          <SectionTitle>Conflitos de agenda</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {conflicts.length === 0 && <EmptyNote>Nenhum conflito no momento. Agenda respeitando as regras de espaçamento.</EmptyNote>}
            {conflicts.slice(0, 6).map((c, i) => (
              <div key={i} style={{
                border: "1px solid rgba(217,119,87,0.3)", background: "var(--alert-soft)", borderRadius: 8, padding: "9px 11px"
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>{c.a.title} <span style={{ color: "var(--ink-dim)", fontWeight: 400 }}>×</span> {c.b.title}</div>
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

function StatCard({ label, value, accent }) {
  return (
    <div className="asb-card" style={{ padding: "16px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: accent || "var(--ink)" }}>{value}</div>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "var(--ink-dim)", marginTop: 3 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
function SectionTitle({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-dim)" }}>{children}</div>;
}
function EmptyNote({ children }) {
  return <div style={{ fontSize: 12.5, color: "var(--ink-dim)", padding: "10px 4px" }}>{children}</div>;
}

/* ============================================================
   Calendário (Anual / Mensal / Dia)
   ============================================================ */
function CalendarioView(props) {
  const { events, allEvents, conflicts, conflictCountByEventId, subview, setSubview, catFilter, setCatFilter, refMonth, setRefMonth, selectedDay, setSelectedDay, onEdit } = props;

  return (
    <div>
      <PageHeader title="Calendário" subtitle="Visualização anual, mensal e diária dos eventos"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            {["anual", "mensal", "dia"].map(v => (
              <button key={v} className="asb-btn" onClick={() => setSubview(v)}
                style={{ background: subview === v ? "var(--bg-elev-2)" : "transparent", textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["todos", "esportivo", "social"].map(c => (
          <button key={c} className="asb-btn" onClick={() => setCatFilter(c)}
            style={{
              background: catFilter === c ? (c === "esportivo" ? "var(--gold-soft)" : c === "social" ? "var(--wine-soft)" : "var(--bg-elev-2)") : "transparent",
              color: catFilter === c && c !== "todos" ? CATEGORY_META[c].color : "var(--ink)",
              textTransform: "capitalize"
            }}>
            {c}
          </button>
        ))}
      </div>

      {subview === "anual" && <AnnualView events={events} year={refMonth.getFullYear()} onOpenMonth={(m) => { setRefMonth(new Date(refMonth.getFullYear(), m, 1)); setSubview("mensal"); }} />}
      {subview === "mensal" && <MonthlyView events={events} conflictCountByEventId={conflictCountByEventId} refMonth={refMonth} setRefMonth={setRefMonth} onOpenDay={(d) => { setSelectedDay(d); setSubview("dia"); }} />}
      {subview === "dia" && <DailyView events={allEvents} conflicts={conflicts} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onEdit={onEdit} />}
    </div>
  );
}

function AnnualView({ events, year, onOpenMonth }) {
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const start = parseDate(e.startDate);
      const end = parseDate(e.endDate || e.startDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        (map[key] = map[key] || []).push(e);
      }
    });
    return map;
  }, [events]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {MONTH_NAMES.map((name, m) => (
        <div key={m} className="asb-card" style={{ padding: 12, cursor: "pointer" }} onClick={() => onOpenMonth(m)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{name}</div>
          <MiniMonthGrid year={year} month={m} eventsByDate={eventsByDate} />
        </div>
      ))}
    </div>
  );
}

function MiniMonthGrid({ year, month, eventsByDate }) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
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
        const hasSport = dayEvents.some(e => e.category === "esportivo");
        const hasSocial = dayEvents.some(e => e.category === "social");
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

function MonthlyView({ events, conflictCountByEventId, refMonth, setRefMonth, onOpenDay }) {
  const year = refMonth.getFullYear(), month = refMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const start = parseDate(e.startDate);
      const end = parseDate(e.endDate || e.startDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        (map[key] = map[key] || []).push(e);
      }
    });
    return map;
  }, [events]);

  const cells = [];
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
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(l => (
          <div key={l} style={{ fontSize: 10.5, color: "var(--ink-dim)", textAlign: "center", paddingBottom: 4 }}>{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayEvents = eventsByDate[key] || [];
          const hasConflict = dayEvents.some(e => conflictCountByEventId[e.id]);
          return (
            <div key={i} onClick={() => onOpenDay(key)} style={{
              minHeight: 74, borderRadius: 8, padding: "6px 6px", cursor: "pointer",
              border: hasConflict ? "1px solid rgba(217,119,87,0.45)" : "1px solid var(--line)",
              background: key === todayISO() ? "rgba(201,162,39,0.07)" : "transparent"
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(243,238,225,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = key === todayISO() ? "rgba(201,162,39,0.07)" : "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)" }}>{d}</span>
                {hasConflict && <AlertTriangle size={11} color="var(--alert)" />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} style={{
                    fontSize: 9.5, padding: "2px 5px", borderRadius: 4, background: CATEGORY_META[e.category].soft,
                    color: CATEGORY_META[e.category].color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                  }}>{e.title}</div>
                ))}
                {dayEvents.length > 2 && <div style={{ fontSize: 9, color: "var(--ink-dim)" }}>+{dayEvents.length - 2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyView({ events, conflicts, selectedDay, setSelectedDay, onEdit }) {
  const dayEvents = events.filter(e => {
    const start = e.startDate, end = e.endDate || e.startDate;
    return selectedDay >= start && selectedDay <= end && e.status !== "cancelado";
  });
  const dayConflicts = conflicts.filter(c => dayEvents.some(e => e.id === c.a.id || e.id === c.b.id));

  function shiftDay(delta) {
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
        {dayEvents.map(ev => (
          <div key={ev.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 14, cursor: "pointer" }}
            onClick={() => onEdit(ev)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{ev.title}</div>
              <CategoryTag category={ev.category} />
            </div>
            {ev.description && <div style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 6 }}>{ev.description}</div>}
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12 }}>
              {ev.location && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-dim)" }}><MapPin size={12} /> {ev.location}</span>}
              {ev.responsible && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-dim)" }}><Users size={12} /> {ev.responsible}</span>}
              {ev.modality && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-dim)" }}><Flag size={12} /> {ev.modality}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Eventos (lista / gestão)
   ============================================================ */
function EventosView({ events, conflictCountByEventId, onEdit, onDelete }) {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <div>
      <PageHeader title="Eventos" subtitle="Todos os eventos cadastrados no clube" />
      <div className="asb-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["Data", "Evento", "Categoria", "Local", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(ev => (
              <tr key={ev.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--ink-dim)" }}>{fmtDateShort(ev.startDate)}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {ev.title}
                    <ConflictBadge count={conflictCountByEventId[ev.id]} />
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}><CategoryTag category={ev.category} /></td>
                <td style={{ padding: "10px 14px", color: "var(--ink-dim)" }}>{ev.location}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontSize: 11.5, color: ev.status === "cancelado" ? "var(--alert)" : "var(--field)" }}>{ev.status}</span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="asb-btn" style={{ padding: "5px 8px" }} onClick={() => onEdit(ev)}><Pencil size={12} /></button>
                    <button className="asb-btn" style={{ padding: "5px 8px" }} onClick={() => onDelete(ev.id)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   Formulário de cadastro / edição de evento
   ============================================================ */
function EventForm({ initial, events, rules, considerSize, onCancel, onSave }) {
  const [form, setForm] = useState(initial || {
    id: String(Date.now()), title: "", description: "", category: "esportivo", modality: "",
    startDate: todayISO(), endDate: "", location: LOCATIONS[0], responsible: "", size: "medio", status: "confirmado"
  });

  const liveConflicts = useMemo(() => {
    if (!form.startDate) return [];
    return conflictsForEvent(form, events, rules, considerSize, form.id);
  }, [form, events, rules, considerSize]);

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function handleSubmit() {
    if (!form.title.trim() || !form.startDate) return;
    onSave(form);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,16,13,0.65)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20
    }} onClick={onCancel}>
      <div className="asb-root asb-scroll" style={{ width: 560, maxHeight: "88vh", overflowY: "auto", padding: 26 }} onClick={(e) => e.stopPropagation()}>
        <style>{TOKENS}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600 }}>
            {initial ? "Editar evento" : "Novo evento"}
          </div>
          <button className="asb-btn" style={{ padding: 6, border: "none" }} onClick={onCancel}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="asb-label">Título</label>
            <input className="asb-input" value={form.title} onChange={e => update("title", e.target.value)} placeholder="Ex: Torneio de Futebol Society" />
          </div>

          <div>
            <label className="asb-label">Descrição</label>
            <textarea className="asb-textarea" rows={2} value={form.description} onChange={e => update("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label">Categoria</label>
              <select className="asb-select" value={form.category} onChange={e => update("category", e.target.value)}>
                <option value="esportivo">Esportivo</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="asb-label">Modalidade {form.category === "social" && "(opcional)"}</label>
              <input className="asb-input" value={form.modality} onChange={e => update("modality", e.target.value)} placeholder="Ex: Futebol, Natação..." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label">Data de início</label>
              <input type="date" className="asb-input" value={form.startDate} onChange={e => update("startDate", e.target.value)} />
            </div>
            <div>
              <label className="asb-label">Data final (se +1 dia)</label>
              <input type="date" className="asb-input" value={form.endDate} onChange={e => update("endDate", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label">Local</label>
              <select className="asb-select" value={form.location} onChange={e => update("location", e.target.value)}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="asb-label">Responsável</label>
              <input className="asb-input" value={form.responsible} onChange={e => update("responsible", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="asb-label">Porte do evento</label>
              <select className="asb-select" value={form.size} onChange={e => update("size", e.target.value)}>
                {Object.entries(SIZE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="asb-label">Status</label>
              <select className="asb-select" value={form.status} onChange={e => update("status", e.target.value)}>
                <option value="rascunho">Rascunho</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          {liveConflicts.length > 0 && (
            <div style={{ padding: 12, borderRadius: 8, background: "var(--alert-soft)", border: "1px solid rgba(217,119,87,0.35)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--alert)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={13} /> Conflito de agenda detectado
              </div>
              {liveConflicts.map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 2 }}>
                  <strong style={{ color: "var(--ink)" }}>{c.other.title}</strong> ({fmtDate(c.other.startDate)}) —{" "}
                  {c.severity === "direto" ? "mesma janela de datas" : `${c.gap} dia(s) de intervalo, mínimo exigido ${c.minDays}`}
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 6, fontStyle: "italic" }}>
                Isso é apenas um alerta — você pode manter o cadastro mesmo assim.
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <button className="asb-btn" onClick={onCancel}>Cancelar</button>
            <button className="asb-btn asb-btn-primary" onClick={handleSubmit}><Check size={14} /> Salvar evento</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Configurações
   ============================================================ */
function ConfigView({ rules, setRules, considerSize, setConsiderSize }) {
  function updateRule(key, value) {
    setRules(r => ({ ...r, [key]: Math.max(0, parseInt(value) || 0) }));
  }

  const pairs = [
    { key: "esportivo_esportivo", label: "Esportivo × Esportivo", Icon: Trophy },
    { key: "social_social", label: "Social × Social", Icon: PartyPopper },
    { key: "esportivo_social", label: "Esportivo × Social", Icon: Clock },
  ];

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Regras de espaçamento entre eventos e preferências do sistema" />

      <div className="asb-card" style={{ padding: 20, marginBottom: 18 }}>
        <SectionTitle>Distância mínima entre eventos (em dias)</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {pairs.map(({ key, label, Icon }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <Icon size={16} color="var(--ink-dim)" /> {label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={0} className="asb-input" style={{ width: 70, textAlign: "center", fontFamily: "var(--font-mono)" }}
                  value={rules[key]} onChange={e => updateRule(key, e.target.value)} />
                <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>dias</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="asb-card" style={{ padding: 20 }}>
        <SectionTitle>Preferências</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, padding: "4px" }}>
          <div>
            <div style={{ fontSize: 13.5 }}>Considerar porte do evento no cálculo</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginTop: 2 }}>Eventos de porte grande somam +2 dias à distância mínima exigida.</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 40, height: 22, cursor: "pointer" }}>
            <input type="checkbox" checked={considerSize} onChange={e => setConsiderSize(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: "absolute", inset: 0, borderRadius: 22, transition: ".15s",
              background: considerSize ? "var(--gold)" : "var(--line-strong)"
            }} />
            <span style={{
              position: "absolute", top: 3, left: considerSize ? 21 : 3, width: 16, height: 16, borderRadius: "50%",
              background: "var(--bg)", transition: ".15s"
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}
