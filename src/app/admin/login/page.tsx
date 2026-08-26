"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="asb-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="asb-card" style={{ width: 380, padding: 32 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, marginBottom: 4 }}>Asbemge</div>
        <div style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 24 }}>Painel administrativo · Esportes &amp; Eventos</div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="asb-label" htmlFor="email">E-mail</label>
            <input className="asb-input" id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className="asb-label" htmlFor="password">Senha</label>
            <input className="asb-input" id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          {error && (
            <div style={{ fontSize: 12.5, color: "var(--alert)", background: "var(--alert-soft)", borderRadius: 8, padding: "8px 10px" }}>
              {error}
            </div>
          )}

          <button className="asb-btn asb-btn-primary" type="submit" disabled={pending} style={{ justifyContent: "center", marginTop: 6 }}>
            <LogIn size={14} /> {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 20, textAlign: "center" }}>
          Acesso restrito à diretoria. Fale com a administração para receber suas credenciais.
        </div>
      </div>
    </div>
  );
}
