/**
 * ===========================================================================
 * os.js — CONTROLADOR DO MÓDULO DE ORDEM DE SERVIÇO (TECASSIST)
 * ===========================================================================
 * Controlador reativo, componentizado e modular para gerenciamento de OS.
 * Suporta modo Criação (os.html) e modo Gerenciamento (os.html?os=NUMERO).
 */

// Estado centralizado e volátil da janela atual
const EstadoTelaOS = {
  identificadorOS: null,
  modoEdicao: false,
  abaAtiva: "resumo", // resumo, diagnostico, pecas, fotos, comunicacoes, historico, financeiro
  dadosOS: null,
  clienteOS: null,
  aparelhoOS: null,
  usuarioLogado: null
};

// Dicionário visual de Badges alinhado estritamente com as classes do seu style.css
const STATUS_MAPA = {
  recebido: { texto: "Recebido", classe: "badge-cinza" },
  triagem: { texto: "Triagem", classe: "badge-cinza" },
  diagnostico: { texto: "Diagnóstico", classe: "badge-amarelo" },
  aguardando_orcamento: { texto: "Aguardando orçamento", classe: "badge-amarelo" },
  aguardando_peca: { texto: "Aguardando peça", classe: "badge-roxo" },
  em_manutencao: { texto: "Em manutenção", classe: "badge-azul" },
  pronto: { texto: "Pronto para retirada", classe: "badge-verde" },
  entregue: { texto: "Entregue", classe: "badge-verde" },
  cancelado: { texto: "Cancelado", classe: "badge-vermelho" }
};

// =====================================================================
// NÚCLEO DE CICLO DE VIDA E DADOS
// =====================================================================

/**
 * Sincroniza e busca dados atualizados da única fonte da verdade (DB.js)
 */
function sincronizarDadosComBanco() {
  if (!EstadoTelaOS.modoEdicao || !EstadoTelaOS.identificadorOS) return;

  let agregador = DB.obterOSCompleta ? DB.obterOSCompleta(EstadoTelaOS.identificadorOS) : null;
  
  // --- CORREÇÃO DA TIPAGEM (STRING VS NUMBER) ---
  // Se o método nativo falhar por comparação estrita, fazemos a busca tolerante a tipos
  if (!agregador) {
    const chaveOS = DB.CHAVES ? DB.CHAVES.OS : "tecassist_os";
    const todasOS = DB._ler(chaveOS) || [];
    const osEncontrada = todasOS.find(o => 
      String(o.id) === String(EstadoTelaOS.identificadorOS) || 
      String(o.numero) === String(EstadoTelaOS.identificadorOS)
    );

    if (osEncontrada) {
      agregador = {
        os: osEncontrada,
        cliente: DB.obterCliente ? DB.obterCliente(osEncontrada.cliente_id) : null,
        aparelho: DB.obterAparelho ? DB.obterAparelho(osEncontrada.aparelho_id) : null
      };
    }
  }

  if (!agregador) {
    window.location.href = "ordens-servico.html";
    return;
  }

  EstadoTelaOS.dadosOS = agregador.os;
  EstadoTelaOS.clienteOS = agregador.cliente;
  EstadoTelaOS.aparelhoOS = agregador.aparelho;
}

/**
 * Atualiza o estado da tela e força a renderização dos componentes afetados
 */
function atualizarFichaTécnicaCompleta() {
  sincronizarDadosComBanco();
  renderizarBreadcrumbs();
  renderizarPainelGerenciamento();
}

/**
 * Exibe um aviso flutuante confirmando que a alteração foi salva no banco.
 * Fica preso ao <body> (não ao #page-body), então sobrevive aos re-renders
 * da ficha e some sozinho depois de alguns segundos.
 */
function exibirConfirmacaoSalvo(mensagem = "Alterações salvas com sucesso.") {
  let toast = document.getElementById("os-toast-confirmacao");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "os-toast-confirmacao";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--verde, #16a34a);
      color: #fff;
      padding: 12px 18px;
      border-radius: var(--raio-sm, 8px);
      box-shadow: var(--sombra-card, 0 4px 12px rgba(0,0,0,0.15));
      font-size: 13.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 9999;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;

  clearTimeout(toast._timeoutOcultar);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  toast._timeoutOcultar = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 2200);
}

// =====================================================================
// COMPONENTES DE RENDERIZAÇÃO VISUAL (INTEGRADO AO SEU STYLE.CSS)
// =====================================================================

/**
 * Renderiza os Breadcrumbs com base no estado atual da tela
 */
