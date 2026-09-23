"use client";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Landmark,
  MessageCircle,
  LayoutDashboard,
  MapPinned,
  MoreVertical,
  Plane,
  Plus,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, getSession, listClients, listPayments, signOut, supabaseConfigured, type ClientRecord, type PaymentRecord } from "../../lib/supabase-browser";

const navItems = [
  [LayoutDashboard, "Início"], [MapPinned, "Saídas"], [Users, "Clientes"], [WalletCards, "Financeiro"],
  [ClipboardCheck, "Operações"], [Plane, "Equipamentos"], [FileText, "Documentos"], [MessageCircle, "Comunicação"], [Landmark, "Relatórios"],
] as const;

const modules = {
  "Início": { eyebrow: "Visão do dia", title: "A jornada da equipe", summary: "Acompanhe a operação a partir das inscrições reais recebidas.", cards: [] },
  "Saídas": { eyebrow: "Saídas", title: "Andes Essencial", summary: "Acompanhamento das inscrições, preparação e financeiro reais.", cards: [] },
  "Clientes": { eyebrow: "Relacionamento", title: "Clientes e viajantes", summary: "Cadastros, contatos e documentos em uma única ficha.", cards: [] },
  "Financeiro": { eyebrow: "Fluxo financeiro", title: "Pagamentos com clareza", summary: "Entradas e parcelas registradas nas inscrições reais.", cards: [] },
  "Operações": { eyebrow: "Bastidores da viagem", title: "Operação", summary: "Organize os detalhes à medida que o grupo for formado.", cards: [] },
  "Equipamentos": { eyebrow: "Preparação", title: "Equipamentos e segurança", summary: "Acompanhe a preparação conforme os viajantes se cadastrarem.", cards: [] },
  "Documentos": { eyebrow: "Conferência", title: "Documentos", summary: "Passaportes e informações de saúde serão organizados por inscrição.", cards: [] },
  "Comunicação": { eyebrow: "WhatsApp e relacionamento", title: "Comunicação", summary: "Use roteiros de mensagem vinculados a dados reais.", cards: [] },
  "Relatórios": { eyebrow: "Leitura do negócio", title: "Relatórios", summary: "Acompanhe ocupação e receita quando as inscrições começarem.", cards: [] },
} as const;

