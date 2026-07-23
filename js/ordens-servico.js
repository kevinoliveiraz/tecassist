/**
 * ===========================================================================
 * ordens-servico.js — CONTROLADOR DA LISTAGEM DE ORDENS DE SERVIÇO
 * ===========================================================================
 * Esse arquivo faz 3 coisas, seguindo o padrão arquitetural do SaaS:
 * 1. Monta a sidebar/topbar via layout e valida sessão ("ordens-servico")
 * 2. Pede para o DB.js a lista filtrada e paginada de Ordens de Serviço
 * 3. Desenha a listagem, filtros e paginação na tela (#page-body)
 * ===========================================================================
 */

// Dicionário padrão de rótulos e cores mapeados estritamente para as classes do seu style.css
const STATUS_LABELS = {
  recebido: { texto: "Recebido", classe: "badge-cinza" },
  triagem: { texto: "Triagem", classe: "badge-cinza" },
  diagnostico: { texto: "Diagnóstico", classe: "badge-amarelo" },
  aguardando_orcamento: { texto: "Aguardando orçamento", classe: "badge-amarelo" },
  aguardando_peca: { texto: "Aguardando peça", classe: "badge-roxo" },
  em_manutencao: { texto: "Em manutenção", classe: "badge-azul" },
  pronto: { texto: "Pronto para retirada", classe: "badge-verde" },
  entregue: { texto: "Entregue", classe: "badge-verde" },
  cancelado: { texto: "Cancelado", classe: "badge-vermelho" },
};

// Estado local da tela para persistência de paginação, busca e filtros em tempo de execução
const EstadoTelaOSListagem = {
  pesquisa: "",
  status: "Todos",
  paginaAtual: 1,
  porPagina: 8
};

