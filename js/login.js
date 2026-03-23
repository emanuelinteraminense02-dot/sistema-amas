/* ─── LOGIN.JS v4.5 — Recuperação de Senha ─────────── */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Tema ───────────────────────────────────────── */
  ["btnTheme","btnTheme2"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", toggleTheme);
  });

  /* ── Toggle visibilidade de senha (todos os campos) */
  document.querySelectorAll(".toggle-pw").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === "password";
      target.type = isPass ? "text" : "password";
      btn.innerHTML = isPass ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });
  });

  /* ── Helpers ────────────────────────────────────── */
  const formLogin  = document.getElementById("formLogin");
  const erroEl     = document.getElementById("loginErro");
  const btnSubmit  = formLogin?.querySelector("button[type=submit]");

  function showErro(msg) {
    erroEl.textContent = msg;
    erroEl.classList.remove("hidden");
  }
  function hideErro() { erroEl.classList.add("hidden"); }

  /* ════════════════════════════════════════════════
     1. FORMULÁRIO DE LOGIN
  ════════════════════════════════════════════════ */
  formLogin?.addEventListener("submit", (e) => {
    e.preventDefault();
    hideErro();

    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    if (!email || !senha) { showErro("Preencha todos os campos."); return; }
    if (btnSubmit) { btnSubmit.textContent = "Entrando..."; btnSubmit.disabled = true; }

    setTimeout(() => {
      const usuario = autenticar(email, senha);

      if (!usuario) {
        showErro("E-mail ou senha incorretos. Tente novamente.");
        if (btnSubmit) { btnSubmit.textContent = "Entrar no sistema"; btnSubmit.disabled = false; }
        return;
      }

      const perfil = usuario.perfil || "associado";

      /* ── Verifica se senha expirou (reset pelo admin) */
      if (usuario.senhaExpirada === true) {
        // Salva sessão parcial para usar na redefinição
        setSessao({ ...usuario, _pendingRedefinir: true });
        registrarLog("Login com senha expirada", usuario.nome, perfil,
          "Redirecionado para troca obrigatória de senha");
        mostrarPainelRedefinir(usuario);
        if (btnSubmit) { btnSubmit.textContent = "Entrar no sistema"; btnSubmit.disabled = false; }
        return;
      }

      /* ── Login normal */
      registrarLog("Login realizado", usuario.nome, perfil, "Acesso via tela de login");
      setSessao(usuario);
      switch (perfil) {
        case "admin":      window.location.href = "admin.html";      break;
        case "associado":  window.location.href = "associado.html";  break;
        case "empresario": window.location.href = "empresario.html"; break;
        default: showErro("Perfil inválido.");
          if (btnSubmit) { btnSubmit.textContent = "Entrar no sistema"; btnSubmit.disabled = false; }
      }
    }, 280);
  });

  /* ════════════════════════════════════════════════
     2. PAINEL DE REDEFINIÇÃO OBRIGATÓRIA
  ════════════════════════════════════════════════ */
  function mostrarPainelRedefinir(usuario) {
    document.getElementById("panelLogin").classList.add("hidden");
    document.getElementById("panelRedefinir").classList.remove("hidden");
    document.getElementById("redefSub").textContent =
      "Olá, " + usuario.nome.split(" ")[0] + "! Por segurança, crie uma nova senha antes de continuar.";
  }

  // Indicador de força da senha
  document.getElementById("novaSenhaRedef")?.addEventListener("input", function() {
    const val = this.value;
    const forca = document.getElementById("senhaForca");
    if (!val) { forca.innerHTML = ""; return; }

    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const niveis = [
      { cls:"fraca",   txt:"Fraca",    cor:"#ef4444" },
      { cls:"fraca",   txt:"Fraca",    cor:"#ef4444" },
      { cls:"media",   txt:"Média",    cor:"#f59e0b" },
      { cls:"boa",     txt:"Boa",      cor:"#22c55e" },
      { cls:"forte",   txt:"Forte",    cor:"#16a34a" },
      { cls:"forte",   txt:"Forte",    cor:"#16a34a" },
    ];
    const n = niveis[Math.min(score, 5)];
    forca.innerHTML =
      '<div class="sf-bar">' +
        [1,2,3,4,5].map(i =>
          '<div class="sf-seg' + (i <= score ? ' sf-on' : '') + '" style="' +
          (i <= score ? 'background:' + n.cor : '') + '"></div>'
        ).join("") +
      '</div>' +
      '<span style="font-size:0.75rem;color:' + n.cor + ';font-weight:600;">' + n.txt + '</span>';
  });

  document.getElementById("formRedefinir")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nova    = document.getElementById("novaSenhaRedef").value;
    const confirm = document.getElementById("confirmaSenhaRedef").value;
    const erroR   = document.getElementById("redefErro");
    erroR.classList.add("hidden");

    if (nova !== confirm) {
      erroR.textContent = "As senhas não coincidem.";
      erroR.classList.remove("hidden"); return;
    }

    const sessao = getSessao();
    if (!sessao) { window.location.href = "login.html"; return; }

    const colecao = sessao.perfil === "associado" ? "associados" : "usuarios";
    const res = definirNovaSenha(sessao.id, colecao, nova);

    if (!res.ok) {
      erroR.textContent = res.erro;
      erroR.classList.remove("hidden"); return;
    }

    // Atualiza sessão
    const sessaoAtualizada = { ...sessao, senha: nova, senhaExpirada: false, primeiroLogin: false, _pendingRedefinir: false };
    setSessao(sessaoAtualizada);
    registrarLog("Nova senha definida", sessao.nome, sessao.perfil, "Senha redefinida com sucesso após reset");
    showToast("Nova senha salva! Redirecionando...", "success");
    setTimeout(() => {
      switch (sessao.perfil) {
        case "admin":      window.location.href = "admin.html";      break;
        case "associado":  window.location.href = "associado.html";  break;
        case "empresario": window.location.href = "empresario.html"; break;
        default:           window.location.href = "login.html";
      }
    }, 1200);
  });

  /* ════════════════════════════════════════════════
     3. MODAL ESQUECI MINHA SENHA
  ════════════════════════════════════════════════ */
  const modalEsqueci = document.getElementById("modalEsqueci");

  document.getElementById("btnEsqueci")?.addEventListener("click", () => {
    document.getElementById("esqueciEmail").value = "";
    document.getElementById("esqueciErro").textContent = "";
    document.getElementById("esqueciForm").classList.remove("hidden");
    document.getElementById("esqueciSucesso").classList.add("hidden");
    modalEsqueci.classList.remove("hidden");
    setTimeout(() => document.getElementById("esqueciEmail").focus(), 100);
  });

  function fecharModalEsqueci() { modalEsqueci.classList.add("hidden"); }
  document.getElementById("btnFecharEsqueci")?.addEventListener("click", fecharModalEsqueci);
  document.getElementById("btnFecharEsqueciSucesso")?.addEventListener("click", fecharModalEsqueci);
  modalEsqueci?.addEventListener("click", (e) => { if (e.target === modalEsqueci) fecharModalEsqueci(); });

  document.getElementById("btnSolicitarReset")?.addEventListener("click", () => {
    const email  = document.getElementById("esqueciEmail").value.trim();
    const erroE  = document.getElementById("esqueciErro");
    erroE.textContent = "";

    if (!email) { erroE.textContent = "Digite seu e-mail."; return; }

    const btn = document.getElementById("btnSolicitarReset");
    btn.textContent = "Enviando...";
    btn.disabled = true;

    setTimeout(() => {
      const res = solicitarResetSenha(email);

      if (!res.ok) {
        erroE.textContent = res.erro;
        btn.textContent = "Enviar solicitação";
        btn.disabled = false;
        return;
      }

      // Mostra estado de sucesso
      document.getElementById("esqueciForm").classList.add("hidden");
      document.getElementById("esqueciSucessoNome").textContent =
        "Solicitação enviada, " + res.nome.split(" ")[0] + "!";
      document.getElementById("esqueciSucesso").classList.remove("hidden");
      btn.textContent = "Enviar solicitação";
      btn.disabled = false;
    }, 400);
  });

  // Permite enviar com Enter no campo de e-mail
  document.getElementById("esqueciEmail")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("btnSolicitarReset").click();
    }
  });

  /* ════════════════════════════════════════════════
     4. RESET DE DADOS DE TESTE
  ════════════════════════════════════════════════ */
  document.getElementById("btnResetDados")?.addEventListener("click", () => {
    if (!confirm("Isso vai apagar todos os dados e restaurar os dados de demonstração. Confirma?")) return;
    localStorage.clear();
    inicializarBanco();
    inicializarDoacoes();
    inicializarContratosDemo();
    const btn = document.getElementById("btnResetDados");
    btn.textContent = "Dados restaurados!";
    btn.style.color = "#16a34a";
    btn.style.borderColor = "#16a34a";
    setTimeout(() => {
      btn.textContent = "Restaurar dados de teste";
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 2500);
  });

  /* ════════════════════════════════════════════════
     5. VERIFICA SESSÃO PENDENTE (senha expirada)
        Ao recarregar a página com sessão ativa
  ════════════════════════════════════════════════ */
  const sessaoAtiva = getSessao();
  if (sessaoAtiva?._pendingRedefinir === true) {
    mostrarPainelRedefinir(sessaoAtiva);
  }
});
