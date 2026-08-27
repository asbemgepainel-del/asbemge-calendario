"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  LayoutDashboard,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Users,
  Flag,
  Trophy,
  PartyPopper,
  Menu,
  Search,
  LayoutGrid,
} from "lucide-react";
import type { EventCategory, EventWithLocation } from "@/lib/types";
import { parseDate, todayISO, fmtDate, fmtDateMonthShort, daysUntil } from "@/lib/format";

const CATEGORY_META: Record<EventCategory, { label: string; color: string; solid: string; soft: string; Icon: typeof Trophy }> = {
  esportivo: { label: "Esportivo", color: "var(--gold-600)", solid: "var(--gold-500)", soft: "var(--gold-100)", Icon: Trophy },
  social: { label: "Social", color: "var(--navy-700)", solid: "var(--navy-800)", soft: "var(--navy-050)", Icon: PartyPopper },
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/* ============================================================
   Arte do evento — imagem enviada (attachment_url) ou pôster SVG
   gerado nas cores do clube como placeholder.
   ============================================================ */
function EventArt({
  event, height = 190, orientation = "landscape",
}: {
  event: EventWithLocation;
  height?: number;
  orientation?: "landscape" | "portrait";
}) {
  const isPortrait = orientation === "portrait";
  // Aspect ratio lives on the wrapper div, never on the <svg> itself — CSS
  // aspect-ratio support on replaced SVG elements is inconsistent (notably
  // older mobile Safari), so the art must fill a pre-sized box instead.
  const containerStyle = isPortrait
    ? { position: "relative" as const, width: "100%", aspectRatio: "4 / 5", overflow: "hidden" as const }
    : { position: "relative" as const, width: "100%", height, overflow: "hidden" as const };

  if (event.attachment_url) {
    return (
      <div style={containerStyle}>
        <Image
          src={event.attachment_url}
          alt={event.title}
          fill
          sizes={isPortrait ? "480px" : "400px"}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  const meta = CATEGORY_META[event.category];
  const Icon = meta.Icon;
  const isGold = event.category === "esportivo";
  const bg1 = isGold ? "#0C2C4F" : "#0A2038";
  const bg2 = isGold ? "#123B63" : "#15406B";
  const accent = "#F0A202";

  // A single normalized 0-100 canvas, cropped with "slice" to whatever box
  // it lands in. No text baked into the artwork — the title and date are
  // always shown as real HTML right next to it, so nothing here can ever
  // overflow regardless of how long an event title is.
  return (
    <div style={containerStyle}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`grad-${event.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={bg1} />
            <stop offset="100%" stopColor={bg2} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#grad-${event.id})`} />
        <circle cx="18" cy="20" r="30" fill={accent} opacity="0.07" />
        <circle cx="85" cy="78" r="24" fill={accent} opacity="0.07" />
        <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="16" fill={accent} opacity="0.14" />
        <foreignObject x="36" y="36" width="28" height="28">
          <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} color={accent} />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

function CategoryTag({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.Icon;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
        padding: "4px 10px", borderRadius: 999, background: meta.soft, color: meta.color,
      }}
    >
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: collapsed ? 13 : 17, letterSpacing: "-0.01em", color: "#fff" }}>
        {collapsed ? "AB" : "ASBEMGE"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://asbemge.com.br/wp-content/uploads/2025/04/logo_white.png"
      alt="Clube Asbemge"
      style={{ height: collapsed ? 26 : 32, width: "auto", objectFit: "contain", maxWidth: collapsed ? 32 : 150 }}
      onError={() => setFailed(true)}
    />
  );
}

type View = "painel" | "calendario" | "eventos";
type CalSubview = "mensal" | "anual";
type CatFilter = "todos" | EventCategory;

