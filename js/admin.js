/* ─── ADMIN.JS v4 ─────────────────────────────────── */

if (typeof Chart !== "undefined") { Chart.defaults.animation = false; Chart.defaults.responsive = true; Chart.defaults.maintainAspectRatio = false; }

document.addEventListener("DOMContentLoaded", () => {

  /* Garante que o banco (e o usuário admin) esteja inicializado antes do guard */
  if (typeof inicializarBanco === "function") inicializarBanco();

  const sessao = getSessao();
  if (!sessao || sessao.perfil !== "admin") { window.location.href = "login.html"; return; }
  document.getElementById("adminNome").textContent = sessao.nome || "Administrador";

  const clockEl = document.getElementById("topbarClock");
  function updateClock() { clockEl.textContent = new Date().toLocaleString("pt-BR"); }
  updateClock(); setInterval(updateClock, 1000);

  // ── Helpers
  function statusBadge(status) {
    const map = { "Regular":"badge-regular","Inadimplente":"badge-inadim","Em análise":"badge-analise","Revisão solicitada":"badge-revisao","Pendente":"badge-pendente","Aprovado":"badge-aprovado","Recusado":"badge-recusado" };
    return '<span class="badge ' + (map[status]||"badge-pendente") + '">' + status + '</span>';
  }
  function dataBR(iso) { if (!iso) return "—"; const [y,m,d] = iso.split("-"); return d+"/"+m+"/"+y; }

  // ── Helper para capturar cliques corretamente em botões com ícones
  function getClickedButton(e) {
    return e.target.closest('button, .nav-item, .qa-btn, .btn');
  }

  // ── Badges sidebar
  function atualizarBadges() {
    const pendentes = getAssociados().reduce((acc,a) => acc + (a.historico||[]).filter(c => c.status === "Em análise").length, 0);
    const alertas   = getAlertasEmp().filter(a => !a.lido).length;
    const bMesa = document.getElementById("badgeMesa");
    const bAlert = document.getElementById("badgeAlertas");
    const bRec   = document.getElementById("badgeRecuperacao");
    const pendRec = getResetsPendentes().length;
    if (bRec) {
      if (pendRec > 0) { bRec.textContent = pendRec; bRec.classList.remove("hidden"); }
      else bRec.classList.add("hidden");
    }
    if (pendentes > 0) { bMesa.textContent = pendentes; bMesa.classList.remove("hidden"); } else bMesa.classList.add("hidden");
    if (alertas > 0)   { bAlert.textContent = alertas;  bAlert.classList.remove("hidden"); } else bAlert.classList.add("hidden");
  }

  // ── Navegação
  const navItems  = document.querySelectorAll(".nav-item");
  const sections  = document.querySelectorAll(".painel-section");
  const pageTitle = document.getElementById("pageTitle");
  const pageSub   = document.getElementById("pageSub");
  const titulos = {
    dashboard:   ["Dashboard",              "Visão geral do sistema AMAS"],
    mesa:        ["Mesa de Operações",      "Validar comprovantes enviados pelos associados"],
    associados:  ["Associados",             "Gerencie todos os membros da associação"],
    broadcast:   ["Broadcast",              "Envie mensagens para grupos de usuários"],
    alertas:     ["Alertas de Empresários", "Comunicados urgentes dos parceiros"],
    relatorios:  ["Relatórios",             "Dados e exportação do sistema"],
    monitor:     ["Monitor de Atividades",  "Log de ações realizadas no sistema"],
    noticias:    ["Notícias",               "Publique e gerencie as notícias da AMAS"],
    eventos:     ["Eventos",                "Organize os eventos da associação"],
    solicitacoes:["Solicitações",           "Novos pedidos de associação"],
    contratos:   ["Catálogo de Parcerias",  "Gerencie os convênios e benefícios para associados"],
    recuperacao:  ["Recuperação de Acesso",    "Resets de senha solicitados pelos usuários"]
  };

  window.irPara = function(sec) {
    const item = document.querySelector('[data-section="' + sec + '"]');
    if (item) item.click();
  };

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const buttonClicado = getClickedButton(e) || e.currentTarget;
      const sec = buttonClicado.dataset.section;
      navItems.forEach(n => n.classList.remove("active")); 
      buttonClicado.classList.add("active");
      sections.forEach(s => s.classList.add("hidden"));
      document.getElementById("sec-" + sec).classList.remove("hidden");
      const [t, s] = titulos[sec] || ["",""];
      pageTitle.textContent = t; pageSub.textContent = s;
      if (sec === "mesa")         renderMesa();
      if (sec === "associados")   renderAssociados();
      if (sec === "broadcast")    renderBroadcast();
      if (sec === "alertas")      renderAlertas();
      if (sec === "relatorios")   renderRelatorios();
      if (sec === "monitor")      renderMonitor();
      if (sec === "noticias")     renderNoticias();
      if (sec === "eventos")      renderEventos();
      if (sec === "solicitacoes") renderSolicitacoes();
      if (sec === "contratos")    renderContratos();
      if (sec === "recuperacao")  renderRecuperacao();
      atualizarBadges();
      document.getElementById("sidebar").classList.remove("sidebar-open");
    });
  });

  document.getElementById("hamburgerBtn").addEventListener("click", () => { document.getElementById("sidebar").classList.toggle("sidebar-open"); });
  document.getElementById("sidebarClose").addEventListener("click", () => { document.getElementById("sidebar").classList.remove("sidebar-open"); });
  document.getElementById("btnLogout").addEventListener("click", () => { registrarLog("Logout","Administrador AMAS","admin","Sessão encerrada"); clearSessao(); window.location.href="login.html"; });

  // ══════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════
  let chartStatus = null, chartContrib = null;

  function renderDashboard() {
    const est = getEstatisticas();
    document.getElementById("dTotal").textContent   = est.total;
    document.getElementById("dRegular").textContent = est.regulares;
    document.getElementById("dInadim").textContent  = est.inadim;
    document.getElementById("dAnalise").textContent = est.emAnalise;
    document.getElementById("dArrecad").textContent = formatMoney(est.totalArrecadado);
    document.getElementById("dAlertas").textContent = est.alertasPendentes;

    const assocs  = getAssociados();
    const ctx1    = document.getElementById("graficoStatus").getContext("2d");
    if (chartStatus) chartStatus.destroy();
    chartStatus = new Chart(ctx1, { type:"doughnut", data: {
      labels:["Regular","Inadimplente","Em análise","Pendente"],
      datasets:[{ data:[est.regulares,est.inadim,est.emAnalise,est.pendentes], backgroundColor:["#22c55e","#ef4444","#f59e0b","#6C6E84"], borderWidth:0 }]
    }, options:{ plugins:{ legend:{ position:"bottom", labels:{ color:"#4a4060", font:{ family:"DM Sans" } } } } } });

    // Arrecadação últimos meses
    const mesesMap = {};
    assocs.forEach(a => (a.historico||[]).forEach(c => {
      if (c.status === "Aprovado") {
        const k = c.mes || c.data;
        mesesMap[k] = (mesesMap[k]||0) + parseFloat(c.valor||0);
      }
    }));
    const mesesKeys = Object.keys(mesesMap).slice(-6);
    const ctx2 = document.getElementById("graficoContrib").getContext("2d");
    if (chartContrib) chartContrib.destroy();
    chartContrib = new Chart(ctx2, { type:"bar", data: {
      labels: mesesKeys.length ? mesesKeys : ["—"],
      datasets:[{ label:"Arrecadação", data: mesesKeys.length ? mesesKeys.map(k => mesesMap[k]) : [0], backgroundColor:"rgba(77,83,160,0.7)", borderRadius:6 }]
    }, options:{ plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ callback:v => "R$ "+v } } } } });
  }

  // ══════════════════════════════════════════════
  // MESA DE OPERAÇÕES
  // ══════════════════════════════════════════════
  let pendRecusarAssocId = null, pendRecusarContribId = null;

  function renderMesa() {
    const assocs = getAssociados();
    const pendentes = [];
    assocs.forEach(a => {
      (a.historico||[]).forEach(c => {
        if (c.status === "Em análise") pendentes.push({ assoc: a, contrib: c });
      });
    });
    document.getElementById("mesaCount").textContent = pendentes.length + " pendentes";
    document.getElementById("mesaCount").className = "badge " + (pendentes.length > 0 ? "badge-analise" : "badge-regular");
    if (pendentes.length === 0) {
      document.getElementById("listaMesa").innerHTML = '<div class="empty-state"><div class="es-icon"></div>Nenhum comprovante aguardando análise.</div>';
      return;
    }
    document.getElementById("listaMesa").innerHTML = pendentes.map(({ assoc, contrib }) =>
      '<div class="mesa-item">' +
        '<div class="mesa-assoc">' +
          '<div class="ma-nome">' + assoc.nome + ' <span class="badge badge-analise" style="font-size:0.72rem;">Em análise</span></div>' +
          '<div class="ma-det">' + assoc.matricula + ' · ' + contrib.mes + ' · ' + formatMoney(contrib.valor) + ' · ' + contrib.data + '</div>' +
          (contrib.observacoes ? '<div class="ma-obs"><i class=\"bi bi-pencil-square\"></i> ' + contrib.observacoes + '</div>' : '') +
          '<div class="ma-arquivo"><i class=\"bi bi-paperclip\"></i> ' + (contrib.arquivo||"—") + '</div>' +
        '</div>' +
        '<div class="mesa-acoes">' +
          '<button class="btn btn-success btn-sm" onclick="aprovarContrib(' + assoc.id + ',' + contrib.id + ')"><i class="bi bi-check-circle-fill"></i> Aprovar</button>' +
          '<button class="btn btn-danger btn-sm"  onclick="iniciarRecusa(' + assoc.id + ',' + contrib.id + ')"><i class="bi bi-x-circle-fill"></i> Recusar</button>' +
        '</div>' +
      '</div>'
    ).join("");
    atualizarBadges();
  }

  window.aprovarContrib = function(aId, cId) {
    atualizarStatusContribuicao(aId, cId, "Aprovado", "");
    renderMesa(); atualizarBadges();
    showToast("Comprovante aprovado!", "success");
  };

  window.iniciarRecusa = function(aId, cId) {
    pendRecusarAssocId = aId; pendRecusarContribId = cId;
    document.getElementById("motivoRecusa").value = "";
    document.getElementById("modalRecusar").classList.remove("hidden");
  };

  document.getElementById("btnConfirmarRecusa").addEventListener("click", () => {
    const motivo = document.getElementById("motivoRecusa").value.trim();
    if (!motivo) { showToast("Informe o motivo da recusa.", "error"); return; }
    atualizarStatusContribuicao(pendRecusarAssocId, pendRecusarContribId, "Recusado", motivo);
    document.getElementById("modalRecusar").classList.add("hidden");
    renderMesa(); atualizarBadges();
    showToast("Comprovante recusado com justificativa.", "info");
    pendRecusarAssocId = null; pendRecusarContribId = null;
  });

  // ══════════════════════════════════════════════
  // ASSOCIADOS
  // ══════════════════════════════════════════════
  function renderAssociados() {
    const busca   = document.getElementById("buscarAssoc").value.toLowerCase();
    const filtSt  = document.getElementById("filtroStatus").value;
    let lista = getAssociados().filter(a => {
      const ok1 = !busca || a.nome.toLowerCase().includes(busca) || a.cpf.includes(busca) || (a.matricula||"").toLowerCase().includes(busca);
      const ok2 = !filtSt || a.status === filtSt;
      return ok1 && ok2;
    });
    const tbody = document.getElementById("tbodyAssoc");
    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="es-icon"></div>Nenhum associado encontrado.</div></td></tr>'; return;
    }
    tbody.innerHTML = lista.map(a =>
      '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px;">' +
          (a.foto ? '<img src="'+a.foto+'" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">' : '<span style="font-size:1.4rem;"><i class="bi bi-person"></i></span>') +
          '<div><strong>' + a.nome + '</strong><br><small style="color:var(--text-muted);">' + a.email + '</small></div>' +
        '</div></td>' +
        '<td style="font-family:monospace;">' + a.cpf + '</td>' +
        '<td>' + (a.matricula||"—") + '</td>' +
        '<td>' + statusBadge(a.status) + '</td>' +
        '<td>' + dataBR(a.dataEntrada) + '</td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-outline btn-sm" onclick="verAssoc('+a.id+')"><i class="bi bi-eye"></i></button>' +
            '<button class="btn btn-outline btn-sm" onclick="editarAssoc('+a.id+')"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn-danger btn-sm" onclick="excluirAssoc('+a.id+')"><i class="bi bi-trash"></i></button>' +
          '</div>' +
        '</td>' +
      '</tr>'
    ).join("");
  }

  document.getElementById("buscarAssoc").addEventListener("input", renderAssociados);
  document.getElementById("filtroStatus").addEventListener("change", renderAssociados);

  document.getElementById("btnNovoAssoc").addEventListener("click", () => {
    document.getElementById("modalAssocTitulo").textContent = "Novo Associado";
    document.getElementById("formAssoc").reset();
    document.getElementById("assocIdEdit").value = "";
    document.getElementById("assocSenha").value  = "123456";
    document.getElementById("modalAssoc").classList.remove("hidden");
  });

  document.getElementById("assocCpf").addEventListener("input", function() { maskCPF(this); });
  document.getElementById("assocTel").addEventListener("input", function() { maskTel(this); });

  document.getElementById("formAssoc").addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdit = document.getElementById("assocIdEdit").value;
    const nome   = document.getElementById("assocNome").value.trim();
    const cpf    = document.getElementById("assocCpf").value.trim();
    const nasc   = document.getElementById("assocNasc").value;
    const tel    = document.getElementById("assocTel").value.trim();
    const email  = document.getElementById("assocEmail").value.trim();
    const prof   = document.getElementById("assocProf").value.trim();
    const end    = document.getElementById("assocEnd").value.trim();
    const status = document.getElementById("assocStatus").value;
    const senha  = document.getElementById("assocSenha").value.trim() || "123456";
    const err    = document.getElementById("assocErro");
    err.textContent = "";
    if (!nome)  { err.textContent = "Nome é obrigatório."; return; }
    if (!cpf)   { err.textContent = "CPF é obrigatório."; return; }
    if (!email) { err.textContent = "E-mail é obrigatório."; return; }
    if (cpfJaExiste(cpf, idEdit ? parseInt(idEdit) : null)) { err.textContent = "Este CPF já está cadastrado."; return; }
    if (idEdit) {
      atualizarAssociado(parseInt(idEdit), { nome, cpf, nascimento:nasc, telefone:tel, email, profissao:prof, endereco:end, status, senha });
      showToast("Associado atualizado!", "success");
    } else {
      adicionarAssociado({ nome, cpf, nascimento:nasc, telefone:tel, email, profissao:prof, endereco:end, status, senha, primeiroLogin:true });
      showToast("Associado cadastrado!", "success");
    }
    document.getElementById("modalAssoc").classList.add("hidden");
    renderAssociados();
  });

  window.editarAssoc = function(id) {
    const a = getAssociados().find(x => x.id === id);
    if (!a) return;
    document.getElementById("modalAssocTitulo").textContent = "Editar Associado";
    document.getElementById("assocNome").value   = a.nome || "";
    document.getElementById("assocCpf").value    = a.cpf || "";
    document.getElementById("assocNasc").value   = a.nascimento || "";
    document.getElementById("assocTel").value    = a.telefone || "";
    document.getElementById("assocEmail").value  = a.email || "";
    document.getElementById("assocProf").value   = a.profissao || "";
    document.getElementById("assocEnd").value    = a.endereco || "";
    document.getElementById("assocStatus").value = a.status || "Pendente";
    document.getElementById("assocSenha").value  = a.senha || "";
    document.getElementById("assocIdEdit").value = id;
    document.getElementById("modalAssoc").classList.remove("hidden");
  };

  window.excluirAssoc = function(id) {
    const a = getAssociados().find(x => x.id === id);
    if (!a) return;
    if (!confirm('Deseja realmente excluir o associado "' + a.nome + '"?\nEsta ação não pode ser desfeita.')) return;
    removerAssociado(id);
    renderAssociados();
    showToast("Associado excluído.", "info");
  };

  window.verAssoc = function(id) {
    const a = getAssociados().find(x => x.id === id);
    if (!a) return;
    const hist = (a.historico||[]).slice().reverse();
    const map = { "Aprovado":"badge-aprovado","Recusado":"badge-recusado","Em análise":"badge-analise","Revisão solicitada":"badge-revisao" };
    document.getElementById("verAssocContent").innerHTML =
      '<div class="dados-list">' +
      [["Nome",a.nome],["CPF",a.cpf],["Nascimento",dataBR(a.nascimento)],["Telefone",a.telefone||"—"],["E-mail",a.email],["Profissão",a.profissao||"—"],["Endereço",a.endereco||"—"],["Matrícula",a.matricula],["Status",statusBadge(a.status)],["Entrada",dataBR(a.dataEntrada)]].map(
        ([l,v]) => '<div class="dado-row"><span class="dado-label">'+l+'</span><span class="dado-valor">'+v+'</span></div>'
      ).join("") +
      '</div>' +
      (hist.length > 0 ? '<h4 style="margin:20px 0 12px;font-size:0.9rem;">Histórico de contribuições</h4><div class="table-wrapper"><table><thead><tr><th>Mês</th><th>Valor</th><th>Status</th><th>Observações</th></tr></thead><tbody>' +
      hist.map(c => '<tr><td>'+c.mes+'</td><td>'+formatMoney(c.valor)+'</td><td>'+statusBadge(c.status)+'</td><td>'+((c.observacoes||c.msgAdmin||"—"))+'</td></tr>').join("") +
      '</tbody></table></div>' : '<p style="color:var(--text-muted);margin-top:16px;">Nenhuma contribuição registrada.</p>');
    document.getElementById("modalVerAssoc").classList.remove("hidden");
  };

  // ══════════════════════════════════════════════
  // BROADCAST
  // ══════════════════════════════════════════════
  function renderBroadcast() {
    const msgs = getMensagens();
    const el   = document.getElementById("listaBroadcast");
    if (msgs.length === 0) { el.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;">Nenhuma mensagem enviada ainda.</p>'; return; }
    el.innerHTML = msgs.map(m => {
      const lidas = (m.lidas||[]).length;
      const dataFmt = new Date(m.data).toLocaleString("pt-BR");
      return '<div class="broadcast-item">' +
        '<div class="bc-titulo">' + m.titulo + '</div>' +
        '<div class="bc-meta">Para: <strong>' + m.destinatarios + '</strong> · ' + dataFmt + '</div>' +
        '<div class="bc-meta"><i class="bi bi-check-circle-fill"></i> ' + lidas + ' lida(s)</div>' +
      '</div>';
    }).join("");
  }

  document.getElementById("formBroadcast").addEventListener("submit", (e) => {
    e.preventDefault();
    const dest  = document.getElementById("bcDest").value;
    const titulo = document.getElementById("bcTitulo").value.trim();
    const corpo  = document.getElementById("bcCorpo").value.trim();
    if (!titulo || !corpo) { showToast("Preencha título e conteúdo.", "error"); return; }
    enviarMensagem(titulo, corpo, dest);
    document.getElementById("formBroadcast").reset();
    renderBroadcast();
    showToast("Mensagem enviada com sucesso!", "success");
  });

  // ══════════════════════════════════════════════
  // ALERTAS EMPRESÁRIOS
  // ══════════════════════════════════════════════
  function renderAlertas() {
    const alertas = getAlertasEmp();
    const el = document.getElementById("listaAlertas");
    if (alertas.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="es-icon"></div>Nenhum alerta recebido.</div>'; return;
    }
    el.innerHTML = alertas.map(a =>
      '<div class="alerta-item ' + (a.lido ? "alerta-lido" : "") + '">' +
        '<div class="alerta-header">' +
          (a.urgente ? '<span class="badge badge-inadim"><i class="bi bi-circle-fill" style="color:#dc2626;font-size:0.7rem;"></i> URGENTE</span>' : '<span class="badge badge-analise"><i class="bi bi-circle-fill" style="color:#f59e0b;font-size:0.7rem;"></i> Normal</span>') +
          '<span class="alerta-emp">De: ' + a.empresarioNome + '</span>' +
          '<span class="alerta-data">' + new Date(a.data).toLocaleString("pt-BR") + '</span>' +
        '</div>' +
        '<div class="alerta-titulo">' + a.titulo + '</div>' +
        '<div class="alerta-msg">' + a.mensagem + '</div>' +
        (!a.lido ? '<button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="marcarAlertaLidoUI(' + a.id + ')">Marcar como resolvido</button>' : '<span style="font-size:0.78rem;color:var(--text-muted);"><i class="bi bi-check-circle-fill"></i> Resolvido</span>') +
      '</div>'
    ).join("");
    atualizarBadges();
  }

  window.marcarAlertaLidoUI = function(id) {
    marcarAlertaLido(id);
    renderAlertas();
    atualizarBadges();
    showToast("Alerta marcado como resolvido.", "success");
  };

  // ══════════════════════════════════════════════
  // RELATÓRIOS
  // ══════════════════════════════════════════════
  function renderRelatorios() {
    const assocs  = getAssociados();
    const inadims = assocs.filter(a => a.status === "Inadimplente");
    const data    = new Date().toLocaleString("pt-BR");
    const est     = getEstatisticas();

    // Relatório inadimplentes
    const rInadim = document.getElementById("relatorioInadim");
    if (inadims.length === 0) {
      rInadim.innerHTML = '<p style="color:var(--status-regular);font-weight:600;">Nenhum associado inadimplente!</p>';
    } else {
      rInadim.innerHTML = '<div class="relat-header">Gerado em: ' + data + '</div>' +
        '<div class="relat-table"><table><thead><tr><th>Matrícula</th><th>Nome</th><th>CPF</th><th>Telefone</th><th>Última contribuição</th></tr></thead><tbody>' +
        inadims.map(a => {
          const ultima = (a.historico||[]).slice(-1)[0];
          return '<tr><td>' + (a.matricula||"—") + '</td><td>' + a.nome + '</td><td>' + a.cpf + '</td><td>' + (a.telefone||"—") + '</td><td>' + (ultima ? ultima.mes + " (" + statusBadge(ultima.status) + ")" : "Nenhuma") + '</td></tr>';
        }).join("") +
        '</tbody></table></div>';
    }

    // Relatório geral
    document.getElementById("relatorioGeral").innerHTML =
      '<div class="relat-header">Situação em: ' + data + '</div>' +
      '<div class="relat-stat-list">' +
      [
        ["Total de Associados", est.total, ""],
        ["Regulares", est.regulares, "color:var(--status-regular)"],
        ["Inadimplentes", est.inadim, "color:var(--status-inadim)"],
        ["Em análise", est.emAnalise, "color:var(--status-analise)"],
        ["Pendentes", est.pendentes, "color:var(--status-pendente)"],
        ["Total Arrecadado (aprovado)", formatMoney(est.totalArrecadado), "color:var(--azul-mid);font-weight:700;"],
        ["Alertas não resolvidos", est.alertasPendentes, est.alertasPendentes > 0 ? "color:var(--status-inadim)" : ""]
      ].map(([l,v,s]) => '<div class="relat-stat-row"><span class="relat-stat-label">' + l + '</span><span class="relat-stat-val" style="' + s + '">' + v + '</span></div>').join("") +
      '</div>';
  }

  document.getElementById("btnImprimirInadim").addEventListener("click", () => { window.print(); });
  document.getElementById("btnCopiarInadim").addEventListener("click", () => {
    const inadims = getAssociados().filter(a => a.status === "Inadimplente");
    const text = "RELATÓRIO DE INADIMPLENTES – AMAS\n" + new Date().toLocaleString("pt-BR") + "\n\n" +
      inadims.map((a,i) => (i+1) + ". " + a.nome + " | " + a.cpf + " | " + (a.telefone||"—") + " | " + a.matricula).join("\n");
    navigator.clipboard?.writeText(text).then(() => showToast("Copiado para a área de transferência!", "success"));
  });

  // ══════════════════════════════════════════════
  // MONITOR
  // ══════════════════════════════════════════════
  function renderMonitor() {
    const log = getLog();
    const el  = document.getElementById("listaLog");
    if (log.length === 0) { el.innerHTML = '<div class="empty-state"><div class="es-icon"></div>Nenhuma atividade registrada.</div>'; return; }
    const iconMap = { admin:'<i class="bi bi-shield"></i>', associado:'<i class="bi bi-person"></i>', empresario:'<i class="bi bi-building"></i>', sistema:'<i class="bi bi-cpu"></i>' };
    el.innerHTML = log.map(l => {
      const ago = timeDiff(l.data);
      return '<div class="log-item">' +
        '<div class="log-icon">' + (iconMap[l.perfil]||'<i class=\"bi bi-question\"></i>') + '</div>' +
        '<div class="log-content">' +
          '<div class="log-acao"><strong>' + l.acao + '</strong></div>' +
          '<div class="log-meta">' + l.usuario + ' · ' + ago + '</div>' +
          (l.detalhes ? '<div class="log-det">' + l.detalhes + '</div>' : '') +
        '</div>' +
        '<div class="log-badge">' + (l.perfil === "admin" ? '<span class="badge badge-regular">Admin</span>' : l.perfil === "associado" ? '<span class="badge badge-analise">Associado</span>' : '<span class="badge" style="background:rgba(99,102,241,0.1);color:#6366f1;border:1px solid rgba(99,102,241,0.2);">Empresário</span>') + '</div>' +
      '</div>';
    }).join("");
  }

  function timeDiff(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "agora há pouco";
    if (diff < 3600) return Math.floor(diff/60) + " min atrás";
    if (diff < 86400) return Math.floor(diff/3600) + "h atrás";
    return new Date(iso).toLocaleString("pt-BR");
  }

  document.getElementById("btnRefreshLog").addEventListener("click", () => { renderMonitor(); showToast("Log atualizado.", "info"); });

  // ══════════════════════════════════════════════
  // NOTÍCIAS
  // ══════════════════════════════════════════════
  function renderNoticias() {
    const list = getNoticias();
    const el = document.getElementById("listaNoticias");
    if (list.length === 0) { el.innerHTML = '<div class="card"><div class="empty-state"><div class="es-icon"></div>Nenhuma notícia cadastrada.</div></div>'; return; }
    el.innerHTML = list.map(n =>
      '<div class="card" style="margin-bottom:12px;">' +
        '<div class="card-title-row">' +
          '<div><h4 style="font-size:0.95rem;">' + (n.destaque ? "⭐ " : "") + n.titulo + '</h4>' +
            '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">' + n.categoria + ' · ' + dataBR(n.publicadaEm) + ' · ' + n.autor + '</div></div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-outline btn-sm" onclick="editarNoticia('+n.id+')"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn-danger btn-sm" onclick="excluirNoticia('+n.id+')"><i class="bi bi-trash"></i></button>' +
          '</div>' +
        '</div>' +
        '<p style="font-size:0.85rem;color:var(--text-secondary);margin-top:10px;">' + n.resumo + '</p>' +
      '</div>'
    ).join("");
  }

  document.getElementById("btnNovaNoticia").addEventListener("click", () => {
    document.getElementById("modalNoticiaTitulo").textContent = "Nova Notícia";
    document.getElementById("formNoticia").reset();
    document.getElementById("noIdEdit").value = "";
    document.getElementById("modalNoticia").classList.remove("hidden");
  });

  document.getElementById("formNoticia").addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdit = document.getElementById("noIdEdit").value;
    const dados  = { titulo: document.getElementById("noTitulo").value.trim(), resumo: document.getElementById("noResumo").value.trim(), conteudo: document.getElementById("noConteudo").value.trim(), categoria: document.getElementById("noCategoria").value, destaque: document.getElementById("noDestaque").checked };
    if (!dados.titulo || !dados.resumo || !dados.conteudo) { showToast("Preencha todos os campos obrigatórios.", "error"); return; }
    if (idEdit) atualizarNoticia(parseInt(idEdit), dados); else adicionarNoticia(dados);
    document.getElementById("modalNoticia").classList.add("hidden");
    renderNoticias(); showToast("Notícia salva!", "success");
  });

  window.editarNoticia = function(id) {
    const n = getNoticias().find(x => x.id === id);
    if (!n) return;
    document.getElementById("modalNoticiaTitulo").textContent = "Editar Notícia";
    document.getElementById("noTitulo").value    = n.titulo;
    document.getElementById("noResumo").value    = n.resumo;
    document.getElementById("noConteudo").value  = n.conteudo;
    document.getElementById("noCategoria").value = n.categoria;
    document.getElementById("noDestaque").checked= n.destaque;
    document.getElementById("noIdEdit").value    = id;
    document.getElementById("modalNoticia").classList.remove("hidden");
  };

  window.excluirNoticia = function(id) {
    if (!confirm("Deseja realmente excluir esta notícia?")) return;
    removerNoticia(id); renderNoticias(); showToast("Notícia excluída.", "info");
  };

  // ══════════════════════════════════════════════
  // EVENTOS
  // ══════════════════════════════════════════════
  const TIPO_ICON = { social:'<i class="bi bi-heart"></i>', capacitacao:'<i class="bi bi-book"></i>', parceria:"<i class=\"bi bi-handshake\"></i>", cultural:'<i class="bi bi-stars"></i>', reuniao:'<i class="bi bi-chat-square-text"></i>' };

  // ── Status helpers
  const EV_STATUS_MAP = {
    "Aberto":    { badge:"ev-status-aberto",   icon:"<i class=\"bi bi-circle-fill\" style=\"color:#16a34a;font-size:0.6rem;\"></i>", label:"Aberto" },
    "Em Breve":  { badge:"ev-status-embreve",  icon:'<i class=\"bi bi-hourglass\"></i>', label:"Em Breve" },
    "Encerrado": { badge:"ev-status-encerrado",icon:'<i class=\"bi bi-circle-fill\" style=\"color:#dc2626;font-size:0.6rem;\"></i>', label:"Encerrado" }
  };

  function renderEventos() {
    const list = getEventos();
    const el   = document.getElementById("listaEventos");
    if (list.length === 0) {
      el.innerHTML = '<div class="card"><div class="empty-state"><div class="es-icon"></div>Nenhum evento cadastrado.</div></div>';
      return;
    }
    el.innerHTML = list.map(ev => {
      const vagas      = ev.vagasTotais || ev.vagas || 0;
      const inscritos  = (ev.inscritos  || []).length;
      const espera     = (ev.listaEspera|| []).length;
      const pct        = vagas > 0 ? Math.min(100, Math.round((inscritos/vagas)*100)) : 0;
      const lotado     = vagas > 0 && inscritos >= vagas;
      const barColor   = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
      const st         = EV_STATUS_MAP[ev.status] || EV_STATUS_MAP["Aberto"];

      return '<div class="card ev-admin-card" style="margin-bottom:14px;">' +
        // Header
        '<div class="card-title-row">' +
          '<div>' +
            '<h4 style="font-size:0.95rem;margin-bottom:3px;">' + (TIPO_ICON[ev.tipo]||'<i class=\"bi bi-calendar\"></i>') + " " + ev.titulo + '</h4>' +
            '<div style="font-size:0.78rem;color:var(--text-muted);">' + dataBR(ev.data) + ' às ' + ev.horario + ' · ' + ev.local + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            // Status toggle select
            '<select class="ev-status-select ev-status-select--' + (ev.status||"Aberto").replace(" ","") + '" onchange="mudarStatusEvento(' + ev.id + ',this.value)">' +
              '<option value="Aberto"'    + (ev.status==="Aberto"    ? " selected":"") + '>Aberto</option>' +
              '<option value="Em Breve"'  + (ev.status==="Em Breve"  ? " selected":"") + '>Em Breve</option>' +
              '<option value="Encerrado"' + (ev.status==="Encerrado" ? " selected":"") + '>Encerrado</option>' +
            '</select>' +
            '<button class="btn btn-outline btn-sm" onclick="verParticipantes(' + ev.id + ')"><i class="bi bi-people"></i> ' + inscritos + (espera ? '+' + espera + '⏳' : '') + '</button>' +
            '<button class="btn btn-outline btn-sm" onclick="editarEvento(' + ev.id + ')"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn-danger btn-sm"  onclick="excluirEvento(' + ev.id + ')"><i class="bi bi-trash"></i></button>' +
          '</div>' +
        '</div>' +
        // Barra de ocupação
        '<div class="ev-ocupacao-row">' +
          '<div class="ev-progress"><div class="ev-progress-bar" style="width:' + pct + '%;background:' + barColor + ';"></div></div>' +
          '<div class="ev-ocupacao-nums">' +
            '<span>' + inscritos + (vagas ? '/' + vagas : '') + ' confirmados</span>' +
            (espera ? '<span class="ev-fila-badge">' + espera + ' na fila de espera</span>' : '') +
            (lotado && ev.status === "Aberto" ? '<span class="ev-lotado-badge">LOTADO</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  window.mudarStatusEvento = function(id, novoStatus) {
    alterarStatusEvento(id, novoStatus);
    renderEventos();
    showToast("Status atualizado: " + novoStatus, "success");
  };

  window.verParticipantes = function(id) {
    const ev = getEventos().find(x => x.id === id);
    if (!ev) return;
    const vagas     = ev.vagasTotais || ev.vagas || 0;
    const inscritos = ev.inscritos   || [];
    const espera    = ev.listaEspera || [];
    const pct       = vagas > 0 ? Math.min(100, Math.round((inscritos.length/vagas)*100)) : 0;
    const barColor  = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

    document.getElementById("mpTitulo").textContent    = ev.titulo;
    document.getElementById("mpSubtitulo").textContent = dataBR(ev.data) + " às " + ev.horario + " · " + ev.local;

    const listRow = (p, i, tipo) => {
      const data = tipo === "confirmado" ? (p.dataInscricao||p.dataPromocao||"") : p.dataInscricao || "";
      const dataFmt = data ? new Date(data).toLocaleDateString("pt-BR") : "—";
      const badge = tipo === "confirmado"
        ? '<span class="badge badge-regular" style="font-size:0.7rem;"><i class="bi bi-check-circle-fill"></i> Confirmado</span>'
        : tipo === "espera"
        ? '<span class="badge badge-analise" style="font-size:0.7rem;">⏳ Fila #' + (i+1) + '</span>'
        : "";
      return '<div class="mp-row">' +
        '<span class="mp-pos">' + (tipo === "confirmado" ? (i+1) : "·") + '</span>' +
        '<div class="mp-info">' +
          '<div class="mp-nome">' + (p.nome||"—") + '</div>' +
          '<div class="mp-det">' + (p.matricula||p.email||"") + ' · ' + dataFmt + '</div>' +
        '</div>' +
        badge +
        (tipo === "confirmado" ? '<button class="btn btn-outline btn-sm" style="margin-left:auto;" onclick="adminRemoverInscrito(' + ev.id + ',' + p.id + ')">✕</button>' : '') +
      '</div>';
    };

    document.getElementById("mpConteudo").innerHTML =
      // Barra de ocupação
      '<div class="mp-ocupacao">' +
        '<div class="mp-ocupacao-top">' +
          '<span>' + inscritos.length + (vagas ? " / " + vagas + " vagas" : " inscritos") + '</span>' +
          '<span>' + pct + '% preenchido</span>' +
        '</div>' +
        '<div class="ev-progress" style="height:10px;"><div class="ev-progress-bar" style="width:' + pct + '%;background:' + barColor + ';height:10px;"></div></div>' +
      '</div>' +
      // Confirmados
      '<h4 class="mp-section-title"><i class="bi bi-check-circle-fill"></i> Participantes Confirmados (' + inscritos.length + ')</h4>' +
      (inscritos.length
        ? inscritos.map((p,i) => listRow(p,i,"confirmado")).join("")
        : '<div class="mp-empty">Nenhum inscrito ainda.</div>') +
      // Fila de espera
      (espera.length
        ? '<h4 class="mp-section-title" style="margin-top:20px;">⏳ Fila de Espera (' + espera.length + ')</h4>' + espera.map((p,i) => listRow(p,i,"espera")).join("")
        : "");

    document.getElementById("modalParticipantes").classList.remove("hidden");
  };

  window.adminRemoverInscrito = function(eventoId, associadoId) {
    if (!confirm("Remover este participante do evento?")) return;
    const res = cancelarInscricao(eventoId, associadoId);
    if (res.ok && res.promovido) {
      showToast("Participante removido. " + res.promovido.nome + " foi promovido da fila!", "success");
    } else {
      showToast("Participante removido.", "info");
    }
    renderEventos();
    verParticipantes(eventoId); // refresh modal
  };

  document.getElementById("btnNovoEvento").addEventListener("click", () => {
    document.getElementById("modalEventoTitulo").textContent = "Novo Evento";
    document.getElementById("formEvento").reset();
    document.getElementById("evIdEdit").value = "";
    document.getElementById("evStatus").value = "Aberto";
    document.getElementById("modalEvento").classList.remove("hidden");
  });

  document.getElementById("formEvento").addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdit = document.getElementById("evIdEdit").value;
    const vagas  = parseInt(document.getElementById("evVagas").value||0);
    const dados  = {
      titulo:      document.getElementById("evTitulo").value.trim(),
      data:        document.getElementById("evData").value,
      horario:     document.getElementById("evHorario").value,
      local:       document.getElementById("evLocal").value.trim(),
      vagas,
      vagasTotais: vagas,
      status:      document.getElementById("evStatus").value,
      tipo:        document.getElementById("evTipo").value,
      destaque:    document.getElementById("evDestaque").checked,
      descricao:   document.getElementById("evDesc").value.trim()
    };
    if (!dados.titulo || !dados.data || !dados.local) { showToast("Preencha os campos obrigatórios.", "error"); return; }
    if (idEdit) {
      // Preserva inscritos/listaEspera ao editar — não apaga participantes já inscritos
      const evAtual = getEventos().find(e => e.id === parseInt(idEdit));
      dados.inscritos    = evAtual?.inscritos   || [];
      dados.listaEspera  = evAtual?.listaEspera || [];
      dados.vagasTotais  = vagas;
      dados.inscricoes   = dados.inscritos.length;
      atualizarEvento(parseInt(idEdit), dados);
    } else {
      // adicionarEvento já define inscritos:[], listaEspera:[], vagasTotais, status
      adicionarEvento(dados);
    }
    document.getElementById("modalEvento").classList.add("hidden");
    renderEventos();
    showToast("Evento salvo!", "success");
  });

  window.editarEvento = function(id) {
    const ev = getEventos().find(x => x.id === id);
    if (!ev) return;
    document.getElementById("modalEventoTitulo").textContent = "Editar Evento";
    document.getElementById("evTitulo").value    = ev.titulo;
    document.getElementById("evData").value      = ev.data;
    document.getElementById("evHorario").value   = ev.horario;
    document.getElementById("evLocal").value     = ev.local;
    document.getElementById("evVagas").value     = ev.vagasTotais || ev.vagas || "";
    document.getElementById("evStatus").value    = ev.status || "Aberto";
    document.getElementById("evTipo").value      = ev.tipo;
    document.getElementById("evDestaque").checked= ev.destaque;
    document.getElementById("evDesc").value      = ev.descricao;
    document.getElementById("evIdEdit").value    = id;
    document.getElementById("modalEvento").classList.remove("hidden");
  };

  window.excluirEvento = function(id) {
    if (!confirm("Deseja realmente excluir este evento?")) return;
    removerEvento(id); renderEventos(); showToast("Evento excluído.", "info");
  };

  // ══════════════════════════════════════════════
  // SOLICITAÇÕES
  // ══════════════════════════════════════════════
  let solicitFiltroAtivo = "todos";

  function renderSolicitacoes() {
    const todas = getSolicitacoes().filter(s => s.status === "Pendente");
    const el    = document.getElementById("listaSolicitacoes");

    document.querySelectorAll(".sft-btn").forEach(btn => {
      btn.onclick = () => {
        solicitFiltroAtivo = btn.dataset.filtro;
        document.querySelectorAll(".sft-btn").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        renderSolicitacoes();
      };
    });

    const comTipo = todas.map(s => ({ ...s, _tipo: s.cnpj ? "empresa" : "associado" }));
    const list = solicitFiltroAtivo === "todos" ? comTipo
      : comTipo.filter(s => s._tipo === solicitFiltroAtivo);

    const totalAssoc = comTipo.filter(s => s._tipo === "associado").length;
    const totalEmp   = comTipo.filter(s => s._tipo === "empresa").length;
    const btnAssoc = document.querySelector('.sft-btn[data-filtro="associado"]');
    const btnEmp   = document.querySelector('.sft-btn[data-filtro="empresa"]');
    if (btnAssoc) btnAssoc.innerHTML = '<i class="bi bi-person"></i> Associados' + (totalAssoc ? " (" + totalAssoc + ")" : "");
    if (btnEmp)   btnEmp.innerHTML   = '<i class="bi bi-building"></i> Empresas' + (totalEmp   ? " (" + totalEmp   + ")" : "");

    if (list.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="es-icon"></div>Nenhuma solicitação pendente.</div>'; return;
    }

    el.innerHTML = list.map(s => {
      const isEmp = s._tipo === "empresa";
      const origemBadge = isEmp
        ? '<span class="origem-badge origem-empresa"><i class="bi bi-building"></i> Empresa Parceira</span>'
        : '<span class="origem-badge origem-associado"><i class="bi bi-person"></i> Pessoa Física</span>';
      const docInfo = isEmp
        ? (s.cnpj ? "CNPJ: " + s.cnpj + " · " : "") + s.email
        : (s.cpf  ? "CPF: "  + s.cpf  + " · " : "") + s.email + (s.telefone ? " · " + s.telefone : "");
      return '<div class="solicit-item">' +
        '<div class="solicit-info">' +
          '<div class="solicit-nome-row"><div class="solicit-nome">' + s.nome + '</div>' + origemBadge + '</div>' +
          '<div class="solicit-det">' + docInfo + '</div>' +
          (s.observacoes ? '<div class="solicit-obs"><i class="bi bi-pencil-square"></i> ' + s.observacoes + '</div>' : '') +
          '<div class="solicit-det" style="margin-top:4px;">Solicitado em: ' + dataBR(s.dataSolicitacao) + '</div>' +
        '</div>' +
        '<div class="solicit-acoes">' +
          '<button class="btn btn-success btn-sm" onclick="aprovarSolicit(' + s.id + ')"><i class="bi bi-check-circle-fill"></i> Aprovar</button>' +
          '<button class="btn btn-danger btn-sm"  onclick="recusarSolicit(' + s.id + ')"><i class="bi bi-x-circle-fill"></i> Recusar</button>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  window.aprovarSolicit = function(id) {
    if (!confirm("Aprovar esta solicitação e cadastrar o membro?")) return;
    const novo = aprovarSolicitacao(id);
    renderSolicitacoes();
    showToast("Membro cadastrado! Senha inicial: 123456", "success");
    registrarLog("Solicitação aprovada", sessao.nome, "admin", novo ? novo.nome + " aprovado." : "");
  };

  window.recusarSolicit = function(id) {
    const motivo = prompt("Motivo da recusa:");
    if (!motivo) return;
    recusarSolicitacao(id, motivo);
    renderSolicitacoes();
    showToast("Solicitação recusada.", "info");
  };

  // ── Init
  renderDashboard();
  atualizarBadges();
  setInterval(atualizarBadges, 10000);
  registrarLog("Login realizado", sessao.nome, "admin", "Acesso ao painel administrativo");

  // ── Botão Resetar Sistema
  document.getElementById("btnResetSistema")?.addEventListener("click", () => {
    if (!confirm("ATENÇÃO\n\nIsso vai apagar TODOS os dados do sistema (associados, inscrições, contribuições, mensagens) e restaurar os dados de demonstração.\n\nTem certeza?")) return;
    if (!confirm("Confirme novamente: apagar tudo e reiniciar?")) return;
    localStorage.clear();
    inicializarBanco();
    inicializarDoacoes();
    inicializarContratosDemo();
    showToast("Sistema resetado! Recarregando...", "success");
    setTimeout(() => window.location.reload(), 1200);
  });

  // ── Event listeners dos módulos Contratos e Arrecadação
  // (registrados aqui pois as funções são definidas abaixo, mas o DOM já existe)
  document.getElementById("btnSalvarContrato")?.addEventListener("click", () => salvarContratoModal());
});


// ══════════════════════════════════════════════════
// CONTRATOS
// ══════════════════════════════════════════════════
/* ══════════════════════════════════════════════════
   CONTRATOS — Modelo Parceria por Benefício Mútuo
══════════════════════════════════════════════════ */

function renderContratos() {
  const emps = getEmpresarios();
  const el   = document.getElementById("listaContratos");
  if (!el) return;

  if (emps.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon"><i class="bi bi-building" style="font-size:1.6rem;"></i></div>Nenhuma empresa parceira cadastrada.</div>';
    return;
  }

  el.innerHTML = emps.map(emp => {
    const c       = emp.contrato || {};
    const benef   = c.beneficioOfertado || "";
    const regras  = c.regrasUtilizacao  || "";
    const valida  = c.formaValidacao    || "";
    const tipo    = c.tipoAcordo        || "Parceiro de Benefício (Padrão)";
    const validado= c.beneficiosValidados === true;
    const hist    = c.historicoDocumentos || [];
    const vigencia= c.dataVigencia ? formatDate(c.dataVigencia) : "Indefinida";

    // Icon per tipo
    const tipoIcon = tipo === "Parceiro Estratégico" ? '<i class="bi bi-star-fill"></i>' : tipo === "Apoio Institucional" ? '<i class="bi bi-building-check"></i>' : '<i class="bi bi-tag-fill"></i>';

    return '<div class="contrato-card">' +
      '<div class="contrato-card-header">' +
        '<div class="cc-emp-info">' +
          '<div class="cc-emp-nome"><i class="bi bi-building"></i> ' + emp.nome + '</div>' +
          '<div class="cc-emp-cnpj">' + (emp.cnpj || "—") + ' · ' + (emp.email || "") + '</div>' +
        '</div>' +
        '<div class="cc-parceria-badge">' +
          '<span class="cpb-tipo">' + tipoIcon + ' ' + tipo + '</span>' +
          '<span class="cpb-validado ' + (validado ? "ok" : "pend") + '">' +
            (validado ? '<i class="bi bi-check-circle-fill" style="color:#16a34a;"></i> Validado' : '<i class="bi bi-hourglass-split" style="color:#d97706;"></i> Pendente') +
          '</span>' +
        '</div>' +
      '</div>' +

      // Benefício em destaque
      '<div class="cc-beneficio-destaque">' +
        '<span class="cbd-label"><i class="bi bi-tag"></i> Benefício ofertado</span>' +
        '<span class="cbd-valor">' + (benef || '<em style="opacity:.5;"><i class="bi bi-dash-circle"></i> Não definido</em>') + '</span>' +
      '</div>' +

      (regras ? '<div class="cc-regras"><span style="font-weight:600;"><i class="bi bi-list-check"></i> Regras:</span> ' + regras + '</div>' : '') +
      (valida ? '<div class="cc-regras" style="background:rgba(37,99,235,0.05);border-left-color:#3b82f6;"><span style="font-weight:600;"><i class="bi bi-person-badge"></i> Forma de Validação:</span> ' + valida + '</div>' : '') +

      '<div class="contrato-card-body">' +
        '<div class="contrato-stat">' +
          '<span class="cs-label">Vigência</span>' +
          '<span class="cs-val">' + vigencia + '</span>' +
        '</div>' +
        '<div class="contrato-stat">' +
          '<span class="cs-label">Documentos gerados</span>' +
          '<span class="cs-val blue">' + hist.length + '</span>' +
        '</div>' +
        '<div class="contrato-stat">' +
          '<span class="cs-label">Descrição dos benefícios</span>' +
          '<span class="cs-val ' + (c.descricaoBeneficios ? "green" : "") + '">' +
            (c.descricaoBeneficios ? '<i class="bi bi-check-circle-fill"></i> Preenchida' : '—') +
          '</span>' +
        '</div>' +
        '<div class="contrato-stat">' +
          '<span class="cs-label">Obs. Administrador</span>' +
          '<span class="cs-val">' + (c.observacoesAdmin ? '<i class="bi bi-pencil"></i> Há nota' : '—') + '</span>' +
        '</div>' +
      '</div>' +

      (c.observacoesAdmin ? '<div class="contrato-obs"><i class="bi bi-pin-angle"></i> ' + c.observacoesAdmin + '</div>' : '') +

      // Histórico documental inline (últimos 3)
      (hist.length > 0 ?
        '<div class="cc-hist-mini">' +
          '<span class="cc-hist-title"><i class="bi bi-folder2-open"></i> Histórico:</span> ' +
          hist.slice(-3).map(h => {
            const dt = new Date(h.dataGeracao).toLocaleDateString("pt-BR");
            return '<span class="cc-hist-item">' + h.tipo + ' v' + h.versao + ' (' + dt + ')</span>';
          }).join("") +
          (hist.length > 3 ? '<span class="cc-hist-more">+' + (hist.length-3) + ' mais</span>' : '') +
        '</div>' : '') +

      '<div class="contrato-card-footer">' +
        '<button class="btn btn-primary btn-sm" onclick="abrirModalContrato(' + emp.id + ')"><i class="bi bi-gear"></i> Editar Parceria</button>' +
        (!validado ? '<button class="btn btn-success btn-sm" onclick="validarBeneficios(' + emp.id + ')"><i class="bi bi-check-circle-fill"></i> Validar</button>' : '') +
        '<button class="btn btn-outline btn-sm" onclick="imprimirContrato(' + emp.id + ')"><i class="bi bi-printer"></i> Contrato</button>' +
        '<button class="btn btn-outline btn-sm" onclick="imprimirTermoParceria(' + emp.id + ')"><i class="bi bi-file-earmark-check"></i> Termo</button>' +
        '<button class="btn btn-outline btn-sm" onclick="imprimirAditivo(' + emp.id + ')"><i class="bi bi-file-earmark-diff"></i> Aditivo</button>' +
        '<button class="btn btn-outline btn-sm" onclick="imprimirSeloVitrine(' + emp.id + ')"><i class="bi bi-award"></i> Selo de Vitrine</button>' +
      '</div>' +
    '</div>';
  }).join("");
}

window.abrirModalContrato = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c = emp.contrato || {};
  document.getElementById("modalContratoTitulo").textContent = "Parceria — " + emp.nome;
  document.getElementById("modalContratoNome").textContent   = (emp.cnpj || "") + " · " + (emp.email || "");
  document.getElementById("ctBeneficioOfertado").value = c.beneficioOfertado  || "";
  document.getElementById("ctRegras").value            = c.regrasUtilizacao   || "";
  document.getElementById("ctFormaValidacao").value    = c.formaValidacao     || "";
  document.getElementById("ctDescBeneficios").value    = c.descricaoBeneficios|| "";
  document.getElementById("ctTipo").value              = c.tipoAcordo         || "Parceiro de Benefício (Padrão)";
  document.getElementById("ctVigencia").value          = c.dataVigencia       || "";
  document.getElementById("ctObsAdmin").value          = c.observacoesAdmin   || "";
  document.getElementById("ctBenefValidado").checked   = c.beneficiosValidados === true;
  document.getElementById("ctEmpId").value             = empId;
  document.getElementById("modalContrato").classList.remove("hidden");
};

