/**
 * ===========================================================================
 * dashboard.js — LÓGICA DA TELA INICIAL (dashboard.html)
 * ===========================================================================
 * Esse arquivo faz 3 coisas, nessa ordem:
 *   1. Monta a sidebar/topbar (via sidebar.js) e confere se está logado
 *   2. Pede pro DB.js calcular os números do dashboard
 *   3. Desenha esses números na tela (cards, tabela, gráfico)
 * ===========================================================================
 */

// Dicionário: transforma o "código" do status (ex: "em_manutencao") no texto
// e na cor que aparecem na tela (ex: "Em manutenção", azul).
const STATUS_LABELS = {
  recebido: { texto: "Recebido", cor: "cinza" },
  triagem: { texto: "Triagem", cor: "cinza" },
  diagnostico: { texto: "Diagnóstico", cor: "amarelo" },
  aguardando_orcamento: { texto: "Aguardando orçamento", cor: "amarelo" },
  aguardando_peca: { texto: "Aguardando peça", cor: "roxo" },
  em_manutencao: { texto: "Em manutenção", cor: "azul" },
  pronto: { texto: "Pronto para retirada", cor: "verde" },
  entregue: { texto: "Entregue", cor: "verde" },
  cancelado: { texto: "Cancelado", cor: "vermelho" },
};

/** Formata um número como dinheiro brasileiro (ex: 1500 -> "R$ 1.500,00"). */
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Monta o HTML de todo o conteúdo do dashboard, a partir dos dados calculados. */
function renderizarDashboard(dash) {
  const corpo = document.getElementById("page-body");

  corpo.innerHTML = `
    <h1 class="page-title">Bom dia, ${dash.saudacao_nome}! 👋</h1>
    <p class="page-subtitle">Aqui está o resumo da sua assistência técnica hoje. (Dados salvos localmente no navegador.)</p>

    <!-- ============ CARDS DE CONTAGEM DE OS ============ -->
    <div class="grid-cards">
      <div class="kpi-card">
        <div class="kpi-icon azul">${ICONES.os}</div>
        <div>
          <div class="kpi-value">${String(dash.os_em_andamento).padStart(2, "0")}</div>
          <div class="kpi-label">OS em andamento</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amarelo">${ICONES.agenda}</div>
        <div>
          <div class="kpi-value">${String(dash.os_aguardando_orcamento).padStart(2, "0")}</div>
          <div class="kpi-label">Aguardando orçamento</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon roxo">${ICONES.estoque}</div>
        <div>
          <div class="kpi-value">${String(dash.os_aguardando_peca).padStart(2, "0")}</div>
          <div class="kpi-label">Aguardando peça</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon verde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div>
        <div>
          <div class="kpi-value">${String(dash.os_prontas_retirada).padStart(2, "0")}</div>
          <div class="kpi-label">Prontos para retirada</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon teal">${ICONES.estoque}</div>
        <div>
          <div class="kpi-value">${String(dash.os_entregues_hoje).padStart(2, "0")}</div>
          <div class="kpi-label">Entregues hoje</div>
        </div>
      </div>
    </div>

    <!-- ============ CARDS FINANCEIROS ============ -->
    <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(220px,1fr));">
      <div class="card-panel">
        <div class="card-panel-title">Faturamento do dia</div>
        <div class="metric-value">${formatarMoeda(dash.faturamento_dia)}</div>
      </div>
      <div class="card-panel">
        <div class="card-panel-title">Faturamento do mês</div>
        <div class="metric-value">${formatarMoeda(dash.faturamento_mes)}</div>
      </div>
      <div class="card-panel">
        <div class="card-panel-title">Aparelhos na bancada</div>
        <div class="metric-value">${dash.aparelhos_na_bancada}</div>
      </div>
      <div class="card-panel">
        <div class="card-panel-title">Ticket médio</div>
        <div class="metric-value">${formatarMoeda(dash.ticket_medio)}</div>
      </div>
    </div>

    <!-- ============ TABELA + GRÁFICO ============ -->
    <div class="grid-2col">
      <div class="card-panel">
        <div class="card-panel-title" style="margin-bottom:16px;">Últimas Ordens de Serviço</div>
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr><th>OS</th><th>Cliente</th><th>Aparelho</th><th>Status</th><th>Entrada</th></tr>
            </thead>
            <tbody>
              ${dash.ultimas_ordens_servico.map((os) => `
                <tr>
                  <td><b>#${os.numero}</b></td>
                  <td>${os.cliente_nome}</td>
                  <td>${os.aparelho_nome}</td>
                  <td><span class="badge ${STATUS_LABELS[os.status]?.cor || "cinza"}">${STATUS_LABELS[os.status]?.texto || os.status}</span></td>
                  <td>${os.data_entrada}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-panel">
        <div class="card-panel-title" style="margin-bottom:16px;">Faturamento - últimos 7 dias</div>
        <div id="grafico-faturamento"></div>
      </div>
    </div>
  `;

  desenharGraficoBarras("grafico-faturamento", dash.grafico_faturamento_dia);
}

/** Desenha um gráfico de barras simples em SVG puro (sem bibliotecas externas). */
function desenharGraficoBarras(idContainer, pontos) {
  const container = document.getElementById(idContainer);
  const maxValor = Math.max(...pontos.map((p) => p.valor), 1); // evita divisão por zero
  const largura = 320, altura = 180, larguraBarra = largura / pontos.length - 12;

  const barras = pontos.map((p, i) => {
    const alturaBarra = (p.valor / maxValor) * (altura - 30);
    const x = i * (largura / pontos.length) + 6;
    const y = altura - alturaBarra - 20;
    return `
      <rect x="${x}" y="${y}" width="${larguraBarra}" height="${alturaBarra}" rx="4" fill="#2563eb" opacity="0.85"/>
      <text x="${x + larguraBarra / 2}" y="${altura - 4}" font-size="9" fill="#64748b" text-anchor="middle">${p.label}</text>
    `;
  }).join("");

  container.innerHTML = `<svg width="100%" viewBox="0 0 ${largura} ${altura}" style="max-width:100%">${barras}</svg>`;
}

// ===========================================================================
// PONTO DE ENTRADA: isso roda assim que a página carrega
// ===========================================================================
(function iniciar() {
  const usuario = TecAssistLayout.montar("dashboard"); // monta sidebar + confere login
  if (!usuario) return; // se não estava logado, já foi redirecionado pro login

  const dash = DB.calcularDashboard(); // pede os números pro "banco de dados"
  renderizarDashboard(dash);           // desenha tudo na tela
})();
