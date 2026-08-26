import React, { useState, useMemo } from "react";
import {
  CalendarDays, LayoutDashboard, ListFilter, ChevronLeft, ChevronRight, X,
  MapPin, Users, Flag, Trophy, PartyPopper, Menu, Search, ArrowUpRight, LayoutGrid
} from "lucide-react";

/* ============================================================
   Identidade visual — Clube Asbemge
   Azul institucional + dourado (herança Bemge), estilo painel
   analítico (BI): fundo claro, cards, tipografia forte para dados.
   ============================================================ */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .abd-root {
    --navy-900: #061B33;
    --navy-800: #0C2C4F;
    --navy-700: #15406B;
    --navy-050: #EAF0F8;
    --gold-700: #8A5B00;
    --gold-600: #C98A00;
    --gold-500: #F0A202;
    --gold-100: #FCEACB;
    --bg: #F4F6F9;
    --surface: #FFFFFF;
    --line: #E3E7EE;
    --line-strong: #CBD2DE;
    --ink: #10233F;
    --ink-dim: #667085;
    --font-display: 'Sora', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-body);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
  }
  .abd-root * { box-sizing: border-box; }
  .abd-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .abd-scroll::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 4px; }
  .abd-chip {
    font-family: var(--font-body); font-weight: 500; font-size: 12.5px;
    border-radius: 999px; padding: 7px 14px; cursor: pointer;
    border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink);
    display: inline-flex; align-items: center; gap: 6px; transition: all .15s ease;
  }
  .abd-chip:hover { border-color: var(--navy-700); }
  .abd-chip:focus-visible { outline: 2px solid var(--navy-700); outline-offset: 2px; }
  .abd-icon-btn {
    border: 1px solid var(--line-strong); background: var(--surface); border-radius: 8px;
    width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--ink); flex-shrink: 0;
  }
  .abd-icon-btn:hover { border-color: var(--navy-700); }
  .abd-card {
    background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
  }
  .abd-nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 9px;
    cursor: pointer; color: rgba(244,246,249,0.65); font-size: 13.5px; font-weight: 500;
    white-space: nowrap; overflow: hidden; transition: background .15s ease, color .15s ease;
  }
  .abd-nav-item:hover { background: rgba(244,246,249,0.07); color: #fff; }
  .abd-nav-item.active { background: var(--gold-500); color: #221600; }
  @media (prefers-reduced-motion: reduce) { .abd-root * { transition: none !important; } }
`;

/* ============================================================
   Dados
   ============================================================ */
const CATEGORY_META = {
  esportivo: { label: "Esportivo", color: "var(--gold-600)", solid: "var(--gold-500)", soft: "var(--gold-100)", Icon: Trophy },
  social:    { label: "Social",    color: "var(--navy-700)", solid: "var(--navy-800)", soft: "var(--navy-050)", Icon: PartyPopper },
};

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const EVENTS = [
  { id: "1", title: "Torneio de Futebol Society", subtitle: "Fase classificatória", description: "Fase classificatória do tradicional torneio interno de futebol society do clube, com equipes formadas por associados.", category: "esportivo", modality: "Futebol", startDate: "2026-09-05", endDate: "", location: "Campo Society", responsible: "Diretoria de Esportes" },
  { id: "2", title: "Aula Aberta de Natação", subtitle: "Experimental para associados", description: "Aula experimental aberta a todos os sócios interessados em conhecer a equipe de natação do clube.", category: "esportivo", modality: "Natação", startDate: "2026-09-07", endDate: "", location: "Piscina", responsible: "Escola de Natação" },
  { id: "3", title: "Festa Junina do Asbemge", subtitle: "Arraiá tradicional do clube", description: "A tradicional festa junina do Asbemge, com comidas típicas, quadrilha e música ao vivo para toda a família.", category: "social", modality: "", startDate: "2026-09-20", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social" },
  { id: "4", title: "Campeonato Interno Sub-13", subtitle: "Categoria de base — Vôlei", description: "Campeonato interno de vôlei para atletas da categoria sub-13, nascidos a partir de 2014.", category: "esportivo", modality: "Vôlei", startDate: "2026-09-21", endDate: "2026-09-25", location: "Quadra Poliesportiva", responsible: "Escola de Vôlei" },
  { id: "5", title: "Aula de Ginástica Funcional", subtitle: "Turma livre ao ar livre", description: "Aula semanal de ginástica funcional aberta, ao ar livre, com professores da equipe de educação física.", category: "esportivo", modality: "Funcional", startDate: "2026-09-30", endDate: "", location: "Quadra Poliesportiva", responsible: "Educação Física" },
  { id: "6", title: "Campeonato de Tênis", subtitle: "Chave única, eliminatória", description: "Campeonato interno de tênis em chave única eliminatória, aberto a todos os níveis.", category: "esportivo", modality: "Tênis", startDate: "2026-10-10", endDate: "2026-10-11", location: "Quadra de Tênis", responsible: "Diretoria de Esportes" },
  { id: "7", title: "Baile a Fantasia", subtitle: "Noite temática de gala", description: "Baile a fantasia de fim de temporada, com música ao vivo, open bar e concurso de melhor fantasia.", category: "social", modality: "", startDate: "2026-10-24", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social" },
  { id: "8", title: "Torneio de Beach Tennis", subtitle: "Torneio aberto", description: "Torneio aberto de beach tennis, com categorias masculina, feminina e mista.", category: "esportivo", modality: "Beach Tennis", startDate: "2026-10-25", endDate: "", location: "Quadra Poliesportiva", responsible: "Diretoria de Esportes" },
  { id: "9", title: "Aniversário do Clube", subtitle: "73 anos de história", description: "Celebração dos 73 anos de fundação do Clube Asbemge, com programação especial para toda a família.", category: "social", modality: "", startDate: "2026-11-15", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social" },
  { id: "10", title: "Torneio Interno de Vôlei", subtitle: "Equipes de associados", description: "Torneio interno de vôlei entre equipes formadas por sócios do clube.", category: "esportivo", modality: "Vôlei", startDate: "2026-11-02", endDate: "", location: "Quadra Poliesportiva", responsible: "Escola de Vôlei" },
  { id: "11", title: "Confraternização de Fim de Ano", subtitle: "Encerramento do calendário social", description: "Festa de confraternização de encerramento do calendário social do ano, com jantar e música ao vivo.", category: "social", modality: "", startDate: "2026-12-13", endDate: "", location: "Salão de Festas", responsible: "Diretoria Social" },
];

/* ============================================================
   Helpers
   ============================================================ */
function parseDate(s) { return new Date(s + "T00:00:00"); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s) { return parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
function fmtDateShort(s) { return parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
function daysUntil(s) { return Math.round((parseDate(s) - parseDate(todayISO())) / 86400000); }

/* ============================================================
   Arte do evento — pôster gerado em SVG nas cores do clube
   (substituível por imagem real via campo artUrl no futuro)
   ============================================================ */
function EventArt({ event, height = 190 }) {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.Icon;
  const isGold = event.category === "esportivo";
  const bg1 = isGold ? "#0C2C4F" : "#0A2038";
  const bg2 = isGold ? "#123B63" : "#15406B";
  const accent = "#F0A202";
  return (
    <svg viewBox="0 0 400 220" width="100%" height={height} style={{ display: "block" }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`grad-${event.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg1} />
          <stop offset="100%" stopColor={bg2} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#grad-${event.id})`} />
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={40 + i * 65} cy={30 + (i % 2) * 150} r={i % 2 === 0 ? 70 : 46} fill={accent} opacity="0.06" />
      ))}
      <rect x="0" y="0" width="400" height="220" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="6" />
      <g transform="translate(28,132)">
        <circle cx="18" cy="18" r="18" fill={accent} opacity="0.16" />
        <foreignObject x="4" y="4" width="28" height="28">
          <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={accent} />
          </div>
        </foreignObject>
      </g>
      <text x="28" y="180" fill="#F4F6F9" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="19">{event.title}</text>
      <text x="28" y="200" fill={accent} fontFamily="IBM Plex Mono, monospace" fontSize="12.5" letterSpacing="0.5">{fmtDate(event.startDate).toUpperCase()}</text>
    </svg>
  );
}

