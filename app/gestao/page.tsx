"use client";

import Image from "next/image";
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
import { useEffect, useMemo, useState } from "react";
import { getSession, signOut, supabaseConfigured } from "../../lib/supabase-browser";

type Participant = {
  name: string;
  city: string;
  image: string;
  documents: "OK" | "Pendente";
  documentNote: string;
  payment: "Pago" | "Parcial" | "Pendente";
  paymentNote: string;
  preparation: "Concluída" | "Em andamento";
  preparationNote: string;
  phone: string;
};

const participants: Participant[] = [
  { name: "Ana Beatriz Souza", city: "São Paulo – SP", image: "/images/depoimento-helena.jpg", documents: "OK", documentNote: "Passaporte válido", payment: "Pago", paymentNote: "R$ 7.900", preparation: "Concluída", preparationNote: "Todos os itens", phone: "5554991195626" },
  { name: "Bruno Almeida", city: "Belo Horizonte – MG", image: "/images/depoimento-felipe.jpg", documents: "OK", documentNote: "Passaporte válido", payment: "Pago", paymentNote: "R$ 7.900", preparation: "Em andamento", preparationNote: "2 itens pendentes", phone: "5554991195626" },
  { name: "Carla Mendes", city: "Rio de Janeiro – RJ", image: "/images/depoimento-leila.jpg", documents: "OK", documentNote: "Passaporte válido", payment: "Pago", paymentNote: "R$ 7.900", preparation: "Concluída", preparationNote: "Todos os itens", phone: "5554991195626" },
  { name: "Diego Ramos", city: "Curitiba – PR", image: "/images/depoimento-claudio.jpg", documents: "OK", documentNote: "Passaporte válido", payment: "Parcial", paymentNote: "R$ 4.000 de R$ 7.900", preparation: "Em andamento", preparationNote: "3 itens pendentes", phone: "5554991195626" },
  { name: "Fernanda Costa", city: "Porto Alegre – RS", image: "/images/depoimento-zica.png", documents: "Pendente", documentNote: "Enviar passaporte", payment: "Pago", paymentNote: "R$ 7.900", preparation: "Em andamento", preparationNote: "1 item pendente", phone: "5554991195626" },
  { name: "Gustavo Lima", city: "Salvador – BA", image: "/images/depoimento-thiago.webp", documents: "OK", documentNote: "Passaporte válido", payment: "Pago", paymentNote: "R$ 7.900", preparation: "Concluída", preparationNote: "Todos os itens", phone: "5554991195626" },
];

const navItems = [
  [LayoutDashboard, "Início"], [MapPinned, "Saídas"], [Users, "Clientes"], [WalletCards, "Financeiro"],
  [ClipboardCheck, "Operações"], [Plane, "Equipamentos"], [FileText, "Documentos"], [MessageCircle, "Comunicação"], [Landmark, "Relatórios"],
] as const;