function salvarContratoModal() {
  const empId = parseInt(document.getElementById("ctEmpId").value);
  const emp   = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const contratoAtual = emp.contrato || {};

  const contrato = {
    beneficioOfertado:   document.getElementById("ctBeneficioOfertado").value.trim(),
    regrasUtilizacao:    document.getElementById("ctRegras").value.trim(),
    formaValidacao:      document.getElementById("ctFormaValidacao").value.trim(),
    descricaoBeneficios: document.getElementById("ctDescBeneficios").value.trim(),
    tipoAcordo:          document.getElementById("ctTipo").value,
    dataVigencia:        document.getElementById("ctVigencia").value,
    observacoesAdmin:    document.getElementById("ctObsAdmin").value.trim(),
    beneficiosValidados: document.getElementById("ctBenefValidado").checked,
    historicoDocumentos: contratoAtual.historicoDocumentos || []
  };

  if (!contrato.beneficioOfertado) { showToast("Informe o benefício ofertado.", "error"); return; }

  salvarContratoEmpresa(empId, contrato);
  document.getElementById("modalContrato").classList.add("hidden");
  renderContratos();
  showToast("<i class=\'bi bi-check-circle\'></i> Parceria salva! Benefício: " + contrato.beneficioOfertado, "success");
}

window.validarBeneficios = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c = emp.contrato || {};
  c.beneficiosValidados = true;
  atualizarEmpresario(empId, { contrato: c });
  renderContratos();
  showToast("<i class=\'bi bi-check-circle\'></i> Benefícios validados! Associados já podem ver a parceria.", "success");
  registrarLog("Benefícios validados", getSessao()?.nome || "Admin", "admin", emp.nome + " — validado");
};