function renderizarBreadcrumbs() {
  const container = document.getElementById("os-breadcrumbs-container");
  if (!container) return;

  const textoModo = EstadoTelaOS.modoEdicao 
    ? `Gerenciar OS #${EstadoTelaOS.dadosOS?.numero || ""}` 
    : "Nova Ordem de Serviço";

  container.innerHTML = `
    <div style="margin-bottom: 16px; font-size: 14px; color: var(--texto-secundario);">
      <span style="cursor:pointer;" onclick="window.location.href='ordens-servico.html'">Ordens de Serviço</span>
      <i class="fas fa-chevron-right" style="font-size: 10px; margin: 0 8px;"></i>
      <span style="color: var(--texto-principal); font-weight: 500;">${textoModo}</span>
    </div>
  `;
}

/**
 * Componente: Formulário de Abertura (Modo Criação)
 */
function renderizarFormularioCriacao() {
  const bodyContainer = document.getElementById("page-body");
  if (!bodyContainer) return;

  bodyContainer.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h1 class="page-title">Abertura de Ordem de Serviço</h1>
      <p class="page-subtitle">Preencha os dados base para dar entrada no dispositivo em laboratório.</p>
    </div>

    <div class="card-panel">
      <form id="form-nova-os">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
          
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Cliente Proprietário *</label>
            <select id="os-form-cliente" required class="form-control">
              <option value="">Selecione um cliente...</option>
            </select>
          </div>

          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Dispositivo / Aparelho *</label>
            <select id="os-form-aparelho" required class="form-control" disabled>
              <option value="">Selecione primeiro o cliente...</option>
            </select>
          </div>

          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Técnico Alocado *</label>
            <select id="os-form-tecnico" required class="form-control"></select>
          </div>

          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Previsão Estimada de Entrega *</label>
            <input type="datetime-local" id="os-form-previsao" required class="form-control">
          </div>

        </div>

        <div style="margin-bottom: 24px;">
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario)">Defeito Informado / Sintomas *</label>
          <textarea id="os-form-defeito" required class="form-control" style="height: 100px; resize: none;" placeholder="Descreva detalhadamente as reclamações..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--borda); padding-top: 16px;">
          <button type="button" class="btn btn-secondary" id="btn-cancelar-criacao">Cancelar</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Criar e Iniciar OS</button>
        </div>
      </form>
    </div>
  `;

  popularSelectsCriacao();
  configurarEventosCriacao();
}

/**
 * Componente: Painel Central de Gerenciamento (Modo Edição)
 */
function renderizarPainelGerenciamento() {
  const bodyContainer = document.getElementById("page-body");
  if (!bodyContainer || !EstadoTelaOS.dadosOS) return;

  const os = EstadoTelaOS.dadosOS;
  const statusVisual = STATUS_MAPA[os.status] || { texto: os.status, classe: "badge-cinza" };

  bodyContainer.innerHTML = `
    <div class="card-panel">
      <div class="os-grid-header">
        
        <div class="os-title-area">
          <span class="os-subtopico">Ficha Técnica Operacional</span>
          <h1 class="page-title" style="margin: 4px 0 8px 0;">Ordem de Serviço #<span id="os-numero-header">${os.numero}</span></h1>
          <span class="badge ${statusVisual.classe}" id="os-status-badge"><i class="fas fa-circle" style="font-size: 8px; margin-right: 4px;"></i> ${statusVisual.texto}</span>
        </div>

        <div class="os-meta-grid">
          <div class="os-meta-block">
            <span class="os-meta-label"><i class="fas fa-user"></i> Cliente</span>
            <span class="os-meta-value" id="os-cliente-nome">${EstadoTelaOS.clienteOS?.nome_completo || "Não vinculado"}</span>
          </div>
          <div class="os-meta-block">
            <span class="os-meta-label"><i class="fas fa-mobile-alt"></i> Aparelho</span>
            <span class="os-meta-value" id="os-aparelho-nome">${EstadoTelaOS.aparelhoOS ? `${EstadoTelaOS.aparelhoOS.marca} ${EstadoTelaOS.aparelhoOS.modelo}` : "Não vinculado"}</span>
          </div>
          <div class="os-meta-block">
            <span class="os-meta-label"><i class="fas fa-user-cog"></i> Técnico</span>
            <select id="header-select-tecnico" class="form-control" style="padding: 2px 6px; height: 28px; font-size: 12px; font-weight: 600;">
              ${DB.listarUsuarios().map(u => `<option value="${u.id}" ${u.id === os.tecnico_id ? 'selected' : ''}>${u.nome}</option>`).join("")}
            </select>
          </div>
          <div class="os-meta-block">
            <span class="os-meta-label"><i class="fas fa-clock"></i> Entrada</span>
            <span class="os-meta-value" id="os-data-entrada">${os.data_entrada ? new Date(os.data_entrada).toLocaleDateString("pt-BR") : "N/D"}</span>
          </div>
          <div class="os-meta-block">
            <span class="os-meta-label"><i class="fas fa-calendar-alt"></i> Previsão</span>
            <input type="date" id="header-input-previsao" class="form-control" style="padding: 2px 6px; height: 28px; font-size: 12px; font-weight: 600;" value="${os.previsao_entrega ? os.previsao_entrega.substring(0, 10) : ""}">
          </div>
        </div>

        <div class="os-header-actions" style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-secondary" id="btn-fechar-os">
            <i class="fas fa-times"></i> Fechar
          </button>
          <button class="btn btn-primary" id="btn-dropdown-status-os">
            <i class="fas fa-exchange-alt"></i> Mudar Status <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i>
          </button>
          <div class="card-panel hidden" id="menu-dropdown-status" style="position: absolute; right: 0; top: 42px; width: 220px; z-index: 100; padding: 6px; box-shadow: var(--sombra-modal);">
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px;" data-status="diagnostico">Diagnóstico</button>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px;" data-status="aguardando_orcamento">Aguardando Orçamento</button>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px;" data-status="aguardando_peca">Aguardando Peça</button>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px;" data-status="em_manutencao">Em Manutenção</button>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px;" data-status="pronto">Pronto para Retirada</button>
            <div style="border-top: 1px solid var(--borda); margin: 6px 0;"></div>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px; color: var(--verde);" data-status="entregue"><i class="fas fa-check"></i> Entregar Dispositivo</button>
            <button class="os-tab-trigger" style="width: 100%; text-align: left; border-radius: 4px; color: var(--vermelho);" data-status="cancelado"><i class="fas fa-times"></i> Cancelar OS</button>
          </div>
        </div>

      </div>
    </div>

    <div class="card-panel" style="padding: 12px 20px; margin-bottom: 24px;">
      <div class="os-tabs-nav">
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "resumo" ? "active" : ""}" data-target="resumo"><i class="fas fa-eye"></i> Resumo</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "diagnostico" ? "active" : ""}" data-target="diagnostico"><i class="fas fa-stethoscope"></i> Diagnóstico</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "pecas" ? "active" : ""}" data-target="pecas"><i class="fas fa-box-open"></i> Peças e Serviços</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "fotos" ? "active" : ""}" data-target="fotos"><i class="fas fa-camera"></i> Galeria Visual</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "comunicacoes" ? "active" : ""}" data-target="comunicacoes"><i class="fas fa-comments"></i> Comunicações</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "historico" ? "active" : ""}" data-target="historico"><i class="fas fa-history"></i> Linha do Tempo</button>
        <button class="os-tab-trigger ${EstadoTelaOS.abaAtiva === "financeiro" ? "active" : ""}" data-target="financeiro"><i class="fas fa-dollar-sign"></i> Financeiro</button>
      </div>
    </div>

    <div id="os-viewport-abas"></div>
  `;

  renderizarSubPainelAbas(os);
  configurarEventosCabecalho(os);
}

// =====================================================================
// RENDERIZADORES DE SUBPAINÉIS (SUB-MÓDULOS DE ABAS)
// =====================================================================

function renderizarSubPainelAbas(os) {
  const viewport = document.getElementById("os-viewport-abas");
  if (!viewport) return;

  const abasMapeadas = {
    resumo: renderAbaResumo,
    diagnostico: renderAbaDiagnostico,
    pecas: renderAbaPecasEServicos,
    fotos: renderAbaFotosEDocumentos,
    comunicacoes: renderAbaComunicação,
    historico: renderAbaHistorico,
    financeiro: renderAbaFinanceiro
  };

  if (abasMapeadas[EstadoTelaOS.abaAtiva]) {
    abasMapeadas[EstadoTelaOS.abaAtiva](os, viewport);
  }
}

function renderAbaResumo(os, viewport) {
  viewport.innerHTML = `
    <div class="os-detalhes-grid">
      
      <div class="card-panel">
        <h3 class="card-title"><i class="fas fa-align-left" style="color: var(--azul-primario)"></i> Relato de Entrada</h3>
        <div style="margin-top: 14px;">
          <p class="defeito-relatado-box">
            ${os.defeito_informado || "Nenhuma observação registrada."}
          </p>
        </div>
      </div>

      <div class="card-panel">
        <h3 class="card-title"><i class="fas fa-receipt" style="color: var(--azul-primario)"></i> Demonstrativo Financeiro</h3>
        <div class="valores-grid">
          <div class="valor-row"><span>Mão de Obra Técnica:</span> <strong>R$ ${(os.valor_servicos || 0).toFixed(2)}</strong></div>
          <div class="valor-row"><span>Componentes / Peças:</span> <strong>R$ ${(os.valor_pecas || 0).toFixed(2)}</strong></div>
          <div class="valor-row" style="color: var(--vermelho);"><span>Descontos Aplicados:</span> <strong>- R$ ${(os.desconto || 0).toFixed(2)}</strong></div>
          <div class="valor-row total"><span>Total Consolidado:</span> <span>R$ ${(os.valor_total || 0).toFixed(2)}</span></div>
        </div>
      </div>

    </div>
  `;
}

function renderAbaDiagnostico(os, viewport) {
  viewport.innerHTML = `
    <div class="card-panel">
      <h3 class="card-title"><i class="fas fa-microchip" style="color: var(--azul-primario)"></i> Parecer Técnico de Bancada</h3>
      <div style="margin-top: 16px;">
        <label class="form-label">Laudo Técnico do Diagnóstico Detalhado:</label>
        <textarea id="tab-diagnostico-texto" class="form-control" style="height: 140px; resize: none;" placeholder="Descreva os testes executados...">${os.diagnostico || ""}</textarea>
        
        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button class="btn btn-primary" id="btn-atualizar-laudo"><i class="fas fa-save"></i> Salvar Parecer Técnico</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("btn-atualizar-laudo").onclick = function() {
    const txt = document.getElementById("tab-diagnostico-texto").value;
    DB.atualizarStatusOS(os.id, os.status, txt);
    exibirConfirmacaoSalvo("Parecer técnico salvo.");
    atualizarFichaTécnicaCompleta();
  };
}