const modules = {
  "Início": { eyebrow: "Visão do dia", title: "A jornada da equipe", summary: "3 pendências, 2 pagamentos e 1 saída com briefing esta semana.", cards: [["Saídas próximas", "Andes Essencial · 02 out", "Ver agenda"], ["Clientes ativos", "26 viajantes em preparação", "Ver clientes"], ["Atenção hoje", "3 documentos aguardando", "Organizar"]] },
  "Saídas": { eyebrow: "Saídas", title: "Andes Essencial", summary: "Acompanhamento completo da saída: participantes, preparação e ritmo financeiro.", cards: [["Participantes", "9 de 10 vagas ocupadas", "Abrir saída"], ["Pendências", "3 itens em andamento", "Ver checklist"], ["Financeiro", "R$ 71.200 recebidos", "Acompanhar"]] },
  "Clientes": { eyebrow: "Relacionamento", title: "Clientes e viajantes", summary: "Cadastros, histórico de contatos, preferências e documentos em um só lugar.", cards: [["Novos contatos", "8 interessados nas últimas 2 semanas", "Ver funil"], ["Perfis completos", "21 de 26 com cadastro atualizado", "Revisar"], ["Próximo acompanhamento", "Diego Ramos · hoje, 16h", "Abrir conversa"]] },
  "Financeiro": { eyebrow: "Fluxo financeiro", title: "Pagamentos com clareza", summary: "Acompanhe entradas, parcelas e cobranças sem perder o contexto de cada viagem.", cards: [["A receber", "R$ 11.800 até 30 set", "Ver parcelas"], ["Recebido no mês", "R$ 71.200", "Abrir visão"], ["Cobranças prontas", "2 mensagens de WhatsApp", "Enviar roteiros"]] },
  "Operações": { eyebrow: "Bastidores da viagem", title: "Operação sem improvisos", summary: "Briefings, transfers, seguros e fornecedores organizados por saída.", cards: [["Checklist Andes", "12 de 16 itens concluídos", "Continuar"], ["Próxima decisão", "Confirmar transfer de chegada", "Resolver"], ["Fornecedores", "7 confirmações registradas", "Consultar"]] },
  "Equipamentos": { eyebrow: "Preparação", title: "Equipamentos e segurança", summary: "Controle a preparação dos viajantes e antecipe itens críticos.", cards: [["Lista final", "4 viajantes ainda pendentes", "Acompanhar"], ["Itens alugados", "6 itens reservados", "Ver reservas"], ["Segurança", "6 seguros validados", "Conferir"]] },
  "Documentos": { eyebrow: "Conferência", title: "Documentos em dia", summary: "Passaportes, seguros e termos reunidos na ficha de cada participante.", cards: [["Pendentes", "3 documentos exigem atenção", "Ver pendências"], ["Validados", "23 documentos conferidos", "Consultar"], ["Vencimentos", "1 passaporte precisa revisão", "Revisar"]] },
  "Comunicação": { eyebrow: "WhatsApp e relacionamento", title: "Conversas que aproximam", summary: "Use roteiros consistentes para briefing, cobranças, documentos e pré-viagem.", cards: [["Roteiro pronto", "Cobrança de parcela · Diego Ramos", "Abrir WhatsApp"], ["Mensagem programada", "Lista de equipamentos · 30 set", "Editar"], ["Histórico", "18 contatos registrados este mês", "Ver conversas"]] },
  "Relatórios": { eyebrow: "Leitura do negócio", title: "Relatórios de jornadas", summary: "Resultados de ocupação, receita e relacionamento para decisões mais seguras.", cards: [["Ocupação", "90% na saída Andes Essencial", "Abrir relatório"], ["Receita", "R$ 71.200 confirmados", "Ver detalhes"], ["Relacionamento", "92% de respostas em até 24h", "Analisar"]] },
} as const;