export default function PublicDashboard({ events }: { events: EventWithLocation[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<View>("painel");
  const [calSubview, setCalSubview] = useState<CalSubview>("mensal");
  const [catFilter, setCatFilter] = useState<CatFilter>("todos");
  const [refMonth, setRefMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventWithLocation | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const applyCollapse = () => setCollapsed(window.innerWidth < 768);
    applyCollapse();
    window.addEventListener("resize", applyCollapse);
    return () => window.removeEventListener("resize", applyCollapse);
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = catFilter === "todos" || e.category === catFilter;
      const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [events, catFilter, query]);

  const upcoming = useMemo(() => {
    return [...events].filter((e) => e.start_date >= todayISO()).sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events]);

  const nextEvent = upcoming[0];
  const esportivosCount = events.filter((e) => e.category === "esportivo").length;
  const sociaisCount = events.filter((e) => e.category === "social").length;

  const NAV_ITEMS: { key: View; label: string; Icon: typeof LayoutDashboard }[] = [
    { key: "painel", label: "Painel", Icon: LayoutDashboard },
    { key: "calendario", label: "Calendário", Icon: CalendarDays },
    { key: "eventos", label: "Eventos", Icon: ListFilter },
  ];

  return (
    <div className="abd-root" style={{ minHeight: "100vh" }}>
      <div
        style={{
          width: collapsed ? 68 : 214, flexShrink: 0, background: "var(--navy-900)",
          display: "flex", flexDirection: "column", padding: "16px 12px", gap: 4, transition: "width .18s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: "0 4px 20px 4px" }}>
          {!collapsed && <Logo collapsed={false} />}
          <button
            className="abd-icon-btn"
            onClick={() => setCollapsed((c) => !c)}
            style={{ background: "rgba(244,246,249,0.08)", border: "none", color: "#fff" }}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <Menu size={16} />
          </button>
        </div>
        {collapsed && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo collapsed={true} />
          </div>
        )}

        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <div
            key={key}
            className={`abd-nav-item ${view === key ? "active" : ""}`}
            onClick={() => setView(key)}
            title={collapsed ? label : undefined}
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
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

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>
              {view === "painel" ? "Painel" : view === "calendario" ? "Calendário de Eventos" : "Eventos"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-dim)" }}>Esportivos e sociais · Clube Asbemge</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 8, padding: "7px 12px", flex: "1 1 180px", minWidth: 0, maxWidth: 320 }}>
            <Search size={14} color="var(--ink-dim)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar evento..."
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: 13, width: "100%", minWidth: 0 }}
            />
          </div>
        </div>

        <div className="abd-scroll" style={{ padding: "18px 16px", overflowY: "auto" }}>
          {view === "painel" && (
            <PainelView
              events={events}
              upcoming={upcoming}
              nextEvent={nextEvent}
              esportivosCount={esportivosCount}
              sociaisCount={sociaisCount}
              onSelect={setSelectedEvent}
            />
          )}

          {view === "calendario" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["todos", "esportivo", "social"] as CatFilter[]).map((c) => (
                    <button
                      key={c}
                      className="abd-chip"
                      onClick={() => setCatFilter(c)}
                      style={{
                        background: catFilter === c ? (c === "esportivo" ? "var(--gold-100)" : c === "social" ? "var(--navy-050)" : "var(--navy-900)") : "var(--surface)",
                        color: catFilter === c ? (c === "todos" ? "#fff" : CATEGORY_META[c].color) : "var(--ink)",
                        borderColor: catFilter === c ? "transparent" : "var(--line-strong)",
                        textTransform: "capitalize",
                      }}
                    >
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
                <AnnualView
                  events={filtered}
                  year={refMonth.getFullYear()}
                  onOpenMonth={(m) => {
                    setRefMonth(new Date(refMonth.getFullYear(), m, 1));
                    setCalSubview("mensal");
                  }}
                />
              )}
            </div>
          )}

          {view === "eventos" && <EventosGrid events={filtered} onSelect={setSelectedEvent} />}
        </div>
      </div>

      {selectedEvent && <EventSpotlight event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

function PainelView({
  events, upcoming, nextEvent, esportivosCount, sociaisCount, onSelect,
}: {
  events: EventWithLocation[];
  upcoming: EventWithLocation[];
  nextEvent: EventWithLocation | undefined;
  esportivosCount: number;
  sociaisCount: number;
  onSelect: (e: EventWithLocation) => void;
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Kpi label="Eventos cadastrados" value={events.length} />
        <Kpi label="Esportivos" value={esportivosCount} accent="var(--gold-600)" />
        <Kpi label="Sociais" value={sociaisCount} accent="var(--navy-700)" />
        <Kpi label="Próximo evento" value={nextEvent ? `${daysUntil(nextEvent.start_date)}d` : "—"} sub={nextEvent ? nextEvent.title : ""} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>
        Em destaque
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {upcoming.slice(0, 6).map((ev) => (
          <div
            key={ev.id}
            className="abd-card"
            style={{ overflow: "hidden", cursor: "pointer" }}
            onClick={() => onSelect(ev)}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line-strong)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          >
            <EventArt event={ev} height={110} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 3 }}>
                {fmtDateMonthShort(ev.start_date)} · {ev.location?.name ?? "—"}
              </div>
            </div>
          </div>
        ))}
        {upcoming.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-dim)" }}>Nenhum evento futuro cadastrado.</div>}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="abd-card" style={{ padding: "16px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500, color: accent || "var(--ink)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
}