/* =====================================================
  ADMIN.JS v4.3 — Impressão + Cadastro Empresa + Filtros
===================================================== */

/* ══════════════════════════════════════════════════
   IMPRESSÃO PROFISSIONAL
══════════════════════════════════════════════════ */

/* shared print helper */
function _docBase(title, bodyHtml, empId) {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Roboto', Arial, sans-serif; font-size: 12pt; color: #1a1a2e; background: #fff; }
    .page { max-width: 210mm; margin: 0 auto; padding: 20mm 22mm; min-height: 297mm; }
    .header { display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #232850; padding-bottom: 14px; margin-bottom: 24px; }
    .logo-area { display:flex; align-items:center; gap:14px; }
    .logo-text h1 { font-size: 1.5rem; font-weight: 700; color: #232850; letter-spacing: 0.06em; }
    .logo-text p  { font-size: 0.75rem; color: #4a4060; margin-top:2px; }
    .doc-info { text-align:right; font-size: 0.78rem; color: #4a4060; }
    .doc-info strong { color: #232850; }
    .contract-title { text-align:center; margin: 28px 0 24px; }
    .contract-title h2 { font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.12em; color: #232850; margin-bottom: 6px; }
    .contract-title .subtitle { font-size: 0.85rem; color: #4a4060; font-style: italic; }
    .parties-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:22px; }
    .party-box { border: 1.5px solid #e0e0f0; border-radius: 8px; padding: 14px 16px; }
    .party-box h4 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4060; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom:6px; }
    .party-box p  { font-size: 0.85rem; line-height: 1.6; }
    .party-box strong { color: #232850; }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4060; border-bottom: 1px solid #dde; padding-bottom: 5px; margin: 20px 0 12px; }
    .clausula { margin-bottom: 14px; font-size: 0.9rem; line-height: 1.75; text-align: justify; }
    .clausula-num { font-weight: 700; color: #232850; }
    .benef-box { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; font-size: 0.9rem; margin: 10px 0 16px; line-height: 1.7; }
    .benef-box .bk { font-weight:700; color:#166534; display:block; margin-bottom:4px; }
    .info-row { display:flex; gap:8px; margin:6px 0; font-size:0.88rem; }
    .info-label { font-weight:700; min-width:180px; color:#232850; }
    .signatures { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:48px; }
    .sig-block { text-align:center; }
    .sig-line  { border-top: 1.5px solid #232850; margin-bottom: 8px; }
    .sig-name  { font-weight: 700; font-size: 0.88rem; }
    .sig-role  { font-size: 0.75rem; color: #4a4060; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #dde; text-align:center; font-size: 0.72rem; color: #9FA3C8; }
    @media print { @page { size: A4; margin: 15mm 18mm; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }
  `;
  const logoImg = `<img src="assets/logo-amas.png" style="width:56px;height:56px;object-fit:contain;" alt="AMAS" onerror="this.style.display='none'">`;
  const headerHtml = `
    <div class="header">
      <div class="logo-area">
        <div>${logoImg}</div>
        <div class="logo-text"><h1>AMAS</h1><p>Associação de São Sebastião/DF · CNPJ: 09.399.332/0001-65</p></div>
      </div>
      <div class="doc-info">
        <div>Nº: <strong>AMAS-${String(empId).padStart(4,"0")}-${new Date().getFullYear()}</strong></div>
        <div>Documento: <strong>${title}</strong></div>
      </div>
    </div>`;
  const btns = `
    <div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:10px;">
      <button onclick="window.print()" style="padding:12px 28px;background:#232850;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;"><i class="bi bi-printer"></i> Imprimir / Salvar PDF</button>
      <button onclick="window.close()" style="padding:12px 20px;background:#f1f5f9;color:#4a4060;border:1px solid #dde;border-radius:8px;font-size:0.9rem;cursor:pointer;">✕ Fechar</button>
    </div>`;
  return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>${title} – AMAS</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><style>${css}</style></head><body><div class="page">${headerHtml}${bodyHtml}<div class="footer">AMAS – Associação de São Sebastião/DF · CNPJ: 09.399.332/0001-65 · Documento gerado automaticamente pelo Sistema AMAS v4.7.</div></div>${btns}</body></html>`;
}

function _signaturas(nome) {
  return `<div class="signatures">
    <div class="sig-block"><div style="height:56px;"></div><div class="sig-line"></div><div class="sig-name">Administrador AMAS</div><div class="sig-role">Associação de São Sebastião/DF</div><div class="sig-role" style="margin-top:4px;">Data: ____/____/________</div></div>
    <div class="sig-block"><div style="height:56px;"></div><div class="sig-line"></div><div class="sig-name">${nome}</div><div class="sig-role">Representante Legal</div><div class="sig-role" style="margin-top:4px;">Data: ____/____/________</div></div>
  </div>`;
}

/**
 * Gera contrato de parceria (benefício mútuo) em nova aba para impressão.
 */
window.imprimirContrato = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c    = emp.contrato || {};
  const tipo = c.tipoAcordo || "Parceiro de Benefício (Padrão)";
  const hoje = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
  const vig  = c.dataVigencia ? new Date(c.dataVigencia + "T00:00:00").toLocaleDateString("pt-BR") : "Indeterminado";

  const body = `
  <div class="contract-title">
    <h2><i class="bi bi-file-earmark-text"></i> Contrato de Parceria</h2>
    <div class="subtitle">Parceria gratuita de benefício mútuo entre a AMAS e a empresa parceira</div>
  </div>
  <div class="parties-grid">
    <div class="party-box"><h4>Contratante</h4><p><strong>AMAS – Associação de São Sebastião</strong><br>Associação sem fins lucrativos<br>São Sebastião/DF</p></div>
    <div class="party-box"><h4>Empresa Parceira</h4><p><strong>${emp.nome}</strong><br>${emp.cnpj ? "CNPJ: " + emp.cnpj + "<br>" : ""}${emp.telefone ? "Tel: " + emp.telefone + "<br>" : ""}${emp.email || ""}</p></div>
  </div>
  <div class="section-title">Objeto e Natureza da Parceria</div>
  <div class="clausula"><span class="clausula-num">Cláusula 1ª – Objeto.</span> O presente instrumento formaliza a parceria gratuita e voluntária entre a <strong>AMAS – Associação de São Sebastião/DF</strong> e a empresa <strong>${emp.nome}</strong>, categoriada como <em>${tipo}</em>, com o objetivo de oferecer benefícios exclusivos aos associados regulares da AMAS, sem qualquer cobrança financeira entre as partes.</div>
  <div class="clausula"><span class="clausula-num">Cláusula 2ª – Gratuidade.</span> Esta parceria é inteiramente gratuita. Não há taxas, alíquotas, mensalidades ou qualquer obrigação financeira de nenhuma das partes. A empresa integra voluntariamente o Catálogo de Convênios da AMAS, beneficiando-se da visibilidade junto à base de associados locais.</div>
  <div class="section-title">Benefício Comprometido</div>
  <div class="benef-box">
    <span class="bk"><i class="bi bi-tag-fill"></i> Benefício ofertado aos associados AMAS:</span>
    ${c.beneficioOfertado || "A definir — preencher no portal de parceria."}
    ${c.regrasUtilizacao ? "<br><br><strong><i class=\"bi bi-list-check\"></i> Regras e Exceções:</strong> " + c.regrasUtilizacao : ""}
    ${c.formaValidacao ? "<br><br><strong><i class=\"bi bi-person-badge\"></i> Forma de Validação:</strong> " + c.formaValidacao : ""}
    ${c.descricaoBeneficios ? "<br><br><strong><i class=\"bi bi-card-text\"></i> Detalhes:</strong> " + c.descricaoBeneficios : ""}
    ${c.beneficiosValidados ? "<br><br><em style=\"color:#15803d;\">Benefícios validados e ativos no catálogo AMAS.</em>" : ""}
  </div>
  <div class="section-title">Obrigações das Partes</div>
  <div class="clausula"><span class="clausula-num">Cláusula 3ª – Obrigações da Empresa.</span> A empresa compromete-se a: (a) honrar o benefício acima para todo associado regular que se identificar conforme a forma de validação acordada; (b) comunicar à AMAS com 15 dias de antecedência qualquer alteração nas condições, por meio de Aditivo de Alteração de Regras; (c) manter conduta ética no atendimento aos associados.</div>
  <div class="clausula"><span class="clausula-num">Cláusula 4ª – Obrigações da AMAS.</span> A AMAS compromete-se a: (a) divulgar a empresa e seu benefício no Catálogo Digital de Convênios; (b) orientar os associados sobre as regras de utilização do benefício; (c) incluir a empresa no Selo de Vitrine e em materiais de divulgação, conforme disponibilidade.</div>
  <div class="clausula"><span class="clausula-num">Cláusula 5ª – Vigência e Rescisão.</span> Este contrato tem vigência ${c.dataVigencia ? "até " + vig : "indeterminada"} e pode ser rescindido por qualquer das partes com 15 dias de comunicação escrita, sem ônus.</div>
  ${c.observacoesAdmin ? "<div class=\"clausula\"><span class=\"clausula-num\">Obs. da Administração:</span> " + c.observacoesAdmin + "</div>" : ""}
  <div class="section-title">Informações do Documento</div>
  <div style="font-size:0.82rem;color:#4a4060;line-height:1.8;margin-bottom:24px;">
    <div class="info-row"><span class="info-label">Emitido em:</span> <span>${hoje}</span></div>
    <div class="info-row"><span class="info-label">Vigência:</span> <span>${vig}</span></div>
    <div class="info-row"><span class="info-label">Categoria:</span> <span>${tipo}</span></div>
  </div>
  ` + _signaturas(emp.nome);
  const html = _docBase("Contrato de Parceria", body, empId);

    const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

/* ══════════════════════════════════════════════════
   IMPRESSÃO RELATÓRIO DE ARRECADAÇÃO══════════════════════════════════════════════════ */
window.imprimirRelatorioArrecadacao = function() {
  showToast("Módulo financeiro removido no modelo de Parceria por Benefício Mútuo.", "info");
};

/* ══════════════════════════════════════════════════
   TERMO DE ADESÃO À PARCERIA
══════════════════════════════════════════════════ */
window.imprimirTermoParceria = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c    = emp.contrato || {};
  const tipo = c.tipoAcordo || "Parceiro de Benefício (Padrão)";
  const hoje = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
  const vig  = c.dataVigencia ? new Date(c.dataVigencia + "T00:00:00").toLocaleDateString("pt-BR") : "Indeterminado";

  const body = `
  <div class="contract-title">
    <h2><i class="bi bi-file-earmark-check"></i> Termo de Adesão à Parceria</h2>
    <div class="subtitle">Instrumento de ingresso no Programa de Convênios e Benefícios da AMAS</div>
  </div>
  <div class="clausula" style="margin-bottom:20px;">
    Pelo presente instrumento, a empresa <strong>${emp.nome}</strong>${emp.cnpj ? " (CNPJ: " + emp.cnpj + ")" : ""}, representada por seu responsável legal, manifesta sua adesão voluntária ao <strong>Programa de Convênios da AMAS – Associação de São Sebastião/DF</strong>.
  </div>
  <div class="section-title">Benefício Ofertado</div>
  <div class="benef-box">
    <span class="bk"><i class="bi bi-tag-fill"></i> Benefício comprometido:</span>
    ${c.beneficioOfertado || "A ser definido no Portal de Parceria AMAS."}
    ${c.regrasUtilizacao ? "<br><br><strong><i class=\"bi bi-list-check\"></i> Regras e Exceções:</strong> " + c.regrasUtilizacao : ""}
    ${c.formaValidacao ? "<br><br><strong><i class=\"bi bi-person-badge\"></i> Forma de Validação:</strong> " + c.formaValidacao : ""}
  </div>
  <div class="section-title">Termos de Adesão</div>
  <div class="clausula"><strong>1.</strong> A empresa aderente compromete-se a oferecer o benefício acima a todos os associados regulares da AMAS que se identificarem conforme a forma de validação acordada.</div>
  <div class="clausula"><strong>2.</strong> Qualquer alteração nas condições do benefício deverá ser comunicada à AMAS com 15 dias de antecedência, mediante Aditivo de Alteração de Regras.</div>
  <div class="clausula"><strong>3.</strong> Esta parceria é gratuita — não há taxas, alíquotas ou mensalidades.</div>
  <div class="clausula"><strong>4.</strong> Este Termo tem vigência ${c.dataVigencia ? "até " + vig : "indeterminada"} e pode ser rescindido com 15 dias de comunicação escrita.</div>
  <div class="section-title">Dados do Aderente</div>
  <div style="font-size:0.85rem;color:#4a4060;line-height:2;margin-bottom:24px;">
    <div class="info-row"><span class="info-label">Empresa:</span> <span>${emp.nome}</span></div>
    ${emp.cnpj ? '<div class="info-row"><span class="info-label">CNPJ:</span> <span>' + emp.cnpj + "</span></div>" : ""}
    <div class="info-row"><span class="info-label">Categoria:</span> <span>${tipo}</span></div>
    <div class="info-row"><span class="info-label">Data de Adesão:</span> <span>${hoje}</span></div>
  </div>
  ` + _signaturas(emp.nome);

  const html = _docBase("Termo de Adesão à Parceria", body, empId);
  registrarDocumentoHistorico(empId, "Termo de Adesão");
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

/* ══════════════════════════════════════════════════
   ADITIVO DE ALTERAÇÃO DE REGRAS
══════════════════════════════════════════════════ */
window.imprimirAditivo = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c    = emp.contrato || {};
  const hoje = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });

  const body = `
  <div class="contract-title">
    <h2><i class="bi bi-file-earmark-diff"></i> Aditivo de Alteração de Regras</h2>
    <div class="subtitle">Instrumento de atualização das condições do convênio vigente</div>
  </div>
  <div class="clausula" style="margin-bottom:20px;">
    As partes — <strong>AMAS</strong> e <strong>${emp.nome}</strong>${emp.cnpj ? " (CNPJ: " + emp.cnpj + ")" : ""} — acordam a alteração das condições do convênio, passando as novas regras a vigorar a partir da data de assinatura.
  </div>
  <div class="section-title">Novas Condições do Benefício</div>
  <div class="benef-box">
    <span class="bk"><i class="bi bi-tag-fill"></i> Novo benefício (após esta alteração):</span>
    ${c.beneficioOfertado || "Preencher no portal antes de imprimir."}
    ${c.regrasUtilizacao ? "<br><br><strong><i class=\"bi bi-list-check\"></i> Novas Regras:</strong> " + c.regrasUtilizacao : ""}
    ${c.formaValidacao ? "<br><br><strong><i class=\"bi bi-person-badge\"></i> Forma de Validação:</strong> " + c.formaValidacao : ""}
  </div>
  <div class="section-title">Cláusulas do Aditivo</div>
  <div class="clausula"><strong>1.</strong> As condições anteriores do convênio ficam substituídas pelas novas condições registradas neste aditivo a partir da data de assinatura.</div>
  <div class="clausula"><strong>2.</strong> As demais cláusulas do Contrato de Parceria original permanecem em plena vigência.</div>
  <div class="clausula"><strong>3.</strong> A AMAS atualizará o Catálogo Digital de Convênios em até 5 dias úteis da assinatura deste Aditivo.</div>
  <div class="section-title">Identificação</div>
  <div style="font-size:0.85rem;color:#4a4060;line-height:2;margin-bottom:24px;">
    <div class="info-row"><span class="info-label">Empresa:</span> <span>${emp.nome}</span></div>
    <div class="info-row"><span class="info-label">Data do Aditivo:</span> <span>${hoje}</span></div>
    <div class="info-row"><span class="info-label">Referência:</span> <span>Aditivo ao Contrato AMAS-${String(empId).padStart(4,"0")}</span></div>
  </div>
  ` + _signaturas(emp.nome);

  const html = _docBase("Aditivo de Alteração de Regras", body, empId);
  registrarDocumentoHistorico(empId, "Aditivo de Alteração");
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

/* ══════════════════════════════════════════════════
   SELO DE VITRINE
══════════════════════════════════════════════════ */
window.imprimirSeloVitrine = function(empId) {
  const emp = getEmpresarios().find(e => e.id === empId);
  if (!emp) return;
  const c = emp.contrato || {};

  const html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Selo de Vitrine – ${emp.nome}</title>
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#f5f6fa; display:flex; justify-content:center; align-items:center; min-height:100vh; }
    .selo-wrap { display:flex; flex-direction:column; gap:32px; align-items:center; padding:40px 20px; }
    .selo { width:320px; background: linear-gradient(135deg, #232850 0%, #4d53a0 100%); border-radius:20px; padding:32px 28px; text-align:center; color:#fff; box-shadow:0 8px 32px rgba(35,40,80,0.35); }
    .logo-txt { font-size:2.5rem; font-weight:900; letter-spacing:0.12em; margin-bottom:2px; }
    .assoc-txt { font-size:0.72rem; opacity:0.75; letter-spacing:0.08em; margin-bottom:20px; }
    .divider { border:none; border-top:1px solid rgba(255,255,255,0.25); margin:16px 0; }
    .headline { font-size:1rem; font-weight:700; line-height:1.4; margin-bottom:12px; }
    .benef-display { background:rgba(255,255,255,0.12); border-radius:10px; padding:14px; font-size:0.88rem; font-weight:600; line-height:1.5; }
    .footer-txt { font-size:0.65rem; opacity:0.6; margin-top:18px; }
    .selo-small { width:220px; background: linear-gradient(135deg, #232850 0%, #4d53a0 100%); border-radius:14px; padding:20px; text-align:center; color:#fff; box-shadow:0 4px 20px rgba(35,40,80,0.3); }
    .logo-s { font-size:1.6rem; font-weight:900; letter-spacing:0.1em; }
    .tag { font-size:0.62rem; opacity:0.7; margin-bottom:10px; }
    .msg-s { font-size:0.75rem; font-weight:700; line-height:1.4; }
    .instructions { background:#fff; border-radius:12px; padding:20px 24px; max-width:380px; font-size:0.82rem; color:#4a4060; line-height:1.7; box-shadow:0 2px 12px rgba(0,0,0,0.07); }
    .instructions h3 { color:#232850; font-size:0.9rem; margin-bottom:10px; }
    @media print { body { background:#fff; } .instructions { display:none; } .no-print { display:none; } @page { size: A4; margin: 20mm; } }
  </style></head><body>
  <div class="selo-wrap">
    <div class="selo">
      <div class="logo-txt">AMAS</div>
      <div class="assoc-txt">Associação de São Sebastião/DF</div>
      <hr class="divider">
      <div class="headline">Aqui, associados AMAS<br>têm benefícios exclusivos!</div>
      <div class="benef-display">${c.beneficioOfertado || "Benefício exclusivo para associados AMAS"}</div>
      ${c.formaValidacao ? '<div style="font-size:0.7rem;opacity:0.8;margin-top:12px;"><i class="bi bi-person-badge"></i> ' + c.formaValidacao + "</div>" : ""}
      <div class="footer-txt">Apresente sua Carteirinha Digital AMAS<br>${emp.nome}</div>
    </div>
    <div class="selo-small">
      <div class="logo-s">AMAS</div>
      <div class="tag">Parceiro Oficial</div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.2);margin:8px 0;">
      <div class="msg-s">Associado AMAS?<br>Pergunte pelo seu benefício!</div>
    </div>
    <div class="instructions">
      <h3><i class="bi bi-info-circle"></i> Como usar este Selo</h3>
      <p>Imprima e fixe em local visível (entrada, balcão, vitrine) para que associados AMAS identifiquem sua empresa como parceira.</p>
      <p style="margin-top:8px;">O Selo grande é ideal para portas e balcões. O Selo pequeno para mesas ou produtos.</p>
    </div>
  </div>
  <div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:10px;">
    <button onclick="window.print()" style="padding:12px 28px;background:#232850;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;"><i class="bi bi-printer"></i> Imprimir / Salvar PDF</button>
    <button onclick="window.close()" style="padding:12px 20px;background:#f1f5f9;color:#4a4060;border:1px solid #dde;border-radius:8px;font-size:0.9rem;cursor:pointer;">✕ Fechar</button>
  </div>
  </body></html>`;

  registrarDocumentoHistorico(empId, "Selo de Vitrine");
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};
