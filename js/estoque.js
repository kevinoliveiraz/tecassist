/**
 * ===========================================================================
 * estoque.js — CONTROLADOR DO MÓDULO DE ESTOQUE (PRODUTOS E PEÇAS)
 * ===========================================================================
 */

const Estoque = {
  // Estado local e volátil do componente de inventário
  estado: {
    itens: [],
    movimentacoes: [],
    pesquisa: "",
    filtroCategoria: "Todos",
    itemEdicaoId: null,
    abaAtiva: "produtos" // produtos | movimentacoes
  },

  /** Ponto de entrada invocado no carregamento da página */
  init() {
    // 1. Aciona a montagem do frame lateral estrutural e topbar via sidebar.js
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("estoque");
    }

    // 2. Carrega e sincroniza os dados usando a estrutura abstrata do db.js
    this.carregar();

    // 3. Renderiza a interface reativa
    this.renderizar();
  },

  /** Abstração de Carga e Sincronização de Dados via LocalStorage */
  carregar() {
    // Integração direta com as tabelas do db.js
    const dadosEstoque = localStorage.getItem("tecassist_estoque");
    const dadosMovimentacoes = localStorage.getItem("tecassist_estoque_movimentacoes");

    if (dadosEstoque) {
      this.estado.itens = JSON.parse(dadosEstoque);
    } else {
      // Massa de dados inicial mockada para homologação do laboratório
      this.estado.itens = [
        {
          id: "EST-001",
          nome: "Tela Frontal Compatível iPhone 11",
          categoria: "Telas",
          quantidade: 14,
          minimo: 5,
          precoCusto: 120.00,
          precoVenda: 280.00,
          localizacao: "Gaveta A2"
        },
        {
          id: "EST-002",
          nome: "Bateria Homologada Linha Moto G22",
          categoria: "Baterias",
          quantidade: 3,
          minimo: 5, // Alerta ativo de estoque baixo
          precoCusto: 45.00,
          precoVenda: 110.00,
          localizacao: "Prateleira B"
        }
      ];
      this.salvar();
    }

    if (dadosMovimentacoes) {
      this.estado.movimentacoes = JSON.parse(dadosMovimentacoes);
    } else {
      this.estado.movimentacoes = [
        {
          id: "MOV-001",
          itemId: "EST-001",
          itemNome: "Tela Frontal Compatível iPhone 11",
          tipo: "entrada",
          quantidade: 10,
          data: "2026-06-15",
          motivo: "Compra Fornecedor SP"
        }
      ];
      this.salvar();
    }
  },

  salvar() {
    localStorage.setItem("tecassist_estoque", JSON.stringify(this.estado.itens));
    localStorage.setItem("tecassist_estoque_movimentacoes", JSON.stringify(this.estado.movimentacoes));
  },

  /** Operações de CRUD do Inventário */
  criar(novoItem) {
    novoItem.id = "EST-" + Math.floor(1000 + Math.random() * 9000);
    novoItem.quantidade = parseInt(novoItem.quantidade) || 0;
    this.estado.itens.unshift(novoItem);
    
    // Se iniciar com quantidade > 0, gera log automático de movimentação
    if (novoItem.quantidade > 0) {
      this.registrarMovimentacao(novoItem.id, novoItem.nome, "entrada", novoItem.quantidade, "Saldo Inicial de Cadastro");
    }

    this.salvar();
    this.renderizar();
  },

  editar(id, dadosAtualizados) {
    const index = this.estado.itens.findIndex(i => i.id === id);
    if (index !== -1) {
      this.estado.itens[index] = { ...this.estado.itens[index], ...dadosAtualizados };
      this.salvar();
      this.renderizar();
    }
  },

  excluir(id) {
    if (confirm("Deseja realmente remover este insumo/produto permanentemente do estoque?")) {
      this.estado.itens = this.estado.itens.filter(i => i.id !== id);
      this.salvar();
      this.renderizar();
    }
  },

  /** Registro e Histórico de Fluxos */
  registrarMovimentacao(itemId, itemNome, tipo, quantidade, motivo) {
    const novaMov = {
      id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
      itemId,
      itemNome,
      tipo, // entrada | saida
      quantidade: parseInt(quantidade),
      data: new Date().toISOString().split('T')[0],
      motivo
    };
    this.estado.movimentacoes.unshift(novaMov);
  },

  alterarQuantidadeManual(id, tipo) {
    const item = this.estado.itens.find(i => i.id === id);
    if (!item) return;

    const strQtd = prompt(`Digite a quantidade de peças para dar ${tipo === 'entrada' ? 'ENTRADA (+)' : 'SAÍDA (-)'}:`);
    const qtd = parseInt(strQtd);
    if (isNaN(qtd) || qtd <= 0) return;

    const motivo = prompt("Informe o motivo ou o número da OS vinculada:");
    if (!motivo) return;

    if (tipo === "saida" && item.quantidade < qtd) {
      alert("Operação abortada: Saldo insuficiente em estoque.");
      return;
    }

    item.quantidade = tipo === "entrada" ? item.quantidade + qtd : item.quantidade - qtd;
    this.registrarMovimentacao(item.id, item.nome, tipo, qtd, motivo);
    this.salvar();
    this.renderizar();
  },

  /** Filtros Dinâmicos */
  filtrarItens() {
    return this.estado.itens.filter(item => {
      const matchPesquisa = !this.estado.pesquisa || item.nome.toLowerCase().includes(this.estado.pesquisa.toLowerCase());
      const matchCategoria = this.estado.filtroCategoria === "Todos" || item.categoria === this.estado.filtroCategoria;
      return matchPesquisa && matchCategoria;
    });
  },

  /** Renderização de Elementos de Interface */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    const itensFiltrados = this.filtrarItens();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Controle de Estoque</h1>
          <p class="page-subtitle">Gerencie insumos, peças de reposição (telas, conectores, baterias) e controle níveis mínimos.</p>
        </div>
        <button class="btn btn-primary" onclick="Estoque.abrirFormularioModal()">
          <i class="fas fa-plus"></i> Cadastrar Item
        </button>
      </div>

      <div class="os-tabs-nav" style="margin-bottom: 20px; border-bottom: 1px solid var(--borda);">
        <button class="os-tab-trigger ${this.estado.abaAtiva === 'produtos' ? 'active' : ''}" onclick="Estoque.alterarAba('produtos')">
          <i class="fas fa-boxes"></i> Posição do Estoque
        </button>
        <button class="os-tab-trigger ${this.estado.abaAtiva === 'movimentacoes' ? 'active' : ''}" onclick="Estoque.alterarAba('movimentacoes')">
          <i class="fas fa-exchange-alt"></i> Histórico de Movimentações
        </button>
      </div>

      ${this.estado.abaAtiva === 'produtos' ? this.renderizarAbaProdutos(itensFiltrados) : this.renderizarAbaMovimentacoes()}

      <div id="modal-container-estoque"></div>
    `;

    this.vincularEventos();
  },

  renderizarAbaProdutos(itensFiltrados) {
    return `
      <div class="card-panel" style="margin-bottom: 20px; padding: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 12px;">
          <input type="text" id="filtro-est-pesquisa" class="form-control" placeholder="Buscar por descrição da peça..." value="${this.estado.pesquisa}">
          <select id="filtro-est-categoria" class="form-control">
            <option value="Todos" ${this.estado.filtroCategoria === 'Todos' ? 'selected' : ''}>Todas Categorias</option>
            <option value="Telas" ${this.estado.filtroCategoria === 'Telas' ? 'selected' : ''}>Telas / Frontais</option>
            <option value="Baterias" ${this.estado.filtroCategoria === 'Baterias' ? 'selected' : ''}>Baterias</option>
            <option value="Conectores" ${this.estado.filtroCategoria === 'Conectores' ? 'selected' : ''}>Conectores / Periféricos</option>
          </select>
        </div>
      </div>

      <div class="card-panel" style="padding: 0; overflow: hidden;">
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Item / Descrição</th>
                <th>Categoria</th>
                <th>Localização</th>
                <th style="text-align:center;">Qtd Disponível</th>
                <th style="text-align:right;">Preço Custo</th>
                <th style="text-align:right;">Preço Venda</th>
                <th style="text-align:right;">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              ${itensFiltrados.length === 0 ? `
                <tr><td colspan="7" class="os-vazio-texto">Nenhum produto ou insumo localizado no inventário.</td></tr>
              ` : itensFiltrados.map(item => {
                const isBaixo = item.quantidade <= item.minimo;
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 600; color: var(--texto-principal);">${item.nome}</div>
                      <small style="color: var(--texto-terciario);">Ref: ${item.id}</small>
                    </td>
                    <td><span style="font-size:13px; color:var(--texto-secundario);">${item.categoria}</span></td>
                    <td><code style="font-size:11.5px; background:var(--fundo-pagina); padding:2px 6px; border-radius:4px;"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>${item.localizacao || 'Geral'}</code></td>
                    <td style="text-align:center;">
                      <span class="badge ${isBaixo ? 'vermelho' : 'verde'}" style="font-weight:700; padding:4px 10px;">
                        ${item.quantidade} un ${isBaixo ? '(Crítico)' : ''}
                      </span>
                    </td>
                    <td style="text-align:right; color:var(--texto-secundario);">R$ ${parseFloat(item.precoCusto).toFixed(2)}</td>
                    <td style="text-align:right; font-weight:600; color:var(--texto-principal);">R$ ${parseFloat(item.precoVenda).toFixed(2)}</td>
                    <td style="text-align:right;">
                      <div style="display:flex; gap:4px; justify-content:flex-end;">
                        <button class="btn btn-sm btn-secondary" onclick="Estoque.alterarQuantidadeManual('${item.id}', 'entrada')" style="color: var(--verde);" title="Entrada de Peça"><i class="fas fa-arrow-up"></i></button>
                        <button class="btn btn-sm btn-secondary" onclick="Estoque.alterarQuantidadeManual('${item.id}', 'saida')" style="color: var(--vermelho);" title="Baixa / Saída"><i class="fas fa-arrow-down"></i></button>
                        <button class="btn btn-sm btn-secondary" onclick="Estoque.abrirEdicao('${item.id}')" title="Editar Ficha"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-secondary" style="color:var(--vermelho)" onclick="Estoque.excluir('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderizarAbaMovimentacoes() {
    return `
      <div class="card-panel" style="padding: 0; overflow: hidden;">
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Data</th>
                <th>Insumo / Peça</th>
                <th>Tipo</th>
                <th style="text-align:center;">Quantidade</th>
                <th>Motivo / Histórico</th>
              </tr>
            </thead>
            <tbody>
              ${this.estado.movimentacoes.length === 0 ? `
                <tr><td colspan="5" class="os-vazio-texto">Nenhuma movimentação de entrada ou saída registrada.</td></tr>
              ` : this.estado.movimentacoes.map(m => `
                <tr>
                  <td>${this.formatarDataBr(m.data)}</td>
                  <td><b>${m.itemNome}</b><br><small style="color:var(--texto-terciario)">ID: ${m.itemId}</small></td>
                  <td>
                    <span class="badge ${m.tipo === 'entrada' ? 'verde' : 'vermelho'}">
                      ${m.tipo === 'entrada' ? 'Entrada (+)' : 'Saída (-)'}
                    </span>
                  </td>
                  <td style="text-align:center; font-weight:700;">${m.quantidade} un</td>
                  <td><span style="font-size:13px; color:var(--texto-secundario);">${m.motivo}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  alterarAba(aba) {
    this.estado.abaAtiva = aba;
    this.renderizar();
  },

  vincularEventos() {
    const inputBusca = document.getElementById("filtro-est-pesquisa");
    const selectCat = document.getElementById("filtro-est-categoria");

    if (inputBusca) {
      inputBusca.addEventListener("input", (e) => {
        this.estado.pesquisa = e.target.value;
        this.renderizar();
      });
    }
    if (selectCat) {
      selectCat.addEventListener("change", (e) => {
        this.estado.filtroCategoria = e.target.value;
        this.renderizar();
      });
    }
  },

  /** Modal de Escrita de Ficha Técnica do Item (Design System) */
  abrirFormularioModal(idEdicao = null) {
    const modalContainer = document.getElementById("modal-container-estoque");
    const dadosEdicao = idEdicao ? this.estado.itens.find(i => i.id === idEdicao) : null;

    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="card-panel" style="width: 100%; max-width: 520px; box-shadow: var(--sombra-card); padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
            <h3 style="margin:0; font-size: 15px; font-weight:700; color: var(--texto-principal);">${dadosEdicao ? 'Editar Ficha do Insumo' : 'Cadastrar Item no Estoque'}</h3>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-container-estoque').innerHTML='';" style="border:none;"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-est-operacao" onsubmit="event.preventDefault(); Estoque.processarSubmitForm(${dadosEdicao ? `'${dadosEdicao.id}'` : 'null'});">
            
            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
              
              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Descrição / Nome do Insumo</label>
                <input type="text" class="form-control" name="nome" value="${dadosEdicao?.nome || ''}" placeholder="Ex: Bateria Premium para iPhone X" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Categoria</label>
                  <select class="form-control" name="categoria">
                    <option value="Telas" ${dadosEdicao?.categoria === 'Telas' ? 'selected' : ''}>Telas / Frontais</option>
                    <option value="Baterias" ${dadosEdicao?.categoria === 'Baterias' ? 'selected' : ''}>Baterias</option>
                    <option value="Conectores" ${dadosEdicao?.categoria === 'Conectores' ? 'selected' : ''}>Conectores / Periféricos</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Localização Física</label>
                  <input type="text" class="form-control" name="localizacao" value="${dadosEdicao?.localizacao || ''}" placeholder="Ex: Armário C1">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Quantidade Inicial</label>
                  <input type="number" class="form-control" name="quantidade" value="${dadosEdicao?.quantidade || 0}" ${dadosEdicao ? 'disabled' : ''} required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Estoque Mínimo (Alerta)</label>
                  <input type="number" class="form-control" name="minimo" value="${dadosEdicao?.minimo || 5}" required>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Preço de Custo (R$)</label>
                  <input type="number" step="0.01" class="form-control" name="precoCusto" value="${dadosEdicao?.precoCusto || ''}" placeholder="0,00" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Preço de Venda (R$)</label>
                  <input type="number" step="0.01" class="form-control" name="precoVenda" value="${dadosEdicao?.precoVenda || ''}" placeholder="0,00" required>
                </div>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--borda); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container-estoque').innerHTML='';">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Registro</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  abrirEdicao(id) {
    this.abrirFormularioModal(id);
  },

  processarSubmitForm(idAlvo) {
    const form = document.getElementById("form-est-operacao");
    const formData = new FormData(form);

    const payload = {
      nome: formData.get("nome"),
      categoria: formData.get("categoria"),
      localizacao: formData.get("localizacao"),
      minimo: parseInt(formData.get("minimo")),
      precoCusto: parseFloat(formData.get("precoCusto")),
      precoVenda: parseFloat(formData.get("precoVenda"))
    };

    if (idAlvo) {
      this.editar(idAlvo, payload);
    } else {
      payload.quantidade = parseInt(formData.get("quantidade")) || 0;
      this.criar(payload);
    }

    document.getElementById("modal-container-estoque").innerHTML = "";
  },

  /** Utilitário de Formatação de Data */
  formatarDataBr(dataIso) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }
};

// Auto-inicialização segura acoplada ao carregamento do ecossistema
document.addEventListener("DOMContentLoaded", () => {
  Estoque.init();
});