/* =====================================================
  AMAS – DATABASE.JS  v4  (Refatoração Completa)
===================================================== */

const DADOS_INICIAIS = {
  usuarios: [
    { id: 1, nome: "Administrador AMAS", email: "admin@amas.com", senha: "admin123", perfil: "admin" },
    {
      id: 2, nome: "Empresa Parceira LTDA", email: "empresa@amas.com", senha: "empresa123", perfil: "empresario",
      cnpj: "12.345.678/0001-99", telefone: "(61) 3333-4444",
      unidades: [
        { id: 1, nome: "Unidade Central", endereco: "Av. Principal, 100 - São Sebastião/DF" },
        { id: 2, nome: "Filial Norte", endereco: "Rua das Rosas, 55 - São Sebastião/DF" }
      ],
      contrato: {
        beneficioOfertado:   "10% de desconto em todos os produtos",
        regrasUtilizacao:    "Não acumulativo com outras promoções; válido apenas para pagamento à vista.",
        formaValidacao:      "Apresentar Carteirinha Digital AMAS no caixa ou mostrar o CPF cadastrado.",
        tipoAcordo:          "Parceiro de Benefício (Padrão)",
        descricaoBeneficios: "10% de desconto em todos os produtos. Frete grátis para compras acima de R$50.",
        beneficiosValidados: true,
        observacoesAdmin:    "Parceria ativa desde 2025.",
        dataVigencia:        "2026-12-31",
        historicoDocumentos: [
          { tipo: "Termo de Adesão", dataGeracao: "2025-03-01T10:00:00.000Z", versao: 1 }
        ]
      }
    }
  ],
  associados: [
    {
      id: 101, nome: "João da Silva", cpf: "123.456.789-00",
      nascimento: "1990-05-15", telefone: "(61) 99999-1111",
      email: "joao@email.com", endereco: "Rua das Flores, 123 - São Sebastião/DF",
      profissao: "Comerciante", senha: "123456", primeiroLogin: false,
      status: "Regular", matricula: "AMAS-001", dataEntrada: "2024-01-10",
      foto: null,
      historico: [
        { id: 1001, valor: "50.00", arquivo: "comprovante_jan.pdf", data: "10/01/2025", mes: "Janeiro 2025", status: "Aprovado", msgAdmin: "", observacoes: "" },
        { id: 1002, valor: "50.00", arquivo: "comprovante_fev.pdf", data: "08/02/2025", mes: "Fevereiro 2025", status: "Aprovado", msgAdmin: "", observacoes: "" },
        { id: 1003, valor: "50.00", arquivo: "comprovante_mar.pdf", data: "05/03/2025", mes: "Março 2025", status: "Em análise", msgAdmin: "", observacoes: "Pagamento referente a adiantamento de abril" }
      ],
      parcelasAtraso: []
    },
    {
      id: 102, nome: "Maria Oliveira", cpf: "987.654.321-00",
      nascimento: "1985-11-20", telefone: "(61) 99888-2222",
      email: "maria@email.com", endereco: "Av. Principal, 456 - São Sebastião/DF",
      profissao: "Professora", senha: "123456", primeiroLogin: false,
      status: "Inadimplente", matricula: "AMAS-002", dataEntrada: "2024-02-15",
      foto: null,
      historico: [
        { id: 1004, valor: "50.00", arquivo: "comprovante_jan_m.pdf", data: "12/01/2025", mes: "Janeiro 2025", status: "Aprovado", msgAdmin: "", observacoes: "" }
      ],
      parcelasAtraso: [
        { mes: "Fevereiro 2025", valor: "50.00", vencimento: "2025-02-10" },
        { mes: "Março 2025", valor: "50.00", vencimento: "2025-03-10" }
      ]
    },
    {
      id: 103, nome: "Carlos Mendes", cpf: "456.123.789-00",
      nascimento: "1978-03-08", telefone: "(61) 97777-3333",
      email: "carlos@email.com", endereco: "Quadra 12, Lote 5 - São Sebastião/DF",
      profissao: "Engenheiro", senha: "123456", primeiroLogin: false,
      status: "Em análise", matricula: "AMAS-003", dataEntrada: "2024-03-20",
      foto: null,
      historico: [
        { id: 1005, valor: "50.00", arquivo: "comprovante_mar_c.jpg", data: "02/03/2025", mes: "Março 2025", status: "Em análise", msgAdmin: "", observacoes: "Quitando atraso de fevereiro" }
      ],
      parcelasAtraso: [
        { mes: "Fevereiro 2025", valor: "50.00", vencimento: "2025-02-10" }
      ]
    }
  ],
  noticias: [
    { id: 2001, titulo: "AMAS fecha parceria com Supermercado Vila Nova", resumo: "Associados da AMAS passam a ter 8% de desconto em todas as compras no Supermercado Vila Nova, a partir de abril de 2025.", conteudo: "A AMAS tem o prazer de anunciar nova parceria com o Supermercado Vila Nova. A partir de abril de 2025, todos os associados regulares terão 8% de desconto em todas as compras. Basta apresentar a carteirinha digital no caixa.", categoria: "parceria", destaque: true, publicadaEm: "2025-03-10", autor: "Administrador AMAS" },
    { id: 2002, titulo: "Assembleia geral ordinária – Março 2025", resumo: "A AMAS convoca todos os associados para a Assembleia Geral Ordinária do primeiro trimestre, que acontecerá no dia 28 de março.", conteudo: "Todos os associados estão convocados para a Assembleia Geral Ordinária referente ao primeiro trimestre de 2025, no dia 28 de março às 19h, na sede da associação.", categoria: "comunicado", destaque: false, publicadaEm: "2025-03-05", autor: "Administrador AMAS" },
    { id: 2003, titulo: "Campanha de alimentos supera expectativas", resumo: "A campanha solidária de fevereiro superou as expectativas: mais de 800kg de alimentos foram arrecadados e doados a famílias em situação de vulnerabilidade.", conteudo: "A campanha de arrecadação de alimentos promovida pela AMAS em fevereiro de 2025 alcançou resultados expressivos. Foram arrecadados 847 kg de alimentos não perecíveis, distribuídos para 60 famílias em situação de vulnerabilidade em São Sebastião.", categoria: "social", destaque: true, publicadaEm: "2025-02-28", autor: "Administrador AMAS" }
  ],
  eventos: [
    { id: 3001, titulo: "Mutirão de Limpeza – Parque do Bairro", descricao: "Ação de limpeza e revitalização do parque central do bairro, em parceria com a Administração Regional de São Sebastião.", tipo: "social", data: "2026-04-05", horario: "08:00", local: "Parque Central de São Sebastião", vagas: 50, vagasTotais: 50, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: true },
    { id: 3002, titulo: "Workshop: Como formalizar seu negócio", descricao: "Capacitação gratuita para empreendedores locais sobre MEI, abertura de empresa e acesso a crédito.", tipo: "capacitacao", data: "2026-04-12", horario: "14:00", local: "Sede da AMAS – Sala de reuniões", vagas: 30, vagasTotais: 30, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3003, titulo: "Reunião com novos empresários parceiros", descricao: "Encontro mensal para apresentação de empresas interessadas em ampliar benefícios para associados.", tipo: "parceria", data: "2026-04-18", horario: "19:00", local: "Restaurante Dom Bosco – Salão privativo", vagas: 40, vagasTotais: 40, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3004, titulo: "Festa Junina Comunitária AMAS 2025", descricao: "Celebração junina aberta à comunidade com barracas, música ao vivo, comidas típicas e sorteios exclusivos para associados.", tipo: "cultural", data: "2026-06-21", horario: "16:00", local: "Quadra poliesportiva – São Sebastião", vagas: 300, vagasTotais: 300, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: true }
  ],
  mensagens: [
    { id: 4001, titulo: "Bem-vindo ao sistema AMAS!", corpo: "Olá! Seja bem-vindo ao portal digital da AMAS. Aqui você acompanha sua situação financeira, envia comprovantes e acessa todas as novidades da associação.", data: "2026-01-10T09:00:00.000Z", tipo: "broadcast", destinatarios: "todos", remetente: "Administrador AMAS", lidas: [] },
    { id: 4002, titulo: "Lembrete: Parcela de Março vence em 10/03", corpo: "Este é um aviso automático da AMAS. Sua contribuição mensal de março vence no dia 10/03/2025. Mantenha-se em dia para usufruir de todos os benefícios!", data: "2026-03-05T08:00:00.000Z", tipo: "broadcast", destinatarios: "associados", remetente: "Administrador AMAS", lidas: [101] }
  ],
  alertasEmpresario: [],
  logAtividades: [
    { id: 1, acao: "Login realizado", usuario: "Administrador AMAS", perfil: "admin", data: new Date(Date.now()-300000).toISOString(), detalhes: "Acesso ao painel administrativo" },
    { id: 2, acao: "Comprovante aprovado", usuario: "Administrador AMAS", perfil: "admin", data: new Date(Date.now()-600000).toISOString(), detalhes: "Contribuição de João da Silva (Jan 2025) aprovada" },
    { id: 3, acao: "Comprovante enviado", usuario: "João da Silva", perfil: "associado", data: new Date(Date.now()-900000).toISOString(), detalhes: "Comprovante de Março 2025 enviado para análise" }
  ],
  solicitacoes: [
    { id: 5001, nome: "Fernanda Lima", cpf: "321.654.987-00", email: "fernanda@email.com", telefone: "(61) 98765-4321", profissao: "Artesã", endereco: "QR 110, Conjunto A - São Sebastião/DF", dataSolicitacao: "2025-03-12", status: "Pendente", observacoes: "Indicada por João da Silva (AMAS-001)" }
  ]
};

