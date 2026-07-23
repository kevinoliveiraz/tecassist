/**
 * ===========================================================================
 * relatorios.js — CONTROLADOR DO MÓDULO DE RELATÓRIOS E INTELIGÊNCIA DE NEGÓCIO
 * ===========================================================================
 */

const Relatorios = {
  // Estado local contendo os dados analíticos de 2026
  estado: {
    periodoSelecionado: "01/06/2026 - 15/06/2026",
    compararPeriodo: "Periodo anterior",
    moduloFiltro: "Todos",
    dadosFaturamento: [
      { data: "01/06", atual: 8000, anterior: 6500 },
      { data: "03/06", atual: 14000, anterior: 11000 },
      { data: "05/06", atual: 9500, anterior: 13000 },
      { data: "07/06", atual: 11500, anterior: 9000 },
      { data: "09/06", atual: 15500, anterior: 10000 },
      { data: "11/06", atual: 7000, anterior: 12500 },
      { data: "13/06", atual: 12000, anterior: 8500 },
      { data: "15/06", atual: 18450, anterior: 14000 }
    ],
    categoriasServico: [
      { nome: "Troca de tela", quantidade: 52, faturamento: 6240, percentual: 33.8, ticket: 120, tempo: "2,1 dias" },
      { nome: "Troca de bateria", quantidade: 28, faturamento: 2800, percentual: 15.2, ticket: 100, tempo: "1,8 dias" },
      { nome: "Reparo de placa", quantidade: 18, faturamento: 3600, percentual: 19.5, ticket: 200, tempo: "3,2 dias" },
      { nome: "Software", quantidade: 22, faturamento: 1870, percentual: 10.1, ticket: 85, tempo: "1,3 dias" },
      { nome: "Outros serviços", quantidade: 36, faturamento: 3940, percentual: 21.4, ticket: 109.44, tempo: "2,0 dias" }
    ],
    topAparelhos: [
      { modelo: "iPhone 13", quantidade: 38, percentual: 24.4 },
      { modelo: "iPhone 11", quantidade: 29, percentual: 18.6 },
      { modelo: "Samsung Galaxy A54", quantidade: 21, percentual: 13.5 },
      { modelo: "Motorola Moto G22", quantidade: 17, percentual: 10.9 },
      { modelo: "Xiaomi Redmi Note 12", quantidade: 15, percentual: 9.6 }
    ]
  },

  /** Inicialização do Módulo */
  init() {
    if (typeof TecAssistLayout !== "undefined") {
      TecAssistLayout.montar("relatorios");
    }
    this.renderizar();
  },

  /** Renderização do Dashboard Executivo */
  renderizar() {
    const container = document.getElementById("page-body");
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 class="page-title">Relatórios</h1>
        <p class="page-subtitle">Gere relatórios personalizados e acompanhe o desempenho da sua assistência técnica.</p>
      </div>

      <div class="card-panel" style="margin-bottom: 24px; padding: 16px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) 160px; gap: 14px; align-items: flex-end;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--texto-secundario);">Período</label>
            <select id="rel-filtro-periodo" class="form-control" style="width:100%;">
              <option value="01/06/2026 - 15/06/2026" selected>01/06/2026 - 15/06/2026</option>
              <option value="01/05/2026 - 31/05/2026">Último mês completo (Maio)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--texto-secundario);">Comparar com</label>
            <select id="rel-filtro-comparar" class="form-control" style="width:100%;">
              <option value="Periodo anterior" selected>Período anterior</option>
              <option value="Ano anterior">Ano anterior</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--texto-secundario);">Módulo</label>
            <select id="rel-filtro-modulo" class="form-control" style="width:100%;">
              <option value="Todos" selected>Todos os módulos</option>
              <option value="Servicos">Apenas Serviços</option>
              <option value="Vendas">Apenas Vendas de Peças</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="Relatorios.processarFiltros()" style="display:flex; align-items:center; justify-content:center; gap:8px; height:38px;">
            <i class="fas fa-sync-alt"></i> Gerar relatório
          </button>
        </div>
      </div>

      <div class="grid-cards" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-icon azul"><i class="fas fa-wallet"></i></div>
          <div>
            <div class="kpi-label">Faturamento</div>
            <div class="kpi-value">R$ 18.450,00</div>
            <span class="metric-variacao positiva"><i class="fas fa-arrow-up"></i> 12,5%</span>
            <small style="color: var(--texto-terciario); font-size:11px; display:block; margin-top:2px;">vs período anterior</small>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-file-invoice"></i></div>
          <div>
            <div class="kpi-label">Ordens de serviço</div>
            <div class="kpi-value">156</div>
            <span class="metric-variacao positiva"><i class="fas fa-arrow-up"></i> 8,3%</span>
            <small style="color: var(--texto-terciario); font-size:11px; display:block; margin-top:2px;">vs período anterior</small>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon roxo"><i class="fas fa-users"></i></div>
          <div>
            <div class="kpi-label">Clientes atendidos</div>
            <div class="kpi-value">98</div>
            <span class="metric-variacao positiva"><i class="fas fa-arrow-up"></i> 11,2%</span>
            <small style="color: var(--texto-terciario); font-size:11px; display:block; margin-top:2px;">vs período anterior</small>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amarelo"><i class="fas fa-calculator"></i></div>
          <div>
            <div class="kpi-label">Ticket médio</div>
            <div class="kpi-value">R$ 118,27</div>
            <span class="metric-variacao positiva"><i class="fas fa-arrow-up"></i> 7,6%</span>
            <small style="color: var(--texto-terciario); font-size:11px; display:block; margin-top:2px;">vs período anterior</small>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-hourglass-half"></i></div>
          <div>
            <div class="kpi-label">Tempo médio (OS)</div>
            <div class="kpi-value">2,4 dias</div>
            <span class="metric-variacao positiva" style="color: var(--verde);"><i class="fas fa-arrow-down"></i> 5,1%</span>
            <small style="color: var(--texto-terciario); font-size:11px; display:block; margin-top:2px;">Mais rápido</small>
          </div>
        </div>
      </div>

      <div class="grid-2col">
        
        <div style="display:flex; flex-direction:column; gap:24px;">
          
          <div class="card-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <div>
                <h3 class="card-panel-title">Faturamento ao longo do tempo</h3>
                <span style="font-size:12px; color:var(--texto-secundario);">Evolução financeira diária da oficina</span>
              </div>
              <select class="form-control" style="width:100px; padding:4px 8px; font-size:12px;">
                <option>Por dia</option>
                <option>Por semana</option>
              </select>
            </div>
            
            <div style="display:flex; gap:16px; margin-bottom:20px; font-size:12px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:12px; height:3px; background:var(--azul-primario); display:inline-block; border-radius:2px;"></span>
                <span style="color:var(--texto-principal); font-weight:500;">Período atual</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:12px; height:3px; background:var(--texto-terciario); display:inline-block; border-radius:2px; border-top:2px dashed #94a3b8;"></span>
                <span style="color:var(--texto-secundario);">Período anterior</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding-top: 20px; border-bottom: 1px solid var(--borda); position: relative; margin-bottom: 10px;">
              ${this.renderizarLinhasDeTendencia()}
            </div>
          </div>

          <div class="card-panel" style="padding:0; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--borda);">
              <h3 class="card-panel-title" style="margin:0;">Resumo por categoria de serviço</h3>
              <button class="btn btn-secondary" style="font-size:12px; padding:6px 12px;" onclick="alert('Exportando dados detalhados para CSV...')">Ver por completo</button>
            </div>
            <div class="tabela-container">
              <table class="tabela-padrao">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th style="text-align:center;">Quant. OS</th>
                    <th style="text-align:right;">Faturamento</th>
                    <th>% do Fat.</th>
                    <th style="text-align:right;">Ticket Médio</th>
                    <th>Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.estado.categoriasServico.map(cat => `
                    <tr>
                      <td><strong style="color:var(--texto-principal);">${cat.nome}</strong></td>
                      <td style="text-align:center; font-weight:600;">${cat.quantidade}</td>
                      <td style="text-align:right; font-weight:600; color:var(--texto-principal);">R$ ${cat.faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      <td style="width:140px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div style="flex:1; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                            <div style="width:${cat.percentual}%; height:100%; background:var(--azul-primario); border-radius:3px;"></div>
                          </div>
                          <span style="font-size:11.5px; font-weight:600; min-width:35px; text-align:right;">${cat.percentual}%</span>
                        </div>
                      </td>
                      <td style="text-align:right; color:var(--texto-secundario);">R$ ${cat.ticket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      <td><span class="badge cinza" style="color:var(--texto-principal); font-weight:500;">${cat.tempo}</span></td>
                    </tr>
                  `).join("")}
                  <tr style="background:var(--fundo-pagina); font-weight:700;">
                    <td>Total</td>
                    <td style="text-align:center;">156</td>
                    <td style="text-align:right; color:var(--azul-primario);">R$ 18.450,00</td>
                    <td>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style="flex:1; height:6px; background:var(--azul-primario); border-radius:3px;"></div>
                        <span style="font-size:11.5px;">100%</span>
                      </div>
                    </td>
                    <td style="text-align:right;">R$ 118,27</td>
                    <td><span class="badge azul">2,4 dias</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:24px;">
          
          <div class="card-panel">
            <h3 class="card-panel-title" style="margin-bottom:16px;">Ordens de serviço por status</h3>
            <div style="display:flex; align-items:center; gap:24px; margin-bottom:12px;">
              <div style="position:relative; width:120px; height:120px; background: conic-gradient(var(--verde) 0% 46.2%, var(--azul-primario) 46.2% 77%, var(--amarelo) 77% 89.8%, var(--roxo) 89.8% 96.2%, var(--vermelho) 96.2% 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <div style="width:84px; height:84px; background:var(--branco); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <strong style="font-size:20px; font-weight:800; color:var(--texto-principal);">156</strong>
                  <span style="font-size:10px; color:var(--texto-terciario); text-transform:uppercase; font-weight:600;">Total</span>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; flex:1; font-size:12.5px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-circle" style="color:var(--verde); font-size:9px; margin-right:6px;"></i> Concluídas</span>
                  <strong>72 <small style="color:var(--texto-secundario); font-weight:normal;">(46,2%)</small></strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-circle" style="color:var(--azul-primario); font-size:9px; margin-right:6px;"></i> Em andamento</span>
                  <strong>48 <small style="color:var(--texto-secundario); font-weight:normal;">(30,8%)</small></strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-circle" style="color:var(--amarelo); font-size:9px; margin-right:6px;"></i> Aguardando peças</span>
                  <strong>20 <small style="color:var(--texto-secundario); font-weight:normal;">(12,8%)</small></strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-circle" style="color:var(--roxo); font-size:9px; margin-right:6px;"></i> Aguardando cliente</span>
                  <strong>10 <small style="color:var(--texto-secundario); font-weight:normal;">(6,4%)</small></strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fas fa-circle" style="color:var(--vermelho); font-size:9px; margin-right:6px;"></i> Canceladas</span>
                  <strong>6 <small style="color:var(--texto-secundario); font-weight:normal;">(3,8%)</small></strong>
                </div>
              </div>
            </div>
          </div>

          <div class="card-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h3 class="card-panel-title" style="margin:0;">Top 5 aparelhos atendidos</h3>
              <i class="fas fa-mobile-alt" style="color:var(--texto-terciario);"></i>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${this.estado.topAparelhos.map((ap, index) => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
                    <span style="font-weight:600; color:var(--texto-principal);">${index + 1}. ${ap.modelo}</span>
                    <span style="color:var(--texto-secundario); font-weight:500;">${ap.quantidade} un. (${ap.percentual}%)</span>
                  </div>
                  <div style="width:100%; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                    <div style="width:${ap.percentual}%; height:100%; background: ${index === 0 ? 'var(--azul-primario)' : index === 1 ? '#3b82f6' : '#60a5fa'}; border-radius:3px;"></div>
                  </div>
                </div>
              `).join("")}
            </div>
            <button class="btn btn-secondary" style="width:100%; font-size:12.5px; margin-top:14px; padding:8px;" onclick="alert('Exibindo histórico completo de marcas/modelos.')">Ver todos os aparelhos</button>
          </div>

          <div class="card-panel" style="padding:16px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--texto-principal); text-transform:uppercase; margin-bottom:12px; letter-spacing:0.02em;">Relatórios rápidos</h4>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <div class="notificacao-item" style="padding:10px; border-radius:var(--raio-sm);" onclick="alert('Abrindo Relatório Financeiro Consolidade de Junho...')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div class="notificacao-item-titulo" style="font-size:12.5px;"><i class="fas fa-file-invoice-dollar" style="margin-right:8px; color:var(--verde);"></i> Relatório financeiro</div>
                    <div class="notificacao-item-desc" style="margin:0; font-size:11px;">Receitas, despesas e lucro real.</div>
                  </div>
                  <i class="fas fa-chevron-right" style="font-size:11px; color:var(--texto-terciario);"></i>
                </div>
              </div>
              <div class="notificacao-item" style="padding:10px; border-radius:var(--raio-sm);" onclick="alert('Abrindo Análise de Produtividade da Equipe Técnica...')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div class="notificacao-item-titulo" style="font-size:12.5px;"><i class="fas fa-tools" style="margin-right:8px; color:var(--azul-primario);"></i> Ordens de serviço</div>
                    <div class="notificacao-item-desc" style="margin:0; font-size:11px;">Análise completa de OS por período técnico.</div>
                  </div>
                  <i class="fas fa-chevron-right" style="font-size:11px; color:var(--texto-terciario);"></i>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  /** Componente Interno: Renderizador de Barras de Tendência */
  renderizarLinhasDeTendencia() {
    const maiorValor = 20000; // Teto para normalização de altura em pixels

    return this.estado.dadosFaturamento.map(d => {
      // Cálculo preciso da altura em porcentagem baseado no grid container de 180px
      const alturaAtual = (d.atual / maiorValor) * 100;
      const alturaAnterior = (d.anterior / maiorValor) * 100;

      return `
        <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:6px; position:relative;">
          
          <div style="display:flex; align-items:flex-end; gap:4px; height:140px; justify-content:center; width:100%;">
            <div style="width:8px; height:${alturaAnterior}%; background:#cbd5e1; border-radius:4px 4px 0 0; transition:all 0.2s;" title="Período Anterior: R$ ${d.anterior}"></div>
            <div style="width:14px; height:${alturaAtual}%; background:var(--azul-primario); border-radius:4px 4px 0 0; position:relative; transition:all 0.2s;" title="Junho/2026: R$ ${d.atual}"></div>
          </div>

          <span style="font-size:11px; color:var(--texto-secundario); font-weight:500;">${d.data}</span>
        </div>
      `;
    }).join("");
  },

  /** Disparador de Atualização de Filtros Administrativos */
  processarFiltros() {
    this.estado.periodoSelecionado = document.getElementById("rel-filtro-periodo").value;
    this.estado.compararPeriodo = document.getElementById("rel-filtro-comparar").value;
    this.estado.moduloFiltro = document.getElementById("rel-filtro-modulo").value;

    // Simulação reativa de processamento de massa de dados
    const container = document.getElementById("page-body");
    if (container) {
      container.style.opacity = "0.5";
      setTimeout(() => {
        container.style.opacity = "1";
        this.renderizar();
      }, 300);
    }
  }
};

// Vinculação segura ao ciclo de carregamento do ecossistema do script principal
document.addEventListener("DOMContentLoaded", () => {
  Relatorios.init();
});