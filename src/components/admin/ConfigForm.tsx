"use client";

import { useState, useTransition } from "react";
import { Trophy, PartyPopper, Clock } from "lucide-react";
import type { SpacingRule } from "@/lib/types";
import { PageHeader, SectionTitle } from "@/components/admin/ui";
import { updateConsiderSize, updateSpacingRuleMinDays } from "@/app/admin/(dashboard)/config/actions";

const PAIR_META: Record<string, { label: string; Icon: typeof Trophy }> = {
  esportivo_esportivo: { label: "Esportivo × Esportivo", Icon: Trophy },
  social_social: { label: "Social × Social", Icon: PartyPopper },
  esportivo_social: { label: "Esportivo × Social", Icon: Clock },
};

function pairKey(a: string, b: string) {
  return [a, b].sort().join("_");
}

export default function ConfigForm({ rules, considerSize }: { rules: SpacingRule[]; considerSize: boolean }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(rules.map((r) => [pairKey(r.category_a, r.category_b), r.min_days])),
  );
  const [consider, setConsider] = useState(considerSize);
  const [, startTransition] = useTransition();

  function updateRule(rule: SpacingRule, value: string) {
    const minDays = Math.max(0, parseInt(value, 10) || 0);
    setValues((v) => ({ ...v, [pairKey(rule.category_a, rule.category_b)]: minDays }));
    startTransition(() => {
      updateSpacingRuleMinDays(rule.id, minDays);
    });
  }

  function toggleConsiderSize(checked: boolean) {
    setConsider(checked);
    startTransition(() => {
      updateConsiderSize(checked);
    });
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Regras de espaçamento entre eventos e preferências do sistema" />

      <div className="asb-card" style={{ padding: 20, marginBottom: 18 }}>
        <SectionTitle>Distância mínima entre eventos (em dias)</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {rules.map((rule) => {
            const key = pairKey(rule.category_a, rule.category_b);
            const meta = PAIR_META[key] ?? { label: key, Icon: Clock };
            const Icon = meta.Icon;
            return (
              <div key={rule.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <Icon size={16} color="var(--ink-dim)" /> {meta.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={0}
                    className="asb-input"
                    style={{ width: 70, textAlign: "center", fontFamily: "var(--font-mono)" }}
                    value={values[key] ?? rule.min_days}
                    onChange={(e) => updateRule(rule, e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>dias</span>
                </div>
              </div>
            );
          })}
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
            <input type="checkbox" checked={consider} onChange={(e) => toggleConsiderSize(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: 22, transition: ".15s", background: consider ? "var(--gold)" : "var(--line-strong)" }} />
            <span style={{ position: "absolute", top: 3, left: consider ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "var(--bg)", transition: ".15s" }} />
          </label>
        </div>
      </div>
    </div>
  );
}