const DB_VERSION = "amas_v4.6";

function inicializarBanco() {
  if (localStorage.getItem("amas_db_version") !== DB_VERSION) {
    localStorage.setItem("amas_usuarios",     JSON.stringify(DADOS_INICIAIS.usuarios));
    localStorage.setItem("amas_associados",   JSON.stringify(DADOS_INICIAIS.associados));
    localStorage.setItem("amas_noticias",     JSON.stringify(DADOS_INICIAIS.noticias));
    localStorage.setItem("amas_eventos",      JSON.stringify(DADOS_INICIAIS.eventos));
    localStorage.setItem("amas_mensagens",    JSON.stringify(DADOS_INICIAIS.mensagens));
    localStorage.setItem("amas_alertas_emp",  JSON.stringify(DADOS_INICIAIS.alertasEmpresario));
    localStorage.setItem("amas_log",          JSON.stringify(DADOS_INICIAIS.logAtividades));
    localStorage.setItem("amas_solicitacoes", JSON.stringify(DADOS_INICIAIS.solicitacoes));
    // Limpa flags de migração para forçar re-inicialização completa
    localStorage.removeItem("amas_doacoes");
    localStorage.removeItem("amas_contratos_init");
    localStorage.removeItem("amas_eventos_v44");
    localStorage.removeItem("amas_seed_extra_v1");
    localStorage.setItem("amas_db_version", DB_VERSION);
    ["usuarios","associados","contribuicoes","usuarioLogado"].forEach(k => localStorage.removeItem(k));
  }
}

function getUsuarios()     { return JSON.parse(localStorage.getItem("amas_usuarios"))     || []; }
function getAssociados()   { return JSON.parse(localStorage.getItem("amas_associados"))   || []; }
function getNoticias()     { return JSON.parse(localStorage.getItem("amas_noticias"))     || []; }
function getEventos()      { return JSON.parse(localStorage.getItem("amas_eventos"))      || []; }
function getMensagens()    { return JSON.parse(localStorage.getItem("amas_mensagens"))    || []; }
function getAlertasEmp()   { return JSON.parse(localStorage.getItem("amas_alertas_emp")) || []; }
function getLog()          { return JSON.parse(localStorage.getItem("amas_log"))          || []; }
function getSolicitacoes() { return JSON.parse(localStorage.getItem("amas_solicitacoes"))|| []; }

let saveTimer = null;
function notifySave() {
  const ind = document.getElementById("saveIndicator");
  if (!ind) return;
  ind.textContent = "✅ Dados salvos";
  ind.className = "save-indicator saved";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { ind.className = "save-indicator"; }, 3000);
}

function salvarAssociados(l)   { localStorage.setItem("amas_associados",   JSON.stringify(l)); notifySave(); }
function salvarUsuarios(l)     { localStorage.setItem("amas_usuarios",     JSON.stringify(l)); notifySave(); }
function salvarNoticias(l)     { localStorage.setItem("amas_noticias",     JSON.stringify(l)); notifySave(); }
function salvarEventos(l)      { localStorage.setItem("amas_eventos",      JSON.stringify(l)); notifySave(); }
function salvarMensagens(l)    { localStorage.setItem("amas_mensagens",    JSON.stringify(l)); notifySave(); }
function salvarAlertasEmp(l)   { localStorage.setItem("amas_alertas_emp", JSON.stringify(l)); notifySave(); }
function salvarLog(l)          { localStorage.setItem("amas_log",          JSON.stringify(l)); }
function salvarSolicitacoes(l) { localStorage.setItem("amas_solicitacoes", JSON.stringify(l)); notifySave(); }

