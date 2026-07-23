/**
 * ===========================================================================
 * garantias.js — CONTROLADOR DO MÓDULO DE CONTROLE DE GARANTIAS
 * ===========================================================================
 */

const Garantias = {
  // Estado local e reativo do módulo
  estado: {
    itens: [],
    pesquisa: "",
    filtroStatus: "Todos", // Todos | Ativa | Expirando | Expirada
    garantiaSelecionadaId: null
  },

  /** Ponto de entrada acionado pelo ciclo de vida da página */
  init() {
    // 1. Renderiza o frame e barra lateral do TecAssist
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("garantias");
    }

    // 2. Carrega dados persistidos do LocalStorage
    this.carregar();

    // 3. Define a primeira garantia como selecionada por padrão para o painel lateral, se houver
    if (this.estado.itens.length > 0 && !this.estado.garantiaSelecionadaId) {
      this.estado.garantiaSelecionadaId = this.estado.itens[0].id;
    }

    // 4. Renderiza a interface reativa
    this.renderizar();
  },

  /** Persistência e Sincronização Local */
  carregar() {
    const dadosLocais = localStorage.getItem("tecassist_garantias");
    if (dadosLocais) {
      this.estado.itens = JSON.parse(dadosLocais);
    } else {
      // Massa de dados mockada fiel à captura de tela enviada para homologação
      this.estado.itens = [
        {
          id: "GAR-000123",
          os: "#000123",
          cliente: "João Silva",
          aparelho: "iPhone 11",
          numeroSerie: "DX3H7K2N73F2",
          cor: "Preto",
          imei: "356789115678912",
          servicoPeca: "Troca de tela",
          prazoDias: 90,
          dataInicio: "2026-07-24",
          dataExpiracao: "2026-10-22",
          status: "Ativa",
          telefone: "(11) 98765-4321"
        },
        {
          id: "GAR-000122",
          os: "#000122",
          cliente: "Maria Oliveira",
          aparelho: "Samsung A54",
          numeroSerie: "ZA892K1L90P4",
          cor: "Azul",
          imei: "356123456789012",
          servicoPeca: "Troca de bateria",
          prazoDias: 90,
          dataInicio: "2026-07-20",
          dataExpiracao: "2026-10-18",
          status: "Ativa",
          telefone: "(11) 99999-1122"
        },
        {
          id: "GAR-000121",
          os: "#000121",
          cliente: "Rafael Costa",
          aparelho: "Motorola G60",
          numeroSerie: "BR782M2X11K9",
          cor: "Cinza",
          imei: "354987654321098",
          servicoPeca: "Conector de carga",
          prazoDias: 90,
          dataInicio: "2026-07-10",
          dataExpiracao: "2026-10-08",
          status: "Expirando",
          telefone: "(21) 98888-7766"
        },
        {
          id: "GAR-000119",
          os: "#000119",
          cliente: "Pedro Santos",
          aparelho: "Xiaomi Redmi Note 12",
          numeroSerie: "XM991L2P33O0",
          cor: "Verde",
          imei: "358111222333444",
          servicoPeca: "Troca de tela",
          prazoDias: 90,
          dataInicio: "2026-06-15",
          dataExpiracao: "2026-09-12",
          status: "Expirada",
          telefone: "(11) 97777-5544"
        }
      ];
      this.salvar();
    }
  },

  salvar() {
    localStorage.setItem("tecassist_garantias", JSON.stringify(this.estado.itens));
  },

  /** Criação de Nova Apólice de Garantia */
  criar(novaGarantia) {
    novaGarantia.id = "GAR-" + Math.floor(100000 + Math.random() * 900000);
    this.estado.itens.unshift(novaGarantia);
    this.estado.garantiaSelecionadaId = novaGarantia.id;
    this.salvar();
    this.renderizar();
  },

  /** Motores de Cálculo e Filtros Rápidos */
  calcularMetricas() {
    let ativas = 0;
    let expirando = 0;
    let expiradas = 0;

    this.estado.itens.forEach(g => {
      if (g.status === "Ativa") ativas++;
      if (g.status === "Expirando") expirando++;
      if (g.status === "Expirada") expiradas++;
    });

    return { ativas, expirando, expiradas, total: this.estado.itens.length };
  },

  filtrarGarantias() {
    return this.estado.itens.filter(g => {
      const matchPesquisa = !this.estado.pesquisa || 
        g.cliente.toLowerCase().includes(this.estado.pesquisa.toLowerCase()) ||
        g.os.toLowerCase().includes(this.estado.pesquisa.toLowerCase()) ||
        g.aparelho.toLowerCase().includes(this.estado.pesquisa.toLowerCase());
        
      const matchStatus = this.estado.filtroStatus === "Todos" || g.status === this.estado.filtroStatus;
      
      return matchPesquisa && matchStatus;
    });
  },

  /** Renderização de Interface Dinâmica */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    const metricas = this.calcularMetricas();
    const listaFiltrada = this.filtrarGarantias();
    const selecionada = this.estado.itens.find(g => g.id === this.estado.garantiaSelecionadaId) || listaFiltrada[0];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Controle de garantia</h1>
          <p class="page-subtitle">Acompanhe todas as garantias dos serviços e peças. Saiba o que está ativo, próximo de expirar ou já expirado.</p>
        </div>
        <button class="btn btn-primary" onclick="Garantias.abrirModalCadastro()">
          <i class="fas fa-plus"></i> Nova garantia
        </button>
      </div>

      <div class="grid-cards" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-check-circle"></i></div>
          <div>
            <div class="kpi-label">Ativas</div>
            <div class="kpi-value">${metricas.ativas}</div>
            <span style="font-size: 11px; color: var(--texto-secundario);">Garantias ativas</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amarelo"><i class="fas fa-clock"></i></div>
          <div>
            <div class="kpi-label">Expirando em 30 dias</div>
            <div class="kpi-value">${metricas.expirando}</div>
            <span style="font-size: 11px; color: var(--texto-secundario);">Garantias</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-times-circle"></i></div>
          <div>
            <div class="kpi-label">Expiradas</div>
            <div class="kpi-value">${metricas.expiradas}</div>
            <span style="font-size: 11px; color: var(--texto-secundario);">Garantias</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon azul"><i class="fas fa-sync"></i></div>
          <div>
            <div class="kpi-label">Total</div>
            <div class="kpi-value">${metricas.total}</div>
            <span style="font-size: 11px; color: var(--texto-secundario);">Garantias cadastradas</span>
          </div>
        </div>
      </div>

      <div class="card-panel" style="margin-bottom: 20px; padding: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 12px;">
          <input type="text" id="filtro-gar-pesquisa" class="form-control" placeholder="Buscar por cliente, OS ou aparelho..." value="${this.estado.pesquisa}">
          <select id="filtro-gar-status" class="form-control">
            <option value="Todos" ${this.estado.filtroStatus === 'Todos' ? 'selected' : ''}>Todos os status</option>
            <option value="Ativa" ${this.estado.filtroStatus === 'Ativa' ? 'selected' : ''}>Ativa</option>
            <option value="Expirando" ${this.estado.filtroStatus === 'Expirando' ? 'selected' : ''}>Expirando</option>
            <option value="Expirada" ${this.estado.filtroStatus === 'Expirada' ? 'selected' : ''}>Expirada</option>
          </select>
        </div>
      </div>

      <div class="grid-2col">
        
        <div class="card-panel" style="padding: 0; overflow: hidden; height: fit-content;">
          <div style="padding: 16px; font-weight: 700; border-bottom: 1px solid var(--borda);">Lista de garantias</div>
          <div class="tabela-container">
            <table class="tabela-padrao">
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Cliente</th>
                  <th>Serviço / Peça</th>
                  <th>Garantia</th>
                  <th>Início</th>
                  <th>Expira em</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${listaFiltrada.length === 0 ? `
                  <tr><td colspan="7" class="os-vazio-texto" style="padding:30px; text-align:center;">Nenhuma garantia localizada.</td></tr>
                ` : listaFiltrada.map(g => `
                  <tr onclick="Garantias.selecionarGarantia('${g.id}')" style="cursor:pointer; ${this.estado.garantiaSelecionadaId === g.id ? 'background: var(--azul-claro);' : ''}">
                    <td><b style="color: var(--azul-primario);">${g.os}</b></td>
                    <td>
                      <div style="font-weight: 600;">${g.cliente}</div>
                      <small style="color: var(--texto-secundario); font-size:11px;">${g.aparelho}</small>
                    </td>
                    <td><span style="font-size:13px;">${g.servicoPeca}</span></td>
                    <td>${g.prazoDias} dias</td>
                    <td>${this.formatarDataBr(g.dataInicio)}</td>
                    <td style="font-weight: 500; color: ${g.status === 'Expirada' ? 'var(--vermelho)' : 'inherit'};">${this.formatarDataBr(g.dataExpiracao)}</td>
                    <td>
                      <span class="badge ${g.status === 'Ativa' ? 'verde' : g.status === 'Expirando' ? 'amarelo' : 'vermelho'}">
                        ${g.status}
                      </span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card-panel" id="painel-inspecao-garantia" style="height: fit-content; position: sticky; top: 80px;">
          ${this.renderizarPainelLateral(selecionada)}
        </div>

      </div>

      <div id="modal-container-garantias"></div>
    `;

    this.vincularEventos();
  },

  renderizarPainelLateral(g) {
    if (!g) {
      return `<div style="text-align:center; padding: 40px; color: var(--texto-terciario);">Selecione uma garantia para visualizar a ficha técnica completa.</div>`;
    }

    const corStatus = g.status === 'Ativa' ? 'var(--verde)' : g.status === 'Expirando' ? 'var(--amarelo)' : 'var(--vermelho)';
    const bgStatus = g.status === 'Ativa' ? 'var(--verde-bg)' : g.status === 'Expirando' ? 'var(--amarelo-bg)' : 'var(--vermelho-bg)';

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
        <h3 style="margin:0; font-size: 14px; font-weight:700;">Detalhes da garantia</h3>
        <span class="badge ${g.status === 'Ativa' ? 'verde' : g.status === 'Expirando' ? 'amarelo' : 'vermelho'}">${g.status}</span>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 16px; font-weight:700; margin-bottom: 2px;">${g.servicoPeca}</h4>
        <span style="font-size: 13px; color: var(--texto-secundario);">OS ${g.os}</span><br>
        <small style="color: var(--texto-terciario);">Aberta em: ${this.formatarDataBr(g.dataInicio)}</small>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--fundo-pagina); padding: 12px; border-radius: var(--raio-sm); margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="topbar-avatar" style="width:32px; height:32px; font-size:12px;">${g.cliente.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}</div>
          <div>
            <div style="font-weight:600; font-size:13px;">${g.cliente}</div>
            <div style="font-size:11.5px; color: var(--texto-secundario);">${g.telefone || 'Sem telefone'}</div>
          </div>
        </div>
        ${g.telefone ? `<a href="https://wa.me/55${g.telefone.replace(/\D/g,'')}" target="_blank" style="color: #25D366; font-size: 18px;"><i class="fab fa-whatsapp"></i></a>` : ''}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-bottom: 20px; font-size: 13px; border-bottom: 1px solid var(--borda); padding-bottom: 16px;">
        <div>
          <span style="color: var(--texto-secundario); display:block; font-size:11px;">Aparelho</span>
          <strong style="color: var(--texto-principal); font-weight:600;">${g.aparelho}</strong>
        </div>
        <div>
          <span style="color: var(--texto-secundario); display:block; font-size:11px;">Nº de série</span>
          <strong style="color: var(--texto-principal); font-weight:600;">${g.numeroSerie || 'N/A'}</strong>
        </div>
        <div>
          <span style="color: var(--texto-secundario); display:block; font-size:11px;">Cor</span>
          <strong style="color: var(--texto-principal); font-weight:600;">${g.cor || 'N/A'}</strong>
        </div>
        <div>
          <span style="color: var(--texto-secundario); display:block; font-size:11px;">IMEI</span>
          <strong style="color: var(--texto-principal); font-weight:600;">${g.imei || 'N/A'}</strong>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; font-size: 13px;">
        <h5 style="font-weight: 700; font-size: 12px; color: var(--texto-principal); text-transform: uppercase;">Informações da garantia</h5>
        <div style="display:flex; justify-content: space-between;">
          <span style="color: var(--texto-secundario);">Tipo</span>
          <span style="font-weight: 600;">Serviço</span>
        </div>
        <div style="display:flex; justify-content: space-between;">
          <span style="color: var(--texto-secundario);">Serviço / Peça</span>
          <span style="font-weight: 600;">${g.servicoPeca}</span>
        </div>
        <div style="display:flex; justify-content: space-between;">
          <span style="color: var(--texto-secundario);">Garantia</span>
          <span style="font-weight: 600;">${g.prazoDias} dias</span>
        </div>
        <div style="display:flex; justify-content: space-between;">
          <span style="color: var(--texto-secundario);">Início da garantia</span>
          <span style="font-weight: 600;">${this.formatarDataBr(g.dataInicio)}</span>
        </div>
        <div style="display:flex; justify-content: space-between;">
          <span style="color: var(--texto-secundario);">Expira em</span>
          <span style="font-weight: 700; color: ${g.status === 'Expirada' ? 'var(--vermelho)' : 'var(--verde)'};">${this.formatarDataBr(g.dataExpiracao)}</span>
        </div>
      </div>

      <div style="background: ${bgStatus}; border: 1px solid ${corStatus}40; padding: 12px; border-radius: var(--raio-sm); font-size: 12.5px; margin-bottom: 20px; display:flex; gap:10px; align-items:flex-start;">
        <i class="fas fa-info-circle" style="color: ${corStatus}; margin-top:2px;"></i>
        <span style="color: var(--texto-principal);">
          ${g.status === 'Ativa' ? '<b>Esta garantia está ativa.</b> Se o cliente voltar dentro do período de garantia, você pode abrir uma nova OS vinculada.' : g.status === 'Expirando' ? '<b>Atenção:</b> Esta cobertura está prestes a expirar nos próximos dias.' : '<b>Garantia expirada.</b> O período de cobertura legal e amigável deste serviço foi encerrado.'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 90px; gap: 10px;">
        <button class="btn btn-secondary" style="font-size:12.5px; padding:8px 12px; color: var(--azul-primario); border-color: var(--azul-primario);" onclick="alert('Funcionalidade vinculada ao gerador de OS de Garantia.')">
          Abrir nova OS (Garantia)
        </button>
        <button class="btn btn-secondary" style="font-size:12.5px; padding:8px 12px;" onclick="location.href='os.html'">
          Ver OS
        </button>
      </div>
    `;
  },

  selecionarGarantia(id) {
    this.estado.garantiaSelecionadaId = id;
    this.renderizar();
  },

  alterarFiltros() {
    this.estado.pesquisa = document.getElementById("filtro-gar-pesquisa").value;
    this.estado.filtroStatus = document.getElementById("filtro-gar-status").value;
    this.renderizar();
  },

  vincularEventos() {
    const inputBusca = document.getElementById("filtro-gar-pesquisa");
    const selectStatus = document.getElementById("filtro-gar-status");

    if (inputBusca) {
      inputBusca.addEventListener("input", () => this.alterarFiltros());
    }
    if (selectStatus) {
      selectStatus.addEventListener("change", () => this.alterarFiltros());
    }
  },

  /** Modal de Emissão / Cadastro de Apólice */
  abrirModalCadastro() {
    const modalContainer = document.getElementById("modal-container-garantias");
    const hojeIso = new Date().toISOString().split('T')[0];

    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="card-panel" style="width: 100%; max-width: 500px; box-shadow: var(--sombra-card); padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
            <h3 style="margin:0; font-size: 15px; font-weight:700;">Emitir Termo de Garantia</h3>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-container-garantias').innerHTML='';" style="border:none;"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-gar-cadastro" onsubmit="event.preventDefault(); Garantias.processarSubmit();">
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
              
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Nº da OS</label>
                  <input type="text" class="form-control" name="os" placeholder="#000124" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Cliente</label>
                  <input type="text" class="form-control" name="cliente" placeholder="Nome Completo" required>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Aparelho</label>
                  <input type="text" class="form-control" name="aparelho" placeholder="Ex: iPhone 12" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Telefone</label>
                  <input type="text" class="form-control" name="telefone" placeholder="(11) 99999-9999">
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Serviço / Peça Coberta</label>
                <input type="text" class="form-control" name="servicoPeca" placeholder="Ex: Substituição de Módulo Frontal" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Prazo (Dias)</label>
                  <select class="form-control" name="prazoDias" id="form-gar-prazo">
                    <option value="30">30 dias (1 mês)</option>
                    <option value="90" selected>90 dias (3 meses - Legal)</option>
                    <option value="180">180 dias (6 meses)</option>
                    <option value="365">365 dias (1 ano)</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Data de Início</label>
                  <input type="date" class="form-control" name="dataInicio" value="${hojeIso}" required>
                </div>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--borda); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container-garantias').innerHTML='';">Cancelar</button>
              <button type="submit" class="btn btn-primary">Ativar Cobertura</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  processarSubmit() {
    const form = document.getElementById("form-gar-cadastro");
    const formData = new FormData(form);

    const dataInicioStr = formData.get("dataInicio");
    const dias = parseInt(formData.get("prazoDias"));
    
    // Calcula automaticamente a expiração com base nos dias escolhidos
    const dataInicio = new Date(dataInicioStr + "T12:00:00");
    const dataExpira = new Date(dataInicio);
    dataExpira.setDate(dataExpira.getDate() + dias);

    const payload = {
      os: formData.get("os").startsWith("#") ? formData.get("os") : "#" + formData.get("os"),
      cliente: formData.get("cliente"),
      aparelho: formData.get("aparelho"),
      telefone: formData.get("telefone"),
      servicoPeca: formData.get("servicoPeca"),
      prazoDias: dias,
      dataInicio: dataInicioStr,
      dataExpiracao: dataExpira.toISOString().split('T')[0],
      status: "Ativa",
      numeroSerie: "NS-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      cor: "N/A",
      imei: "35" + Math.floor(1000000000000 + Math.random() * 9000000000000)
    };

    this.criar(payload);
    document.getElementById("modal-container-garantias").innerHTML = "";
  },

  /** Utilitário de Formatação */
  formatarDataBr(dataIso) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }
};

// Carregamento amarrado com segurança ao ciclo do DOM
document.addEventListener("DOMContentLoaded", () => {
  Garantias.init();
});