/* ============================================================
   Componentes utilitários
   ============================================================ */
function CategoryTag({ category }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
      padding: "4px 10px", borderRadius: 999, background: meta.soft, color: meta.color
    }}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function Logo({ collapsed }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: collapsed ? 13 : 17, letterSpacing: "-0.01em", color: "#fff" }}>
        {collapsed ? "AB" : "ASBEMGE"}
      </div>
    );
  }
  return (
    <img
      src="https://asbemge.com.br/wp-content/uploads/2025/04/logo_white.png"
      alt="Clube Asbemge"
      style={{ height: collapsed ? 26 : 32, width: "auto", objectFit: "contain", maxWidth: collapsed ? 32 : 150 }}
      onError={() => setFailed(true)}
    />
  );
}

/* ============================================================
   App principal
   ============================================================ */
export default function AsbemgeDashboardPublico() {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState("painel"); // painel | calendario | eventos
  const [calSubview, setCalSubview] = useState("mensal"); // mensal | anual
  const [catFilter, setCatFilter] = useState("todos");
  const [refMonth, setRefMonth] = useState(new Date(2026, 8, 1));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      const matchCat = catFilter === "todos" || e.category === catFilter;
      const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [catFilter, query]);

  const upcoming = useMemo(() => {
    return [...EVENTS].filter(e => e.startDate >= todayISO()).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, []);

  const nextEvent = upcoming[0];
  const esportivosCount = EVENTS.filter(e => e.category === "esportivo").length;
  const sociaisCount = EVENTS.filter(e => e.category === "social").length;

  const NAV_ITEMS = [
    { key: "painel", label: "Painel", Icon: LayoutDashboard },
    { key: "calendario", label: "Calendário", Icon: CalendarDays },
    { key: "eventos", label: "Eventos", Icon: ListFilter },
  ];

  return (
    <div className="abd-root" style={{ minHeight: 720 }}>
      <style>{TOKENS}</style>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 68 : 214, flexShrink: 0, background: "var(--navy-900)",
        display: "flex", flexDirection: "column", padding: "16px 12px", gap: 4, transition: "width .18s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: "0 4px 20px 4px" }}>
          {!collapsed && <Logo collapsed={false} />}
          <button className="abd-icon-btn" onClick={() => setCollapsed(c => !c)}
            style={{ background: "rgba(244,246,249,0.08)", border: "none", color: "#fff" }}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
            <Menu size={16} />
          </button>
        </div>
        {collapsed && <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo collapsed={true} /></div>}

        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <div key={key} className={`abd-nav-item ${view === key ? "active" : ""}`}
            onClick={() => setView(key)} title={collapsed ? label : undefined}
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
            <Icon size={17} />
            {!collapsed && label}
          </div>
        ))}

        {!collapsed && (
          <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 10.5, color: "rgba(244,246,249,0.4)", padding: "16px 12px 4px" }}>
            Consulta pública · somente leitura
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>
              {view === "painel" ? "Painel" : view === "calendario" ? "Calendário de Eventos" : "Eventos"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-dim)" }}>Esportivos e sociais · Clube Asbemge</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 8, padding: "7px 12px" }}>
            <Search size={14} color="var(--ink-dim)" />
            <input
              value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar evento..."
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: 13, width: 160 }}
            />
          </div>
        </div>

        <div className="abd-scroll" style={{ padding: "22px 26px", overflowY: "auto", maxHeight: 720 }}>
          {view === "painel" && (
            <PainelView
              events={EVENTS} upcoming={upcoming} nextEvent={nextEvent}
              esportivosCount={esportivosCount} sociaisCount={sociaisCount}
              onSelect={setSelectedEvent}
            />
          )}

          {view === "calendario" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["todos", "esportivo", "social"].map(c => (
                    <button key={c} className="abd-chip" onClick={() => setCatFilter(c)}
                      style={{
                        background: catFilter === c ? (c === "esportivo" ? "var(--gold-100)" : c === "social" ? "var(--navy-050)" : "var(--navy-900)") : "var(--surface)",
                        color: catFilter === c ? (c === "todos" ? "#fff" : CATEGORY_META[c]?.color) : "var(--ink)",
                        borderColor: catFilter === c ? "transparent" : "var(--line-strong)",
                        textTransform: "capitalize"
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="abd-chip" onClick={() => setCalSubview("mensal")} style={{ background: calSubview === "mensal" ? "var(--navy-900)" : "var(--surface)", color: calSubview === "mensal" ? "#fff" : "var(--ink)", borderColor: calSubview === "mensal" ? "transparent" : "var(--line-strong)" }}>
                    <CalendarDays size={13} /> Mês
                  </button>
                  <button className="abd-chip" onClick={() => setCalSubview("anual")} style={{ background: calSubview === "anual" ? "var(--navy-900)" : "var(--surface)", color: calSubview === "anual" ? "#fff" : "var(--ink)", borderColor: calSubview === "anual" ? "transparent" : "var(--line-strong)" }}>
                    <LayoutGrid size={13} /> Ano
                  </button>
                </div>
              </div>

              {calSubview === "mensal" && (
                <MonthlyView events={filtered} refMonth={refMonth} setRefMonth={setRefMonth} onSelect={setSelectedEvent} />
              )}
              {calSubview === "anual" && (
                <AnnualView events={filtered} year={refMonth.getFullYear()} onOpenMonth={(m) => { setRefMonth(new Date(refMonth.getFullYear(), m, 1)); setCalSubview("mensal"); }} />
              )}
            </div>
          )}

          {view === "eventos" && (
            <EventosGrid events={filtered} onSelect={setSelectedEvent} />
          )}
        </div>
      </div>

      {selectedEvent && <EventSpotlight event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

/* ============================================================
   Painel
   ============================================================ */
function PainelView({ events, upcoming, nextEvent, esportivosCount, sociaisCount, onSelect }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Kpi label="Eventos cadastrados" value={events.length} />
        <Kpi label="Esportivos" value={esportivosCount} accent="var(--gold-600)" />
        <Kpi label="Sociais" value={sociaisCount} accent="var(--navy-700)" />
        <Kpi label="Próximo evento" value={nextEvent ? `${daysUntil(nextEvent.startDate)}d` : "—"} sub={nextEvent ? nextEvent.title : ""} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>
        Em destaque
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {upcoming.slice(0, 6).map(ev => (
          <div key={ev.id} className="abd-card" style={{ overflow: "hidden", cursor: "pointer" }}
            onClick={() => onSelect(ev)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}>
            <EventArt event={ev} height={110} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 3 }}>{fmtDateShort(ev.startDate)} · {ev.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, accent }) {
  return (
    <div className="abd-card" style={{ padding: "16px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500, color: accent || "var(--ink)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
}

/* ============================================================
   Calendário mensal
   ============================================================ */
function MonthlyView({ events, refMonth, setRefMonth, onSelect }) {
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
    <div className="abd-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="abd-icon-btn" onClick={() => setRefMonth(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
          <button className="abd-icon-btn" onClick={() => setRefMonth(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(l => (
          <div key={l} style={{ fontSize: 10.5, color: "var(--ink-dim)", textAlign: "center", paddingBottom: 4, fontWeight: 500 }}>{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayEvents = eventsByDate[key] || [];
          return (
            <div key={i} style={{
              minHeight: 78, borderRadius: 8, padding: "6px 6px",
              border: "1px solid var(--line)",
              background: key === todayISO() ? "var(--gold-100)" : "transparent"
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-dim)" }}>{d}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} onClick={() => onSelect(e)} style={{
                    fontSize: 9.5, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontWeight: 500,
                    background: CATEGORY_META[e.category].soft, color: CATEGORY_META[e.category].color,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
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

/* ============================================================
   Calendário anual (matriz estilo BI)
   ============================================================ */
function AnnualView({ events, year, onOpenMonth }) {
  const countsByMonth = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => ({ esportivo: 0, social: 0 }));
    events.forEach(e => {
      const d = parseDate(e.startDate);
      if (d.getFullYear() === year) counts[d.getMonth()][e.category]++;
    });
    return counts;
  }, [events, year]);

  const max = Math.max(1, ...countsByMonth.map(c => c.esportivo + c.social));

  return (
    <div className="abd-card" style={{ padding: 18 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Panorama {year}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {MONTH_NAMES.map((name, m) => {
          const c = countsByMonth[m];
          const total = c.esportivo + c.social;
          return (
            <div key={m} onClick={() => onOpenMonth(m)} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12, cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)" }}>{total}</div>
              </div>
              <div style={{ display: "flex", gap: 3, marginTop: 10, height: 28, alignItems: "flex-end" }}>
                <div style={{ flex: 1, height: `${(c.esportivo / max) * 100}%`, minHeight: c.esportivo ? 4 : 0, background: "var(--gold-500)", borderRadius: 2 }} />
                <div style={{ flex: 1, height: `${(c.social / max) * 100}%`, minHeight: c.social ? 4 : 0, background: "var(--navy-700)", borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11.5, color: "var(--ink-dim)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--gold-500)", display: "inline-block" }} /> Esportivo</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--navy-700)", display: "inline-block" }} /> Social</span>
      </div>
    </div>
  );
}

/* ============================================================
   Lista de eventos (somente leitura)
   ============================================================ */
function EventosGrid({ events, onSelect }) {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {sorted.map(ev => (
        <div key={ev.id} className="abd-card" style={{ overflow: "hidden", cursor: "pointer" }}
          onClick={() => onSelect(ev)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}>
          <EventArt event={ev} height={130} />
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ev.title}</div>
              <CategoryTag category={ev.category} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={12} /> {fmtDateShort(ev.startDate)} · <MapPin size={12} /> {ev.location}
            </div>
          </div>
        </div>
      ))}
      {sorted.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-dim)" }}>Nenhum evento encontrado.</div>}
    </div>
  );
}

/* ============================================================
   Painel de destaque do evento (somente leitura)
   ============================================================ */
function EventSpotlight({ event, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(6,27,51,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20
    }} onClick={onClose}>
      <div className="abd-root abd-scroll" style={{ width: 480, maxHeight: "88vh", overflowY: "auto", display: "block" }} onClick={(e) => e.stopPropagation()}>
        <style>{TOKENS}</style>
        <div style={{ position: "relative" }}>
          <EventArt event={event} height={220} />
          <button className="abd-icon-btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(6,27,51,0.5)", border: "none", color: "#fff" }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <CategoryTag category={event.category} />
            {event.modality && <span style={{ fontSize: 12, color: "var(--ink-dim)", display: "flex", alignItems: "center", gap: 4 }}><Flag size={12} /> {event.modality}</span>}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}>{event.title}</div>
          {event.subtitle && <div style={{ fontSize: 13.5, color: "var(--ink-dim)", marginTop: 4 }}>{event.subtitle}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <InfoRow icon={CalendarDays} text={event.endDate ? `${fmtDate(event.startDate)} até ${fmtDate(event.endDate)}` : fmtDate(event.startDate)} />
            <InfoRow icon={MapPin} text={event.location} />
            <InfoRow icon={Users} text={event.responsible} />
          </div>

          {event.description && (
            <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6, marginTop: 16 }}>{event.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--navy-050)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={13} color="var(--navy-700)" />
      </div>
      {text}
    </div>
  );
}