function renderAbaPecasEServicos(os, viewport) {
  viewport.innerHTML = `
    <div class="os-detalhes-grid">
      
      <div class="card-panel">
        <h3 class="card-title"><i class="fas fa-hammer" style="color: var(--azul-primario)"></i> Serviços Autorizados</h3>
        <div class="tabela-container" style="margin-top: 12px; max-height: 250px; overflow-y: auto;">
          <table class="tabela-padrao">
            <thead><tr><th>Descrição do Procedimento</th><th>Preço</th><th style="width: 60px; text-align: center;">Remover</th></tr></thead>
            <tbody>
              ${(os.servicos || []).length === 0 ? '<tr><td colspan="3" style="text-align:center; color:var(--texto-terciario);">Nenhum serviço lançado.</td></tr>' : (os.servicos || []).map((s, idx) => `
                <tr><td>${s.descricao}</td><td><b>R$ ${s.valor.toFixed(2)}</b></td><td style="text-align: center;"><button class="btn btn-sm btn-secondary btn-action-delete" style="color: var(--vermelho);" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button></td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px; border-top: 1px dashed var(--borda); padding-top: 14px;">
          <input type="text" id="add-serv-descricao" placeholder="Nome do procedimento técnico..." class="form-control" style="flex: 2;">
          <input type="number" id="add-serv-valor" placeholder="R$" class="form-control" style="flex: 1;">
          <button class="btn btn-primary" id="btn-add-serv-row"><i class="fas fa-plus"></i></button>
        </div>
      </div>

      <div class="card-panel">
        <h3 class="card-title"><i class="fas fa-box-open" style="color: var(--azul-primario)"></i> Peças e Componentes</h3>
        <div class="tabela-container" style="margin-top: 12px; max-height: 250px; overflow-y: auto;">
          <table class="tabela-padrao">
            <thead><tr><th>Componente</th><th>Qtd</th><th>Unitário</th><th>Subtotal</th><th style="width: 60px; text-align: center;">Remover</th></tr></thead>
            <tbody>
              ${(os.pecas || []).length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--texto-terciario);">Nenhuma peça alocada.</td></tr>' : (os.pecas || []).map((p, idx) => `
                <tr><td>${p.descricao}</td><td>${p.qtd}</td><td>R$ ${p.valor_unit.toFixed(2)}</td><td><b>R$ ${p.total.toFixed(2)}</b></td><td style="text-align: center;"><button class="btn btn-sm btn-secondary btn-action-delete-peca" style="color: var(--vermelho);" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button></td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; margin-top: 16px; border-top: 1px dashed var(--borda); padding-top: 14px;">
          <input type="text" id="add-peca-descricao" placeholder="Descrição do componente..." class="form-control">
          <input type="number" id="add-peca-qtd" value="1" class="form-control" min="1">
          <input type="number" id="add-peca-valor" placeholder="R$ Unit." class="form-control">
          <button class="btn btn-primary" id="btn-add-peca-row"><i class="fas fa-plus"></i></button>
        </div>
      </div>

    </div>
  `;
  configurarEventosInsumos(os);
}

function renderAbaFotosEDocumentos(os, viewport) {
  viewport.innerHTML = `
    <div class="card-panel">
      <h3 class="card-title"><i class="fas fa-camera" style="color: var(--azul-primario)"></i> Galeria de Registro Visual</h3>
      
      <div class="fotos-grid" style="margin-top: 16px;">
        
        <div class="foto-categoria-card">
          <h4 class="foto-categoria-title">Antes do Reparo (Entrada)</h4>
          <div class="galeria-fotos-container" id="galeria-antes_reparo"></div>
          <input type="file" id="input-upload-antes" class="hidden" accept="image/*">
          <button class="btn btn-secondary btn-sm" style="width: 100%" onclick="document.getElementById('input-upload-antes').click()"><i class="fas fa-upload"></i> Anexar Foto</button>
        </div>

        <div class="foto-categoria-card">
          <h4 class="foto-categoria-title">Interno (Bancada/Mecânica)</h4>
          <div class="galeria-fotos-container" id="galeria-internas"></div>
          <input type="file" id="input-upload-internas" class="hidden" accept="image/*">
          <button class="btn btn-secondary btn-sm" style="width: 100%" onclick="document.getElementById('input-upload-internas').click()"><i class="fas fa-upload"></i> Anexar Foto</button>
        </div>

        <div class="foto-categoria-card">
          <h4 class="foto-categoria-title">Depois do Reparo (Saída)</h4>
          <div class="galeria-fotos-container" id="galeria-depois_reparo"></div>
          <input type="file" id="input-upload-depois" class="hidden" accept="image/*">
          <button class="btn btn-secondary btn-sm" style="width: 100%" onclick="document.getElementById('input-upload-depois').click()"><i class="fas fa-upload"></i> Anexar Foto</button>
        </div>

      </div>
    </div>
  `;
  gerenciarMídiasEUploads(os);
}

function renderAbaComunicação(os, viewport) {
  viewport.innerHTML = `
    <div class="card-panel">
      <h3 class="card-title"><i class="fas fa-comments" style="color: var(--azul-primario)"></i> Log de Comunicações do Cliente</h3>
      
      <div class="chat-actions-bar">
        <a href="https://api.whatsapp.com/send?phone=${encodeURIComponent(EstadoTelaOS.clienteOS?.telefone_principal || '')}&text=${encodeURIComponent(`Olá ${EstadoTelaOS.clienteOS?.nome_completo || ''}, a Ordem de Serviço #${os.numero} foi aberta.`)}" target="_blank" class="btn btn-secondary btn-sm" style="color: var(--verde); border-color: var(--verde);"><i class="fab fa-whatsapp"></i> Notificar Entrada</a>
        <a href="https://api.whatsapp.com/send?phone=${encodeURIComponent(EstadoTelaOS.clienteOS?.telefone_principal || '')}&text=${encodeURIComponent(`Olá, o orçamento da OS #${os.numero} está pronto para aprovação.`)}" target="_blank" class="btn btn-secondary btn-sm" style="color: var(--azul-primario); border-color: var(--azul-primario);"><i class="fab fa-whatsapp"></i> Enviar Orçamento</a>
      </div>

      <div class="chat-container">
        <div class="chat-messages" id="chat-messages-container">
          ${(os.comunicacoes || []).length === 0 ? '<p style="text-align:center; color:var(--texto-terciario); font-style:italic; margin: 20px 0;">Nenhuma interação registrada no histórico.</p>' : os.comunicacoes.map(m => `
            <div class="chat-bubble">
              <div class="chat-bubble-meta"><b>${m.usuario}</b> — ${m.data}</div>
              <div class="chat-bubble-text">${m.texto}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="chat-input-row">
        <input type="text" id="input-comunicacao-txt" placeholder="Descreva aqui o resumo do contato feito com o cliente..." class="form-control">
        <button class="btn btn-primary" id="btn-enviar-comunicacao-log"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.getElementById("btn-enviar-comunicacao-log").onclick = function() {
    const txt = document.getElementById("input-comunicacao-txt").value;
    if (!txt) return;
    const listaComms = os.comunicacoes || [];
    listaComms.push({
      data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
      usuario: EstadoTelaOS.usuarioLogado?.nome || "Técnico",
      texto: txt
    });
    DB.atualizarOS(os.id, { comunicacoes: listaComms });
    exibirConfirmacaoSalvo("Comunicação registrada.");
    atualizarFichaTécnicaCompleta();
  };
}

function renderAbaHistorico(os, viewport) {
  const logsDeAuditoria = DB._ler("tecassist_historico_acoes") || [];
  const filtrados = logsDeAuditoria.filter(l => l.os_id === os.id || l.descricao.includes(`#${os.numero}`))
                                    .sort((a, b) => new Date(b.data) - new Date(a.data));

  viewport.innerHTML = `
    <div class="card-panel">
      <h3 class="card-title"><i class="fas fa-history" style="color: var(--azul-primario)"></i> Linha do Tempo da Ordem de Serviço</h3>
      
      <div class="timeline-container">
        ${filtrados.length === 0 ? '<p style="color: var(--texto-terciario); font-style: italic;">Nenhum rastro operacional encontrado.</p>' : filtrados.map(log => `
          <div class="timeline-item">
            <span class="timeline-date">${new Date(log.data).toLocaleString("pt-BR")}</span>
            <span class="timeline-title">${log.acao}</span>
            <p class="timeline-desc">${log.descricao}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAbaFinanceiro(os, viewport) {
  viewport.innerHTML = `
    <div class="card-panel">
      <h3 class="card-title"><i class="fas fa-dollar-sign" style="color: var(--azul-primario)"></i> Condições comerciais e Faturamento</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
        <div>
          <label class="form-label">Status Comercial do Orçamento</label>
          <select id="financeiro-status-orcamento" class="form-control">
            <option value="Aguardando análise" ${os.status_orcamento === "Aguardando análise" ? "selected" : ""}>Aguardando análise</option>
            <option value="Aprovado" ${os.status_orcamento === "Aprovado" ? "selected" : ""}>Aprovado (Autorizado)</option>
            <option value="Rejeitado" ${os.status_orcamento === "Rejeitado" ? "selected" : ""}>Rejeitado pelo Cliente</option>
          </select>
        </div>
        <div>
          <label class="form-label">Desconto Comercial Especial (R$)</label>
          <input type="number" id="financeiro-desconto-input" class="form-control" value="${os.desconto || 0}">
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 20px; border-top: 1px solid var(--borda); padding-top: 16px;">
        <button class="btn btn-primary" id="btn-atualizar-financeiro"><i class="fas fa-sync"></i> Atualizar Condições Comerciais</button>
      </div>
    </div>
  `;
  document.getElementById("btn-atualizar-financeiro").onclick = function() {
    const statusOrcamento = document.getElementById("financeiro-status-orcamento").value;
    const desc = parseFloat(document.getElementById("financeiro-desconto-input").value) || 0;
    DB.atualizarOS(os.id, { status_orcamento: statusOrcamento, desconto: desc });
    exibirConfirmacaoSalvo("Condições comerciais atualizadas.");
    atualizarFichaTécnicaCompleta();
  };
}

// =====================================================================
// GESTÃO DE EVENTOS E INTERAÇÕES
// =====================================================================

function popularSelectsCriacao() {
  const selectCliente = document.getElementById("os-form-cliente");
  const selectTecnico = document.getElementById("os-form-tecnico");
  
  if (selectCliente && selectTecnico) {
     selectCliente.innerHTML = '<option value="">Selecione um cliente...</option>';
     DB.listarClientes().forEach(c => {
       selectCliente.add(new Option(c.nome_completo, c.id));
     });
     DB.listarUsuarios().forEach(u => {
       selectTecnico.add(new Option(`${u.nome} (${u.cargo})`, u.id));
     });
  }
}

function configurarEventosCriacao() {
  const selectCliente = document.getElementById("os-form-cliente");
  const selectAparelho = document.getElementById("os-form-aparelho");

  if (selectCliente && selectAparelho) {
    selectCliente.addEventListener("change", function() {
      selectAparelho.innerHTML = '<option value="">Selecione o dispositivo...</option>';
      
      if (!this.value) {
        selectAparelho.disabled = true;
        return;
      }

      const todosClientes = DB.listarClientes();
      const clienteSelecionado = todosClientes.find(c => String(c.id) === String(this.value));

      if (!clienteSelecionado) {
        selectAparelho.disabled = true;
        return;
      }

      const dadosLocaisAparelhos = localStorage.getItem("tecassist_aparelhos");
      let todosOsAparelhos = [];
      if (dadosLocaisAparelhos) {
        todosOsAparelhos = JSON.parse(dadosLocaisAparelhos);
      }

      const aparelhosDoCliente = todosOsAparelhos.filter(aparelho => {
        const bateId = String(aparelho.clienteId) === String(clienteSelecionado.id);
        const bateNome = aparelho.clienteNome && aparelho.clienteNome.trim().toLowerCase() === clienteSelecionado.nome_completo.trim().toLowerCase();
        return bateId || bateNome;
      });

      if (aparelhosDoCliente.length > 0) {
        aparelhosDoCliente.forEach(ap => {
          selectAparelho.add(new Option(`${ap.marca} ${ap.modelo} (${ap.imei || 'Sem IMEI/SN'})`, ap.id));
        });
        selectAparelho.disabled = false;
      } else {
        selectAparelho.innerHTML = '<option value="">Nenhum dispositivo cadastrado para este cliente...</option>';
        selectAparelho.disabled = true;
      }
    });
  }

  const btnCancelar = document.getElementById("btn-cancelar-criacao");
  if (btnCancelar) btnCancelar.onclick = () => window.location.href = "ordens-servico.html";

  const formOS = document.getElementById("form-nova-os");
  if (formOS) {
    formOS.onsubmit = function(e) {
      e.preventDefault();
      
      if (!selectCliente.value || !selectAparelho.value) {
        alert("Selecione o cliente proprietário e o dispositivo correspondente.");
        return;
      }

      const payload = {
        cliente_id: selectCliente.value,
        aparelho_id: selectAparelho.value,
        tecnico_id: document.getElementById("os-form-tecnico").value,
        previsao_entrega: document.getElementById("os-form-previsao").value,
        defeito_informado: document.getElementById("os-form-defeito").value,
        status: "recebido",
        status_orcamento: "Aguardando análise",
        diagnostico: "",
        servicos: [],
        pecas: [],
        desconto: 0,
        fotos: { antes_reparo: [], internas: [], depois_reparo: [] },
        documentos: { nota_fiscal: [], laudos: [], comprovantes: [], outros: [] },
        comunicacoes: []
      };

      const osCriada = DB.criarOS(payload);
      // Redireciona diretamente de volta à tela de listagem de Ordens de Serviço
      if (osCriada) window.location.href = "ordens-servico.html";
    };
  }
}

function configurarEventosCabecalho(os) {
  document.querySelectorAll(".os-tabs-nav button").forEach(btn => {
    btn.onclick = function() {
      EstadoTelaOS.abaAtiva = this.getAttribute("data-target");
      renderizarPainelGerenciamento();
    };
  });

  const btnFechar = document.getElementById("btn-fechar-os");
  if (btnFechar) {
    btnFechar.onclick = () => { window.location.href = "ordens-servico.html"; };
  }

  const btnDropdown = document.getElementById("btn-dropdown-status-os");
  const menuDropdown = document.getElementById("menu-dropdown-status");
  if (btnDropdown && menuDropdown) {
    btnDropdown.onclick = (e) => { e.stopPropagation(); menuDropdown.classList.toggle("hidden"); };
    document.addEventListener("click", () => menuDropdown.classList.add("hidden"));
  }

  document.querySelectorAll("#menu-dropdown-status button").forEach(item => {
    item.onclick = function() {
      DB.atualizarStatusOS(os.id, this.getAttribute("data-status"), os.diagnostico);
      exibirConfirmacaoSalvo("Status da OS atualizado.");
      atualizarFichaTécnicaCompleta();
    };
  });

  const selTecnico = document.getElementById("header-select-tecnico");
  if (selTecnico) {
    selTecnico.onchange = function() {
      DB.atualizarOS(os.id, { tecnico_id: this.value });
      exibirConfirmacaoSalvo("Técnico responsável atualizado.");
      atualizarFichaTécnicaCompleta();
    };
  }

  const inpPrevisao = document.getElementById("header-input-previsao");
  if (inpPrevisao) {
    inpPrevisao.onchange = function() {
      DB.atualizarOS(os.id, { previsao_entrega: this.value });
      exibirConfirmacaoSalvo("Previsão de entrega atualizada.");
      atualizarFichaTécnicaCompleta();
    };
  }
}

function configurarEventosInsumos(os) {
  const btnAddServ = document.getElementById("btn-add-serv-row");
  if (btnAddServ) {
    btnAddServ.onclick = function() {
      const desc = document.getElementById("add-serv-descricao").value;
      const val = parseFloat(document.getElementById("add-serv-valor").value);
      if (!desc || isNaN(val)) return;

      const arr = os.servicos || [];
      arr.push({ descricao: desc, valor: val });
      DB.atualizarOS(os.id, { servicos: arr });
      exibirConfirmacaoSalvo("Serviço adicionado.");
      atualizarFichaTécnicaCompleta();
    };
  }

  document.querySelectorAll(".btn-action-delete").forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute("data-idx"));
      const arr = os.servicos || [];
      arr.splice(idx, 1);
      DB.atualizarOS(os.id, { servicos: arr });
      exibirConfirmacaoSalvo("Serviço removido.");
      atualizarFichaTécnicaCompleta();
    };
  });

  const btnAddPeca = document.getElementById("btn-add-peca-row");
  if (btnAddPeca) {
    btnAddPeca.onclick = function() {
      const desc = document.getElementById("add-peca-descricao").value;
      const qtd = parseInt(document.getElementById("add-peca-qtd").value) || 1;
      const val = parseFloat(document.getElementById("add-peca-valor").value);
      if (!desc || isNaN(val)) return;

      const arr = os.pecas || [];
      arr.push({ descricao: desc, qtd: qtd, valor_unit: val, total: qtd * val });
      DB.atualizarOS(os.id, { pecas: arr });
      exibirConfirmacaoSalvo("Peça adicionada.");
      atualizarFichaTécnicaCompleta();
    };
  }

  document.querySelectorAll(".btn-action-delete-peca").forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute("data-idx"));
      const arr = os.pecas || [];
      arr.splice(idx, 1);
      DB.atualizarOS(os.id, { pecas: arr });
      exibirConfirmacaoSalvo("Peça removida.");
      atualizarFichaTécnicaCompleta();
    };
  });
}