function getSessao()   { return JSON.parse(localStorage.getItem("amas_sessao")) || null; }
function setSessao(u)  { localStorage.setItem("amas_sessao", JSON.stringify(u)); }
function clearSessao() { localStorage.removeItem("amas_sessao"); }

function registrarLog(acao, usuario, perfil, detalhes) {
  const log = getLog();
  log.unshift({ id: Date.now(), acao, usuario: usuario||"Sistema", perfil: perfil||"sistema", data: new Date().toISOString(), detalhes: detalhes||"" });
  if (log.length > 100) log.splice(100);
  salvarLog(log);
}

function buscarAssociadoCPF(cpf) {
  const c = cpf.replace(/\D/g, "");
  return getAssociados().find(a => a.cpf.replace(/\D/g, "") === c);
}

function adicionarAssociado(associado) {
  const lista  = getAssociados();
  const novoId = (lista.length > 0 ? Math.max(...lista.map(a => a.id)) : 100) + 1;
  const mat    = "AMAS-" + String(novoId - 100).padStart(3,"0");
  const novo   = { ...associado, id: novoId, matricula: mat, dataEntrada: new Date().toISOString().split("T")[0], historico: [], foto: null, parcelasAtraso: [] };
  lista.push(novo);
  salvarAssociados(lista);
  registrarLog("Associado cadastrado", getSessao()?.nome, getSessao()?.perfil, novo.nome + " (" + mat + ") cadastrado");
  return novo;
}

function atualizarAssociado(id, dados) {
  const lista = getAssociados();
  const idx   = lista.findIndex(a => a.id === id);
  if (idx !== -1) { lista[idx] = { ...lista[idx], ...dados }; salvarAssociados(lista); }
}

function removerAssociado(id) {
  const assoc = getAssociados().find(a => a.id === id);
  salvarAssociados(getAssociados().filter(a => a.id !== id));
  if (assoc) registrarLog("Associado removido", getSessao()?.nome, "admin", assoc.nome + " removido do sistema");
}

function cpfJaExiste(cpf, excluirId) {
  const c = cpf.replace(/\D/g, "");
  return getAssociados().some(a => a.cpf.replace(/\D/g, "") === c && a.id !== excluirId);
}

function autenticar(email, senha) {
  const el = email.trim().toLowerCase();
  const u  = getUsuarios().find(u => u.email.toLowerCase() === el && u.senha === senha);
  if (u) return u;
  const a  = getAssociados().find(a => a.email.toLowerCase() === el && a.senha === senha);
  if (a) return { ...a, perfil: "associado" };
  return null;
}

function adicionarContribuicao(idAssociado, contrib) {
  const lista = getAssociados();
  const idx   = lista.findIndex(a => a.id === idAssociado);
  if (idx !== -1) {
    if (!lista[idx].historico) lista[idx].historico = [];
    lista[idx].historico.push({ ...contrib, id: Date.now(), data: new Date().toLocaleDateString("pt-BR") });
    lista[idx].status = "Em análise";
    salvarAssociados(lista);
    registrarLog("Comprovante enviado", lista[idx].nome, "associado", "Comprovante de " + contrib.mes + " enviado");
  }
}

function atualizarStatusContribuicao(idAssociado, idContrib, novoStatus, msgAdmin) {
  const lista = getAssociados();
  const ai    = lista.findIndex(a => a.id === idAssociado);
  if (ai !== -1) {
    const ci = lista[ai].historico.findIndex(c => c.id === idContrib);
    if (ci !== -1) {
      lista[ai].historico[ci].status   = novoStatus;
      lista[ai].historico[ci].msgAdmin = msgAdmin || "";
      if (novoStatus === "Aprovado") {
        const temOutroPendente = lista[ai].historico.some((c, i) => i !== ci && (c.status === "Em análise" || c.status === "Revisão solicitada"));
        lista[ai].status = temOutroPendente ? "Em análise" : "Regular";
        registrarLog("Comprovante aprovado", getSessao()?.nome, "admin", "Contribuição de " + lista[ai].nome + " aprovada");
      } else if (novoStatus === "Recusado") {
        lista[ai].status = "Inadimplente";
        registrarLog("Comprovante recusado", getSessao()?.nome, "admin", "Contribuição de " + lista[ai].nome + " recusada");
      }
    }
    salvarAssociados(lista);
  }
}

function enviarMensagem(titulo, corpo, destinatarios) {
  const lista = getMensagens();
  const nova = { id: Date.now(), titulo, corpo, data: new Date().toISOString(), tipo: "broadcast", destinatarios, remetente: getSessao()?.nome || "Administrador AMAS", lidas: [] };
  lista.unshift(nova);
  salvarMensagens(lista);
  registrarLog("Broadcast enviado", getSessao()?.nome, "admin", '"' + titulo + '" → ' + destinatarios);
  return nova;
}

function marcarMensagemLida(idMsg, idAssociado) {
  const lista = getMensagens();
  const idx = lista.findIndex(m => m.id === idMsg);
  if (idx !== -1 && !lista[idx].lidas.includes(idAssociado)) {
    lista[idx].lidas.push(idAssociado);
    salvarMensagens(lista);
  }
}

function getMensagensParaAssociado(idAssociado) {
  return getMensagens().filter(m => m.destinatarios === "todos" || m.destinatarios === "associados");
}

function contarNaoLidas(idAssociado) {
  return getMensagensParaAssociado(idAssociado).filter(m => !m.lidas.includes(idAssociado)).length;
}

function enviarAlertaEmpresario(empresarioId, empresarioNome, titulo, mensagem, urgente) {
  const lista = getAlertasEmp();
  lista.unshift({ id: Date.now(), empresarioId, empresarioNome, titulo, mensagem, urgente: !!urgente, data: new Date().toISOString(), lido: false });
  salvarAlertasEmp(lista);
  registrarLog("Alerta enviado ao admin", empresarioNome, "empresario", '"' + titulo + '" ' + (urgente ? "(URGENTE)" : ""));
}

function marcarAlertaLido(id) {
  const lista = getAlertasEmp();
  const idx = lista.findIndex(a => a.id === id);
  if (idx !== -1) { lista[idx].lido = true; salvarAlertasEmp(lista); }
}

