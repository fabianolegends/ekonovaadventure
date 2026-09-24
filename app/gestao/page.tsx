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
import financeStyles from "./finance.module.css";
import { assignReservationToRoom, createClient, createContactLog, createRoomGroup, deleteClientWithReservations, deleteReservation, getSession, listClients, listContactLogs, listDepartures, listPayments, listReservations, listRoomGroups, markPaymentAsPaid, signOut, supabaseConfigured, updateClient, type ClientRecord, type ContactLogRecord, type DepartureRecord, type PaymentRecord, type ReservationRecord, type RoomGroupRecord } from "../../lib/supabase-browser";

void financeStyles;

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
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [departures, setDepartures] = useState<DepartureRecord[]>([]);
  const [selectedDepartureId, setSelectedDepartureId] = useState<string | null>(null);
  const [roomGroups, setRoomGroups] = useState<RoomGroupRecord[]>([]);
  const [contactLogs, setContactLogs] = useState<ContactLogRecord[]>([]);

  useEffect(() => {
    if (!supabaseConfigured) { setCheckingAccess(false); return; }
    const session = getSession();
    if (!session) { window.location.replace("/gestao/login"); return; }
    setUserEmail(session.user.email ?? null);
    setCheckingAccess(false);
  }, []);

  useEffect(() => {
    if (!(["Saídas", "Clientes", "Documentos", "Comunicação", "Relatórios"].includes(activeModule)) || !supabaseConfigured) return;
    setClientsLoading(true);
    listClients().then(setClients).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar os clientes.")).finally(() => setClientsLoading(false));
  }, [activeModule]);
  useEffect(() => { if (["Saídas", "Financeiro", "Relatórios"].includes(activeModule) && supabaseConfigured) listPayments().then(setPayments).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar pagamentos.")); }, [activeModule]);
  useEffect(() => { if (activeModule === "Saídas" && supabaseConfigured) listReservations().then(setReservations).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar as reservas.")); }, [activeModule]);
  useEffect(() => { if (["Saídas", "Financeiro", "Comunicação"].includes(activeModule) && supabaseConfigured) listDepartures().then((items) => { setDepartures(items); setSelectedDepartureId((current) => current && items.some((item) => item.id === current) ? current : items[0]?.id ?? null); }).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar as saídas.")); }, [activeModule]);
  useEffect(() => { if (activeModule === "Saídas" && selectedDepartureId) listRoomGroups(selectedDepartureId).then(setRoomGroups).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar os quartos.")); }, [activeModule, selectedDepartureId]);
  useEffect(() => { if (activeModule === "Comunicação" && supabaseConfigured) listContactLogs().then(setContactLogs).catch((error) => showNotice(error instanceof Error ? error.message : "Não foi possível carregar o histórico de contatos.")); }, [activeModule]);

  const selectedDeparture = departures.find((item) => item.id === selectedDepartureId) ?? null;
  const selectedReservations = selectedDeparture ? reservations.filter((item) => item.departure_id === selectedDeparture.id) : [];
  const selectedClientIds = new Set(selectedReservations.map((item) => item.clients?.id).filter(Boolean));
  const selectedClients = selectedDeparture ? clients.filter((item) => selectedClientIds.has(item.id)) : [];
  const selectedPayments = selectedDeparture ? payments.filter((item) => item.reservations?.departure_id === selectedDeparture.id) : [];
  const totalPlanned = selectedPayments.reduce((sum, item) => sum + item.amount_cents, 0);
  const totalReceived = selectedPayments.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0);
  const money = (value: number) => new Intl.NumberFormat(selectedDeparture?.currency === "BRL" ? "pt-BR" : "en-US", { style: "currency", currency: selectedDeparture?.currency ?? "USD" }).format(value / 100);
  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const registrationUrl = selectedDeparture?.trips?.slug === "andes-essencial" ? "/inscricao" : `/inscricao/${selectedDeparture?.trips?.slug ?? ""}`;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3400);
  }

  async function removeParticipant(reservation: ReservationRecord) {
    const name = reservation.clients?.full_name ?? "este viajante";
    const proceed = window.confirm(`Você está prestes a excluir a inscrição de ${name} desta saída. Os pagamentos e a alocação de quarto vinculados também serão removidos. Deseja continuar?`);
    if (!proceed) return;
    const confirmed = window.confirm(`Confirmação final: excluir definitivamente a inscrição de ${name}? Esta ação não poderá ser desfeita.`);
    if (!confirmed) return;
    try {
      await deleteReservation(reservation.id);
      const [nextReservations, nextPayments] = await Promise.all([listReservations(), listPayments()]);
      setReservations(nextReservations);
      setPayments(nextPayments);
      if (selectedDeparture) setRoomGroups(await listRoomGroups(selectedDeparture.id));
      showNotice("Inscrição excluída desta saída.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Não foi possível excluir a inscrição.");
    }
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
          {activeModule === "Clientes" ? <ClientsModule clients={clients} loading={clientsLoading} onAction={showNotice} onDeleted={async () => { const [nextClients, nextReservations, nextPayments] = await Promise.all([listClients(), listReservations(), listPayments()]); setClients(nextClients); setReservations(nextReservations); setPayments(nextPayments); }} /> : activeModule === "Documentos" ? <DocumentsModule clients={clients} loading={clientsLoading} /> : activeModule === "Financeiro" ? <FinanceModule payments={payments} departures={departures} onAction={showNotice} onUpdated={async () => setPayments(await listPayments())} /> : activeModule === "Relatórios" ? <ReportsModule clients={clients} payments={payments} /> : activeModule === "Comunicação" ? <CommunicationModule clients={clients} logs={contactLogs} departures={departures} onAction={showNotice} onLogged={async () => setContactLogs(await listContactLogs())} /> : activeModule !== "Saídas" ? <ModulePage module={modules[activeModule]} onAction={showNotice} /> : <>
          <section className="departure-catalog" aria-label="Saídas cadastradas"><div><p className="module-eyebrow">SAÍDAS OPERACIONAIS</p><h2>Escolha uma saída para gerir</h2><p>Inscrições, reservas, pagamentos e acomodação ficam separados por roteiro.</p></div><div className="departure-cards">{departures.map((departure) => <button key={departure.id} className={selectedDeparture?.id === departure.id ? "selected" : ""} onClick={() => setSelectedDepartureId(departure.id)}><small>{departure.trips?.category ?? "Roteiro"} · {departure.currency}</small><strong>{departure.trips?.title ?? "Saída"}</strong><span>{formatDate(departure.starts_on)} · {departure.capacity} vagas</span><em>{departure.public_registration_enabled ? "Inscrições abertas" : "Em preparação"}</em></button>)}</div>{!departures.length && <div className="empty-records"><strong>Nenhuma saída cadastrada ainda.</strong><p>As saídas operacionais aparecerão aqui assim que forem criadas.</p></div>}</section>
          {selectedDeparture && <>
          <button className="back-link" onClick={() => window.history.back()}>← Voltar para saídas</button>
          <section className="management-title-row">
            <div>
              <div className="title-line"><h1>{selectedDeparture.trips?.title ?? "Saída"}</h1><Status tone="neutral">● {selectedDeparture.public_registration_enabled ? "Inscrições abertas" : "Em preparação"}</Status></div>
              <p className="trip-subtitle">{selectedDeparture.trips?.category ?? "Roteiro"} <b /> {selectedDeparture.trips?.destination ?? "Destino a definir"}</p>
              <div className="trip-meta"><span><CalendarDays aria-hidden="true" />{formatDate(selectedDeparture.starts_on)} – {formatDate(selectedDeparture.ends_on)}</span><span><MapPinned aria-hidden="true" />{selectedDeparture.trips?.destination ?? "Destino"}</span><span><Users aria-hidden="true" />{selectedClients.length}/{selectedDeparture.capacity} inscrições</span></div>
            </div>
            <div className="title-actions">{selectedDeparture.public_registration_enabled ? <a href={registrationUrl} target="_blank" rel="noreferrer">Abrir link de inscrição</a> : <span>Link será liberado ao publicar a página do roteiro.</span>}</div>
          </section>

          <div className="management-layout">
            <section className="management-main-column">
              <div className="management-tabs" role="tablist" aria-label="Seções da saída">
                {["Participantes", "Rooming list", "Roteiro", "Operações", "Financeiro", "Documentos", "Comunicação"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
              </div>

              {activeTab === "Rooming list" ? <RoomingListModule reservations={selectedReservations} groups={roomGroups} onChange={async () => { if (selectedDeparture) setRoomGroups(await listRoomGroups(selectedDeparture.id)); }} onNotice={showNotice} /> : activeTab === "Financeiro" ? <FinanceModule payments={selectedPayments} departures={[selectedDeparture]} onAction={showNotice} onUpdated={async () => setPayments(await listPayments())} /> : activeTab === "Participantes" ? <>
                <section className="participants-panel">
                  <div className="panel-heading"><h2>Inscrições recebidas <small>({selectedClients.length} de {selectedDeparture.capacity} vagas)</small></h2>{selectedDeparture.public_registration_enabled && <a className="panel-link" href={registrationUrl} target="_blank" rel="noreferrer"><Plus aria-hidden="true" />Abrir inscrição</a>}</div>
                  {selectedClients.length === 0 ? <div className="empty-records"><strong>Nenhuma inscrição recebida ainda.</strong><p>{selectedDeparture.public_registration_enabled ? "Compartilhe o link de inscrição para começar a formar o grupo." : "Esta saída está em preparação. O link será habilitado junto à página pública do roteiro."}</p></div> : <div className="participant-table" role="table">
                    <div className="participant-head" role="row"><span>Pessoa</span><span>Documentos</span><span>Pagamento</span><span>Preparação</span></div>
                    {selectedClients.map((client) => { const clientPayments = selectedPayments.filter((item) => item.reservations?.clients?.id === client.id); const reservation = selectedReservations.find((item) => item.clients?.id === client.id); const paid = clientPayments.every((item) => item.status === "pago") && clientPayments.length > 0; return <article className="participant-row" role="row" key={client.id}>
                      <div className="participant-row-main"><div className="person"><span className="client-initials">{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><p><strong>{client.full_name}</strong><small>{client.city ?? "Cidade não informada"}</small></p></div>
                      <div><Status tone={client.passport_number ? "ok" : "warn"}>{client.passport_number ? "● Informado" : "● Pendente"}</Status><small>{client.passport_number ? "Passaporte cadastrado" : "Aguardando documentos"}</small></div>
                      <div><Status tone={paid ? "ok" : "warn"}>{paid ? "● Pago" : "● Em aberto"}</Status><small>{clientPayments.length ? `${clientPayments.length} lançamento(s)` : "Sem lançamentos"}</small></div>
                      <div><Status tone={client.emergency_contact_name && client.health_plan ? "ok" : "warn"}>{client.emergency_contact_name && client.health_plan ? "● Completa" : "● Em andamento"}</Status><small>{client.emergency_contact_name && client.health_plan ? "Ficha operacional pronta" : "Completar ficha"}</small></div></div>
                      {reservation && <div className="participant-row-actions"><details><summary>Opções da inscrição</summary><button className="destructive-link" onClick={() => removeParticipant(reservation)}>Excluir inscrição</button></details></div>}
                    </article>; })}
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
              <div className="occupancy"><div className="occupancy-ring"><strong>{selectedClients.length}/{selectedDeparture.capacity}</strong></div><div><b>Inscrições recebidas</b><strong>{selectedClients.length} de {selectedDeparture.capacity} vagas</strong><small>{Math.max(selectedDeparture.capacity - selectedClients.length, 0)} vaga(s) disponível(is)</small></div></div>
              <div className="summary-block"><span>Total previsto</span><div><strong>{money(totalPlanned)}</strong><small>Recebido: {money(totalReceived)}</small></div><i><b style={{ width: totalPlanned ? `${Math.round((totalReceived / totalPlanned) * 100)}%` : "0%" }} /></i><em>{totalPlanned ? `${Math.round((totalReceived / totalPlanned) * 100)}%` : "0%"}</em></div>
              <div className="payments-list"><div className="section-label"><b>Próximos pagamentos</b></div>{selectedPayments.filter((item) => item.status !== "pago").slice(0, 3).map((item) => <article key={item.id}><i /><p>{item.reservations?.clients?.full_name ?? "Cliente"}</p><strong>{money(item.amount_cents)}<small>até {new Date(`${item.due_on}T12:00:00`).toLocaleDateString("pt-BR")}</small></strong></article>)}{selectedPayments.length === 0 && <p className="empty-payments">Nenhum lançamento financeiro registrado.</p>}</div>
              {selectedDeparture.public_registration_enabled ? <a className="charge-button" href={registrationUrl} target="_blank" rel="noreferrer"><Users aria-hidden="true" />Compartilhar inscrição</a> : <span className="disabled-link">Inscrições aguardando página pública</span>}
              <div className="trip-reminders"><h3>Próximo passo</h3><p>Envie o link de inscrição para os viajantes. A preparação será organizada conforme os cadastros reais entrarem.</p></div>
            </aside>
          </div></>}</>}
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

function RoomingListModule({ reservations, groups, onChange, onNotice }: { reservations: ReservationRecord[]; groups: RoomGroupRecord[]; onChange: () => Promise<void>; onNotice: (message: string) => void }) {
  const [roomLabel, setRoomLabel] = useState("");
  const [roomType, setRoomType] = useState<RoomGroupRecord["room_type"]>("twin");
  const csvCell = (value: string | null | undefined) => `"${(value ?? "").replaceAll('"', '""')}"`;
  function exportCsv() {
    const header = ["Nome completo", "Quarto", "Tipo de quarto", "E-mail", "Telefone", "Cidade", "CPF", "RG", "Passaporte", "Contato de segurança", "Telefone de segurança", "Plano de saúde / seguro", "Telefone do plano", "Pagamento"];
    const rows = reservations.map((reservation) => { const client = reservation.clients; const group = groups.find((item) => item.room_group_members.some((member) => member.reservation_id === reservation.id)); return [client?.full_name, group?.label ?? "Não alocado", group?.room_type ?? "", client?.email, client?.phone, [client?.city, client?.state].filter(Boolean).join(" - "), client?.cpf, client?.rg, client?.passport_number, client?.emergency_contact_name, client?.emergency_contact_phone, client?.health_plan, client?.health_plan_phone, reservation.payment_plan].map(csvCell).join(";"); });
    const csv = [header.map(csvCell).join(";"), ...rows].join("\n");
    const href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = href; link.download = "rooming-list-andes-essencial.csv"; link.click(); URL.revokeObjectURL(href);
  }
  const singles = reservations.filter((item) => item.room_type === "single").length;
  const doubles = reservations.length - singles;
  async function addRoom(event: React.FormEvent) { event.preventDefault(); const departureId = reservations[0]?.departure_id; if (!departureId || !roomLabel.trim()) return; try { await createRoomGroup({ departure_id: departureId, label: roomLabel.trim(), room_type: roomType }); setRoomLabel(""); await onChange(); } catch (error) { onNotice(error instanceof Error ? error.message : "Não foi possível criar o quarto."); } }
  async function assign(reservationId: string, roomGroupId: string) { if (!roomGroupId) return; try { await assignReservationToRoom(reservationId, roomGroupId); await onChange(); } catch (error) { onNotice(error instanceof Error ? error.message : "Não foi possível alocar o viajante."); } }
  return <section className="rooming-list"><div className="rooming-heading"><div><p className="module-eyebrow">OPERAÇÃO</p><h2>Plano de acomodação</h2><p>Andes Essencial · 10–17 mar 2027 · Mendoza, Argentina</p></div><button disabled={!reservations.length || reservations.some((reservation) => !groups.some((group) => group.room_group_members.some((member) => member.reservation_id === reservation.id)))} onClick={exportCsv}>Emitir CSV final</button></div><div className="rooming-stats"><article><span>Inscritos</span><strong>{reservations.length}</strong></article><article><span>Preferência duplo</span><strong>{doubles}</strong></article><article><span>Preferência single</span><strong>{singles}</strong></article></div>{reservations.length === 0 ? <div className="empty-records"><strong>A rooming list será formada automaticamente.</strong><p>Assim que uma inscrição real for concluída, ela aparecerá aqui com os dados necessários para hotel e operação.</p></div> : <><form className="room-form" onSubmit={addRoom}><input value={roomLabel} onChange={(event) => setRoomLabel(event.target.value)} placeholder="Ex.: Quarto 101" required /><select value={roomType} onChange={(event) => setRoomType(event.target.value as RoomGroupRecord["room_type"])}><option value="matrimonial">Matrimonial</option><option value="twin">Doble twin</option><option value="single">Single</option></select><button>Criar quarto</button></form><div className="room-groups">{groups.map((group) => <article key={group.id}><header><strong>{group.label}</strong><span>{group.room_type === "matrimonial" ? "Matrimonial" : group.room_type === "twin" ? "Doble twin" : "Single"}</span></header>{group.room_group_members.length ? group.room_group_members.map((member) => <p key={member.reservation_id}>{reservations.find((reservation) => reservation.id === member.reservation_id)?.clients?.full_name ?? "Viajante"}</p>) : <small>Sem viajantes alocados.</small>}</article>)}</div><div className="rooming-table"><div className="rooming-head"><span>Viajante</span><span>Preferência</span><span>Alocação</span><span>Segurança e saúde</span></div>{reservations.map((reservation) => { const client = reservation.clients; const current = groups.find((group) => group.room_group_members.some((member) => member.reservation_id === reservation.id)); return <article key={reservation.id}><div><strong>{client?.full_name ?? "Viajante"}</strong><small>{client?.email ?? "E-mail não informado"}</small></div><span>{reservation.room_type === "single" ? "Single" : "Duplo"}</span><select value={current?.id ?? ""} onChange={(event) => assign(reservation.id, event.target.value)}><option value="">Selecionar quarto</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.label} · {group.room_type === "twin" ? "Doble twin" : group.room_type}</option>)}</select><div><strong>{client?.emergency_contact_name ?? "Contato pendente"}</strong><small>{client?.health_plan ?? "Plano de saúde pendente"}</small></div></article>; })}</div></>}</section>;
}

function ClientsModule({ clients, loading, onAction, onDeleted }: { clients: ClientRecord[]; loading: boolean; onAction: (message: string) => void; onDeleted: () => Promise<void> }) {
  const [open, setOpen] = useState(false); const [editingClient, setEditingClient] = useState<ClientRecord | null>(null); const [saving, setSaving] = useState(false); const blank = { full_name: "", email: "", phone: "", city: "", cpf: "", rg: "", passport_number: "", street: "", neighborhood: "", postal_code: "", emergency_contact_name: "", emergency_contact_phone: "", health_plan: "", health_plan_phone: "" }; const [form, setForm] = useState(blank);
  function openNewClient() { setEditingClient(null); setForm(blank); setOpen(true); }
  function openClientEditor(client: ClientRecord) { setEditingClient(client); setForm({ full_name: client.full_name ?? "", email: client.email ?? "", phone: client.phone ?? "", city: client.city ?? "", cpf: client.cpf ?? "", rg: client.rg ?? "", passport_number: client.passport_number ?? "", street: client.street ?? "", neighborhood: client.neighborhood ?? "", postal_code: client.postal_code ?? "", emergency_contact_name: client.emergency_contact_name ?? "", emergency_contact_phone: client.emergency_contact_phone ?? "", health_plan: client.health_plan ?? "", health_plan_phone: client.health_plan_phone ?? "" }); setOpen(true); }
  function closeEditor() { setOpen(false); setEditingClient(null); setForm(blank); }
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); try { if (editingClient) { await updateClient(editingClient.id, form); await onDeleted(); onAction("Cadastro atualizado com sucesso."); } else { await createClient(form); await onDeleted(); onAction("Cliente cadastrado com sucesso."); } closeEditor(); } catch (error) { onAction(error instanceof Error ? error.message : "Não foi possível salvar o cadastro."); } finally { setSaving(false); } }
  async function removeClient(client: ClientRecord) { if (!window.confirm(`Excluir definitivamente o cadastro de ${client.full_name}? Todas as inscrições, pagamentos e contatos vinculados a este cliente serão removidos.`)) return; setSaving(true); try { await deleteClientWithReservations(client.id); await onDeleted(); onAction("Cadastro e inscrições vinculadas foram excluídos."); } catch (error) { onAction(error instanceof Error ? error.message : "Não foi possível excluir o cadastro."); } finally { setSaving(false); } }
  const field = (key: keyof typeof form, label: string, type = "text", required = false) => <label>{label}<input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} /></label>;
  return <section className="module-page"><p className="module-eyebrow">Relacionamento</p><h1>Clientes e viajantes</h1><p className="module-summary">Cadastros, dados essenciais para rooming list, contatos e preparação em uma única ficha.</p><section className="module-workspace clients-workspace"><div><h2>{loading ? "Carregando clientes…" : `${clients.length} clientes cadastrados`}</h2><p>{clients.length ? "Abra um cadastro para consultar ou atualizar os dados do viajante." : "Seu primeiro cadastro aparecerá aqui assim que for criado."}</p></div><button onClick={openNewClient}><Plus aria-hidden="true" />Novo cliente</button></section>{open && <form className="client-form" onSubmit={submit}><div className="client-form-heading"><div><h2>{editingClient ? "Editar cadastro" : "Ficha completa do viajante"}</h2><p>Dados usados para rooming list, segurança e operação da viagem.</p></div><button type="button" className="client-close" onClick={closeEditor} aria-label="Fechar edição"><X aria-hidden="true" /></button></div><h3>Identificação</h3>{field("full_name", "Nome completo", "text", true)}{field("cpf", "CPF")}{field("rg", "RG")}{field("passport_number", "Passaporte")}{field("email", "E-mail", "email", true)}{field("phone", "Telefone / WhatsApp", "tel", true)}<h3>Endereço</h3>{field("street", "Rua e número")}{field("neighborhood", "Bairro")}{field("city", "Cidade")}{field("postal_code", "CEP")}<h3>Segurança e saúde</h3>{field("emergency_contact_name", "Contato de segurança")}{field("emergency_contact_phone", "Telefone do contato", "tel")}{field("health_plan", "Plano de saúde")}{field("health_plan_phone", "Contato do plano", "tel")}<div className="client-form-actions"><button disabled={saving}>{saving ? "Salvando…" : editingClient ? "Salvar alterações" : "Salvar ficha do cliente"}</button>{editingClient && <button type="button" className="danger-button" disabled={saving} onClick={() => removeClient(editingClient)}>Excluir cadastro e inscrições</button>}</div></form>}{clients.length > 0 && <div className="clients-list">{clients.map((client) => <article key={client.id}><span>{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.full_name}</strong><small>{[client.city, client.email, client.phone].filter(Boolean).join(" · ")}</small></div><button onClick={() => openClientEditor(client)}>Editar cadastro →</button></article>)}</div>}</section>;
}

function DocumentsModule({ clients, loading }: { clients: ClientRecord[]; loading: boolean }) {
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const readiness = (client: ClientRecord) => {
    const items = [client.cpf || client.rg, client.passport_number, client.emergency_contact_name && client.emergency_contact_phone, client.health_plan && client.health_plan_phone];
    return items.filter(Boolean).length;
  };
  const visible = clients.filter((client) => filter === "all" || (filter === "complete" ? readiness(client) === 4 : readiness(client) < 4));
  const complete = clients.filter((client) => readiness(client) === 4).length;
  const pending = clients.length - complete;
  const indicator = (present: unknown, ok: string, waiting: string) => <Status tone={present ? "ok" : "warn"}>{present ? `● ${ok}` : `● ${waiting}`}</Status>;
  return <section className="module-page"><p className="module-eyebrow">Conferência operacional</p><h1>Documentos e saúde</h1><p className="module-summary">Confira as informações essenciais de cada viajante antes do embarque. Os dados vêm diretamente da ficha de inscrição.</p><div className="module-grid report-grid"><article><span>Fichas completas</span><strong>{complete}</strong><small>Documentos e segurança conferidos</small></article><article><span>Com pendências</span><strong>{pending}</strong><small>Viajantes que precisam de acompanhamento</small></article><article><span>Cadastros recebidos</span><strong>{clients.length}</strong><small>Inscrições reais do Andes Essencial</small></article></div><section className="module-workspace"><div><h2>Conferência por viajante</h2><p>{loading ? "Carregando fichas…" : "Use o filtro para priorizar quem ainda precisa complementar dados."}</p></div><div className="rooming-filter" aria-label="Filtrar documentos"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>Todos</button><button className={filter === "pending" ? "selected" : ""} onClick={() => setFilter("pending")}>Pendentes</button><button className={filter === "complete" ? "selected" : ""} onClick={() => setFilter("complete")}>Completos</button></div></section>{visible.length === 0 ? <section className="empty-section"><h2>{clients.length ? "Nenhuma ficha neste filtro" : "Nenhuma ficha recebida ainda"}</h2><p>{clients.length ? "Altere o filtro para visualizar os demais viajantes." : "Assim que um viajante concluir a inscrição, os documentos aparecerão aqui para conferência."}</p></section> : <div className="document-list">{visible.map((client) => <article key={client.id}><header><div><strong>{client.full_name}</strong><small>{client.email || "E-mail não informado"} · {client.phone || "Telefone não informado"}</small></div><b>{readiness(client)}/4 itens</b></header><div className="document-statuses"><div>{indicator(client.cpf || client.rg, "Identidade informada", "CPF ou RG pendente")}<small>{[client.cpf && "CPF", client.rg && "RG"].filter(Boolean).join(" · ") || ""}</small></div><div>{indicator(client.passport_number, "Passaporte informado", "Passaporte pendente")}<small>{client.passport_number || ""}</small></div><div>{indicator(client.emergency_contact_name && client.emergency_contact_phone, "Contato de segurança", "Contato de segurança pendente")}<small>{client.emergency_contact_name || ""}</small></div><div>{indicator(client.health_plan && client.health_plan_phone, "Saúde informada", "Plano ou seguro pendente")}<small>{client.health_plan || ""}</small></div></div></article>)}</div>}</section>;
}

function CommunicationModule({ clients, logs, departures, onAction, onLogged }: { clients: ClientRecord[]; logs: ContactLogRecord[]; departures: DepartureRecord[]; onAction: (message: string) => void; onLogged: () => Promise<void> }) {
  const [selected, setSelected] = useState("Confirmação da inscrição");
  const [clientId, setClientId] = useState("");
  const [departureId, setDepartureId] = useState("");
  const [saving, setSaving] = useState(false);
  const client = clients.find((item) => item.id === clientId);
  const departure = departures.find((item) => item.id === departureId);
  const tripName = departure?.trips?.title ?? "sua viagem";
  const registrationUrl = departure?.trips?.slug ? `https://www.ekonovaadv.com.br/inscricao/${departure.trips.slug}` : "https://www.ekonovaadv.com.br/inscricao";
  const templates: Record<string, string> = {
    "Link de inscrição": "Olá, {nome}! Que bom ter você por aqui. Para se inscrever no roteiro {roteiro}, preencha sua ficha neste link: {link}",
    "Confirmação da inscrição": "Olá, {nome}! Recebemos sua inscrição para {roteiro}. A equipe Ekonova entrará em contato com os próximos passos.",
    "Documentos pendentes": "Olá, {nome}! Para concluirmos sua preparação para {roteiro}, precisamos complementar seus documentos e dados de segurança. Você consegue nos enviar por aqui?",
    "Pagamento e parcelas": "Olá, {nome}! Tudo bem? Passando para acompanharmos o planejamento do pagamento da sua viagem {roteiro}. Posso ajudar com alguma dúvida?",
    "Briefing da viagem": "Olá, {nome}! Em breve enviaremos os detalhes do briefing de {roteiro}. Será um momento para tirar dúvidas e preparar a viagem."
  };
  const [message, setMessage] = useState("");
  const templateMessage = templates[selected].replaceAll("{nome}", client?.full_name || "[nome]").replaceAll("{roteiro}", tripName).replaceAll("{link}", registrationUrl);
  useEffect(() => { setMessage(templateMessage); }, [selected, clientId, departureId, tripName, registrationUrl]);
  async function openWhatsApp() {
    if (!client) { onAction("Selecione um viajante antes de abrir a mensagem."); return; }
    if (!client.phone) { onAction("Este viajante não possui telefone cadastrado."); return; }
    setSaving(true);
    try {
      await createContactLog({ client_id: client.id, channel: "whatsapp", template_name: `${selected} · ${tripName}`, message });
      await onLogged();
      const phone = client.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      onAction("Contato registrado e mensagem preparada no WhatsApp.");
    } catch (error) { onAction(error instanceof Error ? error.message : "Não foi possível registrar o contato."); } finally { setSaving(false); }
  }
  return <section className="module-page"><p className="module-eyebrow">WhatsApp e relacionamento</p><h1>Conversas que aproximam</h1><p className="module-summary">Escolha o roteiro, o viajante e uma mensagem. Você pode ajustar o texto antes de abrir o WhatsApp; a abertura fica registrada no histórico.</p><section className="communication-layout"><div className="template-list">{Object.keys(templates).map((name) => <button key={name} className={selected === name ? "selected" : ""} onClick={() => setSelected(name)}><strong>{name}</strong><small>WhatsApp · texto editável</small></button>)}</div><article className="message-preview"><span>Preparar mensagem</span><div className="communication-selects"><label className="communication-client">Roteiro<select value={departureId} onChange={(event) => setDepartureId(event.target.value)}><option value="">Selecione um roteiro</option>{departures.map((item) => <option key={item.id} value={item.id}>{item.trips?.title}</option>)}</select></label><label className="communication-client">Viajante<select value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Selecione um viajante</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></label></div><label className="message-editor">Mensagem<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={7} /></label><small>{clients.length ? "Revise a mensagem antes de abrir o WhatsApp. Nenhum envio é automático." : "As opções de contato aparecerão quando chegarem inscrições reais."}</small><button disabled={saving || !clients.length || !departure || !message.trim()} onClick={openWhatsApp}><MessageCircle aria-hidden="true" />{saving ? "Registrando…" : "Abrir no WhatsApp e registrar"}</button></article></section><section className="module-workspace"><div><h2>Histórico de contatos</h2><p>{logs.length ? "Últimas conversas abertas pela equipe." : "Nenhum contato registrado ainda."}</p></div></section>{logs.length > 0 && <div className="clients-list contact-list">{logs.map((log) => <article key={log.id}><span>W</span><div><strong>{log.clients?.full_name ?? "Viajante"} · {log.template_name}</strong><small>{new Date(log.created_at).toLocaleString("pt-BR")}</small></div></article>)}</div>}</section>;
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

function FinanceModule({ payments, departures, onAction, onUpdated }: { payments: PaymentRecord[]; departures: DepartureRecord[]; onAction: (message: string) => void; onUpdated: () => Promise<void> }) {
  const [departureId, setDepartureId] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openReservationId, setOpenReservationId] = useState<string | null>(null);
  const visible = departureId === "all" ? payments : payments.filter((item) => item.reservations?.departure_id === departureId);
  const currency = (item: PaymentRecord) => item.reservations?.departures?.currency ?? "USD";
  const money = (value: number, itemCurrency: "USD" | "BRL") => new Intl.NumberFormat(itemCurrency === "BRL" ? "pt-BR" : "en-US", { style: "currency", currency: itemCurrency }).format(value / 100);
  const clientPayments = Array.from(visible.reduce((groups, payment) => {
    const reservationId = payment.reservations?.departure_id && payment.reservations?.clients?.id ? `${payment.reservations.departure_id}:${payment.reservations.clients.id}` : payment.id;
    const group = groups.get(reservationId) ?? { id: reservationId, payments: [] as PaymentRecord[] };
    group.payments.push(payment); groups.set(reservationId, group); return groups;
  }, new Map<string, { id: string; payments: PaymentRecord[] }>()).values());
  async function markPaid(payment: PaymentRecord) { setSavingId(payment.id); try { await markPaymentAsPaid(payment.id); await onUpdated(); onAction("Pagamento confirmado e registrado no financeiro."); } catch (error) { onAction(error instanceof Error ? error.message : "Não foi possível confirmar o pagamento."); } finally { setSavingId(null); } }
  return <section className="module-page"><p className="module-eyebrow">Financeiro operacional</p><h1>Pagamentos por cliente</h1><p className="module-summary">Abra um viajante para ver apenas as opções de pagamento, parcelas e confirmações daquele cadastro.</p><section className="finance-filter"><label>Saída<select value={departureId} onChange={(event) => { setDepartureId(event.target.value); setOpenReservationId(null); }}><option value="all">Todas as saídas</option>{departures.map((departure) => <option key={departure.id} value={departure.id}>{departure.trips?.title} · {departure.currency}</option>)}</select></label><span>{clientPayments.length} cliente(s) com pagamento</span></section>{!clientPayments.length ? <section className="empty-section"><h2>Sem pagamentos registrados</h2><p>As opções de pagamento aparecerão aqui quando uma inscrição for concluída.</p></section> : <section className="finance-clients">{clientPayments.map((group) => { const first = group.payments[0]; const itemCurrency = currency(first); const pending = group.payments.filter((item) => item.status !== "pago"); const planned = group.payments.reduce((sum, item) => sum + item.amount_cents, 0); const received = group.payments.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount_cents, 0); const open = openReservationId === group.id; return <article key={group.id} className={open ? "open" : ""}><button className="finance-client-summary" onClick={() => setOpenReservationId(open ? null : group.id)} aria-expanded={open}><span>{open ? "−" : "+"}</span><div><strong>{first.reservations?.clients?.full_name ?? "Cliente"}</strong><small>{first.reservations?.departures?.trips?.title ?? "Saída"} · {group.payments.length} opção(ões) de pagamento</small></div><div className="finance-client-total"><small>{pending.length ? `${pending.length} em aberto` : "Tudo pago"}</small><b>{money(planned - received, itemCurrency)}</b></div><em>{open ? "Fechar" : "Ver pagamentos"}</em></button>{open && <div className="finance-client-details"><header><div><strong>Opções de pagamento</strong><small>Previsto: {money(planned, itemCurrency)} · Recebido: {money(received, itemCurrency)}</small></div></header>{group.payments.sort((a, b) => a.due_on.localeCompare(b.due_on)).map((payment) => { const due = new Date(`${payment.due_on}T12:00:00`).toLocaleDateString("pt-BR"); return <div className="finance-installment" key={payment.id}><span className={payment.status === "pago" ? "paid" : "pending"}>{payment.status === "pago" ? "✓" : "!"}</span><div><strong>{payment.reference ?? "Pagamento"}</strong><small>{payment.status === "pago" ? `Pago em ${payment.paid_on ? new Date(`${payment.paid_on}T12:00:00`).toLocaleDateString("pt-BR") : "data não informada"}` : `Vencimento: ${due}`}</small></div><b>{money(payment.amount_cents, itemCurrency)}</b>{payment.status === "pago" ? <em>Confirmado</em> : <button disabled={savingId === payment.id} onClick={() => markPaid(payment)}>{savingId === payment.id ? "Confirmando…" : "Confirmar pagamento"}</button>}</div>; })}</div>}</article>; })}</section>}</section>;
}