function gerenciarMídiasEUploads(os) {
  const renderGaleria = (id, lista, cat) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = (!lista || lista.length === 0) ? '<span class="sem-foto-txt">Nenhuma imagem cadastrada nesta etapa.</span>' : '';
    (lista || []).forEach(img => {
      const wrapper = document.createElement("div");
      wrapper.className = "foto-item-wrapper";
      
      wrapper.innerHTML = `
        <img src="${img.src}">
        <button>&times;</button>
      `;
      wrapper.querySelector("button").onclick = () => {
        const f = { ...os.fotos };
        f[cat] = f[cat].filter(x => x.id !== img.id);
        DB.atualizarOS(os.id, { fotos: f });
        exibirConfirmacaoSalvo("Foto removida.");
        atualizarFichaTécnicaCompleta();
      };
      el.appendChild(wrapper);
    });
  };

  renderGaleria("galeria-antes_reparo", os.fotos?.antes_reparo, "antes_reparo");
  renderGaleria("galeria-internas", os.fotos?.internas, "internas");
  renderGaleria("galeria-depois_reparo", os.fotos?.depois_reparo, "depois_reparo");

  const configurarUpload = (idInput, cat) => {
    const inp = document.getElementById(idInput);
    if (inp) {
      inp.onchange = function(e) {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = function(evt) {
          const fotos = { ...os.fotos };
          if (!fotos[cat]) fotos[cat] = [];
          fotos[cat].push({ id: "_" + Math.random().toString(36).substr(2, 9), src: evt.target.result });
          DB.atualizarOS(os.id, { fotos: fotos });
          exibirConfirmacaoSalvo("Foto anexada.");
          atualizarFichaTécnicaCompleta();
        };
        r.readAsDataURL(f);
      };
    }
  };

  configurarUpload("input-upload-antes", "antes_reparo");
  configurarUpload("input-upload-internas", "internas");
  configurarUpload("input-upload-depois", "depois_reparo");
}

// =====================================================================
// INICIALIZAÇÃO E ENTRADA
// =====================================================================
(function iniciarModuloOS() {
  EstadoTelaOS.usuarioLogado = TecAssistLayout.montar("os");
  if (!EstadoTelaOS.usuarioLogado) return;

  const urlParams = new URLSearchParams(window.location.search);
  const paramOS = urlParams.get("os");

  if (paramOS) {
    EstadoTelaOS.identificadorOS = paramOS;
    EstadoTelaOS.modoEdicao = true;
    atualizarFichaTécnicaCompleta();
  } else {
    EstadoTelaOS.modoEdicao = false;
    EstadoTelaOS.identificadorOS = null;
    renderizarBreadcrumbs();
    renderizarFormularioCriacao();
  }
})();