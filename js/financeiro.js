/**
 * ===========================================================================
 * financeiro.js — CONTROLADOR DO MÓDULO FINANCEIRO (FLUXO DE CAIXA)
 * ===========================================================================
 */

const Financeiro = {
  // Estado local e volátil do componente financeiro
  estado: {
    transacoes: [],
    filtroTipo: "Todos", // Todos | receita | despesa
    filtroPeriodo: "mes", // mes | hoje | personalizado
    transacaoEdicaoId: null
  },

  /** Ponto de entrada invocado no carregamento da página */
  init() {
    // 1. Aciona a montagem do frame lateral estrutural e topbar via sidebar.js
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("financeiro");
    }

    // 2. Carrega dados do repositório local
    this.carregar();

    // 3. Renderiza a interface do módulo
    this.renderizar();
  },

  /** Persistência Local via LocalStorage em sintonia com o db.js */
  carregar() {
    const dadosLocais = localStorage.getItem("tecassist_financeiro");
    if (dadosLocais) {
      this.estado.transacoes = JSON.parse(dadosLocais);
    } else {
      // Dados mockados padrão para homologação inicial do fluxo de caixa
      const hoje = new Date().toISOString().split('T')[0];
      this.estado.transacoes = [
        {
          id: "FIN-001",
          descricao: "Entrada OS #1042 — Troca de Tela iPhone 13",
          tipo: "receita",
          valor: 480.00,
          data: hoje,
          categoria: "Serviços",
          status: "pago"
        },
        {
          id: "FIN-002",
          descricao: "Compra de Insumos e Telas (Fornecedor SP)",
          tipo: "despesa",
          valor: 250.00,
          data: hoje,
          categoria: "Peças",
          status: "pago"
        }
      ];
      this.salvar();
    }
  },

  salvar() {
    localStorage.setItem("tecassist_financeiro", JSON.stringify(this.estado.transacoes));
  },

  /** Operações de CRUD */
  criar(novaTransacao) {
    novaTransacao.id = "FIN-" + Math.floor(1000 + Math.random() * 9000);
    this.estado.transacoes.unshift(novaTransacao);
    this.salvar();
    this.renderizar();
  },

  editar(id, dadosAtualizados) {
    const index = this.estado.transacoes.findIndex(t => t.id === id);
    if (index !== -1) {
      this.estado.transacoes[index] = { ...this.estado.transacoes[index], ...dadosAtualizados };
      this.salvar();
      this.renderizar();
    }
  },

  excluir(id) {
    if (confirm("Deseja realmente excluir este lançamento financeiro permanentemente?")) {
      this.estado.transacoes = this.estado.transacoes.filter(t => t.id !== id);
      this.salvar();
      this.renderizar();
    }
  },

  /** Motores de Cálculo de Indicadores (Métricas Superiores) */
  calcularMetricas() {
    let receitas = 0;
    let despesas = 0;

    this.estado.transacoes.forEach(t => {
      if (t.tipo === "receita") receitas += parseFloat(t.valor);
      if (t.tipo === "despesa") despesas += parseFloat(t.valor);
    });

    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  },

  filtrarTransacoes() {
    return this.estado.transacoes.filter(t => {
      const matchTipo = this.estado.filtroTipo === "Todos" || t.tipo === this.estado.filtroTipo;
      return matchTipo;
    });
  },

  /** Renderização de Interface Dinâmica */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    const metricas = this.calcularMetricas();
    const listaFiltrada = this.filtrarTransacoes();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Gestão Financeira</h1>
          <p class="page-subtitle">Monitore o fluxo de caixa, receitas de ordens de serviço e despesas do laboratório.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="Financeiro.abrirFormularioModal('despesa')" style="color: var(--vermelho);">
            <i class="fas fa-arrow-down"></i> Nova Despesa
          </button>
          <button class="btn btn-primary" onclick="Financeiro.abrirFormularioModal('receita')">
            <i class="fas fa-arrow-up"></i> Nova Receita
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px;">
        
        <div class="card-panel" style="border-left: 4px solid var(--verde); padding: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--texto-secundario); text-transform: uppercase;">Total Receitas</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--verde); margin-top: 4px;">R$ ${metricas.receitas.toFixed(2)}</div>
        </div>

        <div class="card-panel" style="border-left: 4px solid var(--vermelho); padding: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--texto-secundario); text-transform: uppercase;">Total Despesas</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--vermelho); margin-top: 4px;">R$ ${metricas.despesas.toFixed(2)}</div>
        </div>

        <div class="card-panel" style="border-left: 4px solid var(--azul-primario); padding: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--texto-secundario); text-transform: uppercase;">Saldo Líquido</div>
          <div style="font-size: 24px; font-weight: 700; color: ${metricas.saldo >= 0 ? 'var(--texto-principal)' : 'var(--vermelho)'}; margin-top: 4px;">R$ ${metricas.saldo.toFixed(2)}</div>
        </div>

      </div>

      <div class="card-panel" style="margin-bottom: 20px; padding: 14px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="font-size: 13px; font-weight: 600; color: var(--texto-secundario);">Filtrar por:</span>
          <select id="filtro-fin-tipo" class="form-control" style="max-width: 180px;">
            <option value="Todos" ${this.estado.filtroTipo === 'Todos' ? 'selected' : ''}>Todos os Fluxos</option>
            <option value="receita" ${this.estado.filtroTipo === 'receita' ? 'selected' : ''}>Apenas Receitas (+)</option>
            <option value="despesa" ${this.estado.filtroTipo === 'despesa' ? 'selected' : ''}>Apenas Despesas (-)</option>
          </select>
        </div>
      </div>

      <div class="card-panel" style="padding: 0; overflow: hidden;">
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição do Lançamento</th>
                <th>Categoria</th>
                <th>Fluxo</th>
                <th style="text-align:right;">Valor</th>
                <th style="text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${listaFiltrada.length === 0 ? `
                <tr><td colspan="6" class="os-vazio-texto">Nenhuma transação financeira registrada sob este filtro.</td></tr>
              ` : listaFiltrada.map(t => `
                <tr>
                  <td>${this.formatarDataBr(t.data)}</td>
                  <td>
                    <div style="font-weight: 600; color: var(--texto-principal);">${t.descricao}</div>
                  </td>
                  <td><span style="font-size:12.5px; color: var(--texto-secundario);"><i class="far fa-folder" style="margin-right:6px;"></i>${t.categoria}</span></td>
                  <td>
                    <span class="badge ${t.tipo === 'receita' ? 'verde' : 'vermelho'}">
                      ${t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td style="text-align:right; font-weight: 700; color: ${t.tipo === 'receita' ? 'var(--verde)' : 'var(--vermelho)'};">
                    ${t.tipo === 'receita' ? '+' : '-'} R$ ${parseFloat(t.valor).toFixed(2)}
                  </td>
                  <td style="text-align:right;">
                    <div style="display:flex; gap:4px; justify-content:flex-end;">
                      <button class="btn btn-sm btn-secondary" onclick="Financeiro.abrirEdicao('${t.id}')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-secondary" style="color:var(--vermelho)" onclick="Financeiro.excluir('${t.id}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div id="modal-container-financeiro"></div>
    `;

    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById("filtro-fin-tipo").addEventListener("change", (e) => {
      this.estado.filtroTipo = e.target.value;
      this.renderizar();
    });
  },

  /** Modal Unificado de Lançamento (Design System) */
  abrirFormularioModal(tipoPadrao = "receita", idEdicao = null) {
    const modalContainer = document.getElementById("modal-container-financeiro");
    const dadosEdicao = idEdicao ? this.estado.transacoes.find(t => t.id === idEdicao) : null;
    const tipoFinal = dadosEdicao ? dadosEdicao.tipo : tipoPadrao;

    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="card-panel" style="width: 100%; max-width: 460px; box-shadow: var(--sombra-card); padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
            <h3 style="margin:0; font-size: 15px; font-weight:700; color: var(--texto-principal);">
              ${dadosEdicao ? 'Editar Lançamento' : (tipoFinal === 'receita' ? 'Lançar Receita (+)' : 'Lançar Despesa (-)')}
            </h3>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-container-financeiro').innerHTML='';" style="border:none;"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-fin-operacao" onsubmit="event.preventDefault(); Financeiro.processarSubmitForm(${dadosEdicao ? `'${dadosEdicao.id}'` : 'null'});">
            <input type="hidden" name="tipo" value="${tipoFinal}">
            
            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
              
              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Descrição / Histórico</label>
                <input type="text" class="form-control" name="descricao" value="${dadosEdicao?.descricao || ''}" placeholder="Ex: Recebimento OS #1120" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Valor (R$)</label>
                  <input type="number" step="0.01" class="form-control" name="valor" value="${dadosEdicao?.valor || ''}" placeholder="0,00" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Data</label>
                  <input type="date" class="form-control" name="data" value="${dadosEdicao?.data || new Date().toISOString().split('T')[0]}" required>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Categoria</label>
                <select class="form-control" name="categoria">
                  <option value="Serviços" ${dadosEdicao?.categoria === 'Serviços' ? 'selected' : ''}>Serviços / Mão de Obra</option>
                  <option value="Peças" ${dadosEdicao?.categoria === 'Peças' ? 'selected' : ''}>Aquisição de Peças</option>
                  <option value="Infraestrutura" ${dadosEdicao?.categoria === 'Infraestrutura' ? 'selected' : ''}>Infraestrutura / Aluguel / Ferramentas</option>
                  <option value="Outros" ${dadosEdicao?.categoria === 'Outros' ? 'selected' : ''}>Outros Lançamentos</option>
                </select>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--borda); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container-financeiro').innerHTML='';">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="${tipoFinal === 'despesa' ? 'background-color: var(--vermelho); border-color: var(--vermelho);' : ''}">
                Confirmar Lançamento
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  abrirEdicao(id) {
    this.abrirFormularioModal("receita", id);
  },

  processarSubmitForm(idAlvo) {
    const form = document.getElementById("form-fin-operacao");
    const formData = new FormData(form);

    const payload = {
      descricao: formData.get("descricao"),
      tipo: formData.get("tipo"),
      valor: parseFloat(formData.get("valor")),
      data: formData.get("data"),
      categoria: formData.get("categoria"),
      status: "pago"
    };

    if (idAlvo) {
      this.editar(idAlvo, payload);
    } else {
      this.criar(payload);
    }

    document.getElementById("modal-container-financeiro").innerHTML = "";
  },

  /** Utilitário de Formatação */
  formatarDataBr(dataIso) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }
};

// Vinculação ao ciclo de vida seguro do DOM
document.addEventListener("DOMContentLoaded", () => {
  Financeiro.init();
});