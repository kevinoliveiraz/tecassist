/**
 * ===========================================================================
 * comunicacoes.js — CONTROLADOR DO MÓDULO DE CLIENTES E COMUNICAÇÕES OMNICHANNEL
 * ===========================================================================
 */

const Comunicacoes = {
  // Estado local sincronizado dinamicamente com o db.js
  estado: {
    clienteSelecionadoId: null,
    filtroBusca: "",
    filtroGrupo: "Todos",
    filtroStatus: "Todos",
    abaAtivaId: "resumo",
    clientes: [],
    historicoMensagens: [
      { data: "15/06/2026", tipo: "WhatsApp", desc: "Notificação automática: Ordem de Serviço concluída.", status: "Enviado" },
      { data: "12/06/2026", tipo: "E-mail", desc: "Orçamento para troca de tela enviado para aprovação.", status: "Lido" },
      { data: "10/03/2024", tipo: "WhatsApp", desc: "Mensagem de boas-vindas ao sistema TecAssist.", status: "Enviado" }
    ]
  },

  /** Inicialização do Módulo */
  init() {
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("comunicacoes");
    }
    this.carregarDados();
    this.renderizar();
  },

  /** Carrega e mapeia os dados reais persistidos no db.js */
  carregarDados() {
    if (typeof DB !== "undefined" && typeof DB.listarClientes === "function") {
      const clientesDoBanco = DB.listarClientes() || [];
      
      // Mapeia e normaliza os campos vindos do formulário/banco para a UI de comunicações
      const mapeados = clientesDoBanco.map(c => ({
        id: c.id,
        nome: c.nome_completo || "Sem Nome",
        telefone: c.telefone_principal || "Não Informado",
        telefoneFixo: c.telefone_secundario || "",
        email: c.email || "Não Informado",
        ultimaOs: "Nenhuma OS",
        dataOs: "--/--/----",
        status: "Ativo", // Padrão comercial ativo
        grupo: c.enviar_whatsapp ? "Clientes frequentes" : "Novos clientes",
        cpf: c.cpf_cnpj || "Não Informado",
        nascimento: "Não cadastrado",
        endereco: `${c.endereco || ''} ${c.numero || ''} ${c.bairro || ''} ${c.cidade || ''}-${c.estado || ''}`.trim() || "Não cadastrado",
        cadastro: new Date().toLocaleDateString('pt-BR'),
        totalOs: 0,
        gastoTotal: 0.00,
        ticketMedio: 0.00
      }));

      // AJUSTE: Inverte a lista para que os cadastrados mais recentes apareçam em primeiro lugar
      this.estado.clientes = mapeados.reverse();

      // Seleciona o cliente se ele ainda existir, ou pega o primeiro disponível
      if (this.estado.clientes.length > 0) {
        const aindaExiste = this.estado.clientes.some(c => c.id === this.estado.clienteSelecionadoId);
        if (!aindaExiste || !this.estado.clienteSelecionadoId) {
          this.estado.clienteSelecionadoId = this.estado.clientes[0].id;
        }
      } else {
        this.estado.clienteSelecionadoId = null;
      }
    }
  },

  /** Redireciona para a página de edição de clientes */
  abrirEdicaoCliente(id) {
    if (!id) return;
    window.location.href = `clientes.html?id=${id}`;
  },

  /** Exclui o cliente e atualiza instantaneamente a listagem e a visualização */
  excluirCliente(id, nome) {
    if (!id) return;
    if (confirm(`Deseja realmente excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) {
      
      // Sincroniza e limpa de forma bruta no banco para evitar conflitos de cache ou tenant
      const lista = DB._ler(DB.CHAVES.CLIENTES) || [];
      const novaLista = lista.filter(c => c.id !== id);
      DB._salvar(DB.CHAVES.CLIENTES, novaLista);

      alert("Cliente removido com sucesso!");
      
      // Reseta a seleção antiga
      this.estado.clienteSelecionadoId = null;
      
      // RECARREGA E REDESENHA NA HORA
      this.carregarDados();
      this.renderizar();
    }
  },

  /** Renderiza a Estrutura da Página baseada no Design de 2 Colunas */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    // Filtra a lista de clientes baseando-se no estado atual dos filtros
    const clientesFiltrados = this.estado.clientes.filter(c => {
      const bateBusca = c.nome.toLowerCase().includes(this.estado.filtroBusca.toLowerCase()) || 
                       c.email.toLowerCase().includes(this.estado.filtroBusca.toLowerCase()) ||
                       c.id.toLowerCase().includes(this.estado.filtroBusca.toLowerCase());
      const bateGrupo = this.estado.filtroGrupo === "Todos" || c.grupo === this.estado.filtroGrupo;
      const bateStatus = this.estado.filtroStatus === "Todos" || c.status === this.estado.filtroStatus;
      return bateBusca && bateGrupo && bateStatus;
    });

    // Localiza o objeto do cliente ativo selecionado à direita ou assume fallback dos filtrados
    let clienteAtivo = this.estado.clientes.find(c => c.id === this.estado.clienteSelecionadoId);
    if (!clienteAtivo && clientesFiltrados.length > 0) {
      clienteAtivo = clientesFiltrados[0];
      this.estado.clienteSelecionadoId = clienteAtivo.id;
    }

    // Layout estrutural
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Comunicações</h1>
          <p class="page-subtitle" style="margin:0;">Sua lista telefônica de clientes. Visualize contatos e envie mensagens rapidamente.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn btn-secondary" onclick="alert('Importando contatos CSV...')"><i class="fas fa-file-import"></i> Importar contatos</button>
          <button class="btn btn-primary" onclick="window.location.href='clientes.html'"><i class="fas fa-arrow-left"></i> Voltar para Clientes</button>
        </div>
      </div>

      <div class="card-panel" style="margin-bottom: 20px; padding: 14px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          <div style="display:flex; gap:12px; flex:1; min-width:300px;">
            <div style="position:relative; flex:1; max-width:320px;">
              <i class="fas fa-search" style="position:absolute; left:12px; top:11px; color:var(--texto-terciario);"></i>
              <input type="text" id="com-busca" class="form-input" style="padding-left:34px;" placeholder="Buscar por nome, telefone ou e-mail..." value="${this.estado.filtroBusca}" oninput="Comunicacoes.atualizarFiltros()">
            </div>
            <select id="com-grupo" class="filtro-select" onchange="Comunicacoes.atualizarFiltros()">
              <option value="Todos" ${this.estado.filtroGrupo === "Todos" ? "selected" : ""}>Todos os grupos</option>
              <option value="Clientes frequentes" ${this.estado.filtroGrupo === "Clientes frequentes" ? "selected" : ""}>Clientes frequentes</option>
              <option value="Novos clientes" ${this.estado.filtroGrupo === "Novos clientes" ? "selected" : ""}>Novos clientes</option>
              <option value="Inativos" ${this.estado.filtroGrupo === "Inativos" ? "selected" : ""}>Inativos</option>
            </select>
            <select id="com-status" class="filtro-select" onchange="Comunicacoes.atualizarFiltros()">
              <option value="Todos" ${this.estado.filtroStatus === "Todos" ? "selected" : ""}>Todos os status</option>
              <option value="Ativo" ${this.estado.filtroStatus === "Ativo" ? "selected" : ""}>Ativos</option>
              <option value="Inativo" ${this.estado.filtroStatus === "Inativo" ? "selected" : ""}>Inativos</option>
            </select>
          </div>
          <span style="font-size:13px; color:var(--texto-secundario); font-weight:500;">Total de ${clientesFiltrados.length} clientes encontrados</span>
        </div>
      </div>

      ${clientesFiltrados.length === 0 || !clienteAtivo ? `
        <div class="card-panel" style="text-align:center; padding: 40px; color: var(--texto-secundario);">
          Nenhum cliente cadastrado ou localizado com os filtros vigentes.
        </div>
      ` : `
      <div class="grid-2col" style="grid-template-columns: 1.6fr 1fr;">
        
        <div class="card-panel" style="padding:0; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; min-height:560px;">
          <div class="tabela-container">
            <table class="tabela-padrao">
              <thead>
                <tr>
                  <th style="padding-left:20px;">Cliente</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Última OS</th>
                  <th>Status</th>
                  <th style="text-align:center; padding-right:20px;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${clientesFiltrados.map(c => `
                  <tr style="cursor:pointer; background: ${c.id === clienteAtivo.id ? 'var(--azul-claro)' : 'transparent'};" onclick="Comunicacoes.selecionarCliente('${c.id}')">
                    <td style="padding-left:20px;">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--texto-secundario); font-size:12px;">
                          ${c.nome.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <strong style="color:var(--texto-principal); font-size:13.5px; display:block;">${c.nome}</strong>
                          <span style="font-size:11.5px; color:var(--texto-terciario); font-weight:500;">ID: ${c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-size:13px; color:var(--texto-principal); font-weight:500;"><i class="fab fa-whatsapp" style="color:var(--verde); margin-right:4px;"></i> ${c.telefone}</div>
                      ${c.telefoneFixo ? `<div style="font-size:11.5px; color:var(--texto-terciario); padding-left:16px;">${c.telefoneFixo}</div>` : ""}
                    </td>
                    <td style="color:var(--texto-secundario); font-size:13px;">${c.email}</td>
                    <td>
                      <div style="font-weight:600; font-size:13px; color:var(--texto-principal);">${c.ultimaOs}</div>
                      <div style="font-size:11px; color:var(--texto-terciario);">${c.dataOs}</div>
                    </td>
                    <td>
                      <span class="badge ${c.status === 'Ativo' ? 'verde' : 'vermelho'}">${c.status}</span>
                    </td>
                    <td style="text-align:center; padding-right:20px;" onclick="event.stopPropagation();">
                      <div style="display:flex; gap:6px; justify-content:center;">
                        <button class="topbar-notification-btn" title="Enviar WhatsApp" onclick="Comunicacoes.dispararCanal('whatsapp', '${c.telefone}')"><i class="fab fa-whatsapp" style="color:var(--verde); font-size:14px;"></i></button>
                        <button class="topbar-notification-btn" title="Enviar E-mail" onclick="Comunicacoes.dispararCanal('email', '${c.email}')"><i class="far fa-envelope" style="color:var(--azul-primario); font-size:14px;"></i></button>
                        <button class="topbar-notification-btn" title="Editar Cliente" onclick="Comunicacoes.abrirEdicaoCliente('${c.id}')"><i class="far fa-edit" style="color:var(--azul-primario); font-size:14px;"></i></button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-top:1px solid var(--borda); background:var(--branco);">
            <span style="font-size:12.5px; color:var(--texto-secundario);">Mostrando 1 a ${clientesFiltrados.length} de ${clientesFiltrados.length} clientes</span>
            <div style="display:flex; gap:4px; align-items:center;">
              <button class="btn-secundario" style="padding:4px 8px; font-size:12px;" disabled><i class="fas fa-chevron-left"></i></button>
              <button class="btn-primario" style="padding:4px 10px; font-size:12px; height:28px;">1</button>
              <button class="btn-secundario" style="padding:4px 8px; font-size:12px;" disabled><i class="fas fa-chevron-right"></i></button>
              <select class="filtro-select" style="padding:3px 6px; font-size:12px; margin-left:8px;">
                <option>8 por página</option>
                <option>20 por página</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-panel" style="padding:20px; display:flex; flex-direction:column; justify-content:flex-start; height:fit-content;">
          
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:48px; height:48px; border-radius:50%; background:var(--azul-primario); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px;">
                ${clienteAtivo.nome.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
              </div>
              <div>
                <h3 style="font-size:16px; font-weight:700; color:var(--texto-principal); margin:0; display:inline-block; vertical-align:middle; margin-right:8px;">${clienteAtivo.nome}</h3>
                <span class="badge verde" style="font-size:10px; padding:2px 6px; vertical-align:middle;">${clienteAtivo.status}</span>
                <div style="font-size:12px; color:var(--texto-secundario); margin-top:2px;">ID: ${clienteAtivo.id}</div>
              </div>
            </div>
          </div>

          <div class="os-tabs" style="margin-bottom:16px;">
            <button class="os-tab-btn ${this.estado.abaAtivaId === 'resumo' ? 'active' : ''}" onclick="Comunicacoes.mudarAba('resumo')">Resumo</button>
            <button class="os-tab-btn ${this.estado.abaAtivaId === 'historico' ? 'active' : ''}" onclick="Comunicacoes.mudarAba('historico')">Histórico</button>
          </div>

          ${this.estado.abaAtivaId === "resumo" ? `
            <div style="display:flex; flex-direction:column; gap:16px; animation: osFadeIn 0.2s ease-out;">
              
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <h4 style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--texto-secundario); letter-spacing:0.02em;">Contatos</h4>
                  <button style="background:none; border:none; color:var(--azul-primario); font-size:12px; font-weight:600; cursor:pointer;" onclick="Comunicacoes.abrirEdicaoCliente('${clienteAtivo.id}')"><i class="far fa-edit"></i> Editar</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid var(--borda); border-radius:var(--raio-sm);">
                    <div>
                      <div style="font-size:12.5px; font-weight:600; color:var(--texto-principal);"><i class="fab fa-whatsapp" style="color:var(--verde); margin-right:6px;"></i> ${clienteAtivo.telefone}</div>
                      <div style="font-size:11px; color:var(--texto-terciario); padding-left:18px;">WhatsApp</div>
                    </div>
                    <button class="btn btn-primary" style="padding:5px 10px; font-size:11.5px; background:var(--verde-bg); color:var(--verde); border:none;" onclick="Comunicacoes.dispararCanal('whatsapp', '${clienteAtivo.telefone}')">Enviar mensagem</button>
                  </div>
                  ${clienteAtivo.telefoneFixo ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid var(--borda); border-radius:var(--raio-sm);">
                      <div>
                        <div style="font-size:12.5px; font-weight:600; color:var(--texto-principal);"><i class="fas fa-phone-alt" style="color:var(--azul-primario); margin-right:6px;"></i> ${clienteAtivo.telefoneFixo}</div>
                        <div style="font-size:11px; color:var(--texto-terciario); padding-left:18px;">Telefone</div>
                      </div>
                      <button class="btn btn-secondary" style="padding:5px 10px; font-size:11.5px;" onclick="Comunicacoes.dispararCanal('ligar', '${clienteAtivo.telefoneFixo}')">Ligar</button>
                    </div>
                  ` : ""}
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid var(--borda); border-radius:var(--raio-sm);">
                    <div>
                      <div style="font-size:12.5px; font-weight:600; color:var(--texto-principal);"><i class="far fa-envelope" style="color:var(--texto-secundario); margin-right:6px;"></i> ${clienteAtivo.email}</div>
                      <div style="font-size:11px; color:var(--texto-terciario); padding-left:18px;">E-mail</div>
                    </div>
                    <button class="btn btn-secondary" style="padding:5px 10px; font-size:11.5px;" onclick="Comunicacoes.dispararCanal('email', '${clienteAtivo.email}')">Enviar e-mail</button>
                  </div>
                </div>
              </div>

              <div style="border-top:1px solid var(--borda); padding-top:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <h4 style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--texto-secundario);">Informações</h4>
                  <button style="background:none; border:none; color:var(--azul-primario); font-size:12px; font-weight:600; cursor:pointer;" onclick="Comunicacoes.abrirEdicaoCliente('${clienteAtivo.id}')"><i class="far fa-edit"></i> Editar</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--texto-secundario);">CPF</span><strong style="color:var(--texto-principal);">${clienteAtivo.cpf}</strong></div>
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--texto-secundario);">Data de nascimento</span><strong style="color:var(--texto-principal);">${clienteAtivo.nascimento}</strong></div>
                  
                  <div style="margin-bottom:4px;">
                    <span style="color:var(--texto-secundario); display:block; margin-bottom:2px;">Endereço Cadastrado</span>
                    <strong style="color:var(--texto-principal); line-height:1.4; display:block;">${clienteAtivo.endereco}</strong>
                  </div>

                  <div style="margin-top:12px;">
                    <button class="btn btn-danger-excluir" style="width:100%; font-size:13px; height:36px; display:flex; align-items:center; justify-content:center; gap:6px; background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; border-radius:4px; font-weight:600; cursor:pointer;" onclick="Comunicacoes.excluirCliente('${clienteAtivo.id}', '${clienteAtivo.nome}')">
                      <i class="far fa-trash-alt"></i> Excluir Cliente
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:14px; animation: osFadeIn 0.2s ease-out;">
              <h4 style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--texto-secundario);">Histórico de disparos</h4>
              
              <div class="timeline-os" style="margin-top:4px; padding-left:22px;">
                ${this.estado.historicoMensagens.map(m => `
                  <div class="timeline-item" style="margin-bottom:16px;">
                    <div class="timeline-data" style="font-size:11px;">${m.data} — <span class="badge ${m.tipo === 'WhatsApp' ? 'verde' : 'azul'}" style="font-size:9px; padding:1px 6px;">${m.tipo}</span></div>
                    <div class="timeline-titulo" style="font-size:12.5px; margin:2px 0;">${m.desc}</div>
                    <div style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--texto-secundario);">
                      <i class="fas ${m.status === 'Lido' ? 'fa-check-double' : 'fa-check'}" style="color: ${m.status === 'Lido' ? 'var(--azul-primario)' : 'var(--texto-terciario)'};"></i> Status: ${m.status}
                    </div>
                  </div>
                `).join("")}
              </div>

              <button class="btn btn-secondary" style="width:100%; font-size:12.5px; padding:8px; margin-top:10px;" onclick="alert('Carregando registros de auditoria mais antigos...')">Ver histórico completo</button>
            </div>
          `}

        </div>

      </div>
      `}
    `;
  },

  /** Gerencia a Alternância de Seleção de Clientes */
  selecionarCliente(id) {
    this.estado.clienteSelecionadoId = id;
    this.renderizar();
  },

  /** Alternador de Abas Internas (Resumo vs Histórico) */
  mudarAba(abaId) {
    this.estado.abaAtivaId = abaId;
    this.renderizar();
  },

  /** Captura Eventos de Entrada dos Filtros e Sincroniza o Estado */
  atualizarFiltros() {
    this.estado.filtroBusca = document.getElementById("com-busca").value;
    this.estado.filtroGrupo = document.getElementById("com-grupo").value;
    this.estado.filtroStatus = document.getElementById("com-status").value;
    this.renderizar();
  },

  /** Mecanismo de Disparo de Mensagens Ominichannel */
  dispararCanal(tipo, destino) {
    if (!destino || destino === "Não Informado") {
      alert("Destino de contato inválido ou não cadastrado.");
      return;
    }
    
    // AJUSTE: Executa as integrações reais de envio através de protocolos do navegador
    if (tipo === "whatsapp") {
      // Deixa apenas os números limpos e gera o link da API oficial do WhatsApp
      const numeroLimpo = destino.replace(/[^\d]+/g, '');
      window.open(`https://wa.me/${numeroLimpo}`, '_blank');
    } else if (tipo === "email") {
      // Abre o Gmail ou oferece opções nativas de e-mail usando o padrão mailto
      window.location.href = `mailto:${destino}`;
    } else {
      // Executa discagem telefônica nativa por padrão
      window.location.href = `tel:${destino.replace(/[^\d]+/g, '')}`;
    }
  }
};

// Vinculação segura ao ciclo de carregamento do ecossistema do script principal
document.addEventListener("DOMContentLoaded", () => {
  Comunicacoes.init();
});