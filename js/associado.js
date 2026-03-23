/* ─── ASSOCIADO.JS v4 ─────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

  const sessao = getSessao();
  if (!sessao || sessao.perfil !== "associado") { window.location.href = "login.html"; return; }

  function getAssocAtual() { return getAssociados().find(a => a.id === sessao.id) || sessao; }
  let assoc = getAssocAtual();
  let parcelaPagarMes = null;

  // ── Sidebar info
  function updateSidebarInfo() {
    assoc = getAssocAtual();
    document.getElementById("sidebarNome").textContent      = assoc.nome;
    document.getElementById("sidebarMatricula").textContent = assoc.matricula || "—";
    const av = document.getElementById("sidebarAvatar");
    if (assoc.foto) { av.innerHTML = '<img src="' + assoc.foto + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">'; }
    else            { av.innerHTML = '<i class="bi bi-person" style="font-size:1.6rem;"></i>'; }
    atualizarBadgeMensagens();
  }
  updateSidebarInfo();

  // ── Badge mensagens
  function atualizarBadgeMensagens() {
    const n = contarNaoLidas(assoc.id);
    const badge = document.getElementById("badgeMensagens");
    if (n > 0) { badge.textContent = n; badge.classList.remove("hidden"); }
    else        { badge.classList.add("hidden"); }
  }

  // ── Status chip
  function renderStatusChip() {
    assoc = getAssocAtual();
    const chip = document.getElementById("statusChip");
    const map = { "Regular":"badge-regular","Inadimplente":"badge-inadim","Em análise":"badge-analise","Revisão solicitada":"badge-revisao","Pendente":"badge-pendente" };
    chip.innerHTML = '<span class="badge ' + (map[assoc.status]||"badge-pendente") + '" style="font-size:0.85rem;padding:6px 16px;">' + assoc.status + '</span>';
  }
  renderStatusChip();

  // ── Primeiro login
  if (assoc.primeiroLogin !== false) {
    document.getElementById("avisoSenha").classList.remove("hidden");
    document.getElementById("modalSenha").classList.remove("hidden");
  }
  document.getElementById("btnIrTrocarSenha")?.addEventListener("click", () => {
    document.getElementById("modalSenha").classList.remove("hidden");
  });

  document.getElementById("formTrocarSenha").addEventListener("submit", (e) => {
    e.preventDefault();
    const nova = document.getElementById("novaSenha").value.trim();
    const conf = document.getElementById("confirmarSenha").value.trim();
    const err  = document.getElementById("senhaErro");
    err.textContent = "";
    if (nova.length < 6) { err.textContent = "A senha deve ter pelo menos 6 caracteres."; return; }
    if (nova !== conf)   { err.textContent = "As senhas não coincidem."; return; }
    atualizarAssociado(assoc.id, { senha: nova, primeiroLogin: false });
    setSessao({ ...assoc, senha: nova, primeiroLogin: false });
    assoc = getAssocAtual();
    document.getElementById("modalSenha").classList.add("hidden");
    document.getElementById("avisoSenha").classList.add("hidden");
    registrarLog("Senha alterada", assoc.nome, "associado", "Senha redefinida com sucesso");
    showToast("Senha alterada com sucesso!", "success");
  });

  // ── Navegação
  const navItems  = document.querySelectorAll(".nav-item");
  const sections  = document.querySelectorAll(".painel-section");
  const pageTitle = document.getElementById("pageTitle");
  const pageSub   = document.getElementById("pageSub");
  const titulos   = {
    perfil:      ["Meu Perfil",            "Seus dados cadastrais"],
    mensagens:   ["Central de Mensagens",  "Avisos e comunicados da AMAS"],
    financeiro:  ["Situação Financeira",   "Acompanhe sua contribuição"],
    enviar:      ["Enviar Comprovante",    "Registre sua contribuição mensal"],
    historico:   ["Histórico",             "Todas as suas contribuições"],
    carteirinha: ["Carteirinha Digital",   "Sua identificação de associado"],
    parceiros:    ["Empresas Parceiras",      "Descontos e benefícios exclusivos para você"],
    eventos:     ["Meus Eventos",           "Inscrições e eventos da AMAS"]
  };

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const sec = item.dataset.section;
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      sections.forEach(s => s.classList.add("hidden"));
      document.getElementById("sec-" + sec).classList.remove("hidden");
      const [t, s] = titulos[sec] || ["",""];
      pageTitle.textContent = t; pageSub.textContent = s;
      assoc = getAssocAtual();
      if (sec === "perfil")      renderPerfil();
      if (sec === "mensagens")   renderMensagens();
      if (sec === "financeiro")  renderFinanceiro();
      if (sec === "historico")   renderHistorico();
      if (sec === "carteirinha") renderCarteirinha();
      if (sec === "parceiros")    renderCatalogoParceiros();
      if (sec === "eventos")     renderEventosAssoc();
      renderStatusChip();
      // fechar sidebar mobile
      document.getElementById("sidebar").classList.remove("sidebar-open");
    });
  });

  // ── Mobile hamburger
  document.getElementById("hamburgerBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("sidebar-open");
  });
  document.getElementById("sidebarClose").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("sidebar-open");
  });

  // ── Logout
  document.getElementById("btnLogout").addEventListener("click", () => {
    registrarLog("Logout", assoc.nome, "associado", "Sessão encerrada");
    clearSessao(); window.location.href = "login.html";
  });

  // ══════════════════════════════════════════════
  // PERFIL
  // ══════════════════════════════════════════════
  function renderPerfil() {
    assoc = getAssocAtual();
    const campos = [
      ["Nome",          assoc.nome],
      ["CPF",           assoc.cpf],
      ["Nascimento",    formatDate(assoc.nascimento)],
      ["Telefone",      assoc.telefone],
      ["E-mail",        assoc.email],
      ["Endereço",      assoc.endereco],
      ["Profissão",     assoc.profissao],
      ["Matrícula",     assoc.matricula],
      ["Data de entrada", formatDate(assoc.dataEntrada)]
    ];
    document.getElementById("dadosPessoais").innerHTML = campos.map(([l,v]) =>
      '<div class="dado-row"><span class="dado-label">' + l + '</span><span class="dado-valor">' + (v||"—") + '</span></div>'
    ).join("");

    // Foto
    const preview = document.getElementById("fotoImgPreview");
    const placeholder = document.getElementById("fotoPlaceholder");
    if (assoc.foto) {
      preview.src = assoc.foto;
      preview.style.display = "block";
      placeholder.style.display = "none";
    } else {
      preview.style.display = "none";
      placeholder.style.display = "block";
    }
  }

  // Upload de foto
  document.getElementById("inputFoto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Imagem muito grande. Máximo 2MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      atualizarAssociado(assoc.id, { foto: b64 });
      setSessao({ ...getSessao(), foto: b64 });
      assoc = getAssocAtual();
      renderPerfil();
      updateSidebarInfo();
      showToast("Foto atualizada com sucesso!", "success");
      registrarLog("Foto atualizada", assoc.nome, "associado", "Foto de perfil alterada");
    };
    reader.readAsDataURL(file);
  });

  // Editar perfil
  document.getElementById("btnEditarPerfil").addEventListener("click", () => {
    assoc = getAssocAtual();
    document.getElementById("editNome").value     = assoc.nome || "";
    document.getElementById("editTelefone").value = assoc.telefone || "";
    document.getElementById("editEmail").value    = assoc.email || "";
    document.getElementById("editProfissao").value = assoc.profissao || "";
    document.getElementById("editEndereco").value = assoc.endereco || "";
    document.getElementById("modalEditarPerfil").classList.remove("hidden");
  });

  // Máscara telefone no modal editar
  document.getElementById("editTelefone").addEventListener("input", function() { maskTel(this); });

  document.getElementById("formEditarPerfil").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome     = document.getElementById("editNome").value.trim();
    const telefone = document.getElementById("editTelefone").value.trim();
    const email    = document.getElementById("editEmail").value.trim();
    const profissao = document.getElementById("editProfissao").value.trim();
    const endereco = document.getElementById("editEndereco").value.trim();
    const err      = document.getElementById("editErro");
    err.textContent = "";
    if (!nome) { err.textContent = "Nome é obrigatório."; return; }
    if (!email) { err.textContent = "E-mail é obrigatório."; return; }
    atualizarAssociado(assoc.id, { nome, telefone, email, profissao, endereco });
    setSessao({ ...getSessao(), nome, telefone, email, profissao, endereco });
    assoc = getAssocAtual();
    document.getElementById("modalEditarPerfil").classList.add("hidden");
    renderPerfil();
    updateSidebarInfo();
    registrarLog("Perfil editado", assoc.nome, "associado", "Dados de perfil atualizados");
    showToast("Perfil atualizado com sucesso!", "success");
  });

  // ══════════════════════════════════════════════
  // MENSAGENS
  // ══════════════════════════════════════════════
  function renderMensagens() {
    assoc = getAssocAtual();
    const msgs = getMensagensParaAssociado(assoc.id);
    const cont = document.getElementById("listaMensagens");
    if (msgs.length === 0) {
      cont.innerHTML = '<div class="empty-state"><div class="es-icon"><i class="bi bi-envelope" style="font-size:1.6rem;"></i></div>Nenhuma mensagem recebida ainda.</div>';
      return;
    }
    cont.innerHTML = msgs.map(m => {
      const lida = m.lidas.includes(assoc.id);
      const dataFmt = new Date(m.data).toLocaleString("pt-BR");
      return '<div class="msg-item ' + (lida ? "msg-lida" : "msg-nao-lida") + '">' +
        '<div class="msg-item-header">' +
          '<div>' +
            '<span class="msg-titulo">' + (lida ? "" : '<span class="msg-dot"></span>') + m.titulo + '</span>' +
            '<span class="msg-meta">De: ' + m.remetente + ' · ' + dataFmt + '</span>' +
          '</div>' +
          (!lida ? '<button class="btn btn-outline btn-sm" data-id="' + m.id + '" onclick="marcarLidaUI(' + m.id + ')">Marcar como lida</button>' : '<span class="badge badge-regular" style="font-size:0.75rem;">Lida</span>') +
        '</div>' +
        '<div class="msg-corpo">' + m.corpo + '</div>' +
      '</div>';
    }).join("");
    atualizarBadgeMensagens();
  }

  window.marcarLidaUI = function(idMsg) {
    marcarMensagemLida(idMsg, assoc.id);
    renderMensagens();
    atualizarBadgeMensagens();
    showToast("Mensagem marcada como lida.", "success");
  };

  // ══════════════════════════════════════════════
  // FINANCEIRO
  // ══════════════════════════════════════════════
  function renderFinanceiro() {
    assoc = getAssocAtual();
    const icones = {
      "Regular":            ['<i class="bi bi-check-circle-fill" style="color:#16a34a;"></i>',"#16a34a","Você está em dia com suas contribuições. Continue assim!"],
      "Inadimplente":       ['<i class="bi bi-x-circle-fill" style="color:#dc2626;"></i>',"#dc2626","Você possui contribuições em atraso. Regularize para manter seus benefícios."],
      "Em análise":         ['<i class="bi bi-hourglass-split" style="color:#d97706;"></i>',"#d97706","Seu comprovante está sendo analisado. Aguarde a confirmação."],
      "Revisão solicitada": ['<i class="bi bi-arrow-clockwise" style="color:#ea580c;"></i>',"#ea580c","O administrador solicitou revisão do seu comprovante."],
      "Pendente":           ['<i class="bi bi-circle" style="color:#6C6E84;"></i>',"#6C6E84","Você ainda não enviou sua contribuição deste mês."]
    };
    const [icone, cor, desc] = icones[assoc.status] || ['<i class="bi bi-circle" style="color:#6C6E84;"></i>',"#6C6E84","—"];
    document.getElementById("situacaoFinanceira").innerHTML =
      '<div class="situacao-big">' +
        '<div class="situacao-icone">' + icone + '</div>' +
        '<div class="situacao-status" style="color:' + cor + ';">' + assoc.status + '</div>' +
        '<div class="situacao-desc">' + desc + '</div>' +
      '</div>';

    // Parcelas em atraso
    const parcelas = assoc.parcelasAtraso || [];
    const pCont = document.getElementById("parcelasAtrasoCont");
    if (parcelas.length === 0) {
      pCont.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;padding:12px 0;"><i class=\"bi bi-check-circle-fill\" style=\"color:#16a34a;\"></i> Nenhuma parcela em atraso.</p>';
    } else {
      pCont.innerHTML = parcelas.map((p, i) =>
        '<div class="parcela-atraso-item">' +
          '<div>' +
            '<div class="pa-mes">' + p.mes + '</div>' +
            '<div class="pa-venc">Vencimento: ' + formatDate(p.vencimento) + '</div>' +
          '</div>' +
          '<div class="pa-valor">' + formatMoney(p.valor) + '</div>' +
          '<button class="btn btn-primary btn-sm" onclick="abrirModalPagamento(' + i + ')><i class=\"bi bi-credit-card\"></i> Pagar</button>' +
        '</div>'
      ).join("");
    }

    // Mensagens do admin
    const msgs = (assoc.historico||[]).filter(c => c.msgAdmin).map(c =>
      '<div class="msg-admin-item">' +
        '<div class="ma-header"><i class=\"bi bi-envelope-paper\"></i> Re: ' + (c.mes||c.data) + ' — ' + c.status + '</div>' +
        '<div class="ma-texto">' + c.msgAdmin + '</div>' +
      '</div>'
    );
    document.getElementById("mensagensAdmin").innerHTML = msgs.length
      ? msgs.join("")
      : '<p style="color:var(--text-muted);font-size:0.88rem;">Nenhuma mensagem do administrador.</p>';
  }

  window.abrirModalPagamento = function(idx) {
    assoc = getAssocAtual();
    parcelaPagarMes = assoc.parcelasAtraso[idx];
    document.getElementById("parcelaMesLabel").textContent = parcelaPagarMes.mes + " — " + formatMoney(parcelaPagarMes.valor);
    document.getElementById("obsPagamento").value = "";
    document.getElementById("arquivoParcela").value = "";
    document.getElementById("modalPagamento").classList.remove("hidden");
  };

  document.getElementById("btnConfirmarPagamento").addEventListener("click", () => {
    if (!parcelaPagarMes) return;
    const obs     = document.getElementById("obsPagamento").value.trim();
    const arquivo = document.getElementById("arquivoParcela").files[0];
    adicionarContribuicao(assoc.id, {
      valor: parcelaPagarMes.valor,
      arquivo: arquivo ? arquivo.name : "comprovante_parcela.pdf",
      mes: parcelaPagarMes.mes,
      status: "Em análise",
      observacoes: obs || "Pagamento de parcela em atraso"
    });
    // Remove parcela da lista de atraso
    const updated = getAssocAtual();
    const novasParcelas = (updated.parcelasAtraso||[]).filter(p => p.mes !== parcelaPagarMes.mes);
    atualizarAssociado(assoc.id, { parcelasAtraso: novasParcelas });
    assoc = getAssocAtual();
    document.getElementById("modalPagamento").classList.add("hidden");
    renderFinanceiro();
    renderStatusChip();
    showToast("Pagamento registrado! Em análise pelo administrador.", "success");
    parcelaPagarMes = null;
  });

  // ══════════════════════════════════════════════
  // ENVIO COMPROVANTE
  // ══════════════════════════════════════════════
  const fileDropZone = document.getElementById("fileDropZone");
  const arquivoComp  = document.getElementById("arquivoComp");
  const fdzSelected  = document.getElementById("fdz-selected");

  fileDropZone.addEventListener("click", () => arquivoComp.click());
  fileDropZone.addEventListener("dragover", (e) => { e.preventDefault(); fileDropZone.classList.add("drag-over"); });
  fileDropZone.addEventListener("dragleave", () => fileDropZone.classList.remove("drag-over"));
  fileDropZone.addEventListener("drop", (e) => {
    e.preventDefault(); fileDropZone.classList.remove("drag-over");
    if (e.dataTransfer.files[0]) { arquivoComp.files = e.dataTransfer.files; showFileSelected(e.dataTransfer.files[0].name); }
  });
  arquivoComp.addEventListener("change", () => { if (arquivoComp.files[0]) showFileSelected(arquivoComp.files[0].name); });
  function showFileSelected(nome) { fdzSelected.innerHTML = '<i class="bi bi-check-circle-fill" style="color:#16a34a;"></i> ' + nome; fdzSelected.classList.remove("hidden"); }

  // Máscara moeda
  document.getElementById("valorContrib").addEventListener("input", function() { maskMoeda(this); });

  document.getElementById("formComprovante").addEventListener("submit", (e) => {
    e.preventDefault();
    const mes     = document.getElementById("mesRef").value;
    const valorRaw = document.getElementById("valorContrib").value.replace(/\D/g,"");
    const valor   = (parseInt(valorRaw||"0") / 100).toFixed(2);
    const arquivo = arquivoComp.files[0];
    const obs     = document.getElementById("obsContrib").value.trim();
    const erroEl  = document.getElementById("envioErro");
    erroEl.textContent = "";
    if (!mes || !valorRaw || !arquivo) { erroEl.textContent = "Preencha todos os campos e selecione um arquivo."; return; }
    if (parseFloat(valor) <= 0)        { erroEl.textContent = "O valor deve ser maior que zero."; return; }
    if (arquivo.size > 5*1024*1024)    { erroEl.textContent = "Arquivo muito grande. Máximo 5MB."; return; }
    const [ano, mesNum] = mes.split("-");
    const nomeMes = new Date(parseInt(ano), parseInt(mesNum)-1).toLocaleString("pt-BR", { month:"long", year:"numeric" });
    adicionarContribuicao(assoc.id, {
      valor, arquivo: arquivo.name,
      mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
      status: "Em análise", observacoes: obs
    });
    assoc = getAssocAtual();
    setSessao({ ...assoc, perfil: "associado" });
    document.getElementById("formComprovante").classList.add("hidden");
    document.getElementById("enviofeedback").classList.remove("hidden");
    renderStatusChip();
    showToast("Comprovante enviado com sucesso!", "success");
  });

  document.getElementById("btnEnviarOutro")?.addEventListener("click", () => {
    document.getElementById("formComprovante").reset();
    fdzSelected.classList.add("hidden"); fdzSelected.textContent = "";
    document.getElementById("formComprovante").classList.remove("hidden");
    document.getElementById("enviofeedback").classList.add("hidden");
  });

  // ══════════════════════════════════════════════
  // HISTÓRICO
  // ══════════════════════════════════════════════
  function renderHistorico() {
    assoc = getAssocAtual();
    const tbody = document.getElementById("tbodyHistorico");
    const hist  = (assoc.historico||[]).slice().reverse();
    if (hist.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="es-icon"><i class="bi bi-clock-history" style="font-size:1.6rem;"></i></div>Nenhuma contribuição registrada ainda.</div></td></tr>';
      return;
    }
    const map = { "Regular":"badge-regular","Inadimplente":"badge-inadim","Em análise":"badge-analise","Revisão solicitada":"badge-revisao","Pendente":"badge-pendente","Aprovado":"badge-aprovado","Recusado":"badge-recusado" };
    tbody.innerHTML = hist.map(c =>
      '<tr>' +
        '<td><strong>' + (c.mes||c.data) + '</strong><br><small style="color:var(--text-muted);">' + c.data + '</small></td>' +
        '<td><strong>' + formatMoney(c.valor) + '</strong></td>' +
        '<td style="font-size:0.82rem;color:var(--text-muted);">' + (c.observacoes || '—') + '</td>' +
        '<td><span class="badge ' + (map[c.status]||"badge-pendente") + '">' + c.status + '</span></td>' +
        '<td style="font-size:0.85rem;color:var(--text-secondary);">' + (c.msgAdmin||"—") + '</td>' +
      '</tr>'
    ).join("");
  }

  // ══════════════════════════════════════════════
  // CARTEIRINHA DIGITAL
  // ══════════════════════════════════════════════
  function renderCarteirinha() {
    assoc = getAssocAtual();
    document.getElementById("cartNome").textContent      = assoc.nome || "—";
    document.getElementById("cartMatricula").textContent = assoc.matricula || "—";
    document.getElementById("cartProfissao").textContent = assoc.profissao || "—";
    document.getElementById("cartEntrada").textContent   = "Membro desde " + formatDate(assoc.dataEntrada);
    const cartFoto = document.getElementById("cartFoto");
    if (assoc.foto) {
      cartFoto.innerHTML = '<img src="' + assoc.foto + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      cartFoto.innerHTML = '<span><i class="bi bi-person" style="font-size:2.5rem;"></i></span>';
    }
    const statusBadge = document.getElementById("cartStatusBadge");
    const isReg = assoc.status === "Regular";
    statusBadge.innerHTML = isReg ? '<i class="bi bi-check-circle-fill" style="color:#16a34a;"></i> Adimplente' : '<i class="bi bi-exclamation-triangle" style="color:#d97706;"></i> ' + assoc.status;
    statusBadge.style.background = isReg ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)";
    statusBadge.style.color      = isReg ? "#16a34a" : "#dc2626";
    statusBadge.style.border     = isReg ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(239,68,68,0.4)";
  }

  // ── Render inicial
  renderPerfil();
  registrarLog("Login realizado", assoc.nome, "associado", "Acesso ao painel do associado");
});

/* ── MÓDULO EVENTOS — v4.5 completo ─────────────────── */
document.addEventListener("DOMContentLoaded", () => {

  /* ── Constantes ─────────────────────────────── */
  const EV_TIPO_ICON  = { social:'<i class="bi bi-heart"></i>', capacitacao:'<i class="bi bi-book"></i>', parceria:'<i class="bi bi-handshake"></i>', cultural:'<i class="bi bi-stars"></i>', reuniao:'<i class="bi bi-people"></i>' };
  const EV_TIPO_LABEL = { social:"Ação Social", capacitacao:"Capacitação", parceria:"Parceria", cultural:"Cultural", reuniao:"Assembleia" };
  const SENHA_NAO_EXPIRE = true; // Evita loop com senhaExpirada

  let filtroTipoAtivo = "";
  let filtroBusca     = "";
  let evTabAtiva      = "disponiveis";

  /* ── Abas internas ──────────────────────────── */
  function initEvTabs() {
    document.querySelectorAll(".ev-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        evTabAtiva = btn.dataset.evTab;
        document.querySelectorAll(".ev-tab").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        document.getElementById("evPainelDisponiveis").classList.toggle("hidden", evTabAtiva !== "disponiveis");
        document.getElementById("evPainelInscritos").classList.toggle("hidden", evTabAtiva !== "inscritos");
        if (evTabAtiva === "inscritos") renderMinhasInscricoes();
        else renderEventosAssoc();
      });
    });
  }

  /* ── Filtros ────────────────────────────────── */
  function initFiltros() {
    document.querySelectorAll(".ev-filtro-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filtroTipoAtivo = btn.dataset.tipo;
        document.querySelectorAll(".ev-filtro-btn").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        renderEventosAssoc();
      });
    });

    const busca = document.getElementById("evBusca");
    let debounce;
    busca?.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { filtroBusca = busca.value.trim().toLowerCase(); renderEventosAssoc(); }, 220);
    });
  }

  /* ── Badge contador de inscrições ──────────── */
  function atualizarCountInscritos() {
    const sessao = getSessao();
    if (!sessao) return;
    const n   = getEventosDoAssociado(sessao.id).length;
    const el  = document.getElementById("countInscritos");
    if (!el) return;
    if (n > 0) { el.textContent = n; el.classList.remove("hidden"); }
    else el.classList.add("hidden");
  }

  /* ══════════════════════════════════════════════
     LISTA DE EVENTOS DISPONÍVEIS
  ══════════════════════════════════════════════ */
  function renderEventosAssoc() {
    const sessao = getSessao();
    if (!sessao) return;

    const todos = getEventos()
      .filter(ev => {
        const st = ev.status || "Aberto";
        if (st === "Encerrado") return false; // nunca exibe encerrado para associado
        return true;
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    // Aplica filtros
    let lista = todos;
    if (filtroTipoAtivo) lista = lista.filter(ev => ev.tipo === filtroTipoAtivo);
    if (filtroBusca)      lista = lista.filter(ev =>
      ev.titulo.toLowerCase().includes(filtroBusca) ||
      (ev.descricao||"").toLowerCase().includes(filtroBusca) ||
      (ev.local||"").toLowerCase().includes(filtroBusca)
    );

    const el = document.getElementById("listaEventosAssoc");
    if (!el) return;

    if (!lista.length) {
      el.innerHTML =
        '<div class="ev-empty">' +
          '<div class="ev-empty-icon"><i class="bi bi-calendar-event" style="font-size:1.6rem;"></i></div>' +
          '<div class="ev-empty-txt">' + (filtroBusca || filtroTipoAtivo ? "Nenhum evento encontrado com esses filtros." : "Nenhum evento disponível no momento.") + '</div>' +
        '</div>';
      atualizarCountInscritos();
      return;
    }

    el.innerHTML = lista.map(ev => buildEventoCard(ev, sessao.id)).join("");
    atualizarCountInscritos();
  }

  /* ── Card de evento ─────────────────────────── */
  function buildEventoCard(ev, assocId) {
    const estado    = statusInscricao(ev, assocId);
    const vagas     = ev.vagasTotais || ev.vagas || 0;
    const inscritos = (ev.inscritos  || []).length;
    const espera    = (ev.listaEspera|| []).length;
    const vagasDisp = vagas > 0 ? Math.max(0, vagas - inscritos) : null;
    const pct       = vagas > 0 ? Math.min(100, Math.round((inscritos/vagas)*100)) : 0;
    const barColor  = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

    // Data formatada
    const [y, m, d] = (ev.data||"").split("-");
    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    const mesNome = meses[parseInt(m||1)-1] || "";

    // Status badge
    const evStatus = ev.status || "Aberto";
    const stBadge = evStatus === "Aberto"
      ? '<span class="badge-ev-status aberto">Aberto</span>'
      : evStatus === "Em Breve"
      ? '<span class="badge-ev-status embreve">Em Breve</span>'
      : '<span class="badge-ev-status encerrado">Encerrado</span>';

    // Badge de estado de inscrição
    let inscBadge = "";
    if (estado === "inscrito")        inscBadge = '<span class="ev-inscricao-badge inscrito"><i class=\"bi bi-check-circle-fill\"></i> Inscrito</span>';
    else if (estado === "espera")     inscBadge = '<span class="ev-inscricao-badge espera">⏳ Na fila</span>';
    else if (estado === "vaga_disponivel") inscBadge = '<span class="ev-inscricao-badge vaga-disp"><i class=\"bi bi-stars\"></i> Vaga!</span>';

    // Botão principal
    let btnHtml = "";
    if (estado === "inscrito") {
      btnHtml = '<button class="ev-card-btn btn-cancelar" onclick="assocCancelarInscricao(' + ev.id + ')"> Cancelar inscrição</button>';
    } else if (estado === "vaga_disponivel") {
      btnHtml = '<button class="ev-card-btn btn-vaga-disp" onclick="assocConfirmarVaga(' + ev.id + ')"><i class=\"bi bi-stars\"></i> Confirmar vaga!</button>';
    } else if (estado === "espera") {
      const pos = (ev.listaEspera||[]).findIndex(i => i.id === assocId) + 1;
      btnHtml = '<button class="ev-card-btn btn-espera" onclick="assocCancelarInscricao(' + ev.id + ')">⏳ Fila #' + pos + ' · Sair</button>';
    } else if (estado === "livre") {
      btnHtml = '<button class="ev-card-btn btn-inscrever" onclick="assocInscrever(' + ev.id + ')"><i class=\"bi bi-check-circle-fill\"></i> Inscrever-se</button>';
    } else if (estado === "lotado") {
      btnHtml = '<button class="ev-card-btn btn-espera-entrar" onclick="assocInscrever(' + ev.id + ')"> Lista de espera</button>';
    } else {
      btnHtml = '<button class="ev-card-btn btn-desabilitado" disabled>Em breve</button>';
    }

    return (
      '<div class="ev-card ev-card-estado-' + estado + '" id="evCard-' + ev.id + '">' +

        // Cabeçalho com data
        '<div class="ev-card-top">' +
          '<div class="ev-card-data">' +
            '<div class="evd-dia">' + (d||"—") + '</div>' +
            '<div class="evd-mes">' + mesNome + '</div>' +
            '<div class="evd-ano">' + (y||"") + '</div>' +
          '</div>' +
          '<div class="ev-card-main">' +
            '<div class="ev-card-badges">' +
              '<span class="ev-tipo-pill ' + ev.tipo + '">' + (EV_TIPO_ICON[ev.tipo]||'<i class="bi bi-calendar-event"></i>') + ' ' + (EV_TIPO_LABEL[ev.tipo]||ev.tipo) + '</span>' +
              stBadge +
              inscBadge +
            '</div>' +
            '<div class="ev-card-titulo">' + ev.titulo + '</div>' +
            '<div class="ev-card-local"><i class=\"bi bi-geo-alt\"></i> ' + (ev.local||"—") + ' · <i class=\"bi bi-clock\"></i> ' + (ev.horario||"—") + '</div>' +
          '</div>' +
        '</div>' +

        // Descrição (truncada) + link ver mais
        '<div class="ev-card-desc">' + (ev.descricao||"") + '</div>' +

        // Rodapé: vagas + botões
        '<div class="ev-card-footer">' +
          // Barra de vagas
          (vagas > 0 ?
            '<div class="ev-card-vagas">' +
              '<div class="ev-vagas-track"><div class="ev-vagas-fill" style="width:' + pct + '%;background:' + barColor + ';"></div></div>' +
              '<span class="ev-vagas-txt">' +
                inscritos + '/' + vagas +
                (vagasDisp !== null && vagasDisp > 0 ? ' · <strong style="color:' + barColor + ';">' + vagasDisp + ' restante' + (vagasDisp !== 1 ? 's' : '') + '</strong>' : '') +
                (vagasDisp === 0 ? ' · <strong style="color:#ef4444;">Lotado</strong>' : '') +
                (espera > 0 ? ' · <em>' + espera + ' na espera</em>' : '') +
              '</span>' +
            '</div>'
            : '') +
          // Ações
          '<div class="ev-card-acoes">' +
            '<button class="ev-card-btn-detalhes" onclick="verDetalheEvento(' + ev.id + ')">ℹ️ Ver detalhes</button>' +
            btnHtml +
          '</div>' +
        '</div>' +

      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     MODAL DETALHE DO EVENTO
  ══════════════════════════════════════════════ */
  window.verDetalheEvento = function(eventoId) {
    const ev     = getEventos().find(e => e.id === eventoId);
    const sessao = getSessao();
    if (!ev || !sessao) return;

    const estado    = statusInscricao(ev, sessao.id);
    const vagas     = ev.vagasTotais || ev.vagas || 0;
    const inscritos = (ev.inscritos   || []).length;
    const espera    = (ev.listaEspera || []).length;
    const vagasDisp = vagas > 0 ? Math.max(0, vagas - inscritos) : null;
    const pct       = vagas > 0 ? Math.min(100, Math.round((inscritos/vagas)*100)) : 0;
    const barColor  = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
    const evStatus  = ev.status || "Aberto";

    // Header
    document.getElementById("medTipoRow").innerHTML =
      '<span class="ev-tipo-pill ' + ev.tipo + '">' + (EV_TIPO_ICON[ev.tipo]||'<i class="bi bi-calendar-event"></i>') + " " + (EV_TIPO_LABEL[ev.tipo]||ev.tipo) + '</span>' +
      (evStatus === "Aberto"   ? '<span class="badge-ev-status aberto" style="margin-left:8px;">Inscrições abertas</span>'   : '') +
      (evStatus === "Em Breve" ? '<span class="badge-ev-status embreve" style="margin-left:8px;">Em Breve</span>'            : '') +
      (evStatus === "Encerrado"? '<span class="badge-ev-status encerrado" style="margin-left:8px;">Encerrado</span>'         : '');
    document.getElementById("medTitulo").textContent = ev.titulo;

    // Grid de informações
    const [y, m, d] = (ev.data||"").split("-");
    const mesesFull = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const dataCompleta = d + " de " + (mesesFull[parseInt(m||1)-1]||"") + " de " + y;

    document.getElementById("medInfoGrid").innerHTML =
      medInfoRow('<i class="bi bi-calendar3"></i>',"Data", dataCompleta) +
      medInfoRow('<i class="bi bi-clock"></i>',"Horário", ev.horario || "A confirmar") +
      medInfoRow('<i class="bi bi-geo-alt"></i>',"Local", ev.local || "A definir") +
      (vagas > 0 ? medInfoRow('<i class="bi bi-ticket-perforated"></i>',"Vagas", vagas + " no total") : "") +
      (ev.destaque ? medInfoRow("⭐","Destaque", "Evento em destaque AMAS") : "");

    // Descrição completa
    document.getElementById("medDescricao").innerHTML =
      '<h4 class="med-section-title"> Sobre o evento</h4>' +
      '<p class="med-descricao-txt">' + (ev.descricao || "Sem descrição disponível.") + '</p>';

    // Vagas
    if (vagas > 0) {
      document.getElementById("medVagasBlock").innerHTML =
        '<h4 class="med-section-title"> Ocupação de vagas</h4>' +
        '<div class="med-vagas-bar-wrap">' +
          '<div class="med-vagas-bar"><div class="med-vagas-fill" style="width:' + pct + '%;background:' + barColor + ';"></div></div>' +
          '<div class="med-vagas-info">' +
            '<span>' + inscritos + ' confirmados</span>' +
            (espera > 0 ? '<span style="color:#f59e0b;">' + espera + ' na fila de espera</span>' : '') +
            '<span style="color:' + barColor + ';font-weight:700;">' +
              (vagasDisp === 0 ? ' Lotado' : vagasDisp + ' vaga' + (vagasDisp !== 1 ? 's' : '') + ' disponível') +
            '</span>' +
          '</div>' +
        '</div>';
    } else {
      document.getElementById("medVagasBlock").innerHTML = "";
    }

    // Botão de ação
    let acaoHtml = "";
    if (evStatus === "Encerrado") {
      acaoHtml = '<div class="med-acao-block encerrado"> As inscrições para este evento estão encerradas.</div>';
    } else if (evStatus === "Em Breve") {
      acaoHtml = '<div class="med-acao-block embreve"> As inscrições ainda não estão abertas.</div>';
    } else if (estado === "inscrito") {
      acaoHtml =
        '<div class="med-acao-confirmado">' +
          '<div class="mac-icon"></div>' +
          '<div><strong>Você está inscrito!</strong><br><span>Sua vaga está confirmada. Compareça na data e local indicados.</span></div>' +
        '</div>' +
        '<button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;justify-content:center;color:#dc2626;border-color:rgba(239,68,68,0.3);" onclick="assocCancelarInscricaoModal(' + ev.id + ')">Cancelar minha inscrição</button>';
    } else if (estado === "vaga_disponivel") {
      acaoHtml =
        '<div class="med-acao-vaga">' +
          '<div class="mav-icon"></div>' +
          '<div><strong>Vaga disponível para você!</strong><br><span>Uma vaga foi liberada. Confirme agora antes que expire.</span></div>' +
        '</div>' +
        '<button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;" onclick="assocConfirmarVagaModal(' + ev.id + ')"><i class=\"bi bi-stars\"></i> Confirmar minha vaga</button>';
    } else if (estado === "espera") {
      const pos = (ev.listaEspera||[]).findIndex(i => i.id === sessao.id) + 1;
      acaoHtml =
        '<div class="med-acao-espera">' +
          '<div>⏳ <strong>Você está na fila de espera — posição #' + pos + '</strong></div>' +
          '<div>Você será notificado quando uma vaga for liberada.</div>' +
        '</div>' +
        '<button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;justify-content:center;" onclick="assocCancelarInscricaoModal(' + ev.id + ')">Sair da fila de espera</button>';
    } else if (estado === "livre") {
      acaoHtml = '<button class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:1rem;" onclick="assocInscreverModal(' + ev.id + ')"> Garantir minha vaga</button>';
    } else if (estado === "lotado") {
      acaoHtml =
        '<div class="med-acao-espera">️ Todas as vagas estão preenchidas.</div>' +
        '<button class="btn" style="width:100%;justify-content:center;padding:14px;background:#f59e0b;color:#fff;margin-top:8px;" onclick="assocInscreverModal(' + ev.id + ')"> Entrar na lista de espera</button>';
    }

    document.getElementById("medAcao").innerHTML = acaoHtml;
    document.getElementById("modalDetalheEvento").classList.remove("hidden");
  };

  function medInfoRow(icon, label, value) {
    return '<div class="med-info-row">' +
      '<span class="mir-icon">' + icon + '</span>' +
      '<div><div class="mir-label">' + label + '</div><div class="mir-value">' + value + '</div></div>' +
    '</div>';
  }

  // Ações dentro do modal (fecham o modal antes de agir)
  window.assocInscreverModal = function(id) {
    document.getElementById("modalDetalheEvento").classList.add("hidden");
    assocInscrever(id);
  };
  window.assocCancelarInscricaoModal = function(id) {
    document.getElementById("modalDetalheEvento").classList.add("hidden");
    assocCancelarInscricao(id);
  };
  window.assocConfirmarVagaModal = function(id) {
    document.getElementById("modalDetalheEvento").classList.add("hidden");
    assocConfirmarVaga(id);
  };

  // Fecha modal clicando fora
  document.getElementById("modalDetalheEvento")?.addEventListener("click", function(e) {
    if (e.target === this) this.classList.add("hidden");
  });

  /* ══════════════════════════════════════════════
     MINHAS INSCRIÇÕES
  ══════════════════════════════════════════════ */
  function renderMinhasInscricoes() {
    const sessao = getSessao();
    if (!sessao) return;

    const meus = getEventosDoAssociado(sessao.id);
    const el   = document.getElementById("minhasInscricoes");
    if (!el) return;

    if (!meus.length) {
      el.innerHTML =
        '<div class="ev-empty">' +
          '<div class="ev-empty-icon"></div>' +
          '<div class="ev-empty-txt">Você ainda não tem inscrições.</div>' +
          '<button class="btn btn-outline btn-sm" style="margin-top:14px;" onclick="irParaDisponiveis()">Ver eventos disponíveis</button>' +
        '</div>';
      return;
    }

    // Agrupa: confirmados primeiro, depois fila, depois vaga disponível
    const ordem = { "vaga_disponivel": 0, "inscrito": 1, "espera": 2 };
    meus.sort((a, b) => (ordem[a._estadoInscricao]||9) - (ordem[b._estadoInscricao]||9));

    el.innerHTML = meus.map(ev => buildMineCard(ev, sessao.id)).join("");
  }

  function buildMineCard(ev, assocId) {
    const estado  = ev._estadoInscricao;
    const [y, m, d] = (ev.data||"").split("-");
    const mesesFull = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const mesesA    = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

    const stCfg = {
      inscrito:        { cls:"mine-ok",     icon:"", txt:"Inscrição Confirmada" },
      vaga_disponivel: { cls:"mine-vaga",   icon:"", txt:"Vaga Disponível! Confirme agora" },
      espera:          { cls:"mine-espera", icon:"⏳", txt:"Na fila de espera" }
    }[estado] || { cls:"", icon:"", txt:"—" };

    const pos = estado === "espera"
      ? (ev.listaEspera||[]).findIndex(i => i.id === assocId) + 1 : null;

    let acaoBtns = "";
    if (estado === "vaga_disponivel") {
      acaoBtns = '<button class="btn btn-primary btn-sm" onclick="assocConfirmarVagaModal(' + ev.id + ')"><i class=\"bi bi-stars\"></i> Confirmar vaga</button>';
    } else if (estado === "inscrito") {
      acaoBtns = '<button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:rgba(239,68,68,0.3);" onclick="assocCancelarInscricaoModal(' + ev.id + ')">Cancelar</button>';
    } else {
      acaoBtns = '<button class="btn btn-outline btn-sm" onclick="assocCancelarInscricaoModal(' + ev.id + ')">Sair da fila</button>';
    }

    return (
      '<div class="mine-card-v2 ' + stCfg.cls + '">' +
        // Barra de status no topo
        '<div class="mc2-status-bar">' +
          '<span class="mc2-status-icon">' + stCfg.icon + '</span>' +
          '<span class="mc2-status-txt">' + stCfg.txt + (pos ? " — posição #" + pos : "") + '</span>' +
          (estado === "vaga_disponivel" ? '<span class="mc2-urgente"> Aja agora!</span>' : '') +
        '</div>' +
        // Conteúdo
        '<div class="mc2-body">' +
          // Bloco de data
          '<div class="mc2-data">' +
            '<div class="mc2-dia">' + (d||"—") + '</div>' +
            '<div class="mc2-mes">' + (mesesA[parseInt(m||1)-1]||"") + '</div>' +
          '</div>' +
          '<div class="mc2-info">' +
            '<div class="mc2-tipo">' + (EV_TIPO_ICON[ev.tipo]||'<i class="bi bi-calendar-event"></i>') + ' ' + (EV_TIPO_LABEL[ev.tipo]||ev.tipo) + '</div>' +
            '<div class="mc2-titulo">' + ev.titulo + '</div>' +
            '<div class="mc2-meta"> ' + (ev.horario||"—") + ' ·  ' + (ev.local||"—") + '</div>' +
          '</div>' +
        '</div>' +
        // Rodapé com ações
        '<div class="mc2-footer">' +
          '<button class="btn btn-outline btn-sm" onclick="verDetalheEvento(' + ev.id + ')">ℹ️ Detalhes</button>' +
          acaoBtns +
        '</div>' +
      '</div>'
    );
  }

  window.irParaDisponiveis = function() {
    const tabDisp = document.querySelector('.ev-tab[data-ev-tab="disponiveis"]');
    if (tabDisp) tabDisp.click();
  };

  /* ══════════════════════════════════════════════
     AÇÕES DO ASSOCIADO
  ══════════════════════════════════════════════ */
  window.assocInscrever = function(eventoId) {
    const sessao = getSessao();
    if (!sessao) return;
    const res = inscreverNoEvento(eventoId, sessao);
    if (!res.ok) {
      const msgs = {
        encerrado:   "Este evento está com inscrições encerradas.",
        em_breve:    "As inscrições ainda não estão abertas.",
        ja_inscrito: "Você já está inscrito ou na fila deste evento."
      };
      showToast(msgs[res.acao] || "Não foi possível realizar a inscrição.", "error");
      return;
    }
    if (res.acao === "inscrito") {
      showToast("<i class=\"bi bi-stars\"></i> Inscrição confirmada! Até lá!", "success");
    } else {
      showToast("⏳ Você entrou na lista de espera — posição " + res.posicao + ".", "info");
    }
    renderEventosAssoc();
    if (evTabAtiva === "inscritos") renderMinhasInscricoes();
    atualizarCountInscritos();
  };

  window.assocCancelarInscricao = function(eventoId) {
    if (!confirm("Deseja cancelar sua inscrição neste evento?")) return;
    const sessao = getSessao();
    if (!sessao) return;
    const res = cancelarInscricao(eventoId, sessao.id);
    if (!res.ok) { showToast("Não foi possível cancelar.", "error"); return; }
    showToast(res.promovido
      ? "Inscrição cancelada. A próxima pessoa da fila foi notificada."
      : "Inscrição cancelada com sucesso.", "info");
    renderEventosAssoc();
    if (evTabAtiva === "inscritos") renderMinhasInscricoes();
    atualizarCountInscritos();
  };

  window.assocConfirmarVaga = function(eventoId) {
    const sessao = getSessao();
    if (!sessao) return;
    const ok = confirmarVagaDisponivel(eventoId, sessao.id);
    if (ok) {
      showToast("<i class=\"bi bi-stars\"></i> Vaga confirmada! Você está inscrito.", "success");
    } else {
      showToast("A vaga já não está disponível. Tente outra vez.", "error");
    }
    renderEventosAssoc();
    if (evTabAtiva === "inscritos") renderMinhasInscricoes();
    atualizarCountInscritos();
  };

  /* ── Init ─────────────────────────────────── */
  initEvTabs();
  initFiltros();
});

/* ── CATÁLOGO DE EMPRESAS PARCEIRAS ─────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  function renderCatalogoParceiros() {
    const el = document.getElementById("catalogoParceiros");
    if (!el) return;

    const todas = getEmpresarios().filter(emp => {
      const c = emp.contrato || {};
      return c.beneficioOfertado && c.beneficiosValidados === true;
    });

    // Busca
    const busca = document.getElementById("buscaParceiros")?.value?.trim().toLowerCase() || "";
    const lista = busca
      ? todas.filter(emp =>
          emp.nome.toLowerCase().includes(busca) ||
          (emp.contrato?.beneficioOfertado||"").toLowerCase().includes(busca) ||
          (emp.contrato?.descricaoBeneficios||"").toLowerCase().includes(busca)
        )
      : todas;

    if (!lista.length) {
      el.innerHTML =
        '<div style="text-align:center;padding:48px 24px;color:var(--text-muted);">' +
          '<div style="font-size:2.5rem;margin-bottom:12px;"></div>' +
          (busca ? 'Nenhuma empresa encontrada para "' + busca + '".' : 'Nenhuma empresa parceira disponível no momento.') +
        '</div>';
      return;
    }

    el.innerHTML =
      '<div class="parceiros-grid">' +
        lista.map(emp => {
          const c = emp.contrato || {};
          const unids = (emp.unidades || []).length;
          const vig = c.dataVigencia
            ? new Date(c.dataVigencia + "T00:00:00").toLocaleDateString("pt-BR")
            : null;
          return '<div class="parceiro-card">' +
            // Cabeçalho
            '<div class="pc-header">' +
              '<div class="pc-icon"></div>' +
              '<div class="pc-info">' +
                '<div class="pc-nome">' + emp.nome + '</div>' +
                '<div class="pc-tipo">' + (c.tipoAcordo || "Empresa Parceira") + '</div>' +
              '</div>' +
            '</div>' +
            // Benefício em destaque
            '<div class="pc-beneficio">' +
              '<div class="pc-benef-label"> Desconto / Benefício</div>' +
              '<div class="pc-benef-valor">' + c.beneficioOfertado + '</div>' +
            '</div>' +
            // Regras de uso
            (c.regrasUtilizacao ? '<div class="pc-regras"> ' + c.regrasUtilizacao + '</div>' : '') +
            // Descrição adicional
            (c.descricaoBeneficios ? '<div class="pc-desc">' + c.descricaoBeneficios + '</div>' : '') +
            // Footer
            '<div class="pc-footer">' +
              (unids > 0 ? '<span class="pc-meta"><i class=\"bi bi-geo-alt\"></i> ' + unids + ' unidade' + (unids !== 1 ? 's' : '') + '</span>' : '') +
              (emp.telefone ? '<span class="pc-meta"> ' + emp.telefone + '</span>' : '') +
              (vig ? '<span class="pc-meta">⏰ Válido até ' + vig + '</span>' : '') +
            '</div>' +
            // Botão ver unidades
            (unids > 0 ? '<button class="pc-btn-mapa" onclick="verUnidadesParceiro(' + emp.id + ')"><i class=\"bi bi-geo-alt\"></i> Ver localização</button>' : '') +
          '</div>';
        }).join("") +
      '</div>' +
      '<p style="font-size:0.75rem;color:var(--text-muted);margin-top:16px;text-align:center;">' +
        ' ' + lista.length + ' empresa' + (lista.length !== 1 ? 's' : '') + ' parceira' + (lista.length !== 1 ? 's' : '') + ' disponíve' + (lista.length !== 1 ? 'is' : 'l') + ' · Apresente sua Carteirinha Digital AMAS para usufruir dos benefícios.' +
      '</p>';
  }

  window.renderCatalogoParceiros = renderCatalogoParceiros;

  // Busca com debounce
  let debounce;
  document.getElementById("buscaParceiros")?.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderCatalogoParceiros, 250);
  });

  window.verUnidadesParceiro = function(empId) {
    const emp = getEmpresarios().find(e => e.id === empId);
    if (!emp || !(emp.unidades || []).length) return;
    const endereco = emp.unidades[0].endereco;
    window.open("https://maps.google.com/maps?q=" + encodeURIComponent(endereco), "_blank");
  };
});