function Status({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" | "neutral" }) {
  return <span className={`management-status ${tone}`}>{children}</span>;
}

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("Participantes");
  const [activeModule, setActiveModule] = useState<keyof typeof modules>("Saídas");
  const [checklist, setChecklist] = useState([true, true, false, false]);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const paidCount = useMemo(() => participants.filter((person) => person.payment === "Pago").length, []);

  useEffect(() => {
    if (!supabaseConfigured) { setCheckingAccess(false); return; }
    const session = getSession();
    if (!session) { window.location.replace("/gestao/login"); return; }
    setUserEmail(session.user.email ?? null);
    setCheckingAccess(false);
  }, []);

  function toggleTask(index: number) {
    setChecklist((current) => current.map((done, itemIndex) => itemIndex === index ? !done : done));
  }

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
          {activeModule !== "Saídas" ? <ModulePage module={modules[activeModule]} onAction={showNotice} /> : <>
          <button className="back-link" onClick={() => window.history.back()}>← Voltar para saídas</button>
          <section className="management-title-row">
            <div>
              <div className="title-line"><h1>Andes Essencial</h1><Status>● Confirmada</Status></div>
              <p className="trip-subtitle">Trekking e cicloturismo <b /> Chile e Argentina</p>
              <div className="trip-meta"><span><CalendarDays aria-hidden="true" />02 – 11 out 2026</span><span><MapPinned aria-hidden="true" />Cordilheira dos Andes</span><span><Users aria-hidden="true" />9/10 participantes</span></div>
            </div>
            <div className="title-actions"><button onClick={() => showNotice("Edição de saída aberta.")}>Editar saída</button><button aria-label="Mais ações" onClick={() => showNotice("Mais ações disponíveis em breve.")}><MoreVertical aria-hidden="true" /></button></div>
          </section>

          <div className="management-layout">
            <section className="management-main-column">
              <div className="management-tabs" role="tablist" aria-label="Seções da saída">
                {["Participantes", "Roteiro", "Operações", "Financeiro", "Documentos", "Comunicação"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
              </div>

              {activeTab === "Participantes" ? <>
                <section className="participants-panel">
                  <div className="panel-heading"><h2>Participantes <small>({participants.length} de 6 confirmados)</small></h2><button onClick={() => showNotice("Cadastro de participante aberto.")}><Plus aria-hidden="true" />Adicionar participante</button></div>
                  <div className="participant-table" role="table">
                    <div className="participant-head" role="row"><span>Pessoa</span><span>Documentos</span><span>Pagamento</span><span>Preparação</span><span className="sr-only">Ações</span></div>
                    {participants.map((person) => <div className="participant-row" role="row" key={person.name}>
                      <div className="person"><Image src={person.image} alt="" width={44} height={44} /><p><strong>{person.name}</strong><small>{person.city}</small></p></div>
                      <div><Status tone={person.documents === "OK" ? "ok" : "warn"}>{person.documents === "OK" ? "● OK" : "● Pendente"}</Status><small>{person.documentNote}</small></div>
                      <div><Status tone={person.payment === "Pago" ? "ok" : "warn"}>{person.payment === "Pago" ? "● Pago" : `● ${person.payment}`}</Status><small>{person.paymentNote}</small></div>
                      <div><Status tone={person.preparation === "Concluída" ? "ok" : "warn"}>{person.preparation === "Concluída" ? "● Concluída" : "● Em andamento"}</Status><small>{person.preparationNote}</small></div>
                      <button className="more-button" aria-label={`Ações de ${person.name}`} onClick={() => showNotice(`Ações de ${person.name}: perfil e histórico.`)}><MoreVertical aria-hidden="true" /></button>
                    </div>)}
                  </div>
                </section>

                <section className="checklist-panel">
                  <div className="panel-heading"><h2>Checklist de preparação da saída</h2><button className="text-action" onClick={() => showNotice("Checklist completo aberto.")}>Ver checklist completo →</button></div>
                  <div className="checklist-grid">
                    {[
                      ["Seguro viagem", "6/6 confirmados", "Verificar apólices →"],
                      ["Briefing da viagem", "Agendado: 28 set 2026", "Ver detalhes →"],
                      ["Equipamento", "4/6 confirmados", "Acompanhar →"],
                      ["Transfer e logística", "Pendente de confirmação", "Resolver →"],
                    ].map(([title, detail, action], index) => <button className={`check-item ${checklist[index] ? "done" : ""}`} key={title} onClick={() => toggleTask(index)}><span>{checklist[index] ? "✓" : "○"}</span><p><strong>{title}</strong><small>{detail}</small><em>{action}</em></p></button>)}
                  </div>
                </section>
              </> : <section className="empty-section"><h2>{activeTab}</h2><p>Esta seção está pronta para receber os dados da operação.</p><button onClick={() => setActiveTab("Participantes")}>Voltar aos participantes</button></section>}
            </section>

            <aside className="trip-summary">
              <h2>Ritmo da saída</h2><p>Visão geral financeira e de ocupação</p>
              <div className="occupancy"><div className="occupancy-ring"><strong>9/10</strong></div><div><b>Ocupação do grupo</b><strong>9 de 10 vagas</strong><small>› 1 vaga disponível</small></div></div>
              <div className="summary-block"><span>Total recebido</span><div><strong>R$ 71.200</strong><small>de R$ 79.000</small></div><i><b /></i><em>90%</em></div>
              <div className="payments-list"><div className="section-label"><b>Próximos pagamentos</b><button onClick={() => showNotice("Lista completa de pagamentos aberta.")}>Ver todos</button></div><article><i /><p>Diego Ramos</p><strong>R$ 3.900<small>até 25 set 2026</small></strong></article><article><i /><p>Fernanda Costa</p><strong>R$ 7.900<small>até 30 set 2026</small></strong></article></div>
              <button className="charge-button" onClick={() => showNotice(`Roteiros de cobrança prontos para ${participants.length - paidCount} pendências.`)}><WalletCards aria-hidden="true" />Cobrar pendências</button>
              <div className="trip-reminders"><h3>Lembretes da saída</h3><button onClick={() => showNotice("Briefing selecionado.")}><CalendarDays aria-hidden="true" /><span>Briefing online<small>28 set 2026 · 19h</small></span>›</button><button onClick={() => showNotice("Emissão de bilhetes selecionada.")}><Plane aria-hidden="true" /><span>Emissão de bilhetes<small>até 25 set 2026</small></span>›</button><button onClick={() => showNotice("Lista de equipamentos selecionada.")}><FileText aria-hidden="true" /><span>Enviar lista final de equipamentos<small>até 30 set 2026</small></span>›</button></div>
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
  return <section className="module-page"><p className="module-eyebrow">{module.eyebrow}</p><h1>{module.title}</h1><p className="module-summary">{module.summary}</p><div className="module-grid">{module.cards.map(([label, detail, action]) => <article key={label}><span>{label}</span><strong>{detail}</strong><button onClick={() => onAction(`${action}: fluxo preparado para conexão com os dados reais.`)}>{action} →</button></article>)}</div><section className="module-workspace"><div><h2>Espaço de trabalho</h2><p>Em breve, esta visão será alimentada pelos dados do Supabase e pelo histórico da equipe.</p></div><button onClick={() => onAction("Novo registro aberto.")}><Plus aria-hidden="true" />Novo registro</button></section></section>;
}
