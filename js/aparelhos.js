/**
 * ===========================================================================
 * aparelhos.js — CONTROLADOR DO MÓDULO DE APARELHOS
 * ===========================================================================
 */

const Aparelhos = {
  // Estado local e volátil da interface de aparelhos
  estado: {
    aparelhos: [],
    aparelhoSelecionadoId: null,
    pesquisa: "",
    filtroCliente: "",
    filtroMarca: "",
    filtroSituacao: "Todos",
    abaAtiva: "historico" // historico | anotacoes | documentos
  },

  /** Ponto de entrada inicializado pelo DOMContentLoaded */
  init() {
    // 1. Aciona o frame de layout global através do sidebar.js
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("aparelhos");
    }

    // 2. Sincroniza dados com a persistência local
    this.carregar();

    // 3. Renderiza a casca estrutural primária e eventos de filtros
    this.renderizar();
  },

  /** Gerenciamento de Dados via LocalStorage */
  carregar() {
    const dadosLocais = localStorage.getItem("tecassist_aparelhos");
    if (dadosLocais) {
      this.estado.aparelhos = JSON.parse(dadosLocais);
    } else {
      // Massa de dados inicial mockada para homologação em simetria com db.js
      this.estado.aparelhos = [
        {
          id: "DEV-001",
          tipo: "Smartphone",
          marca: "Apple",
          modelo: "iPhone 13 Pro Max",
          imei: "354689110234567",
          cor: "Grafite",
          capacidade: "256GB",
          clienteId: "1",
          clienteNome: "Carlos Henrique Silva",
          senhaPadrao: "142536",
          contaNuvem: "carlos.h@icloud.com",
          acessorios: "Capa protetora, Cabo original Lightning",
          observacoes: "Pequeno trinco na quina inferior esquerda do vidro traseiro.",
          dataCadastro: "2026-03-15",
          situacao: "em_manutencao"
        }
      ];
      this.salvar();
    }

    // Auto-seleciona o primeiro item caso exista e nenhum tenha sido fixado
    if (this.estado.aparelhos.length > 0 && !this.estado.aparelhoSelecionadoId) {
      this.estado.aparelhoSelecionadoId = this.estado.aparelhos[0].id;
    }
  },

  salvar() {
    localStorage.setItem("tecassist_aparelhos", JSON.stringify(this.estado.aparelhes || this.estado.aparelhos));
  },

  /** Operações de CRUD */
  criar(novoAparelho) {
    novoAparelho.id = "DEV-" + Math.floor(1000 + Math.random() * 9000);
    novoAparelho.dataCadastro = new Date().toISOString().split('T')[0];
    this.estado.aparelhos.push(novoAparelho);
    this.estado.aparelhoSelecionadoId = novoAparelho.id;
    this.salvar();
    this.renderizar();
  },

  editar(id, dadosAtualizados) {
    const index = this.estado.aparelhos.findIndex(a => a.id === id);
    if (index !== -1) {
      this.estado.aparelhos[index] = { ...this.estado.aparelhos[index], ...dadosAtualizados };
      this.salvar();
      this.renderizar();
    }
  },

  excluir(id) {
    if (confirm("Deseja realmente remover permanentemente este aparelho do cadastro?")) {
      this.estado.aparelhos = this.estado.aparelhos.filter(a => a.id !== id);
      this.estado.aparelhoSelecionadoId = this.estado.aparelhos.length > 0 ? this.estado.aparelhos[0].id : null;
      this.salvar();
      this.renderizar();
    }
  },

  duplicar(id) {
    const alvo = this.estado.aparelhos.find(a => a.id === id);
    if (alvo) {
      const copia = { ...alvo, id: "DEV-" + Math.floor(1000 + Math.random() * 9000), modelo: `${alvo.modelo} (Cópia)` };
      this.estado.aparelhos.push(copia);
      this.estado.aparelhoSelecionadoId = copia.id;
      this.salvar();
      this.renderizar();
    }
  },

  /** Filtros e Motores de Busca */
  filtrarAparelhos() {
    return this.estado.aparelhos.filter(aparelho => {
      const matchPesquisa = !this.estado.pesquisa || 
        aparelho.modelo.toLowerCase().includes(this.estado.pesquisa.toLowerCase()) ||
        aparelho.imei.includes(this.estado.pesquisa);
      
      const matchCliente = !this.estado.filtroCliente || 
        aparelho.clienteNome.toLowerCase().includes(this.estado.filtroCliente.toLowerCase());

      const matchMarca = !this.estado.filtroMarca || 
        aparelho.marca.toLowerCase().includes(this.estado.filtroMarca.toLowerCase());

      const matchSituacao = this.estado.filtroSituacao === "Todos" || 
        aparelho.situacao === this.estado.filtroSituacao;

      return matchPesquisa && matchCliente && matchMarca && matchSituacao;
    });
  },

  /** Renderizadores de Interface Base (Design System) */
  renderizar() {
    const container = document.getElementById("page-body");
    const aparelhosFiltrados = this.filtrarAparelhos();
    const selecionado = this.estado.aparelhos.find(a => a.id === this.estado.aparelhoSelecionadoId) || null;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Gerenciamento de Aparelhos</h1>
          <p class="page-subtitle">Cadastre, gerencie e acompanhe o prontuário técnico de equipamentos sob cuidados da assistência.</p>
        </div>
        <button class="btn btn-primary" id="btn-abrir-cadastro" style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-plus"></i> Novo Aparelho
        </button>
      </div>

      <div class="card-panel" style="margin-bottom: 24px; padding: 16px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <input type="text" id="busca-modelo" class="form-control" placeholder="Buscar por modelo ou IMEI..." value="${this.estado.pesquisa}">
          <input type="text" id="busca-cliente" class="form-control" placeholder="Filtrar por Cliente..." value="${this.estado.filtroCliente}">
          <input type="text" id="busca-marca" class="form-control" placeholder="Filtrar por Marca..." value="${this.estado.filtroMarca}">
          <select id="busca-situacao" class="form-control">
            <option value="Todos" ${this.estado.filtroSituacao === 'Todos' ? 'selected' : ''}>Todas as Situações</option>
            <option value="ativo" ${this.estado.filtroSituacao === 'ativo' ? 'selected' : ''}>Ativo / Em Uso</option>
            <option value="em_manutencao" ${this.estado.filtroSituacao === 'em_manutencao' ? 'selected' : ''}>Em Manutenção</option>
            <option value="arquivado" ${this.estado.filtroSituacao === 'arquivado' ? 'selected' : ''}>Arquivado</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start;">
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h3 style="font-size: 14px; font-weight: 600; color: var(--texto-secundario); margin: 0 0 4px 0;">Dispositivos Encontrados (${aparelhosFiltrados.length})</h3>
          ${aparelhosFiltrados.length === 0 ? `
            <div class="card-panel" style="text-align: center; color: var(--texto-terciario); padding: 30px 16px;">Nenhum aparelho encontrado.</div>
          ` : aparelhosFiltrados.map(ap => `
            <div class="card-panel" style="padding: 14px; cursor: pointer; border: 1px solid ${ap.id === this.estado.aparelhoSelecionadoId ? 'var(--azul-primario)' : 'var(--borda)'};" onclick="Aparelhos.selecionarAparelho('${ap.id}')">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                <strong style="color: var(--texto-principal); font-size: 14px;">${ap.modelo}</strong>
                <span class="badge ${ap.situacao === 'em_manutencao' ? 'azul' : ap.situacao === 'ativo' ? 'verde' : 'cinza'}">${ap.situacao}</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: var(--texto-secundario);">${ap.marca} • IMEI: ${ap.imei}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 500; color: var(--texto-principal);"><i class="fas fa-user" style="font-size: 10px; margin-right: 4px;"></i>${ap.clienteNome}</p>
            </div>
          `).join("")}
        </div>

        <div>
          ${selecionado ? `
            <div style="display: grid; grid-template-columns: 260px 1fr; gap: 24px; margin-bottom: 24px;" class="card-panel">
              
              <div style="text-align: center; border-right: 1px solid var(--borda); padding-right: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="width: 90px; height: 90px; border-radius: 50%; background: var(--fundo-pagina); display: flex; align-items: center; justify-content: center; color: var(--azul-primario); margin-bottom: 12px; font-size: 36px;">
                  <i class="fas ${selecionado.tipo === 'Tablet' ? 'fa-tablet-alt' : 'fa-mobile-alt'}"></i>
                </div>
                <h2 style="font-size: 16px; font-weight: 700; color: var(--texto-principal); margin: 0 0 4px 0;">${selecionado.modelo}</h2>
                <span class="badge ${selecionado.situacao === 'em_manutencao' ? 'azul' : 'verde'}" style="margin-bottom: 16px;">${selecionado.situacao}</span>
                
                <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; text-align: left; border-top: 1px solid var(--borda); padding-top: 12px;">
                  <div style="font-size: 12px;"><span style="color:var(--texto-secundario)">IMEI:</span> <strong style="float:right; color:var(--texto-principal)">${selecionado.imei}</strong></div>
                  <div style="font-size: 12px;"><span style="color:var(--texto-secundario)">Cliente:</span> <strong style="float:right; color:var(--texto-principal)">${selecionado.clienteNome}</strong></div>
                  <div style="font-size: 12px;"><span style="color:var(--texto-secundario)">Cadastro:</span> <strong style="float:right; color:var(--texto-principal)">${selecionado.dataCadastro}</strong></div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--texto-secundario);">Especificações Gerais</h4>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-secondary" onclick="Aparelhos.abrirEdicao('${selecionado.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-secondary" onclick="Aparelhos.duplicar('${selecionado.id}')" title="Duplicar"><i class="fas fa-copy"></i></button>
                      <button class="btn btn-sm btn-secondary" onclick="Aparelhos.excluir('${selecionado.id}')" style="color: var(--vermelho);" title="Remover"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                    <div><span style="color:var(--texto-secundario)">Cor:</span> <span style="color:var(--texto-principal); font-weight:500;">${selecionado.cor}</span></div>
                    <div><span style="color:var(--texto-secundario)">Capacidade:</span> <span style="color:var(--texto-principal); font-weight:500;">${selecionado.capacidade}</span></div>
                    <div><span style="color:var(--texto-secundario)">Senha/Padrão:</span> <code style="background:var(--fundo-pagina); padding:2px 4px; border-radius:4px;">${selecionado.senhaPadrao || 'Nenhum'}</code></div>
                    <div><span style="color:var(--texto-secundario)">Nuvem Ativa:</span> <span style="color:var(--texto-principal); font-weight:500; font-size:12px;">${selecionado.contaNuvem || 'Não informada'}</span></div>
                    <div style="grid-column: span 2;"><span style="color:var(--texto-secundario)">Acessórios Inclusos:</span> <p style="margin:2px 0 0 0; color:var(--texto-principal)">${selecionado.acessorios || 'Nenhum'}</p></div>
                    <div style="grid-column: span 2;"><span style="color:var(--texto-secundario)">Observações Internas:</span> <p style="margin:2px 0 0 0; color:var(--texto-principal); font-style:italic;">${selecionado.observacoes || 'Sem observações adicionais.'}</p></div>
                  </div>
                </div>
              </div>

            </div>

            <div class="card-panel" style="padding: 20px;">
              <div class="os-tabs-nav">
                <button class="os-tab-trigger ${this.estado.abaAtiva === 'historico' ? 'active' : ''}" onclick="Aparelhos.trocarAba('historico')"><i class="fas fa-history"></i> Histórico de OS</button>
                <button class="os-tab-trigger ${this.estado.abaAtiva === 'anotacoes' ? 'active' : ''}" onclick="Aparelhos.trocarAba('anotacoes')"><i class="fas fa-sticky-note"></i> Anotações Internas</button>
                <button class="os-tab-trigger ${this.estado.abaAtiva === 'documentos' ? 'active' : ''}" onclick="Aparelhos.trocarAba('documentos')"><i class="fas fa-file-invoice"></i> Termos e Anexos</button>
              </div>
              
              <div style="margin-top: 16px;">
                ${this.renderizarConteudoAba(selecionado)}
              </div>
            </div>
          ` : `
            <div class="card-panel" style="text-align: center; padding: 60px; color: var(--texto-terciario);">Selecione um equipamento na listagem lateral para visualizar seu prontuário operacional completo.</div>
          `}
        </div>

      </div>

      <div id="modal-container-aparelho"></div>
    `;

    this.vincularEventosFiltros();
  },

  /** Gerenciador Modular do Sub-Viewport de Abas */
  renderizarConteudoAba(aparelho) {
    switch (this.estado.abaAtiva) {
      case "historico":
        return `
          <div class="tabela-container">
            <table class="tabela-padrao">
              <thead>
                <tr>
                  <th>Nº OS</th>
                  <th>Data</th>
                  <th>Serviço Solicitado</th>
                  <th>Técnico</th>
                  <th>Status</th>
                  <th style="text-align:right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>#1042</b></td>
                  <td>18/05/2026</td>
                  <td>Troca de Tela Frontal Touch</td>
                  <td>Valdir Técnico</td>
                  <td><span class="badge verde">Entregue</span></td>
                  <td style="text-align:right; font-weight:600;">R$ 480,00</td>
                </tr>
                <tr>
                  <td><b>#1109</b></td>
                  <td>02/07/2026</td>
                  <td>Reparo de Conector de Carga e Limpeza</td>
                  <td>Valdir Técnico</td>
                  <td><span class="badge azul">Em Manutenção</span></td>
                  <td style="text-align:right; font-weight:600;">R$ 150,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      
      case "anotacoes":
        return `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; gap: 8px;">
              <input type="text" id="nova-anotacao-txt" class="form-control" placeholder="Adicionar nova anotação técnica rápida...">
              <button class="btn btn-primary" onclick="alert('Anotação registrada com sucesso no log local.')">Salvar</button>
            </div>
            <div class="os-chat-viewport">
              <div class="os-chat-balao" style="width: 100%; max-width: 100%;">
                <div class="os-chat-meta">15/03/2026 14:32 — Por Administrador</div>
                <div class="os-chat-corpo">Aparelho deu entrada com marcas acentuadas de queda. Cliente ciente dos riscos de abertura da carcaça.</div>
              </div>
            </div>
          </div>
        `;

      case "documentos":
        return `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; color: var(--texto-secundario);">Anexos de Checkout e Vistoria</span>
              <button class="btn btn-sm btn-secondary" onclick="alert('Selecione o arquivo do dispositivo local.')"><i class="fas fa-upload"></i> Anexar Documento</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--fundo-pagina); border: 1px solid var(--borda); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <i class="far fa-file-pdf" style="color: var(--vermelho); font-size: 18px;"></i>
                  <div>
                    <span style="font-size: 13px; font-weight: 500; color: var(--texto-principal);">termo_de_recebimento.pdf</span>
                    <small style="display:block; font-size: 11px; color:var(--texto-secundario)">PDF • 18/05/2026</small>
                  </div>
                </div>
                <div style="display:flex; gap: 4px;">
                  <button class="btn btn-sm btn-secondary" onclick="alert('Abrindo visualizador integrado...')"><i class="fas fa-eye"></i></button>
                  <button class="btn btn-sm btn-secondary" style="color:var(--vermelho)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;
    }
  },

  /** Eventos e Mutadores de Estado */
  selecionarAparelho(id) {
    this.estado.aparelhoSelecionadoId = id;
    this.renderizar();
  },

  trocarAba(novaAaba) {
    this.estado.abaAtiva = novaAaba;
    this.renderizar();
  },

  vincularEventosFiltros() {
    document.getElementById("busca-modelo").addEventListener("input", (e) => {
      this.estado.pesquisa = e.target.value;
      this.renderizar();
    });
    document.getElementById("busca-cliente").addEventListener("input", (e) => {
      this.estado.filtroCliente = e.target.value;
      this.renderizar();
    });
    document.getElementById("busca-marca").addEventListener("input", (e) => {
      this.estado.filtroMarca = e.target.value;
      this.renderizar();
    });
    document.getElementById("busca-situacao").addEventListener("change", (e) => {
      this.estado.filtroSituacao = e.target.value;
      this.renderizar();
    });
    document.getElementById("btn-abrir-cadastro").addEventListener("click", () => {
      this.abrirFormularioModal();
    });
  },

  /** Modal Unificado de Operações de Escrita (Formulário do Design System) */
  abrirFormularioModal(idEdicao = null) {
    const modalContainer = document.getElementById("modal-container-aparelho");
    const dadosEdicao = idEdicao ? this.estado.aparelhos.find(a => a.id === idEdicao) : null;

    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="card-panel" style="width: 100%; max-width: 680px; box-shadow: var(--sombra-card); padding: 24px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
            <h3 style="margin:0; font-size: 16px; font-weight:700; color: var(--texto-principal);">${dadosEdicao ? 'Editar Equipamento' : 'Cadastrar Novo Aparelho'}</h3>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-container-aparelho').innerHTML='';" style="border:none;"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-aparelho-operacao" onsubmit="event.preventDefault(); Aparelhos.processarSubmitForm(${dadosEdicao ? `'${dadosEdicao.id}'` : 'null'});">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              
              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Tipo de Aparelho</label>
                <select class="form-control" name="tipo" required>
                  <option value="Smartphone" ${dadosEdicao?.tipo === 'Smartphone' ? 'selected' : ''}>Smartphone</option>
                  <option value="Tablet" ${dadosEdicao?.tipo === 'Tablet' ? 'selected' : ''}>Tablet</option>
                  <option value="Notebook" ${dadosEdicao?.tipo === 'Notebook' ? 'selected' : ''}>Notebook</option>
                </select>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Marca</label>
                <input type="text" class="form-control" name="marca" placeholder="Ex: Apple, Samsung" value="${dadosEdicao?.marca || ''}" required>
              </div>

              <div style="grid-column: span 2;">
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Modelo do Equipamento</label>
                <input type="text" class="form-control" name="modelo" placeholder="Ex: Galaxy S23 Ultra" value="${dadosEdicao?.modelo || ''}" required>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">IMEI / Número de Série</label>
                <input type="text" class="form-control" name="imei" placeholder="15 dígitos numéricos" value="${dadosEdicao?.imei || ''}" required>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Cor</label>
                <input type="text" class="form-control" name="cor" placeholder="Ex: Azul Azul" value="${dadosEdicao?.cor || ''}">
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Capacidade de Armazenamento</label>
                <input type="text" class="form-control" name="capacidade" placeholder="Ex: 128GB" value="${dadosEdicao?.capacidade || ''}">
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Cliente Proprietário</label>
                <input type="text" class="form-control" name="clienteNome" placeholder="Nome completo do cliente" value="${dadosEdicao?.clienteNome || ''}" required>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Senha de Bloqueio / Padrão</label>
                <input type="text" class="form-control" name="senhaPadrao" placeholder="Ex: 1234 ou Desenho" value="${dadosEdicao?.senhaPadrao || ''}">
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Conta Google / Apple ID</label>
                <input type="email" class="form-control" name="contaNuvem" placeholder="email@exemplo.com" value="${dadosEdicao?.contaNuvem || ''}">
              </div>

              <div style="grid-column: span 2;">
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Acessórios Inclusos</label>
                <input type="text" class="form-control" name="acessorios" placeholder="Ex: Carregador, capa, caixa" value="${dadosEdicao?.acessorios || ''}">
              </div>

              <div style="grid-column: span 2;">
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Observações ou Defeito Relatado</label>
                <textarea class="form-control" name="observacoes" style="height: 60px; resize:none;">${dadosEdicao?.observacoes || ''}</textarea>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Situação Operacional</label>
                <select class="form-control" name="situacao">
                  <option value="ativo" ${dadosEdicao?.situacao === 'ativo' ? 'selected' : ''}>Ativo / Em Uso</option>
                  <option value="em_manutencao" ${dadosEdicao?.situacao === 'em_manutencao' ? 'selected' : ''}>Em Manutenção</option>
                  <option value="arquivado" ${dadosEdicao?.situacao === 'arquivado' ? 'selected' : ''}>Arquivado</option>
                </select>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--borda); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container-aparelho').innerHTML='';">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
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
    const form = document.getElementById("form-aparelho-operacao");
    const formData = new FormData(form);
    
    const payload = {
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      imei: formData.get("imei"),
      cor: formData.get("cor"),
      capacidade: formData.get("capacidade"),
      clienteNome: formData.get("clienteNome"),
      senhaPadrao: formData.get("senhaPadrao"),
      contaNuvem: formData.get("contaNuvem"),
      acessorios: formData.get("acessorios"),
      observacoes: formData.get("observacoes"),
      situacao: formData.get("situacao")
    };

    if (idAlvo) {
      this.editar(idAlvo, payload);
    } else {
      this.criar(payload);
    }
    
    document.getElementById('modal-container-aparelho').innerHTML = '';
  }
};

// Auto-inicialização do componente respeitando a barreira do escopo do documento
document.addEventListener("DOMContentLoaded", () => {
  Aparelhos.init();
});