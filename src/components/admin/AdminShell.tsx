"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, ListPlus, Settings, AlertTriangle, LogOut,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel", Icon: LayoutDashboard },
  { href: "/admin/calendario", label: "Calendário", Icon: CalendarDays },
  { href: "/admin/eventos", label: "Eventos", Icon: ListPlus },
  { href: "/admin/config", label: "Configurações", Icon: Settings },
];

export default function AdminShell({
  children, conflictCount, directorName,
}: {
  children: React.ReactNode;
  conflictCount: number;
  directorName: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="asb-root" style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 208, borderRight: "1px solid var(--line)", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ padding: "0 8px 22px 8px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.01em" }}>Asbemge</div>
          <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 2 }}>Esportes &amp; Eventos</div>
        </div>

        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="asb-btn"
              style={{
                justifyContent: "flex-start", border: "none", background: active ? "rgba(201,162,39,0.12)" : "transparent",
                color: active ? "var(--gold)" : "var(--ink-dim)", fontWeight: active ? 600 : 500, padding: "9px 10px",
              }}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <Link href="/admin/eventos/novo" className="asb-btn asb-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <ListPlus size={14} /> Novo evento
          </Link>
          {conflictCount > 0 && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--alert)", display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}>
              <AlertTriangle size={13} /> {conflictCount} conflito{conflictCount > 1 ? "s" : ""} ativo{conflictCount > 1 ? "s" : ""}
            </div>
          )}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            {directorName && <div style={{ fontSize: 12, color: "var(--ink-dim)", padding: "0 10px 8px" }}>{directorName}</div>}
            <form action={signOut}>
              <button className="asb-btn" style={{ width: "100%", justifyContent: "flex-start", border: "none", color: "var(--ink-dim)" }}>
                <LogOut size={14} /> Sair
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="asb-scroll" style={{ flex: 1, padding: "26px 30px", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