function buildEventsByDate(events: EventWithLocation[]) {
  const map: Record<string, EventWithLocation[]> = {};
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

function MonthlyView({
  events, refMonth, setRefMonth, onSelect,
}: {
  events: EventWithLocation[];
  refMonth: Date;
  setRefMonth: (d: Date) => void;
  onSelect: (e: EventWithLocation) => void;
}) {
  const year = refMonth.getFullYear();
  const month = refMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => buildEventsByDate(events), [events]);

  const cells: (number | null)[] = [];
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
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((l) => (
          <div key={l} style={{ fontSize: 10.5, color: "var(--ink-dim)", textAlign: "center", paddingBottom: 4, fontWeight: 500 }}>{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayEvents = eventsByDate[key] || [];
          return (
            <div
              key={i}
              style={{
                minHeight: 78, borderRadius: 8, padding: "6px 6px",
                border: "1px solid var(--line)",
                background: key === todayISO() ? "var(--gold-100)" : "transparent",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-dim)" }}>{d}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    onClick={() => onSelect(e)}
                    style={{
                      fontSize: 9.5, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontWeight: 500,
                      background: CATEGORY_META[e.category].soft, color: CATEGORY_META[e.category].color,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}
                  >
                    {e.title}
                  </div>
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

function AnnualView({ events, year, onOpenMonth }: { events: EventWithLocation[]; year: number; onOpenMonth: (m: number) => void }) {
  const countsByMonth = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => ({ esportivo: 0, social: 0 }));
    events.forEach((e) => {
      const d = parseDate(e.start_date);
      if (d.getFullYear() === year) counts[d.getMonth()][e.category]++;
    });
    return counts;
  }, [events, year]);

  return (
    <div className="abd-card" style={{ padding: 18 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Panorama {year}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
        {MONTH_NAMES.map((name, m) => {
          const c = countsByMonth[m];
          const total = c.esportivo + c.social;
          const active = total > 0;
          return (
            <button
              key={m}
              onClick={() => onOpenMonth(m)}
              style={{
                border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                background: "var(--surface)", textAlign: "left", opacity: active ? 1 : 0.55, fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>{name.slice(0, 3)}</div>
              <div
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 500,
                  color: active ? "var(--ink)" : "var(--ink-dim)", marginBottom: active ? 8 : 0,
                }}
              >
                {total}
              </div>
              {active && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {c.esportivo > 0 && (
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 3, background: "var(--gold-100)",
                        color: "var(--gold-700)", fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 999,
                      }}
                    >
                      <Trophy size={10} /> {c.esportivo}
                    </span>
                  )}
                  {c.social > 0 && (
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 3, background: "var(--navy-050)",
                        color: "var(--navy-700)", fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 999,
                      }}
                    >
                      <PartyPopper size={10} /> {c.social}
                    </span>
                  )}
                </div>
              )}
            </button>
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

function EventosGrid({ events, onSelect }: { events: EventWithLocation[]; onSelect: (e: EventWithLocation) => void }) {
  const sorted = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
      {sorted.map((ev) => (
        <div
          key={ev.id}
          className="abd-card"
          style={{ overflow: "hidden", cursor: "pointer" }}
          onClick={() => onSelect(ev)}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--line-strong)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
        >
          <EventArt event={ev} height={130} />
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ev.title}</div>
              <CategoryTag category={ev.category} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <CalendarDays size={12} /> {fmtDateMonthShort(ev.start_date)} · <MapPin size={12} /> {ev.location?.name ?? "—"}
            </div>
          </div>
        </div>
      ))}
      {sorted.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-dim)" }}>Nenhum evento encontrado.</div>}
    </div>
  );
}

function EventSpotlight({ event, onClose }: { event: EventWithLocation; onClose: () => void }) {
  return (
    <div
      className="abd-spotlight-overlay"
      style={{
        position: "fixed", inset: 0, background: "rgba(6,27,51,0.55)", display: "flex",
        justifyContent: "center", zIndex: 50,
      }}
      onClick={onClose}
    >
      <div className="abd-root abd-scroll abd-spotlight" style={{ overflowY: "auto", display: "block" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <EventArt event={event} orientation="portrait" />
          <button className="abd-icon-btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(6,27,51,0.5)", border: "none", color: "#fff" }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <CategoryTag category={event.category} />
            {event.modality && (
              <span style={{ fontSize: 12, color: "var(--ink-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                <Flag size={12} /> {event.modality}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, lineHeight: 1.25, overflowWrap: "break-word" }}>{event.title}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <InfoRow icon={CalendarDays} text={event.end_date ? `${fmtDate(event.start_date)} até ${fmtDate(event.end_date)}` : fmtDate(event.start_date)} />
            {event.location?.name && <InfoRow icon={MapPin} text={event.location.name} />}
            {event.responsible && <InfoRow icon={Users} text={event.responsible} />}
          </div>

          {event.description && <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6, marginTop: 16 }}>{event.description}</div>}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--navy-050)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={13} color="var(--navy-700)" />
      </div>
      {text}
    </div>
  );
}
