/**
 * ===========================================================================
 * clientes.js — CONTROLADOR DO MÓDULO DE CLIENTES (FORMULÁRIO UNIFICADO)
 * ===========================================================================
 */

const Clientes = {
  // Estado local e volátil do formulário
  estado: {
    clienteId: null,
    dados: {}
  },

  /**
   * Ponto de entrada inicializado ao carregar a página
   */
  init() {
    // 1. Aciona o frame de layout global através do sidebar.js
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("clientes");
    }

    // 2. Tenta capturar um ID da URL para modo de edição (?id=...)
    const params = new URLSearchParams(window.location.search);
    this.estado.clienteId = params.get("id");

    // 3. Carrega os dados se for uma edição utilizando a API oficial do db.js
    this.carregarCliente();

    // 4. Renderiza os componentes na tela
    this.renderizar();
  },

  /**
   * Sincroniza dados com a persistência através da API pública oficial do db.js
   */
  carregarCliente() {
    if (!this.estado.clienteId) return;

    // Consome estritamente a API oficial fornecida pelo db.js
    if (typeof DB.obterCliente === "function") {
      this.estado.dados = DB.obterCliente(this.estado.clienteId) || {};
    }
  },

  /**
   * Auxiliar seguro para prevenção de falhas de renderização e XSS
   */
  escapeHtml(string) {
    if (!string) return "";
    return String(string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Renderiza os blocos da interface dentro do container oficial utilizado pelo dashboard.js
   */
  renderizar() {
    // Utiliza exatamente o mesmo container padrão do dashboard.js (page-body)
    const container = document.getElementById("page-body");
    if (!container) return;

    // Limpa a tela e monta os wrappers internos estruturais
    container.innerHTML = `
      <div class="dashboard-container">
        <div id="wrapper-cabecalho"></div>
        <div id="wrapper-formulario"></div>
      </div>
    `;

    // Renderiza cada subcomponente através de funções pequenas e dedicadas
    this.renderizarCabecalho();
    this.renderizarFormulario();
  },

  /**
   * Renderiza la barra superior de ações alinhadas com os botões requisitados
   */
  renderizarCabecalho() {
    const wrapper = document.getElementById("wrapper-cabecalho");
    if (!wrapper) return;

    const titulo = this.estado.clienteId ? "Editar Cliente" : "Novo Cliente";

    wrapper.innerHTML = `
      <div class="dashboard-header-flex">
        <div class="header-info">
          <h1 class="dashboard-titulo">${titulo}</h1>
          <p class="dashboard-subtitulo">Gerencie as informações cadastrais do cliente.</p>
        </div>
        <div class="acoes-formulario-grupo">
          <button type="button" class="btn btn-secondary" id="btn-cancelar">Cancelar</button>
          <button type="button" class="btn btn-secondary" id="btn-comunicacoes">Comunicações</button>
          <button type="button" class="btn btn-secondary" id="btn-garantias">Garantias</button>
          <button type="button" class="btn btn-primary" id="btn-salvar">Salvar Cliente</button>
        </div>
      </div>
    `;

    this.vincularEventosCabecalho();
  },

  /**
   * Vincula os eventos de clique aos botões do cabeçalho
   */
  vincularEventosCabecalho() {
    document.getElementById("btn-cancelar").addEventListener("click", () => this.cancelar());
    document.getElementById("btn-comunicacoes").addEventListener("click", () => {
      window.location.href = "comunicacoes.html";
    });
    document.getElementById("btn-garantias").addEventListener("click", () => {
      window.location.href = "garantias.html";
    });
    document.getElementById("btn-salvar").addEventListener("click", () => this.salvarCliente());
  },

  /**
   * Renderiza o formulário em grid ocupando toda a área útil, usando os nomes de campos oficiais
   */
  renderizarFormulario() {
    const wrapper = document.getElementById("wrapper-formulario");
    if (!wrapper) return;

    const d = this.estado.dados || {};
    // Verifica a propriedade oficial do banco: enviar_whatsapp
    const whatsappChecked = d.enviar_whatsapp === true || (!this.estado.clienteId) ? "checked" : "";

    wrapper.innerHTML = `
      <div class="card card-formulario-completo">
        <form id="form-cliente-principal" onsubmit="event.preventDefault();">
          
          <div class="grid-formulario-sistema">
            
            <div class="col-span-8">
              <label class="form-label">Nome Completo / Razão Social *</label>
              <input type="text" class="form-control" name="nome_completo" required placeholder="Ex: João da Silva" value="${this.escapeHtml(d.nome_completo)}">
            </div>
            <div class="col-span-4">
              <label class="form-label">CPF / CNPJ</label>
              <input type="text" class="form-control" name="cpf_cnpj" placeholder="000.000.000-00" value="${this.escapeHtml(d.cpf_cnpj)}">
            </div>

            <div class="col-span-4">
              <label class="form-label">Telefone Principal</label>
              <input type="text" class="form-control" name="telefone_principal" placeholder="(11) 99999-9999" value="${this.escapeHtml(d.telefone_principal)}">
            </div>
            <div class="col-span-4">
              <label class="form-label">Telefone Secundário</label>
              <input type="text" class="form-control" name="telefone_secundario" placeholder="(11) 1111-1111" value="${this.escapeHtml(d.telefone_secundario)}">
            </div>
            <div class="col-span-4 campo-checkbox-container">
              <label class="form-label-checkbox">
                <input type="checkbox" name="enviar_whatsapp" value="sim" ${whatsappChecked}> 
                Possui WhatsApp
              </label>
            </div>

            <div class="col-span-12">
              <label class="form-label">E-mail</label>
              <input type="email" class="form-control" name="email" placeholder="cliente@email.com" value="${this.escapeHtml(d.email)}">
            </div>

            <div class="col-span-3">
              <label class="form-label">CEP</label>
              <input type="text" class="form-control" name="cep" placeholder="00000-000" value="${this.escapeHtml(d.cep)}">
            </div>
            <div class="col-span-6">
              <label class="form-label">Endereço</label>
              <input type="text" class="form-control" name="endereco" placeholder="Rua, Avenida..." value="${this.escapeHtml(d.endereco)}">
            </div>
            <div class="col-span-3">
              <label class="form-label">Número</label>
              <input type="text" class="form-control" name="numero" placeholder="123" value="${this.escapeHtml(d.numero)}">
            </div>

            <div class="col-span-6">
              <label class="form-label">Complemento</label>
              <input type="text" class="form-control" name="complemento" placeholder="Apto, Bloco..." value="${this.escapeHtml(d.complemento)}">
            </div>
            <div class="col-span-6">
              <label class="form-label">Bairro</label>
              <input type="text" class="form-control" name="bairro" placeholder="Bairro" value="${this.escapeHtml(d.bairro)}">
            </div>

            <div class="col-span-8">
              <label class="form-label">Cidade</label>
              <input type="text" class="form-control" name="cidade" placeholder="São Paulo" value="${this.escapeHtml(d.cidade)}">
            </div>
            <div class="col-span-4">
              <label class="form-label">Estado</label>
              <input type="text" class="form-control" name="estado" maxlength="2" placeholder="SP" value="${this.escapeHtml(d.estado)}">
            </div>

            <div class="col-span-12">
              <label class="form-label">Observações</label>
              <textarea class="form-control textarea-observacoes" name="observacoes" rows="4" placeholder="Observações e anotações internas sobre o cliente...">${this.escapeHtml(d.observacoes)}</textarea>
            </div>

          </div>
        </form>
      </div>
    `;
  },

  /**
   * Coleta e mapeia os dados informados nos inputs do formulário utilizando as chaves do db.js
   */
  coletarDadosFormulario() {
    const form = document.getElementById("form-cliente-principal");
    if (!form) return null;

    const formData = new FormData(form);
    
    return {
      nome_completo: formData.get("nome_completo"),
      cpf_cnpj: formData.get("cpf_cnpj"),
      telefone_principal: formData.get("telefone_principal"),
      telefone_secundario: formData.get("telefone_secundario"),
      enviar_whatsapp: formData.get("enviar_whatsapp") === "sim",
      email: formData.get("email"),
      cep: formData.get("cep"),
      endereco: formData.get("endereco"),
      numero: formData.get("numero"),
      complemento: formData.get("complemento"),
      bairro: formData.get("bairro"),
      cidade: formData.get("cidade"),
      estado: formData.get("estado"),
      observacoes: formData.get("observacoes")
    };
  },

  /**
   * Envia os dados coletados de forma segura exclusivamente para as funções públicas oficiais da API do db.js
   */
  salvarCliente() {
    // Guarda o botão para manipulações de UX
    const btnSalvar = document.getElementById("btn-salvar");
    
    // Evita chamadas concorrentes paralelas se já estiver salvando
    if (this.estado.salvando) return;

    const form = document.getElementById("form-cliente-principal");
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const dadosCliente = this.coletarDadosFormulario();
    
    // 1. Bloqueio imediato para evitar múltiplos cliques
    this.estado.salvando = true;
    if (btnSalvar) {
      btnSalvar.disabled = true;
      btnSalvar.innerText = "Salvando Cliente...";
    }

    try {
      // 2. Interceptação da Validação utilizando o VerificadorDados e métodos do DB
      if (typeof VerificadorDados !== "undefined" && typeof DB.listarClientes === "function") {
        const clientesExistentes = DB.listarClientes();
        
        const resultadoValidacao = VerificadorDados.validarCliente(
          dadosCliente,
          clientesExistentes,
          this.estado.clienteId
        );

        // Em caso de erro de validação (formato ou duplicidade)
        if (!resultadoValidacao.sucesso) {
          alert(resultadoValidacao.mensagem);
          
          // Libera novamente o botão para ajustes na tela
          this.estado.salvando = false;
          if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Salvar Cliente";
          }
          return; // Aborta fluxo de persistência
        }
      }

      // 3. Salvamento via Métodos Públicos Existentes do DB
      let resultado = null;

      if (this.estado.clienteId) {
        // Modo Edição: Consome estritamente a função pública nativa do banco fornecido
        if (typeof DB.atualizarCliente === "function") {
          resultado = DB.atualizarCliente(this.estado.clienteId, dadosCliente);
        }
      } else {
        // Modo Criação: Consome estritamente a função pública nativa do banco fornecido
        if (typeof DB.criarCliente === "function") {
          resultado = DB.criarCliente(dadosCliente);
        }
      }

      // 4. Fluxo pós-salvamento e feedback de interface
      if (resultado) {
        // Mensagem de sucesso em bloco isolado para futura troca por Toast
        this.exibirMensagemSucesso("✅ Cliente salvo com sucesso.");
        
        // CORREÇÃO: Limpa os inputs da tela e reseta o estado local para novos cadastros
        form.reset();
        this.estado.clienteId = null;
        this.estado.dados = {};

        // Recarrega os títulos do cabeçalho caso estivesse em modo edição
        this.renderizarCabecalho();

        // Mantém na mesma página liberando o botão para edições futuras ou novas operações
        this.estado.salvando = false;
        if (btnSalvar) {
          btnSalvar.disabled = false;
          btnSalvar.innerText = "Salvar Cliente";
        }
      } else {
        alert("Erro ao processar a operação no banco de dados.");
        
        // Libera novamente o botão apenas se ocorrer erro para permitir nova tentativa
        this.estado.salvando = false;
        if (btnSalvar) {
          btnSalvar.disabled = false;
          btnSalvar.innerText = "Salvar Cliente";
        }
      }

    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro inesperado ao processar a operação.");
      
      this.estado.salvando = false;
      if (btnSalvar) {
        btnSalvar.disabled = false;
        btnSalvar.innerText = "Salvar Cliente";
      }
    }
  },

  /**
   * Lógica isolada para mensagens de sucesso de forma estruturada
   */
  exibirMensagemSucesso(mensagem) {
    alert(mensagem);
  },

  /**
   * Retorna ao painel abortando alterações vigentes
   */
  cancelar() {
    if (confirm("Deseja realmente sair? As alterações não salvas serão perdidas.")) {
      window.location.href = "dashboard.html";
    }
  }
};

// Inicialização acoplada ao carregamento do DOM
document.addEventListener("DOMContentLoaded", () => Clientes.init());