/** Formata um número como dinheiro brasileiro (ex: 450 -> "R$ 450,00"). */
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Desenha toda a interface de gerenciamento e listagem de OS na tela */
function renderizarPainelOrdensServico() {
  const corpo = document.getElementById("page-body");
  if (!corpo) return;

  // Obtém os dados tratados diretamente do banco local (DB.js)
  const listagemPaginada = DB.listarOSFiltradas({
    pesquisa: EstadoTelaOSListagem.pesquisa,
    status: EstadoTelaOSListagem.status,
    pagina: EstadoTelaOSListagem.paginaAtual,
    porPagina: EstadoTelaOSListagem.porPagina
  });

  corpo.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 class="page-title">Ordens de Serviço</h1>
        <p class="page-subtitle">Acompanhe e controle o fluxo completo de manutenção e orçamentos da sua assistência.</p>
      </div>
      <button class="btn btn-primary" id="btn-nova-os" style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nova OS
      </button>
    </div>

    <div class="card-panel" style="margin-bottom: 24px; padding: 16px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px;">
          <input type="text" id="filtro-os-pesquisa" class="form-control" placeholder="Buscar por código da OS, cliente ou aparelho..." value="${EstadoTelaOSListagem.pesquisa}">
        </div>
        <div style="width: 220px;">
          <select id="filtro-os-status" class="form-control">
            <option value="Todos" ${EstadoTelaOSListagem.status === "Todos" ? "selected" : ""}>Todos os Status</option>
            ${Object.keys(STATUS_LABELS).map(chave => `
              <option value="${chave}" ${EstadoTelaOSListagem.status === chave ? "selected" : ""}>${STATUS_LABELS[chave].texto}</option>
            `).join("")}
          </select>
        </div>
      </div>
    </div>

    <div class="card-panel">
      <div class="tabela-container">
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>OS</th>
              <th>Cliente</th>
              <th>Aparelho</th>
              <th>Status</th>
              <th>Data de Entrada</th>
              <th>Total Orçamento</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${listagemPaginada.dados.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: var(--texto-secundario); padding: 40px;">
                  Nenhuma ordem de serviço corresponde aos filtros selecionados ou nenhuma cadastrada.
                </td>
              </tr>
            ` : listagemPaginada.dados.map(os => {
              const statusVisual = STATUS_LABELS[os.status] || { texto: os.status, classe: "badge-cinza" };
              
              // --- CORREÇÃO DO NOME DO APARELHO ---
              // Primeiro verifica propriedades diretas ou faz a busca estruturada usando o id no DB
              let nomeAparelhoExibicao = os.aparelho_name || os.aparelho_nome || os.aparelho;
              
              if (!nomeAparelhoExibicao && os.aparelho_id) {
                const dispositivoEncontrado = DB.obterAparelho(os.aparelho_id);
                if (dispositivoEncontrado) {
                  nomeAparelhoExibicao = `${dispositivoEncontrado.marca} ${dispositivoEncontrado.modelo}`;
                }
              }
              
              if (!nomeAparelhoExibicao) {
                nomeAparelhoExibicao = "Não identificado";
              }

              // --- RESOLUÇÃO DO PARÂMETRO DE BUSCA ---
              // Garante o envio do identificador correto aceito pelo os.js (id primário ou número)
              const identificadorRedirecionamento = os.id || os.numero;

              return `
                <tr>
                  <td><b>#${os.numero}</b></td>
                  <td>${os.cliente_nome || "Não informado"}</td>
                  <td>${nomeAparelhoExibicao}</td>
                  <td>
                    <span class="badge ${statusVisual.classe}">
                      ${statusVisual.texto}
                    </span>
                  </td>
                  <td>${os.data_entrada ? new Date(os.data_entrada).toLocaleDateString("pt-BR") : "N/D"}</td>
                  <td><b>${formatarMoeda(os.valor_total || 0)}</b></td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <button class="btn btn-sm btn-secondary" onclick="irParaOSDetalhada('${identificadorRedirecionamento}')">Gerenciar</button>
                      <button class="btn btn-sm" style="background: var(--vermelho-bg); color: var(--vermelho); border: 1px solid rgba(220,38,38,0.2);" onclick="deletarOrdemServico('${os.id}', '${os.numero}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      ${renderizarPaginacao(listagemPaginada)}
    </div>
  `;

  configurarEventosFiltros();
}

/** Monta a régua inferior de paginação com base no retorno do banco de dados */
function renderizarPaginacao(pag) {
  if (pag.paginas <= 1) return "";

  let botoesHtml = "";
  for (let i = 1; i <= pag.paginas; i++) {
    botoesHtml += `
      <button class="btn btn-sm ${pag.pagina === i ? "btn-primary" : "btn-secondary"}" onclick="trocarPaginaOS(${i})">
        ${i}
      </button>
    `;
  }

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--borda);">
      <span style="font-size: 14px; color: var(--texto-secundario);">Mostrando ${pag.dados.length} de ${pag.total} ordens</span>
      <div style="display: flex; gap: 4px;">${botoesHtml}</div>
    </div>
  `;
}

/** Configura e monitora as interações do usuário nos inputs superiores */
function configurarEventosFiltros() {
  document.getElementById("filtro-os-pesquisa").addEventListener("input", (e) => {
    EstadoTelaOSListagem.pesquisa = e.target.value;
    EstadoTelaOSListagem.paginaAtual = 1; 
    renderizarPainelOrdensServico();
  });

  document.getElementById("filtro-os-status").addEventListener("change", (e) => {
    EstadoTelaOSListagem.status = e.target.value;
    EstadoTelaOSListagem.paginaAtual = 1;
    renderizarPainelOrdensServico();
  });

  document.getElementById("btn-nova-os").addEventListener("click", () => {
    window.location.href = "os.html";
  });
}

/** Evento disparado pelos botões da paginação */
function trocarPaginaOS(novaPagina) {
  EstadoTelaOSListagem.paginaAtual = novaPagina;
  renderizarPainelOrdensServico();
}

/** Redireciona de forma limpa para a tela de gerenciamento de OS */
function irParaOSDetalhada(idOS) {
  if (!idOS || idOS === "undefined") return;
  window.location.href = `os.html?os=${idOS}`;
}

/** Remove uma Ordem de Serviço permanentemente do banco local */
function deletarOrdemServico(idOS, numeroOS) {
  if (!idOS) return;
  
  const confirmar = confirm(`Tem certeza que deseja excluir permanentemente a Ordem de Serviço #${numeroOS}? Esta ação não poderá ser desfeita.`);
  if (!confirmar) return;

  const chaveOS = DB.CHAVES ? DB.CHAVES.OS : "tecassist_os";
  let todasOS = DB._ler(chaveOS) || [];
  
  // Filtra removendo a OS selecionada
  todasOS = todasOS.filter(o => String(o.id) !== String(idOS));
  
  DB._salvar(chaveOS, todasOS);
  alert(`Ordem de Serviço #${numeroOS} excluída com sucesso.`);
  renderizarPainelOrdensServico();
}

// ===========================================================================
// PONTO DE ENTRADA (INITIALIZER)
// ===========================================================================
(function iniciar() {
  const usuarioAutenticado = TecAssistLayout.montar("ordens-servico");
  if (!usuarioAutenticado) return;

  renderizarPainelOrdensServico();
})();