function adicionarNoticia(n) {
  const lista = getNoticias(); const novoId = lista.length > 0 ? Math.max(...lista.map(x => x.id)) + 1 : 2001;
  const nova = { ...n, id: novoId, publicadaEm: new Date().toISOString().split("T")[0], autor: "Administrador AMAS" };
  lista.unshift(nova); salvarNoticias(lista); return nova;
}
function atualizarNoticia(id, dados) {
  const lista = getNoticias(); const idx = lista.findIndex(n => n.id === id);
  if (idx !== -1) { lista[idx] = { ...lista[idx], ...dados }; salvarNoticias(lista); }
}
function removerNoticia(id) { salvarNoticias(getNoticias().filter(n => n.id !== id)); }

function adicionarEvento(e) {
  const lista  = getEventos();
  const novoId = lista.length > 0 ? Math.max(...lista.map(x => x.id)) + 1 : 3001;
  const vagas  = parseInt(e.vagasTotais || e.vagas || 0);
  const diffDias = (new Date((e.data||"2099-01-01") + "T00:00:00") - new Date()) / 86400000;
  const statusAuto = e.status || (diffDias > 30 ? "Em Breve" : "Aberto");
  const novo = {
    ...e,
    id:          novoId,
    vagas,
    vagasTotais: vagas,
    status:      statusAuto,
    inscritos:   e.inscritos   || [],
    listaEspera: e.listaEspera || [],
    inscricoes:  (e.inscritos  || []).length   // mantém retrocompat
  };
  lista.push(novo);
  lista.sort((a, b) => new Date(a.data) - new Date(b.data));
  salvarEventos(lista);
  return novo;
}
function atualizarEvento(id, dados) {
  const lista = getEventos();
  const idx   = lista.findIndex(e => e.id === id);
  if (idx !== -1) {
    // Preserva arrays de inscrições ao editar — não sobrescreve com undefined
    const atual = lista[idx];
    lista[idx] = {
      ...atual,
      ...dados,
      inscritos:   dados.inscritos   !== undefined ? dados.inscritos   : atual.inscritos   || [],
      listaEspera: dados.listaEspera !== undefined ? dados.listaEspera : atual.listaEspera || [],
      vagasTotais: dados.vagasTotais || dados.vagas || atual.vagasTotais || atual.vagas || 0
    };
    // Sincroniza inscricoes (legado) com o array real
    lista[idx].inscricoes = lista[idx].inscritos.length;
    salvarEventos(lista);
  }
}
function removerEvento(id) { salvarEventos(getEventos().filter(e => e.id !== id)); }

function aprovarSolicitacao(id) {
  const lista = getSolicitacoes(); const idx = lista.findIndex(s => s.id === id);
  if (idx === -1) return;
  const sol = lista[idx]; lista[idx].status = "Aprovado"; salvarSolicitacoes(lista);
  return adicionarAssociado({ nome: sol.nome, cpf: sol.cpf, email: sol.email, telefone: sol.telefone, profissao: sol.profissao, endereco: sol.endereco, senha: "123456", primeiroLogin: true, status: "Pendente" });
}
function recusarSolicitacao(id, motivo) {
  const lista = getSolicitacoes(); const idx = lista.findIndex(s => s.id === id);
  if (idx !== -1) { lista[idx].status = "Recusado"; lista[idx].motivoRecusa = motivo; salvarSolicitacoes(lista); }
}

function getEstatisticas() {
  const assocs = getAssociados();
  let totalArrecadado = 0;
  assocs.forEach(a => (a.historico||[]).forEach(c => { if (c.status === "Aprovado") totalArrecadado += parseFloat(c.valor || 0); }));
  return {
    total: assocs.length,
    regulares:  assocs.filter(a => a.status === "Regular").length,
    inadim:     assocs.filter(a => a.status === "Inadimplente").length,
    emAnalise:  assocs.filter(a => a.status === "Em análise").length,
    pendentes:  assocs.filter(a => a.status === "Pendente").length,
    totalArrecadado,
    alertasPendentes: getAlertasEmp().filter(a => !a.lido).length,
    pendentesAprovacao: assocs.reduce((acc, a) => acc + (a.historico||[]).filter(c => c.status === "Em análise").length, 0)
  };
}

function getEmpresarios() { return getUsuarios().filter(u => u.perfil === "empresario"); }
function atualizarEmpresario(id, dados) {
  const lista = getUsuarios(); const idx = lista.findIndex(u => u.id === id);
  if (idx !== -1) { lista[idx] = { ...lista[idx], ...dados }; salvarUsuarios(lista); }
}

inicializarBanco();

/* =====================================================
  AMAS – DATABASE.JS  v4.1  Módulo Financeiro Parceiros
===================================================== */

/* ── REGRAS DE CONTRIBUIÇÃO ──────────────────────────
   Faixa 1: Renda líquida ≤ R$5.000   → ISENTO
   Faixa 2: R$5.000 < líquida ≤ R$10.000 → Taxa fixa R$100 OU alíquota reduzida (padrão 2%)
   Faixa 3: Renda líquida > R$10.000  → Alíquota contrato (padrão 5%)
   Acordo de Benefícios Ativo         → Admin pode reduzir alíquota (ex: 3%)
─────────────────────────────────────────────────────*/



/* ── INIT DOAÇÕES (dados demo) ───────────────────────*/
function inicializarDoacoes() {
  if (localStorage.getItem("amas_doacoes")) return; // já inicializado
  const demo = [
    { id: 9001, empresaId: 2, empresaNome: "Empresa Parceira LTDA", mes: "2025-01",
      rendaBruta: 10000, rendaLiquida: 8500, valorDevido: 255, faixa: 3, aliquotaAplicada: 3,
      isento: false, status: "Pago",
      dataCriacao: "2025-01-31T10:00:00.000Z", dataComprovante: "2025-02-02T14:00:00.000Z",
      dataRevisao: "2025-02-03T09:00:00.000Z",
      comprovante: "pix_jan_2025.pdf", observacoes: "PIX enviado.", obsAdmin: "" },
    { id: 9002, empresaId: 2, empresaNome: "Empresa Parceira LTDA", mes: "2025-02",
      rendaBruta: 10823.53, rendaLiquida: 9200, valorDevido: 276, faixa: 3, aliquotaAplicada: 3,
      isento: false, status: "Pago",
      dataCriacao: "2025-02-28T10:00:00.000Z", dataComprovante: "2025-03-01T11:00:00.000Z",
      dataRevisao: "2025-03-02T08:30:00.000Z",
      comprovante: "pix_fev_2025.pdf", observacoes: "", obsAdmin: "" },
    { id: 9003, empresaId: 2, empresaNome: "Empresa Parceira LTDA", mes: "2025-03",
      rendaBruta: 9176.47, rendaLiquida: 7800, valorDevido: 234, faixa: 3, aliquotaAplicada: 3,
      isento: false, status: "Aguardando confirmação",
      dataCriacao: "2025-03-31T10:00:00.000Z", dataComprovante: "2025-04-01T09:00:00.000Z",
      dataRevisao: null,
      comprovante: "pix_mar_2025.pdf", observacoes: "Pago via PIX, chave CNPJ.", obsAdmin: "" },
  ];
  localStorage.setItem("amas_doacoes", JSON.stringify(demo));
}

