/**
 * ===========================================================================
 * agenda.js — CONTROLADOR DO MÓDULO DE AGENDA E COMPROMISSOS
 * ===========================================================================
 */

const Agenda = {
  // Estado local e volátil do componente de agendamentos
  estado: {
    compromissos: [],
    dataSelecionada: new Date().toISOString().split('T')[0],
    filtroTecnico: "Todos",
    filtroStatus: "Todos",
    visaoAtual: "calendario", // calendario | lista
    compromissoEdicaoId: null
  },

  /** Ponto de entrada invocado no carregamento da página */
  init() {
    // 1. Aciona a montagem do frame lateral estrutural e topbar
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("agenda");
    }

    // 2. Carrega dados do repositório local
    this.carregar();

    // 3. Renderiza a estrutura inicial da tela
    this.renderizar();
  },

  /** Persistência Local via LocalStorage em simetria com db.js */
  carregar() {
    const dadosLocais = localStorage.getItem("tecassist_agenda");
    if (dadosLocais) {
      this.estado.compromissos = JSON.parse(dadosLocais);
    } else {
      // Dados padrão para homologação inicial do ecossistema SaaS
      const hoje = new Date().toISOString().split('T')[0];
      this.estado.compromissos = [
        {
          id: "AGM-001",
          titulo: "Retirada de Tela iPhone 13 - Cliente Carlos",
          data: hoje,
          hora: "14:00",
          tecnico: "Valdir Técnico",
          status: "pendente",
          descricao: "Cliente agendou para buscar o aparelho consertado no balcão."
        },
        {
          id: "AGM-002",
          titulo: "Avaliação Técnica em Notebook Dell",
          data: hoje,
          hora: "16:30",
          tecnico: "Valdir Técnico",
          status: "concluido",
          descricao: "Análise preventiva de curto na placa mãe."
        }
      ];
      this.salvar();
    }
  },

  salvar() {
    localStorage.setItem("tecassist_agenda", JSON.stringify(this.estado.compromissos));
  },

  /** Operações de CRUD */
  criar(novoAgendamento) {
    novoAgendamento.id = "AGM-" + Math.floor(1000 + Math.random() * 9000);
    this.estado.compromissos.push(novoAgendamento);
    this.salvar();
    this.renderizar();
  },

  editar(id, dadosAtualizados) {
    const index = this.estado.compromissos.findIndex(c => c.id === id);
    if (index !== -1) {
      this.estado.compromissos[index] = { ...this.estado.compromissos[index], ...dadosAtualizados };
      this.salvar();
      this.renderizar();
    }
  },

  excluir(id) {
    if (confirm("Deseja realmente remover este agendamento de forma permanente?")) {
      this.estado.compromissos = this.estado.compromissos.filter(c => c.id !== id);
      this.salvar();
      this.renderizar();
    }
  },

  /** Filtros Dinâmicos */
  filtrarCompromissos() {
    return this.estado.compromissos.filter(c => {
      const matchTecnico = this.estado.filtroTecnico === "Todos" || c.tecnico === this.estado.filtroTecnico;
      const matchStatus = this.estado.filtroStatus === "Todos" || c.status === this.estado.filtroStatus;
      
      if (this.estado.visaoAtual === "calendario") {
        return matchTecnico && matchStatus; // O calendário marca os dias globalmente
      } else {
        return matchTecnico && matchStatus && c.data === this.estado.dataSelecionada;
      }
    });
  },

  /** Renderização da Interface do Usuário */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Agenda TecAssist</h1>
          <p class="page-subtitle">Gerencie prazos de entrega, horários de atendimento e o fluxo técnico do laboratório.</p>
        </div>
        <button class="btn btn-primary" id="btn-novo-compromisso" style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-calendar-plus"></i> Novo Agendamento
        </button>
      </div>

      <div class="card-panel" style="margin-bottom: 24px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          
          <div style="display: flex; gap: 12px; flex: 1; min-width: 280px;">
            <select id="filtro-agenda-tecnico" class="form-control" style="max-width: 200px;">
              <option value="Todos">Todos os Técnicos</option>
              <option value="Valdir Técnico" ${this.estado.filtroTecnico === 'Valdir Técnico' ? 'selected' : ''}>Valdir Técnico</option>
            </select>
            <select id="filtro-agenda-status" class="form-control" style="max-width: 200px;">
              <option value="Todos">Todos os Status</option>
              <option value="pendente" ${this.estado.filtroStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="concluido" ${this.estado.filtroStatus === 'concluido' ? 'selected' : ''}>Concluído</option>
              <option value="cancelado" ${this.estado.filtroStatus === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>

          <div style="display: flex; gap: 4px; background: var(--fundo-pagina); padding: 4px; border-radius: 6px; border: 1px solid var(--borda);">
            <button class="os-tab-trigger ${this.estado.visaoAtual === 'calendario' ? 'active' : ''}" style="padding: 6px 12px; margin:0; font-size:13px;" onclick="Agenda.alterarVisao('calendario')">
              <i class="fas fa-calendar-alt"></i> Mês
            </button>
            <button class="os-tab-trigger ${this.estado.visaoAtual === 'lista' ? 'active' : ''}" style="padding: 6px 12px; margin:0; font-size:13px;" onclick="Agenda.alterarVisao('lista')">
              <i class="fas fa-list"></i> Lista Diária
            </button>
          </div>

        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start;">
        
        <div>
          ${this.estado.visaoAtual === "calendario" ? this.renderizarGradeCalendario() : this.renderizarTabelaLista()}
        </div>

        <div class="card-panel" style="padding: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--texto-principal); margin: 0 0 16px 0; border-bottom: 1px solid var(--borda); padding-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>Compromissos do Dia</span>
            <small style="font-size: 11px; color: var(--azul-primario); background: var(--azul-claro); padding: 2px 6px; border-radius: 4px;">${this.formatarDataBr(this.estado.dataSelecionada)}</small>
          </h3>
          <div style="display: flex; flex-direction: column; gap: 12px;" id="painel-diario-lista">
            ${this.renderizarEventosLateraisDoDia()}
          </div>
        </div>

      </div>

      <div id="modal-container-agenda"></div>
    `;

    this.vincularEventosInteracao();
  },

  /** Renderiza o Layout Clássico de Calendário Mensal */
  renderizarGradeCalendario() {
    const hoje = new Date(this.estado.dataSelecionada);
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    // Primeiro dia do mês corrente e total de dias
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const compromissosFiltrados = this.filtrarCompromissos();

    let HTMLGrade = `
      <div class="card-panel" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <button class="btn btn-sm btn-secondary" onclick="Agenda.navegarMes(-1)"><i class="fas fa-chevron-left"></i> Anterior</button>
          <strong style="font-size: 16px; color: var(--texto-principal); text-transform: capitalize;">${hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
          <button class="btn btn-sm btn-secondary" onclick="Agenda.navegarMes(1)">Próximo <i class="fas fa-chevron-right"></i></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center; font-weight: 600; font-size: 12px; color: var(--texto-secundario); margin-bottom: 8px;">
          ${nomesDias.map(d => `<div>${d}</div>`).join("")}
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-height: 320px;">
    `;

    // Preenche lacunas de dias do mês anterior
    for (let i = 0; i < primeiroDiaSemana; i++) {
      HTMLGrade += `<div style="background: var(--fundo-pagina); opacity: 0.4; border-radius: 4px;"></div>`;
    }

    // Renderiza cada dia ativo do mês corrente
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const dataIsoString = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const eventosDoDia = compromissosFiltrados.filter(c => c.data === dataIsoString);
      const isSelecionado = dataIsoString === this.estado.dataSelecionada;

      HTMLGrade += `
        <div onclick="Agenda.selecionarData('${dataIsoString}')" style="border: 1px solid ${isSelecionado ? 'var(--azul-primario)' : 'var(--borda)'}; background: ${isSelecionado ? 'var(--azul-claro)' : 'var(--branco)'}; padding: 6px; border-radius: 4px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; min-height: 64px; transition: all 0.15s;">
          <span style="font-size: 11px; font-weight: 600; color: ${isSelecionado ? 'var(--azul-primario)' : 'var(--texto-principal)'};">${dia}</span>
          <div style="display:flex; flex-direction:column; gap:2px;">
            ${eventosDoDia.slice(0, 2).map(ev => `
              <div style="font-size: 9px; padding: 2px 4px; border-radius: 3px; background: ${ev.status === 'concluido' ? '#d1fae5' : '#fee2e2'}; color: ${ev.status === 'concluido' ? '#059669' : '#dc2626'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${ev.hora} ${ev.titulo}
              </div>
            `).join("")}
            ${eventosDoDia.length > 2 ? `<small style="font-size:8px; color:var(--texto-secundario); text-align:center;">+ ${eventosDoDia.length - 2} eventos</small>` : ''}
          </div>
        </div>
      `;
    }

    HTMLGrade += `</div></div>`;
    return HTMLGrade;
  },

  /** Renderiza Layout Alternativo em Formato de Tabela Ampla */
  renderizarTabelaLista() {
    const compromissosFiltrados = this.filtrarCompromissos();

    return `
      <div class="card-panel" style="padding: 0; overflow: hidden;">
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Compromisso / Prazo</th>
                <th>Responsável Técnico</th>
                <th>Status</th>
                <th style="text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${compromissosFiltrados.length === 0 ? `
                <tr><td colspan="5" class="os-vazio-texto">Nenhum agendamento fixado para o dia de hoje.</td></tr>
              ` : compromissosFiltrados.map(ev => `
                <tr>
                  <td><code style="font-weight:600;">${ev.hora}</code></td>
                  <td>
                    <div style="font-weight:600; color:var(--texto-principal);">${ev.titulo}</div>
                    <small style="color:var(--texto-secundario);">${ev.descricao || 'Sem descrição'}</small>
                  </td>
                  <td><span style="font-size:13px;"><i class="fas fa-user-cog" style="font-size:11px; margin-right:6px; color:var(--texto-terciario)"></i>${ev.tecnico}</span></td>
                  <td><span class="badge ${ev.status === 'concluido' ? 'verde' : ev.status === 'cancelado' ? 'vermelho' : 'amarelo'}">${ev.status}</span></td>
                  <td style="text-align:right;">
                    <div style="display:flex; gap:4px; justify-content:flex-end;">
                      <button class="btn btn-sm btn-secondary" onclick="Agenda.abrirEdicao('${ev.id}')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-sm btn-secondary" style="color:var(--vermelho)" onclick="Agenda.excluir('${ev.id}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /** Painel Auxiliar Lateral Reduzido */
  renderizarEventosLateraisDoDia() {
    const doDia = this.estado.compromissos.filter(c => c.data === this.estado.dataSelecionada);
    if (doDia.length === 0) {
      return `<div class="os-vazio-texto" style="padding: 40px 0;">Livre de compromissos para esta data.</div>`;
    }

    return doDia.map(ev => `
      <div style="padding: 12px; border-radius: 6px; background: var(--fundo-pagina); border-left: 4px solid ${ev.status === 'concluido' ? 'var(--verde)' : 'var(--azul-primario)'};">
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: var(--texto-principal);"><i class="far fa-clock" style="margin-right:4px;"></i> ${ev.hora}</span>
          <span class="badge ${ev.status === 'concluido' ? 'verde' : 'amarelo'}" style="font-size:10px; padding:2px 6px;">${ev.status}</span>
        </div>
        <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight:600; color: var(--texto-principal);">${ev.titulo}</h4>
        <p style="margin: 0; font-size: 12px; color: var(--texto-secundario); font-style:italic;">${ev.descricao || ''}</p>
        <div style="margin-top: 8px; display:flex; justify-content: space-between; align-items: center;">
          <span style="font-size:11px; color:var(--texto-secundario);"><i class="fas fa-tools"></i> ${ev.tecnico}</span>
          <div style="display:flex; gap:4px;">
            <button style="background:none; border:none; color:var(--texto-secundario); cursor:pointer; font-size:11px;" onclick="Agenda.abrirEdicao('${ev.id}')"><i class="fas fa-edit"></i></button>
            <button style="background:none; border:none; color:var(--vermelho); cursor:pointer; font-size:11px;" onclick="Agenda.excluir('${ev.id}')"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>
    `).join("");
  },

  /** Eventos Mutadores e Mutex de Visões */
  alterarVisao(novaVisao) {
    this.estado.visaoAtual = novaVisao;
    this.renderizar();
  },

  selecionarData(dataIso) {
    this.estado.dataSelecionada = dataIso;
    this.renderizar();
  },

  navegarMes(direcao) {
    const atual = new Date(this.estado.dataSelecionada);
    atual.setMonth(atual.getMonth() + direcao);
    this.estado.dataSelecionada = atual.toISOString().split('T')[0];
    this.renderizar();
  },

  vincularEventosInteracao() {
    document.getElementById("filtro-agenda-tecnico").addEventListener("change", (e) => {
      this.estado.filtroTecnico = e.target.value;
      this.renderizar();
    });
    document.getElementById("filtro-agenda-status").addEventListener("change", (e) => {
      this.estado.filtroStatus = e.target.value;
      this.renderizar();
    });
    document.getElementById("btn-novo-compromisso").addEventListener("click", () => {
      this.abrirFormularioModal();
    });
  },

  /** Modal de Criação / Edição de Compromissos (Design System) */
  abrirFormularioModal(idEdicao = null) {
    const modalContainer = document.getElementById("modal-container-agenda");
    const dadosEdicao = idEdicao ? this.estado.compromissos.find(c => c.id === idEdicao) : null;

    modalContainer.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div class="card-panel" style="width: 100%; max-width: 500px; box-shadow: var(--sombra-card); padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--borda); padding-bottom: 12px;">
            <h3 style="margin:0; font-size: 15px; font-weight:700; color: var(--texto-principal);">${dadosEdicao ? 'Editar Compromisso' : 'Agendar Novo Compromisso'}</h3>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('modal-container-agenda').innerHTML='';" style="border:none;"><i class="fas fa-times"></i></button>
          </div>

          <form id="form-agenda-operacao" onsubmit="event.preventDefault(); Agenda.processarSubmitForm(${dadosEdicao ? `'${dadosEdicao.id}'` : 'null'});">
            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
              
              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Título do Evento / Finalidade</label>
                <input type="text" class="form-control" name="titulo" value="${dadosEdicao?.titulo || ''}" placeholder="Ex: Entrega de Aparelho Carlos" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Data</label>
                  <input type="date" class="form-control" name="data" value="${dadosEdicao?.data || this.estado.dataSelecionada}" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Horário</label>
                  <input type="time" class="form-control" name="hora" value="${dadosEdicao?.hora || '09:00'}" required>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Técnico Alocado</label>
                <select class="form-control" name="tecnico">
                  <option value="Valdir Técnico" ${dadosEdicao?.tecnico === 'Valdir Técnico' ? 'selected' : ''}>Valdir Técnico</option>
                  <option value="Administrador" ${dadosEdicao?.tecnico === 'Administrador' ? 'selected' : ''}>Administrador</option>
                </select>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Descrição Adicional</label>
                <textarea class="form-control" name="descricao" style="height:60px; resize:none;" placeholder="Detalhes importantes sobre o prazo...">${dadosEdicao?.descricao || ''}</textarea>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--texto-secundario);">Situação Inicial</label>
                <select class="form-control" name="status">
                  <option value="pendente" ${dadosEdicao?.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                  <option value="concluido" ${dadosEdicao?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                  <option value="cancelado" ${dadosEdicao?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--borda); padding-top: 14px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container-agenda').innerHTML='';">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar</button>
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
    const form = document.getElementById("form-agenda-operacao");
    const formData = new FormData(form);

    const payload = {
      titulo: formData.get("titulo"),
      data: formData.get("data"),
      hora: formData.get("hora"),
      tecnico: formData.get("tecnico"),
      descricao: formData.get("descricao"),
      status: formData.get("status")
    };

    if (idAlvo) {
      this.editar(idAlvo, payload);
    } else {
      this.criar(payload);
    }

    document.getElementById("modal-container-agenda").innerHTML = "";
  },

  /** Auxiliares de Formatação Visual */
  formatarDataBr(dataIso) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }
};

// Vinculação segura ao ciclo de vida do Document Object Model
document.addEventListener("DOMContentLoaded", () => {
  Agenda.init();
});