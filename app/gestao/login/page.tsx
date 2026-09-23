"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, signInWithPassword, supabaseConfigured, updatePassword } from "../../../lib/supabase-browser";

export default function ManagementLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("type") === "recovery" && params.get("access_token")) setRecoveryToken(params.get("access_token"));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await signInWithPassword(email, password); window.location.assign("/gestao"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível entrar."); }
    finally { setBusy(false); }
  }
  async function recover() {
    if (!email) { setMessage("Informe seu e-mail para recuperar a senha."); return; }
    setBusy(true); setMessage("");
    try { await requestPasswordReset(email); setMessage("Enviamos as instruções de recuperação para seu e-mail."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar o e-mail."); }
    finally { setBusy(false); }
  }
  async function setNewPassword(event: React.FormEvent) {
    event.preventDefault(); if (!recoveryToken) return;
    setBusy(true); setMessage("");
    try { await updatePassword(recoveryToken, password); window.location.hash = ""; setRecoveryToken(null); setMessage("Senha criada. Agora entre com ela."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível definir a nova senha."); }
    finally { setBusy(false); }
  }
  return <main className="management-login"><section><Link href="/" className="login-brand">Ekonova <span>Gestão</span></Link><p className="login-kicker">Área da equipe</p><h1>Organizar cada jornada começa aqui.</h1><p className="login-lede">Acesse clientes, saídas, pagamentos e preparação de grupos em um só lugar.</p></section><section className="login-card"><h2>{recoveryToken ? "Criar senha" : "Entrar"}</h2>{supabaseConfigured ? <form onSubmit={recoveryToken ? setNewPassword : submit}>{recoveryToken ? <><label>Nova senha<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label><button disabled={busy}>{busy ? "Salvando…" : "Criar nova senha"}</button></> : <><label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label><label>Senha<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label><button disabled={busy}>{busy ? "Entrando…" : "Entrar na gestão"}</button><button type="button" className="login-link" onClick={recover} disabled={busy}>Esqueci minha senha</button></>}{message && <p role="status" className="login-message">{message}</p>}</form> : <div className="login-setup"><p>O acesso seguro será ativado assim que as credenciais do Supabase forem adicionadas à implantação.</p><code>NEXT_PUBLIC_SUPABASE_URL</code><code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code></div>}</section></main>;
}