// Atualiza empresa demo para ter contrato v4.6
function inicializarContratosDemo() {
  if (localStorage.getItem("amas_contratos_init")) return;
  const lista = getUsuarios();
  const idx = lista.findIndex(u => u.id === 2);
  if (idx >= 0 && !lista[idx].contrato) {
    lista[idx].contrato = {
      tipoAcordo: "Parceiro de Benefício (Padrão)",
      beneficioOfertado: "10% de desconto para associados AMAS em todos os produtos. Frete grátis acima de R$50.",
      regrasUtilizacao: "Não acumulativo com outras promoções; válido apenas para pagamento à vista.",
      formaValidacao: "Apresentar Carteirinha Digital AMAS no caixa.",
      descricaoBeneficios: "",
      beneficiosValidados: true,
      observacoesAdmin: "Acordo renovado em 01/01/2025.",
      dataVigencia: "2026-12-31",
      historicoDocumentos: []
    };
    localStorage.setItem("amas_usuarios", JSON.stringify(lista));
  }
  localStorage.setItem("amas_contratos_init", "1");
}

inicializarDoacoes();
inicializarContratosDemo();

/* =====================================================
  AMAS – DATABASE v4.3 — Seed Data Expandido
  16 notícias + 8 eventos adicionais para demo rico
===================================================== */

const SEED_EXTRA = {
  noticias: [
    { id: 2004, titulo: "Congresso de Mulheres AMAS 2025", resumo: "O maior evento do ano reúne mais de 200 mulheres para dois dias de palestras, adoração e networking entre associadas.", conteudo: "O Congresso de Mulheres da AMAS acontecerá nos dias 14 e 15 de junho, no salão principal da Igreja. Com o tema 'Mulher de Valor', o evento trará palestrantes convidadas, momentos de adoração ao vivo, workshop de empreendedorismo feminino e espaço de oração. As inscrições estão abertas para associadas e convidadas.", categoria: "social", destaque: true, publicadaEm: "2025-04-01", autor: "Administrador AMAS" },
    { id: 2005, titulo: "Café com Empresários – Edição Abril", resumo: "Encontro mensal de networking entre empresários parceiros e lideranças da AMAS para fortalecer as parcerias e gerar oportunidades de negócio.", conteudo: "O Café com Empresários de abril acontecerá no dia 17, às 8h, no espaço empresarial da sede. O evento é uma oportunidade única de fortalecer relacionamentos, apresentar negócios e discutir estratégias de benefício mútuo. Empresários parceiros, associados empreendedores e lideranças estão convidados. Vagas limitadas — confirme presença pelo portal.", categoria: "parceria", destaque: false, publicadaEm: "2025-03-28", autor: "Administrador AMAS" },
    { id: 2006, titulo: "Curso de Teologia Básica com Certificado", resumo: "A AMAS em parceria com o Seminário Livre inicia turmas do Curso de Teologia Básica, aberto a todos os associados sem custo adicional.", conteudo: "Em mais uma iniciativa de desenvolvimento espiritual, a AMAS oferece o Curso de Teologia Básica com duração de 6 meses, às quartas-feiras às 19h. O curso é gratuito para associados regulares e inclui material didático. Ao final, os concluintes recebem certificado reconhecido. As inscrições podem ser feitas diretamente no portal do associado.", categoria: "comunicado", destaque: false, publicadaEm: "2025-03-22", autor: "Administrador AMAS" },
    { id: 2007, titulo: "Mutirão Solidário arrecada 1.200kg de alimentos", resumo: "Superando todas as expectativas, o mutirão de março distribuiu mais de 1.200kg de alimentos para 85 famílias carentes de São Sebastião.", conteudo: "A ação solidária de março da AMAS bateu recorde: foram arrecadados 1.247 kg de alimentos não perecíveis, doados por associados, empresários parceiros e pela comunidade em geral. A distribuição beneficiou 85 famílias cadastradas no programa social da associação. O próximo mutirão está previsto para junho — participe!", categoria: "social", destaque: true, publicadaEm: "2025-03-20", autor: "Administrador AMAS" },
    { id: 2008, titulo: "Nova parceria com Farmácia Vida Sana", resumo: "Associados AMAS passam a ter 12% de desconto em medicamentos e 20% em produtos de higiene na Farmácia Vida Sana.", conteudo: "A AMAS firmou acordo com a rede Farmácia Vida Sana, que possui 3 unidades em São Sebastião. A partir de 1º de maio, associados regulares terão 12% de desconto em todos os medicamentos e 20% em produtos de higiene e beleza. Basta apresentar a carteirinha digital no balcão de atendimento.", categoria: "parceria", destaque: false, publicadaEm: "2025-03-18", autor: "Administrador AMAS" },
    { id: 2009, titulo: "Workshop: Finanças Pessoais para Famílias", resumo: "Capacitação gratuita sobre controle financeiro, planejamento orçamentário e investimentos para famílias de baixa e média renda.", conteudo: "A AMAS realiza, em parceria com o Banco do Brasil, um workshop gratuito de Finanças Pessoais no dia 26 de abril, das 9h às 13h. Serão abordados temas como: controle de gastos, quitação de dívidas, criação de reserva de emergência e primeiros investimentos. Vagas para 40 pessoas — inscrições pelo portal.", categoria: "capacitacao", destaque: false, publicadaEm: "2025-03-15", autor: "Administrador AMAS" },
    { id: 2010, titulo: "AMAS completa 5 anos de fundação", resumo: "Em março de 2025, a AMAS celebra 5 anos de história, crescimento e impacto na comunidade de São Sebastião/DF.", conteudo: "Cinco anos atrás, um grupo de líderes visionários fundou a AMAS com um sonho: transformar a comunidade de São Sebastião através da fé, da solidariedade e do empreendedorismo. Hoje, com mais de 100 associados, dezenas de empresas parceiras e centenas de famílias impactadas, celebramos esta conquista com gratidão e renovação do nosso compromisso.", categoria: "conquista", destaque: true, publicadaEm: "2025-03-10", autor: "Administrador AMAS" },
    { id: 2011, titulo: "Desconto de 15% na Ótica Central para associados", resumo: "Nova parceria garante desconto exclusivo de 15% em óculos de grau, solar e exames de vista na Ótica Central de São Sebastião.", conteudo: "A partir de abril, associados regulares da AMAS têm 15% de desconto em todos os produtos e serviços da Ótica Central. O benefício inclui armações, lentes de grau, óculos solares e exames de refração. A Ótica Central fica na Quadra 102, loja 12.", categoria: "parceria", destaque: false, publicadaEm: "2025-03-07", autor: "Administrador AMAS" },
    { id: 2012, titulo: "Reforma da sede concluída com apoio dos parceiros", resumo: "Graças às contribuições dos empresários parceiros e do engajamento dos associados, a reforma da sede da AMAS foi concluída.", conteudo: "Após 3 meses de obras, a sede da AMAS conta com: sala de reuniões ampliada com capacidade para 60 pessoas, espaço multiuso para cursos e workshops, copa reformada e banheiros acessíveis. A reforma foi viabilizada pelas contribuições dos empresários parceiros e por mutirões de trabalho voluntário dos associados. Agradecemos a todos!", categoria: "conquista", destaque: false, publicadaEm: "2025-02-20", autor: "Administrador AMAS" }
  ],
  eventos: [
    { id: 3005, titulo: "Congresso de Mulheres AMAS 2025", descricao: "Dois dias de palestras, adoração, network e formação para mulheres da comunidade. Tema: 'Mulher de Valor'.", tipo: "cultural", data: "2026-06-14", horario: "09:00", local: "Salão Principal – Sede AMAS", vagas: 200, vagasTotais: 200, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: true },
    { id: 3006, titulo: "Café com Empresários – Abril", descricao: "Encontro de networking entre empresários parceiros e lideranças. Apresentações de negócios e oportunidades de parceria.", tipo: "parceria", data: "2026-04-17", horario: "08:00", local: "Espaço Empresarial – Sede AMAS", vagas: 40, vagasTotais: 40, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3007, titulo: "Workshop de Finanças Pessoais", descricao: "Capacitação gratuita sobre orçamento familiar, quitação de dívidas e primeiros investimentos. Em parceria com o Banco do Brasil.", tipo: "capacitacao", data: "2026-04-26", horario: "09:00", local: "Sede da AMAS – Sala de Cursos", vagas: 40, vagasTotais: 40, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3008, titulo: "Culto de Celebração – 5 Anos da AMAS", descricao: "Culto especial de ação de graças pelos 5 anos de fundação da AMAS. Convidados especiais e apresentação dos projetos para 2025.", tipo: "cultural", data: "2026-05-03", horario: "19:00", local: "Templo Principal", vagas: 500, vagasTotais: 500, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: true },
    { id: 3009, titulo: "Curso de Teologia Básica – Início das Turmas", descricao: "Início do curso semestral de Teologia Básica, gratuito para associados. Certificado ao final. Módulo 1: Introdução à Hermenêutica.", tipo: "capacitacao", data: "2026-04-09", horario: "19:00", local: "Sede da AMAS – Sala 2", vagas: 30, vagasTotais: 30, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3010, titulo: "Ação Social – Corte de Cabelo Gratuito", descricao: "Ação solidária com profissionais parceiros oferecendo corte de cabelo, penteado e orientação de higiene pessoal para a comunidade.", tipo: "social", data: "2026-05-10", horario: "08:00", local: "Praça Central de São Sebastião", vagas: 150, vagasTotais: 150, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3011, titulo: "Assembleia Geral – 2º Trimestre 2025", descricao: "Prestação de contas do primeiro trimestre, votação da pauta de projetos para o segundo semestre e eleição de novos membros da diretoria.", tipo: "reuniao", data: "2026-06-28", horario: "19:00", local: "Sede da AMAS – Salão Principal", vagas: 200, vagasTotais: 200, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: false },
    { id: 3012, titulo: "Feira de Empreendedores AMAS", descricao: "Espaço para associados e empresários parceiros exporem seus produtos e serviços para a comunidade. Inscrições para expositores abertas.", tipo: "parceria", data: "2026-07-19", horario: "10:00", local: "Quadra Poliesportiva – São Sebastião", vagas: 80, vagasTotais: 80, inscricoes: 0, inscritos: [], listaEspera: [], status: "Aberto", destaque: true }
  ]
};