function Status({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" | "neutral" }) {
  return <span className={`management-status ${tone}`}>{children}</span>;
}

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("Participantes");
  const [activeModule, setActiveModule] = useState<keyof typeof modules>("Saídas");
  const [notice, setNotice] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!supabaseConfigured) { setCheckingAccess(false); return; }
    const session = getSession();
    if (!session) { window.location.replace("/gestao/login"); return; }
    setUserEmail(session.user.email ?? null);
    setCheckingAccess(false);
  }, []);

  useEffect(() => {
    if (!(["Saídas", "Clientes", "Relatórios"].includes(activeModule)) || !supabaseConfigured) return;
    setClientsLoading(true);
    listClients().then(setClients).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar os clientes.")).finally(() => setClientsLoading(false));
  }, [activeModule]);
  useEffect(() => { if (["Saídas", "Financeiro", "Relatórios"].includes(activeModule) && supabaseConfigured) listPayments().then(setPayments).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar pagamentos.")); }, [activeModule]);

  const totalPlanned = payments.reduce((sum, item) => sum + item.amount_cents, 0);
  const totalReceived = payments.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0);
  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3400);
  }

  if (checkingAccess) return <main className="management-loading">Verificando acesso seguro…</main>;
  return (
    <main className="management-shell">
      <aside className="management-sidebar" aria-label="Navegação da gestão">
        <a className="management-brand" href="/">
          <span>Ekonova</span> Gestão
          <small>Viagens que transformam</small>
        </a>
        <nav>
          {navItems.map(([Icon, label]) => <button className={activeModule === label ? "active" : ""} key={label} onClick={() => setActiveModule(label as keyof typeof modules)}><Icon aria-hidden="true" />{label}</button>)}
        </nav>
        <div className="management-side-bottom">
          <button onClick={() => showNotice("Configurações: em breve.")}><Settings aria-hidden="true" />Configurações</button>
          <button onClick={() => showNotice("Central de ajuda: em breve.")}><CircleHelp aria-hidden="true" />Ajuda</button>
          <p>Mais natureza.<br />Melhores pessoas.</p>
        </div>
      </aside>

      <section className="management-content">
        <header className="management-topbar">
          <label><span className="sr-only">Buscar</span><input placeholder="Buscar saídas, clientes, reservas..." /></label>
          <button className="icon-button" aria-label="Notificações" onClick={() => showNotice("Você tem 3 pendências para hoje.")}><Bell aria-hidden="true" /><i /></button>
          <button className="current-user" onClick={() => { signOut(); window.location.assign("/gestao/login"); }} title="Sair da gestão"><span>FL</span><p><strong>Fernanda Lima</strong><small>{userEmail ?? "Ambiente de demonstração"}</small></p><ChevronDown aria-hidden="true" /></button>
        </header>

        <div className="management-page">
          {activeModule === "Clientes" ? <ClientsModule clients={clients} loading={clientsLoading} onAction={showNotice} /> : activeModule === "Financeiro" ? <FinanceModule payments={payments} onAction={showNotice} /> : activeModule === "Relatórios" ? <ReportsModule clients={clients} payments={payments} /> : activeModule === "Comunicação" ? <CommunicationModule onAction={showNotice} /> : activeModule !== "Saídas" ? <ModulePage module={modules[activeModule]} onAction={showNotice} /> : <>
          <button className="back-link" onClick={() => window.history.back()}>← Voltar para saídas</button>
          <section className="management-title-row">
            <div>
              <div className="title-line"><h1>Andes Essencial</h1><Status tone="neutral">● Inscrições abertas</Status></div>
              <p className="trip-subtitle">Trekking e gastronomia <b /> Mendoza, Argentina</p>
              <div className="trip-meta"><span><CalendarDays aria-hidden="true" />10 – 17 mar 2027</span><span><MapPinned aria-hidden="true" />Cordilheira dos Andes</span><span><Users aria-hidden="true" />{clients.length}/12 inscrições</span></div>
            </div>
            <div className="title-actions"><a href="/inscricao" target="_blank" rel="noreferrer">Abrir link de inscrição</a></div>
          </section>

          <div className="management-layout">
            <section className="management-main-column">
              <div className="management-tabs" role="tablist" aria-label="Seções da saída">
                {["Participantes", "Roteiro", "Operações", "Financeiro", "Documentos", "Comunicação"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
              </div>

              {activeTab === "Participantes" ? <>
                <section className="participants-panel">
                  <div className="panel-heading"><h2>Inscrições recebidas <small>({clients.length} de 12 vagas)</small></h2><a className="panel-link" href="/inscricao" target="_blank" rel="noreferrer"><Plus aria-hidden="true" />Abrir inscrição</a></div>
                  {clients.length === 0 ? <div className="empty-records"><strong>Nenhuma inscrição recebida ainda.</strong><p>Compartilhe o link de inscrição do Andes Essencial para começar a formar o grupo.</p></div> : <div className="participant-table" role="table">
                    <div className="participant-head" role="row"><span>Pessoa</span><span>Documentos</span><span>Pagamento</span><span>Preparação</span></div>
                    {clients.map((client) => { const clientPayments = payments.filter((item) => item.reservations?.clients?.full_name === client.full_name); const paid = clientPayments.every((item) => item.status === "pago") && clientPayments.length > 0; return <div className="participant-row" role="row" key={client.id}>
                      <div className="person"><span className="client-initials">{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><p><strong>{client.full_name}</strong><small>{client.city ?? "Cidade não informada"}</small></p></div>
                      <div><Status tone={client.passport_number ? "ok" : "warn"}>{client.passport_number ? "● Informado" : "● Pendente"}</Status><small>{client.passport_number ? "Passaporte cadastrado" : "Aguardando documentos"}</small></div>
                      <div><Status tone={paid ? "ok" : "warn"}>{paid ? "● Pago" : "● Em aberto"}</Status><small>{clientPayments.length ? `${clientPayments.length} lançamento(s)` : "Sem lançamentos"}</small></div>
                      <div><Status tone={client.emergency_contact_name && client.health_plan ? "ok" : "warn"}>{client.emergency_contact_name && client.health_plan ? "● Completa" : "● Em andamento"}</Status><small>{client.emergency_contact_name && client.health_plan ? "Ficha operacional pronta" : "Completar ficha"}</small></div>
                    </div>; })}
                  </div>}
                </section>

                <section className="checklist-panel">
                  <div className="panel-heading"><h2>Próximos passos</h2></div>
                  <div className="empty-records"><strong>A operação será preparada após as primeiras inscrições.</strong><p>Documentos, rooming list, pagamentos e comunicação serão organizados a partir dos cadastros reais.</p></div>
                </section>
              </> : <section className="empty-section"><h2>{activeTab}</h2><p>Esta seção está pronta para receber os dados da operação.</p><button onClick={() => setActiveTab("Participantes")}>Voltar aos participantes</button></section>}
            </section>

            <aside className="trip-summary">
              <h2>Ritmo da saída</h2><p>Dados reais de ocupação e financeiro</p>
              <div className="occupancy"><div className="occupancy-ring"><strong>{clients.length}/12</strong></div><div><b>Inscrições recebidas</b><strong>{clients.length} de 12 vagas</strong><small>{Math.max(12 - clients.length, 0)} vaga(s) disponível(is)</small></div></div>
              <div className="summary-block"><span>Total previsto</span><div><strong>{money(totalPlanned)}</strong><small>Recebido: {money(totalReceived)}</small></div><i><b style={{ width: totalPlanned ? `${Math.round((totalReceived / totalPlanned) * 100)}%` : "0%" }} /></i><em>{totalPlanned ? `${Math.round((totalReceived / totalPlanned) * 100)}%` : "0%"}</em></div>
              <div className="payments-list"><div className="section-label"><b>Próximos pagamentos</b></div>{payments.filter((item) => item.status !== "pago").slice(0, 3).map((item) => <article key={item.id}><i /><p>{item.reservations?.clients?.full_name ?? "Cliente"}</p><strong>{money(item.amount_cents)}<small>até {new Date(`${item.due_on}T12:00:00`).toLocaleDateString("pt-BR")}</small></strong></article>)}{payments.length === 0 && <p className="empty-payments">Nenhum lançamento financeiro registrado.</p>}</div>
              <a className="charge-button" href="/inscricao" target="_blank" rel="noreferrer"><Users aria-hidden="true" />Compartilhar inscrição</a>
              <div className="trip-reminders"><h3>Próximo passo</h3><p>Envie o link de inscrição para os viajantes. A preparação será organizada conforme os cadastros reais entrarem.</p></div>
            </aside>
          </div></>}
        </div>
      </section>
      {!supabaseConfigured && <div className="management-demo-note">Modo de demonstração — conecte o Supabase para ativar acesso e dados reais.</div>}
      {notice && <div className="management-toast" role="status">{notice}<button aria-label="Fechar" onClick={() => setNotice(null)}><X aria-hidden="true" /></button></div>}
    </main>
  );
}

function ModulePage({ module, onAction }: { module: typeof modules[keyof typeof modules]; onAction: (message: string) => void }) {
  return <section className="module-page"><p className="module-eyebrow">{module.eyebrow}</p><h1>{module.title}</h1><p className="module-summary">{module.summary}</p><section className="module-workspace"><div><h2>Aguardando dados reais</h2><p>Esta área será preenchida conforme chegarem inscrições, contatos e registros da equipe.</p></div><a href="/inscricao" target="_blank" rel="noreferrer">Abrir inscrição do Andes</a></section></section>;
}

function ClientsModule({ clients, loading, onAction }: { clients: ClientRecord[]; loading: boolean; onAction: (message: string) => void }) {
  const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const blank = { full_name: "", email: "", phone: "", city: "", cpf: "", rg: "", passport_number: "", street: "", neighborhood: "", postal_code: "", emergency_contact_name: "", emergency_contact_phone: "", health_plan: "", health_plan_phone: "" }; const [form, setForm] = useState(blank);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); try { await createClient(form); onAction("Cliente cadastrado com sucesso. Atualize a página para visualizar a ficha."); setForm(blank); setOpen(false); } catch (error) { onAction(error instanceof Error ? error.message : "Não foi possível cadastrar o cliente."); } finally { setSaving(false); } }
  const field = (key: keyof typeof form, label: string, type = "text", required = false) => <label>{label}<input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} /></label>;
  return <section className="module-page"><p className="module-eyebrow">Relacionamento</p><h1>Clientes e viajantes</h1><p className="module-summary">Cadastros, dados essenciais para rooming list, contatos e preparação em uma única ficha.</p><section className="module-workspace clients-workspace"><div><h2>{loading ? "Carregando clientes…" : `${clients.length} clientes cadastrados`}</h2><p>{clients.length ? "Selecione um cliente para ver contatos, reservas e pagamentos." : "Seu primeiro cadastro aparecerá aqui assim que for criado."}</p></div><button onClick={() => setOpen(true)}><Plus aria-hidden="true" />Novo cliente</button></section>{open && <form className="client-form" onSubmit={submit}><h2>Ficha completa do viajante</h2><p>Dados usados para rooming list, segurança e operação da viagem.</p><h3>Identificação</h3>{field("full_name", "Nome completo", "text", true)}{field("cpf", "CPF")}{field("rg", "RG")}{field("passport_number", "Passaporte")}{field("email", "E-mail", "email", true)}{field("phone", "Telefone / WhatsApp", "tel", true)}<h3>Endereço</h3>{field("street", "Rua e número")}{field("neighborhood", "Bairro")}{field("city", "Cidade")}{field("postal_code", "CEP")}<h3>Segurança e saúde</h3>{field("emergency_contact_name", "Contato de segurança")}{field("emergency_contact_phone", "Telefone do contato", "tel")}{field("health_plan", "Plano de saúde")}{field("health_plan_phone", "Contato do plano", "tel")}<button disabled={saving}>{saving ? "Salvando…" : "Salvar ficha do cliente"}</button></form>}{clients.length > 0 && <div className="clients-list">{clients.map((client) => <article key={client.id}><span>{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.full_name}</strong><small>{[client.city, client.email, client.phone].filter(Boolean).join(" · ")}</small></div><button onClick={() => onAction(`Ficha de ${client.full_name} selecionada.`)}>Ver ficha →</button></article>)}</div>}</section>;
}

