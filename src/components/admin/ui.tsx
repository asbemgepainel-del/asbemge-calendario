export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
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

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-dim)" }}>{children}</div>;
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, color: "var(--ink-dim)", padding: "10px 4px" }}>{children}</div>;
}

export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="asb-card" style={{ padding: "16px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: accent || "var(--ink)" }}>{value}</div>
    </div>
  );
}