function inicializarSeedExtra() {
  if (localStorage.getItem("amas_seed_extra_v1")) return;
  // Acrescenta notícias extras sem sobrescrever as existentes
  const nots = getNoticias();
  const idsExistentes = new Set(nots.map(n => n.id));
  const novasNots = SEED_EXTRA.noticias.filter(n => !idsExistentes.has(n.id));
  if (novasNots.length) salvarNoticias([...nots, ...novasNots].sort((a,b) => b.publicadaEm.localeCompare(a.publicadaEm)));
  // Acrescenta eventos extras
  const evs = getEventos();
  const idsEvs = new Set(evs.map(e => e.id));
  const novosEvs = SEED_EXTRA.eventos.filter(e => !idsEvs.has(e.id));
  if (novosEvs.length) {
    const todos = [...evs, ...novosEvs].sort((a,b) => new Date(a.data) - new Date(b.data));
    salvarEventos(todos);
  }
  localStorage.setItem("amas_seed_extra_v1", "1");
}

inicializarSeedExtra();

/* =====================================================
  AMAS – DATABASE v4.4 — Motor de Inscrições em Eventos
  Novos campos: status, inscritos[], listaEspera[]
===================================================== */

/* ── Migração: garante campos novos em todos os eventos ── */
function migrarEventosV44() {
  // Força re-migração se a versão do banco foi atualizada (flag removida pelo inicializarBanco)
  if (localStorage.getItem("amas_eventos_v44")) return;
  const lista = getEventos();
  const hoje  = new Date().toISOString().split("T")[0];
  lista.forEach(ev => {
    // Status automático baseado na data se não houver campo status
    if (!ev.status) {
      const diffDias = (new Date(ev.data + "T00:00:00") - new Date()) / 86400000;
      ev.status = diffDias < -1 ? "Encerrado" : diffDias > 30 ? "Em Breve" : "Aberto";
    }
    if (!ev.inscritos)    ev.inscritos    = [];
    if (!ev.listaEspera)  ev.listaEspera  = [];
    if (!ev.vagasTotais)  ev.vagasTotais  = ev.vagas || 0;
  });
  salvarEventos(lista);
  localStorage.setItem("amas_eventos_v44", "1");
}

/* ── CRUD inscrições ──────────────────────────────── */

/**
 * Retorna o estado da inscrição de um associado num evento.
 * @returns "inscrito" | "espera" | "vaga_disponivel" | "livre" | "encerrado" | "lotado"
 */
