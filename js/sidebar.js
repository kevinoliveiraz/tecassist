/**
 * ===========================================================================
 * sidebar.js — MONTA O MENU LATERAL E PROTEGE AS TELAS INTERNAS
 * ===========================================================================
 * Toda página "de dentro do sistema" (depois do login) chama:
 *
 * TecAssistLayout.montar("dashboard")
 *
 * passando o nome da própria página, pra saber qual item do menu marcar
 * como "ativo" (destacado em azul).
 *
 * Essa função também funciona como "proteção de rota": se ninguém estiver
 * logado, ela redireciona automaticamente para login.html.
 * ===========================================================================
 */

// Ícones SVG usados no menu lateral e nos cards do dashboard.
const ICONES = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  os: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 12h6M9 16h6"/></svg>`,
  clientes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  aparelhos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>`,
  agenda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  financeiro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5a2.5 2.5 0 012.5-1.5c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2a2.5 2.5 0 002.5-1.5"/></svg>`,
  estoque: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8L12 13l8.7-5M12 21V13"/></svg>`,
  relatorios: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 12l2 2 4-4"/></svg>`,
  comunicacoes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`,
  configuracoes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82"/></svg>`,
  garantias: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>`,
};

// Lista de todos os itens do menu. Pra adicionar uma nova página no menu,
// basta adicionar uma linha aqui.
const LINKS_MENU = [
  { chave: "dashboard", texto: "Dashboard", href: "dashboard.html", icone: "dashboard" },
  { chave: "clientes", texto: "Clientes", href: "clientes.html", icone: "clientes" },
  { chave: "ordens-servico", texto: "Ordem de Serviço", href: "ordens-servico.html", icone: "os" },
  { chave: "aparelhos", texto: "Aparelhos", href: "aparelhos.html", icone: "aparelhos" },
  { chave: "agenda", texto: "Agenda", href: "agenda.html", icone: "agenda" },
  { chave: "financeiro", texto: "Financeiro", href: "financeiro.html", icone: "financeiro" },
  { chave: "estoque", texto: "Estoque", href: "estoque.html", icone: "estoque" },
  { chave: "garantias", texto: "Garantias", href: "garantias.html", icone: "garantias" },
  { chave: "relatorios", texto: "Relatórios", href: "relatorios.html", icone: "relatorios" },
  { chave: "configuracoes", texto: "Configurações", href: "configuracoes.html", icone: "configuracoes" },
];

// Mapeamento centralizado de módulos e suas respectivas páginas internas
const MODULOS = {
  dashboard: ["dashboard"],
  clientes: ["clientes"],
  aparelhos: ["aparelhos"],
  "ordens-servico": [
    "ordens-servico",
    "os",
    "os-diagnostico",
    "os-financeiro",
    "os-impressao"
  ],
  agenda: ["agenda"],
  financeiro: ["financeiro"],
  estoque: ["estoque"],
  garantias: ["garantias"],
  relatorios: ["relatorios"],
  comunicacoes: ["comunicacoes"],
  configuracoes: ["configuracoes"]
};

const TecAssistLayout = {

  /**
   * Monta a sidebar + topbar no topo da página e retorna o usuário logado.
   * Se ninguém estiver logado, redireciona para login.html e retorna null.
   */
  montar(paginaAtiva) {
    // ---- Passo 1: proteção de rota ----
    if (!DB.estaAutenticado()) {
      window.location.href = "login.html";
      return null;
    }

    // Resolve qual módulo pai deve ficar ativo com base no mapeamento
    let chaveModuloAtivo = paginaAtiva;
    for (const [moduloPai, paginasFilhas] of Object.entries(MODULOS)) {
      if (paginasFilhas.includes(paginaAtiva)) {
        chaveModuloAtivo = moduloPai;
        break;
      }
    }

    // ---- Passo 2: monta o HTML dos links do menu ----
    const linksHtml = LINKS_MENU.map((link) => `
      <a href="${link.href}" class="sidebar-link ${link.chave === chaveModuloAtivo ? "active" : ""}">
        ${ICONES[link.icone]}
        <span>${link.texto}</span>
      </a>
    `).join("");

    // ---- Passo 3: injeta a sidebar/topbar no início do <body> ----
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-logo">
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" stroke="#fff" stroke-width="2.5" fill="rgba(255,255,255,0.1)"/>
              <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#fff"/>
            </svg>
            <span>TecAssist</span>
          </div>
          <nav class="sidebar-nav">${linksHtml}</nav>
          <div class="sidebar-footer">
            <div class="plano-card">
              <div class="plano-nome" id="sidebar-plano-nome">Carregando...</div>
              <div class="plano-info">Modo de testes (localStorage)</div>
            </div>
            <button class="btn-outline-white" id="btn-logout">Sair da conta</button>
            <button class="btn-outline-white" id="btn-reset" style="margin-top:8px; font-size:11px; opacity:0.7;">
              Resetar dados de teste
            </button>
          </div>
        </aside>

        <div class="main-content">
          <header class="topbar">
            <div class="topbar-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span>Buscar por cliente, OS ou aparelho...</span>
            </div>
            
            <div class="topbar-right-actions">
              <div class="notificacoes-container">
                <button id="btnNotificacoes" class="topbar-notification-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span id="contadorNotificacoes" class="notificacao-badge" style="display: none;">0</span>
                </button>

                <div id="caixaNotificacoes" class="notificacoes-dropdown">
                  <div class="notificacoes-header">
                    <span>Notificações</span>
                    <button id="btnMarcarLidas">Limpar não lidas</button>
                  </div>
                  <div id="listaNotificacoes" class="notificacoes-lista"></div>
                </div>
              </div>

              <div class="topbar-user">
                <div class="topbar-avatar" id="topbar-avatar">--</div>
                <div class="topbar-user-info">
                  <div class="topbar-user-name" id="topbar-user-name">Carregando...</div>
                  <div class="topbar-user-role" id="topbar-user-role">&nbsp;</div>
                </div>
              </div>
            </div>
          </header>
          <main class="page-body" id="page-body"></main>
        </div>
      </div>
    `);

    // ---- Passo 4: botão de sair ----
    document.getElementById("btn-logout").addEventListener("click", () => {
      DB.logout();
      window.location.href = "login.html";
    });

    // ---- Passo 5: botão de resetar dados (só existe nessa versão de testes) ----
    document.getElementById("btn-reset").addEventListener("click", () => {
      const confirmar = confirm("Isso vai apagar todos os dados de teste e recriar os dados de exemplo. Continuar?");
      if (confirmar) {
        DB.resetarTudo();
        window.location.href = "login.html";
      }
    });

    // ---- Passo 6: preenche o nome/cargo do usuário logado na topbar ----
    const usuario = DB.obterUsuarioLogado();
    if (usuario) {
      document.getElementById("topbar-user-name").textContent = usuario.nome;
      document.getElementById("topbar-user-role").textContent = usuario.cargo;
      document.getElementById("topbar-avatar").textContent = usuario.nome
        .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      document.getElementById("sidebar-plano-nome").textContent = usuario.nome_empresa;
    }

    // ---- Passo 7: inicializa o sistema de notificações ----
    this._inicializarNotificacoes();

    return usuario;
  },
  /**
   * LÓGICA DO SINO (Gerencia cliques e estados do dropdown)
   */
  _inicializarNotificacoes() {
    const btnSino = document.getElementById("btnNotificacoes");
    const caixa = document.getElementById("caixaNotificacoes");
    const btnMarcarLidas = document.getElementById("btnMarcarLidas");

    if (!btnSino || !caixa) return;

    // 1. Atualiza o contador vermelho com as pendentes
    this._atualizarContadorNotificacoes();

    // 2. Abre/Fecha a caixa ao clicar no sino
    btnSino.addEventListener("click", (e) => {
      e.stopPropagation();
      caixa.classList.toggle("show");
      
      if (caixa.classList.contains("show")) {
        this._renderizarListaNotificacoes();
      }
    });

    // 3. Fecha se clicar em qualquer outra parte da página
    document.addEventListener("click", () => {
      caixa.classList.remove("show");
    });

    // 4. Limpa as mensagens não lidas
    btnMarcarLidas.addEventListener("click", (e) => {
      e.stopPropagation();
      DB.marcarTodasNotificacoesComoLidas();
      this._atualizarContadorNotificacoes();
      this._renderizarListaNotificacoes();
    });
  },

  /**
   * Conta as mensagens no DB e muda a bolinha vermelha
   */
  _atualizarContadorNotificacoes() {
    const contadorEl = document.getElementById("contadorNotificacoes");
    if (!contadorEl) return;
    
    const naoLidas = DB.contarNotificacoesNaoLidas();

    if (naoLidas > 0) {
      contadorEl.textContent = naoLidas;
      contadorEl.style.display = "flex";
    } else {
      contadorEl.style.display = "none";
    }
  },

  /**
   * Renderiza la lista de mensagens no dropdown
   */
  _renderizarListaNotificacoes() {
    const listaEl = document.getElementById("listaNotificacoes");
    if (!listaEl) return;

    const notificacoes = DB.listarNotificacoes();

    if (notificacoes.length === 0) {
      listaEl.innerHTML = `<div class="notificacao-vazia">Nenhuma notificação por enquanto.</div>`;
      return;
    }

    listaEl.innerHTML = notificacoes.map(n => `
      <div class="notificacao-item ${n.lida ? 'lida' : 'nova'}" 
           onclick="DB.marcarNotificacaoComoLida('${n.id}'); TecAssistLayout._atualizarContadorNotificacoes(); TecAssistLayout._renderizarListaNotificacoes();">
        <div class="notificacao-item-titulo">${n.titulo}</div>
        <div class="notificacao-item-desc">${n.descricao}</div>
        <div class="notificacao-item-tempo">${new Date(n.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
    `).join('');
  }
};