/* ─── INDEX.JS v4.3 ──────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Estatísticas animadas no hero ─────────────── */
  const est = getEstatisticas();
  const numEl1 = document.getElementById("statTotal");
  const numEl2 = document.getElementById("statRegular");
  if (numEl1) animCounter(numEl1, est.total);
  if (numEl2) animCounter(numEl2, est.regulares);

  function animCounter(el, target) {
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const t = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n >= target) clearInterval(t);
    }, 40);
  }

  /* ── Helpers ────────────────────────────────────── */
  const CAT_ICON   = { comunicado:'<i class="bi bi-megaphone"></i>', parceria:'<i class="bi bi-handshake"></i>', social:'<i class="bi bi-heart"></i>', evento:'<i class="bi bi-calendar-event"></i>', conquista:'<i class="bi bi-trophy"></i>', capacitacao:'<i class="bi bi-book"></i>' };
  const CAT_LABEL  = { comunicado:"Comunicado", parceria:"Parceria", social:"Ação Social", evento:"Evento", conquista:"Conquista", capacitacao:"Capacitação" };
  const TIPO_ICON  = { social:'<i class="bi bi-heart"></i>', capacitacao:'<i class="bi bi-book"></i>', parceria:'<i class="bi bi-handshake"></i>', cultural:'<i class="bi bi-stars"></i>', reuniao:'<i class="bi bi-people"></i>' };
  const TIPO_LABEL = { social:"Ação Social", capacitacao:"Capacitação", parceria:"Parceria", cultural:"Cultural", reuniao:"Assembleia" };
  const MESES_ABREV = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const MESES_EXT   = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

  function formatDataPublica(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d} de ${MESES_EXT[parseInt(m)-1]} de ${y}`;
  }

  // evStatus: status controlado pelo Admin ("Aberto", "Em Breve", "Encerrado")
  function diasRestantes(iso, evStatus) {
    const diff = (new Date(iso + "T00:00:00") - new Date()) / 86400000;
    // Admin fechou explicitamente → vermelho
    if (evStatus === "Encerrado") return { txt:"Encerrado", cls:"enc" };
    // Admin marcou Em Breve → amarelo, independente de data
    if (evStatus === "Em Breve")  return { txt:"Em breve",  cls:"embreve" };
    // Aberto mas data já passou → verde "Realizado"
    if (diff < -1) return { txt:"Realizado", cls:"realizado" };
    if (diff < 0)  return { txt:"Hoje!",     cls:"hoje" };
    if (diff < 1)  return { txt:"Hoje!",     cls:"hoje" };
    if (diff < 2)  return { txt:"Amanhã",    cls:"breve" };
    if (diff < 8)  return { txt:`Em ${Math.ceil(diff)} dias`, cls:"breve" };
    return           { txt:`Em ${Math.ceil(diff)} dias`, cls:"futuro" };
  }

  /* ═══════════════════════════════════════════════════
     NOTÍCIAS PÚBLICAS — com "Ver Mais"
  ═══════════════════════════════════════════════════ */
  const NOTICIAS_INICIAL = 3;
  let noticiasExpandidas = false;

  function renderNoticiasPublicas(mostrarTodas) {
    const container = document.getElementById("publicNoticias");
    if (!container) return;

    const lista = getNoticias();
    if (!lista.length) {
      container.innerHTML = `<div class="pub-loading">Nenhuma notícia publicada ainda.</div>`;
      return;
    }

    const exibir = mostrarTodas ? lista : lista.slice(0, NOTICIAS_INICIAL);
    const temMais = lista.length > NOTICIAS_INICIAL;

    container.innerHTML = exibir.map((n, idx) => {
      const isDestaque = n.destaque && idx === 0;
      return `
        <div class="noticia-card ${isDestaque ? "destaque" : ""} cat-${n.categoria}" onclick="abrirNoticia(${n.id})">
          <div class="nc-stripe"></div>
          <div class="nc-body">
            <div class="nc-meta-top">
              <span class="nc-cat ${n.categoria}">${CAT_ICON[n.categoria] || '<i class="bi bi-newspaper"></i>'} ${CAT_LABEL[n.categoria] || n.categoria}</span>
              ${n.destaque ? '<span class="nc-destaque-tag">⭐ Destaque</span>' : ""}
            </div>
            <div class="nc-title">${n.titulo}</div>
            <div class="nc-resumo">${n.resumo}</div>
            <div class="nc-footer">
              <span><i class="bi bi-calendar3"></i> ${formatDataPublica(n.publicadaEm)}</span>
              <span class="nc-ler-mais">Ler mais →</span>
            </div>
          </div>
        </div>`;
    }).join("");

    // Botão "Ver Mais / Ver Menos"
    let btnWrap = document.getElementById("noticiasVerMaisWrap");
    if (!btnWrap) {
      btnWrap = document.createElement("div");
      btnWrap.id = "noticiasVerMaisWrap";
      btnWrap.className = "ver-mais-wrap";
      container.parentNode.insertBefore(btnWrap, container.nextSibling);
    }
    if (temMais) {
      btnWrap.innerHTML = mostrarTodas
        ? `<button class="btn-ver-mais" onclick="toggleNoticias(false)">
            <span>Ver menos</span> <span class="vm-chevron vm-up">▲</span>
           </button>`
        : `<button class="btn-ver-mais" onclick="toggleNoticias(true)">
            <span>Ver todas as ${lista.length} notícias</span>
            <span class="vm-chevron">▼</span>
           </button>`;
    } else {
      btnWrap.innerHTML = "";
    }

    // Re-anima cards novos
    container.querySelectorAll(".noticia-card").forEach((el, i) => {
      el.style.animationDelay = `${i * 0.06}s`;
      el.classList.add("anim-on-scroll", "visible");
    });
  }

  window.toggleNoticias = function(expandir) {
    noticiasExpandidas = expandir;
    renderNoticiasPublicas(expandir);
    if (!expandir) {
      document.getElementById("noticias")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  };

  /* ═══════════════════════════════════════════════════
     EVENTOS PÚBLICOS — com "Ver Mais"
  ═══════════════════════════════════════════════════ */
  const EVENTOS_INICIAL = 3;
  let eventosExpandidos = false;

  function renderEventosPublicos(mostrarTodos) {
    const container = document.getElementById("publicEventos");
    if (!container) return;

    // Mostra eventos que o Admin NÃO fechou explicitamente,
    // independente da data — Admin controla o status, não a data sozinha.
    // Também inclui eventos futuros e destaques de qualquer estado.
    const hoje = new Date();
    const lista = getEventos()
      .filter(e => {
        const statusAdmin = e.status || "Aberto";
        // Admin fechou explicitamente → só mostra se for destaque
        if (statusAdmin === "Encerrado") return e.destaque === true;
        // Aberto ou Em Breve: sempre mostra
        return true;
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    if (!lista.length) {
      container.innerHTML = `<div class="pub-loading">Nenhum evento programado no momento.</div>`;
      return;
    }

    const exibir = mostrarTodos ? lista : lista.slice(0, EVENTOS_INICIAL);
    const temMais = lista.length > EVENTOS_INICIAL;

    container.innerHTML = exibir.map(ev => {
      const [y, m, d] = ev.data.split("-");
      // Status controlado pelo Admin — calculado ANTES do countdown
      const evStatus = ev.status || "Aberto";
      const cd = diasRestantes(ev.data, evStatus);

      // Dados REAIS do LocalStorage — não fictícios
      const inscritosReal  = (ev.inscritos   || []).length;
      const vagasTotais    = ev.vagasTotais  || ev.vagas || 0;
      const filaEspera     = (ev.listaEspera || []).length;
      const vagasRestantes = vagasTotais > 0 ? Math.max(0, vagasTotais - inscritosReal) : null;
      const pct            = vagasTotais > 0 ? Math.min(100, Math.round((inscritosReal / vagasTotais) * 100)) : null;
      const barColor       = !pct ? "#22c55e" : pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#22c55e";

      // Selo de status controlado pelo Admin — reflexo direto do localStorage
      const statusSelo = evStatus === "Aberto"
        ? '<span class="er-status-badge er-status-aberto">Inscrições abertas</span>'
        : evStatus === "Em Breve"
        ? '<span class="er-status-badge er-status-embreve">Em breve</span>'
        : '<span class="er-status-badge er-status-encerrado">Encerrado</span>';

      // Info de vagas com dados reais
      const vagasInfoTxt = vagasTotais > 0
        ? (inscritosReal + "/" + vagasTotais + " vagas")
        : "";
      const vagasRestantesTxt = vagasRestantes === 0
        ? "<strong style='color:#ef4444;'>Esgotado</strong>"
        : vagasRestantes !== null
          ? vagasRestantes + " vaga" + (vagasRestantes !== 1 ? "s" : "") + " restante"
          : (pct !== null ? pct + "% preenchido" : "");

      // CSS class for the whole card based on Admin status
      const rowStatusCls = evStatus === 'Encerrado' ? 'ev-encerrado'
        : evStatus === 'Em Breve'  ? 'ev-embreve'
        : cd.cls === 'realizado'   ? 'ev-realizado'
        : cd.cls === 'hoje'        ? 'ev-hoje'
        : cd.cls === 'breve'       ? 'ev-breve'
        : 'ev-aberto';

      return '<div class="evento-row ' + (ev.destaque ? 'destaque ' : '') + rowStatusCls + '">' +
        '<div class="er-date-block ' + rowStatusCls + '">' +
          '<div class="er-day">' + d + '</div>' +
          '<div class="er-month">' + MESES_ABREV[parseInt(m)-1] + '</div>' +
          '<div class="er-year">' + y + '</div>' +
        '</div>' +
        '<div class="er-info">' +
          '<div class="er-badges">' +
            '<span class="er-tipo ' + ev.tipo + '">' + (TIPO_ICON[ev.tipo] || '<i class="bi bi-calendar-event"></i>') + " " + (TIPO_LABEL[ev.tipo] || ev.tipo) + '</span>' +
            statusSelo +
            (ev.destaque ? '<span class="er-destaque-tag">⭐ Destaque</span>' : "") +
          '</div>' +
          '<div class="er-titulo">' + ev.titulo + '</div>' +
          '<div class="er-desc">' + ev.descricao + '</div>' +
          '<div class="er-meta">' +
            '<span><i class="bi bi-clock"></i> ' + ev.horario + '</span>' +
            '<span><i class="bi bi-geo-alt"></i> ' + ev.local + '</span>' +
            (vagasInfoTxt ? '<span><i class="bi bi-ticket-perforated"></i> ' + vagasInfoTxt + '</span>' : "") +
            (filaEspera > 0 ? '<span style="color:#f59e0b;">⏳ ' + filaEspera + ' na espera</span>' : "") +
          '</div>' +
          (pct !== null && evStatus !== "Encerrado" ?
            '<div class="er-progress-wrap">' +
              '<div class="er-progress-bar">' +
                '<div class="er-progress-fill" style="width:' + pct + '%;background:' + barColor + ';"></div>' +
              '</div>' +
              '<span class="er-progress-label">' + vagasRestantesTxt + '</span>' +
            '</div>' : "") +
        '</div>' +
        '<div class="er-side">' +
          '<span class="er-countdown ' + cd.cls + '">' + cd.txt + '</span>' +
        '</div>' +
      '</div>';
    }).join("");

    // Botão "Ver Mais / Ver Menos"
    let btnWrap = document.getElementById("eventosVerMaisWrap");
    if (!btnWrap) {
      btnWrap = document.createElement("div");
      btnWrap.id = "eventosVerMaisWrap";
      btnWrap.className = "ver-mais-wrap";
      container.parentNode.insertBefore(btnWrap, container.nextSibling);
    }
    if (temMais) {
      btnWrap.innerHTML = mostrarTodos
        ? `<button class="btn-ver-mais" onclick="toggleEventos(false)">
            <span>Ver menos</span> <span class="vm-chevron vm-up">▲</span>
           </button>`
        : `<button class="btn-ver-mais" onclick="toggleEventos(true)">
            <span>Ver todos os ${lista.length} eventos</span>
            <span class="vm-chevron">▼</span>
           </button>`;
    } else {
      btnWrap.innerHTML = "";
    }

    // Re-anima
    container.querySelectorAll(".evento-row").forEach((el, i) => {
      el.style.animationDelay = `${i * 0.07}s`;
      el.classList.add("anim-on-scroll", "visible");
    });
  }

  window.toggleEventos = function(expandir) {
    eventosExpandidos = expandir;
    renderEventosPublicos(expandir);
    if (!expandir) {
      document.getElementById("eventos")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  };

  /* ── Render inicial ─────────────────────────────── */
  renderNoticiasPublicas(false);
  renderEventosPublicos(false);

  /* ═══════════════════════════════════════════════════
     MODAL DE NOTÍCIA
  ═══════════════════════════════════════════════════ */
  window.abrirNoticia = (id) => {
    const n = getNoticias().find(x => x.id === id);
    if (!n) return;
    const modal = document.getElementById("modalNoticiaPublica");
    document.getElementById("mnpTitulo").textContent = n.titulo;
    document.getElementById("mnpBody").innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
        <span class="nc-cat ${n.categoria}">${CAT_ICON[n.categoria] || '<i class="bi bi-newspaper"></i>'} ${CAT_LABEL[n.categoria] || n.categoria}</span>
        ${n.destaque ? '<span class="nc-destaque-tag">⭐ Destaque</span>' : ""}
        <span style="color:var(--text-muted);font-size:0.8rem;"><i class="bi bi-calendar3"></i> ${formatDataPublica(n.publicadaEm)} · ✍️ ${n.autor}</span>
      </div>
      <p style="font-style:italic;color:var(--text-secondary);font-size:0.9rem;line-height:1.65;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:14px;">${n.resumo}</p>
      <p style="color:var(--text-primary);font-size:0.92rem;line-height:1.8;">${n.conteudo}</p>`;
    modal.classList.remove("hidden");
  };

  document.getElementById("mnpClose")?.addEventListener("click", () => {
    document.getElementById("modalNoticiaPublica").classList.add("hidden");
  });
  document.getElementById("modalNoticiaPublica")?.addEventListener("click", function(e) {
    if (e.target === this) this.classList.add("hidden");
  });

  /* ═══════════════════════════════════════════════════
     FORMULÁRIO DE ASSOCIAÇÃO (página pública)
  ═══════════════════════════════════════════════════ */
  const fCpf = document.getElementById("f_cpf");
  const fTel = document.getElementById("f_tel");
  if (fCpf) fCpf.addEventListener("input", () => maskCPF(fCpf));
  if (fTel) fTel.addEventListener("input", () => maskTel(fTel));

  const formAssociar = document.getElementById("formAssociar");
  if (formAssociar) {
    formAssociar.addEventListener("submit", (e) => {
      e.preventDefault();
      const msgEl  = document.getElementById("formMsg");
      msgEl.textContent = "";
      const nome   = document.getElementById("f_nome").value.trim();
      const cpf    = document.getElementById("f_cpf").value.trim();
      const nasc   = document.getElementById("f_nasc").value;
      const tel    = document.getElementById("f_tel").value.trim();
      const email  = document.getElementById("f_email").value.trim();
      const end    = document.getElementById("f_end").value.trim();
      const prof   = document.getElementById("f_prof").value.trim();
      const motivo = document.getElementById("f_motivo").value.trim();

      if (!nome || !cpf || !nasc || !tel || !email || !end || !prof || !motivo) {
        msgEl.textContent = "Preencha todos os campos obrigatórios."; return;
      }
      if (!validarCPF(cpf)) { msgEl.textContent = "CPF inválido."; return; }

      const lista = getSolicitacoes();
      if (lista.some(s => s.cpf && s.cpf.replace(/\D/g,"") === cpf.replace(/\D/g,""))) {
        msgEl.textContent = "Já existe uma solicitação com este CPF."; return;
      }

      const nova = {
        id: Date.now(), nome, cpf, email,
        telefone: tel, nascimento: nasc,
        endereco: end, profissao: prof,
        observacoes: motivo,
        dataSolicitacao: new Date().toISOString().split("T")[0],
        status: "Pendente"
      };
      salvarSolicitacoes([...lista, nova]);
      formAssociar.style.display = "none";
      document.getElementById("formSucesso").classList.remove("hidden");
    });
  }

  /* ── IntersectionObserver – animações de entrada ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll(".beneficio-card, .projeto-card, .valor-item").forEach(el => {
    el.classList.add("anim-on-scroll");
    observer.observe(el);
  });
});