function statusInscricao(evento, associadoId) {
  if (!evento) return "encerrado";
  if (evento.status === "Encerrado") return "encerrado";
  if (evento.status === "Em Breve")  return "em_breve";

  const inscritos   = evento.inscritos   || [];
  const listaEspera = evento.listaEspera || [];
  const vagas       = evento.vagasTotais || evento.vagas || 0;

  if (inscritos.some(i => i.id === associadoId)) return "inscrito";
  if (listaEspera.some(i => i.id === associadoId)) {
    // Verifica se é o primeiro da fila e há vagas disponíveis
    const primeiroFila = listaEspera[0]?.id === associadoId && inscritos.length < vagas;
    return primeiroFila ? "vaga_disponivel" : "espera";
  }

  const vagasDisponiveis = vagas - inscritos.length;
  if (vagasDisponiveis > 0) return "livre";
  return "lotado";
}

/**
 * Inscreve um associado. Vai para lista de espera se lotado.
 * @returns { ok, acao: "inscrito" | "espera" | "ja_inscrito" | "encerrado" }
 */
function inscreverNoEvento(eventoId, associado) {
  const lista = getEventos();
  const idx   = lista.findIndex(e => e.id === eventoId);
  if (idx < 0) return { ok: false, acao: "not_found" };

  const ev     = lista[idx];
  const estado = statusInscricao(ev, associado.id);

  if (estado === "encerrado" || estado === "em_breve") return { ok: false, acao: estado };
  if (estado === "inscrito" || estado === "espera" || estado === "vaga_disponivel") {
    return { ok: false, acao: "ja_inscrito" };
  }

  const entrada = { id: associado.id, nome: associado.nome, email: associado.email, matricula: associado.matricula || "", dataInscricao: new Date().toISOString() };

  if (estado === "livre") {
    lista[idx].inscritos = [...(lista[idx].inscritos || []), entrada];
    lista[idx].inscricoes = lista[idx].inscritos.length;
    salvarEventos(lista);
    registrarLog("Inscrição em evento", associado.nome, "associado", '"' + ev.titulo + '" — confirmado');
    // Notifica via mensagem interna
    enviarMensagem(
      "✅ Inscrição confirmada: " + ev.titulo,
      "Sua inscrição no evento \"" + ev.titulo + "\" foi confirmada! Data: " + ev.data + " às " + ev.horario + " em " + ev.local + ".",
      "associados"
    );
    return { ok: true, acao: "inscrito" };
  }

  // Lotado — vai para lista de espera
  lista[idx].listaEspera = [...(lista[idx].listaEspera || []), entrada];
  salvarEventos(lista);
  registrarLog("Fila de espera", associado.nome, "associado", '"' + ev.titulo + '" — posição ' + lista[idx].listaEspera.length);
  return { ok: true, acao: "espera", posicao: lista[idx].listaEspera.length };
}

/**
 * Cancela inscrição. Promove o primeiro da lista de espera se houver.
 * @returns { ok, promovido: null | { nome, id } }
 */
function cancelarInscricao(eventoId, associadoId) {
  const lista = getEventos();
  const idx   = lista.findIndex(e => e.id === eventoId);
  if (idx < 0) return { ok: false };

  const ev          = lista[idx];
  const inscritos   = ev.inscritos   || [];
  const listaEspera = ev.listaEspera || [];

  const eraInscrito = inscritos.some(i => i.id === associadoId);
  const eraEspera   = listaEspera.some(i => i.id === associadoId);

  if (!eraInscrito && !eraEspera) return { ok: false };

  let promovido = null;

  if (eraInscrito) {
    lista[idx].inscritos = inscritos.filter(i => i.id !== associadoId);
    lista[idx].inscricoes = lista[idx].inscritos.length;

    // Promoção automática do primeiro da fila
    if (listaEspera.length > 0) {
      const promover = listaEspera[0];
      lista[idx].inscritos.push({ ...promover, dataPromocao: new Date().toISOString() });
      lista[idx].listaEspera = listaEspera.slice(1);
      lista[idx].inscricoes  = lista[idx].inscritos.length;
      promovido = promover;
      registrarLog("Promovido da fila", promover.nome, "sistema", '"' + ev.titulo + '" — vaga disponível');
    }
  } else {
    lista[idx].listaEspera = listaEspera.filter(i => i.id !== associadoId);
  }

  salvarEventos(lista);
  return { ok: true, promovido };
}

/**
 * Confirma a vaga disponível para o primeiro da lista de espera.
 */
function confirmarVagaDisponivel(eventoId, associadoId) {
  const lista = getEventos();
  const idx   = lista.findIndex(e => e.id === eventoId);
  if (idx < 0) return false;

  const ev   = lista[idx];
  const fila = ev.listaEspera || [];
  const primeiroFila = fila[0];
  if (!primeiroFila || primeiroFila.id !== associadoId) return false;

  const vagas = ev.vagasTotais || ev.vagas || 0;
  if ((ev.inscritos || []).length >= vagas) return false; // vaga sumiu

  lista[idx].inscritos = [...(ev.inscritos || []), { ...primeiroFila, dataConfirmacao: new Date().toISOString() }];
  lista[idx].listaEspera = fila.slice(1);
  lista[idx].inscricoes  = lista[idx].inscritos.length;
  salvarEventos(lista);
  registrarLog("Vaga confirmada", primeiroFila.nome, "associado", '"' + ev.titulo + '" — confirmou vaga da fila');
  return true;
}

/**
 * Altera o status de um evento (Admin).
 * status: "Aberto" | "Encerrado" | "Em Breve"
 */
function alterarStatusEvento(eventoId, novoStatus) {
  const lista = getEventos();
  const idx   = lista.findIndex(e => e.id === eventoId);
  if (idx < 0) return;
  lista[idx].status = novoStatus;
  salvarEventos(lista);
  registrarLog("Status do evento alterado", getSessao()?.nome || "Admin", "admin",
    '"' + lista[idx].titulo + '" → ' + novoStatus);
}

/** Retorna os eventos em que um associado está inscrito ou na fila */
function getEventosDoAssociado(associadoId) {
  return getEventos().map(ev => {
    const estado = statusInscricao(ev, associadoId);
    return estado === "livre" || estado === "encerrado" || estado === "em_breve" || estado === "lotado"
      ? null
      : { ...ev, _estadoInscricao: estado };
  }).filter(Boolean);
}

migrarEventosV44();