function CommunicationModule({ onAction }: { onAction: (message: string) => void }) {
  const [selected, setSelected] = useState("Cobrança de parcela");
  const templates: Record<string, string> = { "Cobrança de parcela": "Olá, {nome}! Tudo bem? Passando para lembrar que a próxima parcela da sua viagem vence em {data}. Posso ajudar com algo?", "Documentos pendentes": "Olá, {nome}! Para concluirmos sua preparação, precisamos receber {documento}. Você consegue nos enviar por aqui?", "Briefing da viagem": "Olá, {nome}! Nosso briefing da viagem acontece em {data}, às {hora}. Vamos compartilhar os detalhes finais e tirar dúvidas." };
  const openWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(templates[selected])}`, "_blank", "noopener,noreferrer"); onAction("Roteiro aberto no WhatsApp. Registre o contato na ficha do cliente após o envio."); };
  return <section className="module-page"><p className="module-eyebrow">WhatsApp e relacionamento</p><h1>Conversas que aproximam</h1><p className="module-summary">Escolha um roteiro, personalize os campos e mantenha cada contato coerente com a experiência Ekonova.</p><section className="communication-layout"><div className="template-list">{Object.keys(templates).map((name) => <button key={name} className={selected === name ? "selected" : ""} onClick={() => setSelected(name)}><strong>{name}</strong><small>WhatsApp · saída</small></button>)}</div><article className="message-preview"><span>Prévia da mensagem</span><p>{templates[selected]}</p><small>Os campos entre chaves são preenchidos com os dados do cliente.</small><button onClick={openWhatsApp}><MessageCircle aria-hidden="true" />Abrir no WhatsApp</button></article></section><section className="module-workspace"><div><h2>Histórico de contatos</h2><p>O próximo registro enviado ficará salvo no histórico do cliente, junto com reservas e pagamentos.</p></div><button onClick={() => onAction("Selecione um cliente para registrar um contato manual.")}><Plus aria-hidden="true" />Registrar contato</button></section></section>;
}

function ReportsModule({ clients, payments }: { clients: ClientRecord[]; payments: PaymentRecord[] }) {
  const total = payments.reduce((sum, item) => sum + item.amount_cents, 0);
  const received = payments.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0);
  const open = total - received;
  const travelers = new Set(payments.map((item) => item.reservations?.clients?.full_name).filter(Boolean)).size;
  const openInstallments = payments.filter((item) => item.status !== "pago").sort((a, b) => a.due_on.localeCompare(b.due_on));
  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
  return <section className="module-page"><p className="module-eyebrow">Leitura do negócio</p><h1>Relatórios de jornadas</h1><p className="module-summary">Visão atualizada de inscrições, ocupação e fluxo financeiro do Andes Essencial.</p><div className="module-grid report-grid"><article><span>Clientes cadastrados</span><strong>{clients.length}</strong><small>Fichas disponíveis na gestão</small></article><article><span>Viajantes com reserva</span><strong>{travelers}</strong><small>Inscrições recebidas para a saída</small></article><article><span>Receita prevista</span><strong>{money(total)}</strong><small>Somatório das entradas e parcelas</small></article><article><span>Recebido</span><strong>{money(received)}</strong><small>Pagamentos marcados como pagos</small></article><article><span>Em aberto</span><strong>{money(open)}</strong><small>{openInstallments.length} cobrança(s) pendente(s)</small></article><article><span>Próximo vencimento</span><strong>{openInstallments[0] ? new Date(`${openInstallments[0].due_on}T12:00:00`).toLocaleDateString("pt-BR") : "Sem pendências"}</strong><small>{openInstallments[0]?.reservations?.clients?.full_name ?? "Tudo regular"}</small></article></div><section className="module-workspace report-workspace"><div><h2>Parcelas em acompanhamento</h2><p>{openInstallments.length ? "Use esta lista para priorizar os próximos contatos da equipe." : "Não há pagamentos pendentes registrados."}</p></div></section>{openInstallments.length > 0 && <div className="clients-list financial-list">{openInstallments.slice(0, 8).map((payment) => <article key={payment.id}><span>!</span><div><strong>{payment.reservations?.clients?.full_name ?? "Cliente"}</strong><small>Vencimento: {new Date(`${payment.due_on}T12:00:00`).toLocaleDateString("pt-BR")}</small></div><b>{money(payment.amount_cents)}</b></article>)}</div>}</section>;
}

function FinanceModule({ payments, onAction }: { payments: PaymentRecord[]; onAction: (message: string) => void }) {
  const total = payments.reduce((sum, item) => sum + item.amount_cents, 0); const received = payments.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0); const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
  return <section className="module-page"><p className="module-eyebrow">Financeiro</p><h1>Pagamentos com clareza</h1><p className="module-summary">Parcelas, vencimentos e cobranças conectados à jornada de cada viajante.</p><div className="module-grid"><article><span>Total previsto</span><strong>{money(total)}</strong></article><article><span>Recebido</span><strong>{money(received)}</strong></article><article><span>Em aberto</span><strong>{money(total - received)}</strong></article></div><div className="clients-list financial-list">{payments.map((payment) => <article key={payment.id}><span>{payment.status === "pago" ? "✓" : "!"}</span><div><strong>{payment.reservations?.clients?.full_name ?? "Cliente"}</strong><small>Vencimento: {new Date(`${payment.due_on}T12:00:00`).toLocaleDateString("pt-BR")}</small></div><b>{money(payment.amount_cents)}</b><button onClick={() => onAction("Roteiro de cobrança pronto no módulo Comunicação.")}>{payment.status === "pago" ? "Pago" : "Cobrar →"}</button></article>)}</div></section>;
}
