"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClientDocumentRecord,
  ClientPortalRecord,
  getClientSession,
  listClientDocuments,
  loadClientPortal,
  requestClientPasswordReset,
  saveClientSession,
  signInClientWithPassword,
  signOutClient,
  signUpClient,
  supabaseConfigured,
  updatePassword,
  updateClientPortalProfile,
} from "@/lib/supabase-browser";
import "./minha-area.css";

type AccessMode = "entrar" | "criar" | "recuperar";
type PortalTab = "cadastro" | "pagamentos" | "documentos" | "saude";

const money = (value: number, currency: "USD" | "BRL") => new Intl.NumberFormat(currency === "USD" ? "en-US" : "pt-BR", { style: "currency", currency }).format(value / 100);
const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");

export default function MinhaAreaPage() {
  const [mode, setMode] = useState<AccessMode>("entrar");
  const [tab, setTab] = useState<PortalTab>("cadastro");
  const [email, setEmail] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<ClientPortalRecord | null>(null);
  const [documents, setDocuments] = useState<ClientDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const record = await loadClientPortal();
      setProfile(record);
      if (record) setDocuments(await listClientDocuments(record.id).catch(() => []));
      if (!record) setMessage("Não encontramos uma inscrição vinculada a este e-mail. Use o mesmo e-mail informado na inscrição.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar sua área.");
      signOutClient();
      setProfile(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const isRecovery = hash.get("type") === "recovery";
    if (accessToken && refreshToken) {
      if (!isRecovery) saveClientSession({ access_token: accessToken, refresh_token: refreshToken, user: { id: "" } });
      window.history.replaceState({}, document.title, "/minha-area");
    }
    queueMicrotask(() => {
      if (isRecovery && accessToken) { setRecoveryToken(accessToken); setLoading(false); return; }
      if (getClientSession() || (accessToken && refreshToken)) void load(); else setLoading(false);
    });
  // This reads the one-time e-mail confirmation token only when the page opens.
  }, []);

  const submitAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(""); setBusy(true);
    try {
      if (!email.trim()) throw new Error("Informe o e-mail usado na inscrição.");
      if (mode === "recuperar") {
        await requestClientPasswordReset(email.trim());
        setMessage("Enviamos as instruções de redefinição para o seu e-mail.");
      } else if (mode === "criar") {
        if (password.length < 10) throw new Error("Escolha uma senha com pelo menos 10 caracteres.");
        if (password !== confirmPassword) throw new Error("As senhas não conferem.");
        const result = await signUpClient(email.trim(), password);
        if (result.requiresEmailConfirmation) setMessage("Conta criada. Confirme o link enviado ao seu e-mail e depois entre aqui.");
        else await load();
      } else {
        await signInClientWithPassword(email.trim(), password);
        await load();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível concluir esta etapa."); }
    finally { setBusy(false); }
  };

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setSavingProfile(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await updateClientPortalProfile(profile.id, {
        full_name: String(form.get("full_name") || "").trim(), phone: String(form.get("phone") || "").trim() || null,
        city: String(form.get("city") || "").trim() || null, cpf: String(form.get("cpf") || "").trim() || null,
        rg: String(form.get("rg") || "").trim() || null, passport_number: String(form.get("passport_number") || "").trim() || null,
        street: String(form.get("street") || "").trim() || null, neighborhood: String(form.get("neighborhood") || "").trim() || null,
        postal_code: String(form.get("postal_code") || "").trim() || null, emergency_contact_name: String(form.get("emergency_contact_name") || "").trim() || null,
        emergency_contact_phone: String(form.get("emergency_contact_phone") || "").trim() || null, health_plan: String(form.get("health_plan") || "").trim() || null,
        health_plan_phone: String(form.get("health_plan_phone") || "").trim() || null, medical_conditions: String(form.get("medical_conditions") || "").trim() || null,
        allergies: String(form.get("allergies") || "").trim() || null, medications: String(form.get("medications") || "").trim() || null,
        dietary_restrictions: String(form.get("dietary_restrictions") || "").trim() || null,
      });
      setProfile({ ...profile, ...updated });
      setMessage("Dados atualizados com sucesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar os dados."); }
    finally { setSavingProfile(false); }
  };

  const saveNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recoveryToken) return;
    setBusy(true); setMessage("");
    try {
      if (password.length < 10) throw new Error("Escolha uma senha com pelo menos 10 caracteres.");
      if (password !== confirmPassword) throw new Error("As senhas não conferem.");
      await updatePassword(recoveryToken, password);
      setRecoveryToken(null); setPassword(""); setConfirmPassword(""); setMode("entrar");
      setMessage("Senha atualizada. Entre com sua nova senha.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível atualizar a senha."); }
    finally { setBusy(false); }
  };

  const payments = useMemo(() => profile?.reservations.flatMap((reservation) => reservation.payments.map((payment) => ({ ...payment, reservation }))) ?? [], [profile]);

  if (!supabaseConfigured) return <main className="portal-shell"><section className="portal-card"><h1>Área do viajante</h1><p>O acesso ainda está sendo preparado.</p></section></main>;

  if (loading) return <main className="portal-shell"><p className="portal-loading">Carregando sua área…</p></main>;

  if (recoveryToken) return <main className="portal-shell"><section className="portal-access"><Link className="portal-brand" href="/">EKONOVA <span>ADVENTURE</span></Link><p className="portal-eyebrow">NOVA SENHA</p><h1>Defina uma senha segura.</h1><p className="portal-intro">Use pelo menos 10 caracteres e não compartilhe esta senha.</p><form onSubmit={saveNewPassword} className="portal-access-form"><label>Nova senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /></label><label>Confirme a nova senha<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} required /></label><button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar nova senha"}</button></form>{message && <p className="portal-message">{message}</p>}</section></main>;

  if (!profile) return <main className="portal-shell"><section className="portal-access">
    <Link className="portal-brand" href="/">EKONOVA <span>ADVENTURE</span></Link>
    <p className="portal-eyebrow">ÁREA DO VIAJANTE</p><h1>Seu acesso à viagem.</h1>
    <p className="portal-intro">Consulte pagamentos, documentos e mantenha seus dados de viagem atualizados.</p>
    <form onSubmit={submitAccess} className="portal-access-form">
      <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required /></label>
      {mode !== "recuperar" && <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /></label>}
      {mode === "criar" && <label>Confirme sua senha<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} required /></label>}
      <button type="submit" disabled={busy}>{busy ? "Aguarde…" : mode === "entrar" ? "Entrar na minha área" : mode === "criar" ? "Criar acesso seguro" : "Enviar instruções"}</button>
    </form>
    {message && <p className="portal-message">{message}</p>}
    <div className="portal-access-links">
      {mode !== "entrar" && <button onClick={() => { setMode("entrar"); setMessage(""); }}>Já tenho acesso</button>}
      {mode !== "criar" && <button onClick={() => { setMode("criar"); setMessage(""); }}>Criar meu acesso</button>}
      {mode !== "recuperar" && <button onClick={() => { setMode("recuperar"); setMessage(""); }}>Esqueci minha senha</button>}
    </div>
    <p className="portal-help">Use o mesmo e-mail informado na inscrição. A senha é pessoal e não é compartilhada com a equipe.</p>
  </section></main>;

  return <main className="portal-dashboard"><header className="portal-header"><Link className="portal-brand" href="/">EKONOVA <span>ADVENTURE</span></Link><div><b>{profile.full_name}</b><span>{profile.email}</span></div><button className="portal-exit" onClick={() => { signOutClient(); setProfile(null); setDocuments([]); setMessage(""); }}>Sair</button></header>
    <section className="portal-hero"><p className="portal-eyebrow">ÁREA DO VIAJANTE</p><h1>Olá, {profile.full_name.split(" ")[0]}.</h1><p>Seu cadastro, documentos e situação da sua viagem em um só lugar.</p></section>
    <nav className="portal-tabs"><button className={tab === "cadastro" ? "active" : ""} onClick={() => setTab("cadastro")}>Meu cadastro</button><button className={tab === "pagamentos" ? "active" : ""} onClick={() => setTab("pagamentos")}>Pagamentos</button><button className={tab === "documentos" ? "active" : ""} onClick={() => setTab("documentos")}>Documentos</button><button className={tab === "saude" ? "active" : ""} onClick={() => setTab("saude")}>Ficha médica</button></nav>
    {message && <p className="portal-message dashboard-message">{message}</p>}
    {tab === "cadastro" && <form onSubmit={updateProfile} className="portal-panel"><h2>Dados do viajante</h2><p>Estas informações serão usadas pela organização da sua viagem.</p><div className="portal-grid"><label>Nome completo<input name="full_name" defaultValue={profile.full_name} required /></label><label>E-mail de acesso<input value={profile.email ?? ""} disabled /></label><label>Telefone / WhatsApp<input name="phone" defaultValue={profile.phone ?? ""} /></label><label>Cidade / UF<input name="city" defaultValue={profile.city ?? ""} /></label><label>CPF<input name="cpf" defaultValue={profile.cpf ?? ""} /></label><label>RG<input name="rg" defaultValue={profile.rg ?? ""} /></label><label>Passaporte<input name="passport_number" defaultValue={profile.passport_number ?? ""} /></label><label>CEP<input name="postal_code" defaultValue={profile.postal_code ?? ""} /></label><label className="span-2">Endereço<input name="street" defaultValue={profile.street ?? ""} /></label><label>Bairro<input name="neighborhood" defaultValue={profile.neighborhood ?? ""} /></label></div><button className="portal-primary" disabled={savingProfile}>{savingProfile ? "Salvando…" : "Salvar cadastro"}</button></form>}
    {tab === "saude" && <form onSubmit={updateProfile} className="portal-panel"><h2>Ficha médica e de segurança</h2><p>Compartilhe apenas dados importantes para o suporte seguro durante a atividade. Estas informações ficam disponíveis à equipe organizadora.</p><div className="portal-grid"><label>Contato de emergência<input name="emergency_contact_name" defaultValue={profile.emergency_contact_name ?? ""} /></label><label>Telefone do contato<input name="emergency_contact_phone" defaultValue={profile.emergency_contact_phone ?? ""} /></label><label>Plano de saúde / seguro<input name="health_plan" defaultValue={profile.health_plan ?? ""} /></label><label>Telefone do plano / seguro<input name="health_plan_phone" defaultValue={profile.health_plan_phone ?? ""} /></label><label className="span-2">Condições de saúde relevantes<textarea name="medical_conditions" defaultValue={profile.medical_conditions ?? ""} placeholder="Ex.: asma, lesão recente, limitação de mobilidade" /></label><label> Alergias<textarea name="allergies" defaultValue={profile.allergies ?? ""} placeholder="Alimentos, medicamentos ou outras" /></label><label>Medicamentos em uso<textarea name="medications" defaultValue={profile.medications ?? ""} /></label><label className="span-2">Restrições alimentares<textarea name="dietary_restrictions" defaultValue={profile.dietary_restrictions ?? ""} /></label></div><button className="portal-primary" disabled={savingProfile}>{savingProfile ? "Salvando…" : "Salvar ficha médica"}</button></form>}
    {tab === "pagamentos" && <section className="portal-panel"><h2>Pagamentos</h2><p>Consulte os lançamentos da sua inscrição. A confirmação de pagamento é feita pela equipe Ekonova.</p>{payments.length === 0 ? <p className="portal-empty">Nenhum pagamento disponível no momento.</p> : <div className="portal-payment-list">{payments.map(({ reservation, ...payment }) => <article key={payment.id}><div><strong>{reservation.departures?.trips?.title ?? "Viagem Ekonova"}</strong><span>{payment.reference ?? "Pagamento"} · vencimento {date(payment.due_on)}</span></div><div><b>{money(payment.amount_cents, reservation.departures?.currency ?? "BRL")}</b><em className={payment.status === "pago" ? "paid" : "pending"}>{payment.status === "pago" ? "Confirmado" : "Em aberto"}</em></div></article>)}</div>}</section>}
    {tab === "documentos" && <section className="portal-panel"><h2>Contratos e documentos</h2><p>Os contratos gerados e liberados pela equipe aparecerão aqui para consulta e download.</p>{documents.length === 0 ? <div className="portal-empty"><strong>Seu contrato ainda não foi disponibilizado.</strong><span>Assim que a equipe gerar e publicar o documento, ele aparecerá nesta área.</span></div> : <div className="portal-document-list">{documents.map((document) => <article key={document.id}><div><strong>{document.title}</strong><span>{document.document_type} · disponibilizado em {date(document.published_at)}</span></div>{document.document_url ? <a href={document.document_url} target="_blank" rel="noreferrer">Abrir documento</a> : <span>Em preparação</span>}</article>)}</div>}</section>}
  </main>;
}