/* =====================================================
  AMAS – DATABASE v4.5 — Recuperação de Senha
  Campos novos no objeto usuário/associado:
    resetSolicitado: bool  — pedido pendente
    senhaExpirada:   bool  — após reset admin, força troca
    dataResetSolicit: iso  — quando solicitou
=====================================================*/

const SENHA_PADRAO = "123456";

/* ── Busca unificada por e-mail (associados + usuários) ─ */
function buscarPorEmail(email) {
  const el = email.trim().toLowerCase();
  // Associados
  const assoc = getAssociados().find(a => a.email.toLowerCase() === el);
  if (assoc) return { ...assoc, perfil: "associado", _colecao: "associados" };
  // Usuários (admin + empresários)
  const user = getUsuarios().find(u => u.email.toLowerCase() === el);
  if (user) return { ...user, _colecao: "usuarios" };
  return null;
}

/* ── Solicita reset de senha ────────────────────────── */
function solicitarResetSenha(email) {
  const usuario = buscarPorEmail(email);
  if (!usuario) return { ok: false, erro: "E-mail não encontrado no sistema." };
  if (usuario.perfil === "admin") {
    return { ok: false, erro: "Conta de administrador não pode solicitar reset por este canal." };
  }

  const campos = { resetSolicitado: true, dataResetSolicit: new Date().toISOString() };
  if (usuario._colecao === "associados") {
    atualizarAssociado(usuario.id, campos);
  } else {
    atualizarEmpresario(usuario.id, campos);
  }

  registrarLog(
    "Reset de senha solicitado",
    usuario.nome, usuario.perfil,
    "Solicitação enviada via tela de login"
  );

  return {
    ok: true,
    nome:   usuario.nome,
    perfil: usuario.perfil,
    tipo:   usuario.perfil === "associado" ? "Associado" : "Empresa Parceira"
  };
}

/* ── Lista todos os resets pendentes ────────────────── */
function getResetsPendentes() {
  const lista = [];
  getAssociados().forEach(a => {
    if (a.resetSolicitado) lista.push({ ...a, perfil: "associado", _colecao: "associados",
      tipoLabel: "Associado", tipoIcon: '<i class="bi bi-person"></i>' });
  });
  getUsuarios().filter(u => u.perfil !== "admin").forEach(u => {
    if (u.resetSolicitado) lista.push({ ...u, _colecao: "usuarios",
      tipoLabel: u.perfil === "empresario" ? "Empresa Parceira" : u.perfil,
      tipoIcon:  u.perfil === "empresario" ? '<i class="bi bi-building"></i>' : '<i class="bi bi-person"></i>' });
  });
  // Ordena do mais recente
  lista.sort((a, b) => new Date(b.dataResetSolicit||0) - new Date(a.dataResetSolicit||0));
  return lista;
}

/* ── Admin processa reset ───────────────────────────── */
function processarResetAdmin(id, colecao) {
  const campos = {
    senha:           SENHA_PADRAO,
    senhaExpirada:   true,
    resetSolicitado: false,
    dataResetSolicit: null
  };
  if (colecao === "associados") {
    atualizarAssociado(id, campos);
    const a = getAssociados().find(x => x.id === id);
    registrarLog("Senha resetada pelo Admin", getSessao()?.nome||"Admin", "admin",
      (a?.nome||"") + " — senha voltou ao padrão, troca obrigatória ativada");
  } else {
    atualizarEmpresario(id, campos);
    const u = getUsuarios().find(x => x.id === id);
    registrarLog("Senha resetada pelo Admin", getSessao()?.nome||"Admin", "admin",
      (u?.nome||"") + " — senha voltou ao padrão, troca obrigatória ativada");
  }
}

/* ── Usuário define nova senha após reset ───────────── */
function definirNovaSenha(id, colecao, novaSenha) {
  if (novaSenha === SENHA_PADRAO) return { ok: false, erro: "A nova senha não pode ser a senha padrão (123456)." };
  if (novaSenha.length < 6)       return { ok: false, erro: "A senha deve ter pelo menos 6 caracteres." };
  const campos = { senha: novaSenha, senhaExpirada: false, primeiroLogin: false };
  if (colecao === "associados") {
    atualizarAssociado(id, campos);
  } else {
    atualizarEmpresario(id, campos);
  }
  return { ok: true };
}

/* =====================================================
   DATABASE v4.6 — Modelo Parceria por Benefício Mútuo
   Funções novas + stubs de compatibilidade
===================================================== */

/* ── Salva contrato de parceria (novo modelo) ─────── */
function salvarContratoEmpresa(empId, contrato) {
  const lista = getUsuarios();
  const idx   = lista.findIndex(u => u.id === empId);
  if (idx !== -1) {
    lista[idx].contrato = { ...(lista[idx].contrato || {}), ...contrato };
    salvarUsuarios(lista);
    registrarLog("Contrato de parceria atualizado", getSessao()?.nome || "Admin", "admin",
      lista[idx].nome + " — " + (contrato.beneficioOfertado || ""));
  }
}

/* ── Registra documento gerado no histórico ──────── */
function registrarDocumentoHistorico(empId, tipo) {
  const lista = getUsuarios();
  const idx   = lista.findIndex(u => u.id === empId);
  if (idx === -1) return;
  const contrato = lista[idx].contrato || {};
  const hist = contrato.historicoDocumentos || [];
  hist.push({
    tipo,
    dataGeracao: new Date().toISOString(),
    versao: hist.filter(h => h.tipo === tipo).length + 1
  });
  lista[idx].contrato = { ...contrato, historicoDocumentos: hist };
  salvarUsuarios(lista);
}

/* ── Retorna histórico documental de uma empresa ──── */
function getHistoricoDocumental(empId) {
  const emp = getUsuarios().find(u => u.id === empId);
  return (emp?.contrato?.historicoDocumentos) || [];
}

/* ── Atualizar empresário (helper) ───────────────── */
function atualizarEmpresario(id, dados) {
  const lista = getUsuarios();
  const idx   = lista.findIndex(u => u.id === id);
  if (idx !== -1) {
    lista[idx] = { ...lista[idx], ...dados };
    salvarUsuarios(lista);
  }
}

/* ── Stubs de compatibilidade ─────────────────────── */
// getDoacoes/salvarDoacoes mantidos para evitar erros em código antigo
function getDoacoes()    { return JSON.parse(localStorage.getItem("amas_doacoes"))    || []; }
function salvarDoacoes(l){ localStorage.setItem("amas_doacoes", JSON.stringify(l)); }
function inicializarDoacoes()    { /* modelo financeiro removido */ }
function inicializarContratosDemo() {
  if (localStorage.getItem("amas_contratos_init")) return;
  localStorage.setItem("amas_contratos_init", "1");
}
