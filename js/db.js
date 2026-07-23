/**
 * ===========================================================================
 * db.js — "BANCO DE DADOS" DO TECASSIST (versão de testes com localStorage)
 * ===========================================================================
 *
 * ARQUITETURA EM CAMADAS - CAMADA DE DADOS E ABSTRAÇÃO (MULTI-TENANT)
 * Todas as páginas do frontend usam apenas chamadas públicas a este objeto DB.
 * * Ano Corrente de Simulação de Dados: 2026
 */

const DB = {

  // -------------------------------------------------------------------
  // CONFIGURAÇÃO: nomes das "tabelas" (chaves do localStorage)
  // -------------------------------------------------------------------
  CHAVES: {
    TENANTS: "tecassist_tenants",
    USERS: "tecassist_users",
    CLIENTES: "tecassist_clientes",
    APARELHOS: "tecassist_aparelhos",
    OS: "tecassist_os",
    FINANCEIRO: "tecassist_financeiro",
    SESSAO: "tecassist_sessao",
    NOTIFICACOES: "tecassist_notificacoes",
    ESTOQUE: "tecassist_estoque",
    ESTOQUE_MOVIMENTACOES: "tecassist_estoque_movimentacoes",
    GARANTIAS: "tecassist_garantias",
    AGENDA: "tecassist_agenda",
    HISTORICO_ACOES: "tecassist_historico_acoes"
  },

  // =====================================================================
  // FUNÇÕES GENÉRICAS DE LEITURA/ESCRITA
  // =====================================================================

  /** Lê uma "tabela" inteira do localStorage. Se não existir, retorna lista vazia. */
  _ler(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  },

  /** Salva uma "tabela" inteira (lista) no localStorage. */
  _salvar(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
  },

  /** Gera um ID novo e único para um registro (baseado em timestamp + aleatório). */
  _gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  },

  /** Auxiliar para paginação de arrays locais */
  _paginar(lista, pagina = 1, porPagina = 8) {
    const total = lista.length;
    const paginas = Math.ceil(total / porPagina);
    const offset = (pagina - 1) * porPagina;
    const dados = lista.slice(offset, offset + porPagina);
    return { dados, total, pagina, paginas, porPagina };
  },

  // =====================================================================
  // SEED — dados de exemplo expandidos para cobertura 100% das telas
  // =====================================================================

  inicializar() {
    const tenants = this._ler(this.CHAVES.TENANTS);
    if (tenants.length > 0) return;

    console.log("[DB] Nenhum dado encontrado. Criando ecossistema de dados de exemplo...");

    // 1. Empresa
    const tenantId = this._gerarId();
    this._salvar(this.CHAVES.TENANTS, [
      { id: tenantId, nome_empresa: "TecAssist Manutenção e Reparos", plano: "Profissional", criado_em: "2026-01-01T08:00:00.000Z" },
    ]);

    // 2. Usuários / Equipe Técnica
    const userAdminId = this._gerarId();
    const userAnaId = this._gerarId();
    const userMarianaId = this._gerarId();
    const userJoaoId = this._gerarId();

    this._salvar(this.CHACES || this.CHAVES.USERS, [
      { id: userAdminId, tenant_id: tenantId, nome: "Carlos Silva", email: "carlos@tecassist.com", senha: "123456", cargo: "Administrador", avatar: "carlos.jpg", criado_em: "2026-01-01T08:00:00.000Z" },
      { id: userAnaId, tenant_id: tenantId, nome: "Ana Beatriz", email: "ana@tecassist.com", senha: "123456", cargo: "Técnico", avatar: "ana.jpg", criado_em: "2026-01-10T09:00:00.000Z" },
      { id: userMarianaId, tenant_id: tenantId, nome: "Mariana Costa", email: "mariana@tecassist.com", senha: "123456", cargo: "Atendente", avatar: "mariana.jpg", criado_em: "2026-01-12T10:00:00.000Z" },
      { id: userJoaoId, tenant_id: tenantId, nome: "João Paulo", email: "joao@tecassist.com", senha: "123456", cargo: "Técnico", avatar: "joao.jpg", criado_em: "2026-01-15T11:00:00.000Z" }
    ]);

    // 3. Clientes
    const clientesDados = [
      { id: this._gerarId(), nome_completo: "João Silva", email: "joaosilva@email.com", telefone_principal: "(11) 98765-4321", telefone_secundario: "(11) 3456-7890", cpf_cnpj: "123.456.789-00", endereco: "Rua das Flores, 123", numero: "123", complemento: "Apto 45", bairro: "Centro", cidade: "São Paulo", estado: "SP", cep: "01000-000", grupo: "Clientes frequentes", status: "Ativo", criado_em: "2023-03-15T10:00:00.000Z" },
      { id: this._gerarId(), nome_completo: "Maria Oliveira", email: "maria.oliveira@email.com", telefone_principal: "(11) 91234-5678", telefone_secundario: "(11) 2222-3333", cpf_cnpj: "987.654.321-11", endereco: "Av Paulista, 1500", numero: "1500", complemento: "", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100", grupo: "Clientes novos", status: "Ativo", criado_em: "2026-02-10T14:22:00.000Z" },
      { id: this._gerarId(), nome_completo: "Rafael Costa", email: "rafael.costa@email.com", telefone_principal: "(11) 99876-5432", telefone_secundario: "", cpf_cnpj: "222.333.444-55", endereco: "Rua Augusta, 400", numero: "400", complemento: "Bloco B", bairro: "Consolação", cidade: "São Paulo", estado: "SP", cep: "01304-000", grupo: "Clientes frequentes", status: "Ativo", criado_em: "2025-11-05T11:05:00.000Z" },
      { id: this._gerarId(), nome_completo: "Ana Beatriz Lima", email: "ana.lima@email.com", telefone_principal: "(11) 93456-7890", telefone_secundario: "", cpf_cnpj: "444.555.666-77", endereco: "Al. Lorena, 88", numero: "88", complemento: "", bairro: "Jardins", cidade: "São Paulo", estado: "SP", cep: "01424-000", grupo: "Clientes VIP", status: "Ativo", criado_em: "2026-03-20T16:40:00.000Z" },
      { id: this._gerarId(), nome_completo: "Pedro Santos", email: "pedro.santos@email.com", telefone_principal: "(11) 95555-1212", telefone_secundario: "(11) 4444-5555", cpf_cnpj: "555.666.777-88", endereco: "Av Rangel Pestana, 900", numero: "900", complemento: "", bairro: "Brás", cidade: "São Paulo", estado: "SP", cep: "03002-000", grupo: "Inativos temporários", status: "Inativo", criado_em: "2024-05-12T09:15:00.000Z" },
      { id: this._gerarId(), nome_completo: "Juliana Alves", email: "juliana.alves@email.com", telefone_principal: "(11) 96666-7777", telefone_secundario: "", cpf_cnpj: "333.444.555-66", endereco: "Rua Domingos de Morais, 50", numero: "50", complemento: "", bairro: "Vila Mariana", cidade: "São Paulo", estado: "SP", cep: "04010-000", grupo: "Clientes frequentes", status: "Ativo", criado_em: "2026-01-10T13:10:00.000Z" },
      { id: this._gerarId(), nome_completo: "Fernando Souza", email: "fernando.souza@email.com", telefone_principal: "(11) 97777-8888", telefone_secundario: "", cpf_cnpj: "777.888.999-00", endereco: "Rua Vergueiro, 1000", numero: "1000", complemento: "", bairro: "Paraíso", cidade: "São Paulo", estado: "SP", cep: "01504-000", grupo: "Clientes novos", status: "Ativo", criado_em: "2026-04-18T10:20:00.000Z" },
      { id: this._gerarId(), nome_completo: "Carla Mendes", email: "carla.mendes@email.com", telefone_principal: "(11) 98888-9999", telefone_secundario: "", cpf_cnpj: "111.222.333-44", endereco: "Av Jabaquara, 2300", numero: "2300", complemento: "Apto 12", bairro: "Saúde", cidade: "São Paulo", estado: "SP", cep: "04046-000", grupo: "Clientes frequentes", status: "Ativo", criado_em: "2025-08-22T15:35:00.000Z" }
    ].map(c => ({ ...c, tenant_id: tenantId, observacoes: "Cliente prefere contato via WhatsApp. Sempre traz aparelhos com nota fiscal.", enviar_whatsapp: true }));
    this._salvar(this.CHAVES.CLIENTES, clientesDados);

    // 4. Aparelhos
    const aparelhosDados = [
      { id: this._gerarId(), cliente_id: clientesDados[0].id, tipo: "Smartphone", marca: "Samsung", modelo: "Galaxy S23", imei_serial: "350245678901234", cor: "Preto", capacidade: "256 GB", acessorios: ["Carregador", "Cabo USB", "Caixa"], senha_padrao: "******", conta_google_apple: "joao.silva@gmail.com", observacoes: "Aparelho com película e capa de proteção.", criado_em: "2026-06-16T09:15:00.000Z" },
      { id: this._gerarId(), cliente_id: clientesDados[1].id, tipo: "Smartphone", marca: "Apple", modelo: "iPhone 13", imei_serial: "359876543210123", cor: "Azul", capacidade: "128 GB", acessorios: ["Cabo USB"], senha_padrao: "142536", conta_google_apple: "maria.olv@icloud.com", observacoes: "Trincado leve no canto inferior.", criado_em: "2026-06-15T10:00:00.000Z" },
      { id: this._gerarId(), cliente_id: clientesDados[2].id, tipo: "Notebook", marca: "Dell", modelo: "Inspiron 15", imei_serial: "BR-098234-X", cor: "Prata", capacidade: "512 GB SSD", acessorios: ["Carregador"], senha_padrao: "admin123", conta_google_apple: "rafa.costa@outlook.com", observacoes: "Sem marcas profundas.", criado_em: "2026-06-15T11:00:00.000Z" },
      { id: this._gerarId(), cliente_id: clientesDados[3].id, tipo: "Tablet", marca: "Apple", modelo: "iPad Air", imei_serial: "DMPX8923KL", cor: "Cinza Espacial", capacidade: "64 GB", acessorios: ["Capa Smart Case"], senha_padrao: "0000", conta_google_apple: "ana.lima@icloud.com", observacoes: "Aparelho bem conservado.", criado_em: "2026-06-14T09:00:00.000Z" },
      { id: this._gerarId(), cliente_id: clientesDados[4].id, tipo: "Console", marca: "Sony", modelo: "PlayStation 5", imei_serial: "03-27459284-11", cor: "Branco/Preto", capacidade: "825 GB", acessorios: ["1 Cabo HDMI", "1 Controle DualSense"], senha_padrao: "Não se aplica", conta_google_apple: "pedro.santos.psn", observacoes: "Lacre de fábrica já violado.", criado_em: "2026-06-14T14:00:00.000Z" }
    ].map(a => ({ ...a, tenant_id: tenantId, status: "Ativo" }));
    this._salvar(this.CHAVES.APARELHOS, aparelhosDados);

    // 5. Estoque de Peças & Acessórios
    const estoqueDados = [
      { id: this._gerarId(), nome: "Tela iPhone 13", descricao: "Original (OLED)", categoria: "Telas", codigo: "TEL-IPH13-OLED", estoque_atual: 12, estoque_minimo: 5, valor_unitario: 520.00, fornecedor: "Importadora SP", status: "Em estoque" },
      { id: this._gerarId(), nome: "Bateria iPhone 11", descricao: "Original", categoria: "Baterias", codigo: "BAT-IPH11", estoque_atual: 8, estoque_minimo: 3, valor_unitario: 189.00, fornecedor: "Global Parts", status: "Estoque baixo" },
      { id: this._gerarId(), nome: "Conector de carga", descricao: "iPhone 12", categoria: "Conectores", codigo: "CON-IPH12-CAR", estoque_atual: 0, estoque_minimo: 4, valor_unitario: 75.00, fornecedor: "China Componentes", status: "Sem estoque" },
      { id: this._gerarId(), nome: "Cabo Flex Power", descricao: "Samsung S21", categoria: "Cabos Flex", codigo: "FLX-S21-PWR", estoque_atual: 15, estoque_minimo: 2, valor_unitario: 45.00, fornecedor: "Distribuidora Sul", status: "Em estoque" },
      { id: this._gerarId(), nome: "Tampa Traseira", descricao: "Samsung A52", categoria: "Tampas", codigo: "TAM-A52", estoque_atual: 3, estoque_minimo: 2, valor_unitario: 65.00, fornecedor: "Global Parts", status: "Estoque baixo" },
      { id: this._gerarId(), nome: "Adesivo de Bateria", descricao: "Universal", categoria: "Adesivos", codigo: "ADES-UNI", estoque_atual: 50, estoque_minimo: 10, valor_unitario: 3.50, fornecedor: "Importadora SP", status: "Em estoque" },
      { id: this._gerarId(), nome: "Parafuso Pentalobe", descricao: "Conjunto", categoria: "Parafusos", codigo: "PAR-PEN-T5", estoque_atual: 0, estoque_minimo: 100, valor_unitario: 12.00, fornecedor: "China Componentes", status: "Sem estoque" },
      { id: this._gerarId(), nome: "Álcool Isopropílico 500ml", descricao: "Materiais", categoria: "Materiais", codigo: "MAT-ALC-500", estoque_atual: 7, estoque_minimo: 2, valor_unitario: 18.00, fornecedor: "Química Central", status: "Estoque baixo" }
    ].map(e => ({ ...e, tenant_id: tenantId, valor_total: e.estoque_atual * e.valor_unitario }));
    this._salvar(this.CHAVES.ESTOQUE, estoqueDados);

    // 5.1 Movimentações de Estoque Recentes
    const movEstoque = [
      { id: this._gerarId(), tenant_id: tenantId, peca_id: estoqueDados[0].id, peca_nome: "Tela iPhone 13", tipo: "entrada", quantidade: 5, motivo: "Compra de fornecedor", usuario_nome: "Carlos Silva", data: "2026-06-16T10:30:00.000Z" },
      { id: this._gerarId(), tenant_id: tenantId, peca_id: estoqueDados[1].id, peca_nome: "Bateria iPhone 11", tipo: "saida", quantidade: 2, motivo: "Uso na OS #000098", usuario_nome: "Ana Beatriz", data: "2026-06-16T09:15:00.000Z" },
      { id: this._gerarId(), tenant_id: tenantId, peca_id: estoqueDados[3].id, peca_nome: "Cabo Flex Power S21", tipo: "entrada", quantidade: 10, motivo: "Reposição emergencial", usuario_nome: "Carlos Silva", data: "2026-06-15T16:45:00.000Z" },
      { id: this._gerarId(), tenant_id: tenantId, peca_id: estoqueDados[2].id, peca_nome: "Conector de carga iPhone 12", tipo: "saida", quantidade: 1, motivo: "Uso na OS #000115", usuario_nome: "Mariana Costa", data: "2026-06-15T14:20:00.000Z" }
    ];
    this._salvar(this.CHAVES.ESTOQUE_MOVIMENTACOES, movEstoque);

    // 6. Ordens de Serviço (OS)
    const osDados = [
      { id: this._gerarId(), tenant_id: tenantId, numero: "000123", cliente_id: clientesDados[0].id, aparelho_id: aparelhosDados[0].id, status: "em_manutencao", tecnico_id: userAdminId, defeito_informado: "Aparelho não liga. Tela apagada após queda.", diagnostico: "Oxidação na placa principal. Necessário limpeza e possível reparo de componente.", servicos: [{ descricao: "Limpeza de placa", tecnico: "Carlos Silva", valor: 200.00 }, { descricao: "Reparo de componente", tecnico: "Carlos Silva", valor: 100.00 }], pecas: [{ descricao: "Conector de carga Samsung S23", qtd: 1, valor_unit: 150.00, total: 150.00 }], valor_servicos: 300.00, valor_pecas: 150.00, desconto: 0.00, valor_total: 450.00, status_orcamento: "Aguardando aprovação do cliente", data_entrada: "2026-06-15T09:15:00.000Z", previsao_entrega: "2026-06-18T18:00:00.000Z", data_entrega: null },
      { id: this._gerarId(), tenant_id: tenantId, numero: "000122", cliente_id: clientesDados[1].id, aparelho_id: aparelhosDados[1].id, status: "aguardando_peca", tecnico_id: userAnaId, defeito_informado: "Bateria estufada, descarrega rápido.", diagnostico: "Bateria esgotada com risco de vazamento.", servicos: [{ descricao: "Troca de bateria", tecnico: "Ana Beatriz", valor: 150.00 }], pecas: [{ descricao: "Bateria iPhone 13", qtd: 1, valor_unit: 200.00, total: 200.00 }], valor_servicos: 150.00, valor_pecas: 200.00, desconto: 0.00, valor_total: 350.00, status_orcamento: "Aprovado", data_entrada: "2026-06-15T10:42:00.000Z", previsao_entrega: "2026-06-20T12:00:00.000Z", data_entrega: null },
      { id: this._gerarId(), tenant_id: tenantId, numero: "000121", cliente_id: clientesDados[4].id, aparelho_id: aparelhosDados[4].id, status: "aguardando_orcamento", tecnico_id: userJoaoId, defeito_informado: "Superaquecimento e desligamento repentino.", diagnostico: "Cooler obstruído por poeira densa.", servicos: [{ descricao: "Limpeza interna geral", tecnico: "João Paulo", valor: 180.00 }], pecas: [], valor_servicos: 180.00, valor_pecas: 0.00, desconto: 0.00, valor_total: 180.00, status_orcamento: "Aguardando análise", data_entrada: "2026-06-15T13:20:00.000Z", previsao_entrega: "2026-06-17T17:00:00.000Z", data_entrega: null },
      { id: this._gerarId(), tenant_id: tenantId, numero: "000120", cliente_id: clientesDados[3].id, aparelho_id: aparelhosDados[3].id, status: "pronto", tecnico_id: userMarianaId, defeito_informado: "Botão Home falhando.", diagnostico: "Ajuste físico no cabo flat.", servicos: [{ descricao: "Manutenção de flat", tecnico: "Ana Beatriz", valor: 120.00 }], pecas: [], valor_servicos: 120.00, valor_pecas: 0.00, desconto: 0.00, valor_total: 120.00, status_orcamento: "Aprovado", data_entrada: "2026-06-14T11:30:00.000Z", previsao_entrega: "2026-06-14T16:00:00.000Z", data_entrega: null },
      { id: this._gerarId(), tenant_id: tenantId, numero: "000119", cliente_id: clientesDados[2].id, aparelho_id: aparelhosDados[2].id, status: "em_manutencao", tecnico_id: userJoaoId, defeito_informado: "Teclado parou de funcionar.", diagnostico: "Curto no circuito do teclado.", servicos: [{ descricao: "Troca de teclado", tecnico: "João Paulo", valor: 250.00 }], pecas: [{ descricao: "Teclado Dell Inspiron", qtd: 1, valor_unit: 180.00, total: 180.00 }], valor_servicos: 250.00, valor_pecas: 180.00, desconto: 10.00, valor_total: 420.00, status_orcamento: "Aprovado", data_entrada: "2026-06-14T14:10:00.000Z", previsao_entrega: "2026-06-17T12:00:00.000Z", data_entrega: null }
    ];
    this._salvar(this.CHAVES.OS, osDados);

    // 6.1 Histórico de Linha do Tempo Interna das OS (Ações detalhadas da OS)
    const timelineDados = [
      { id: this._gerarId(), tenant_id: tenantId, os_id: osDados[0].id, data: "2026-06-15T09:15:00.000Z", usuario: "Carlos Silva", cargo: "Administrador", acao: "Abertura de OS", descricao: "A Ordem de Serviço #000123 foi aberta no sistema para o aparelho Samsung Galaxy S23.", ip: "192.168.0.15" },
      { id: this._gerarId(), tenant_id: tenantId, os_id: osDados[0].id, data: "2026-06-15T11:30:00.000Z", usuario: "Carlos Silva", cargo: "Administrador", acao: "Diagnóstico Técnico", descricao: "Adicionado diagnóstico técnico preliminar: Oxidação na placa.", ip: "192.168.0.15" },
      { id: this._gerarId(), tenant_id: tenantId, os_id: osDados[0].id, data: "2026-06-15T13:45:00.000Z", usuario: "Mariana Costa", cargo: "Atendente", acao: "Envio de Orçamento", descricao: "Orçamento enviado para aprovação do cliente via WhatsApp.", ip: "192.168.0.31" }
    ];
    this._salvar(this.CHAVES.HISTORICO_ACOES, timelineDados);

    // 7. Financeiro (Lançamentos e Fluxo)
    const financeiroDados = [
      { id: this._gerarId(), tenant_id: tenantId, descricao: "Troca de tela - OS #000123", categoria: "Serviços", tipo: "receita", valor: 650.00, data: "2026-06-15T15:00:00.000Z", status: "Recebido", forma_pagamento: "Pix" },
      { id: this._gerarId(), tenant_id: tenantId, descricao: "Conector de carga Samsung S23", categoria: "Vendas de peças", tipo: "receita", valor: 150.00, data: "2026-06-15T14:30:00.000Z", status: "Recebido", forma_pagamento: "Dinheiro" },
      { id: this._gerarId(), tenant_id: tenantId, descricao: "Aluguel da loja", categoria: "Despesas fixas", tipo: "despespa", valor: 1200.00, data: "2026-06-14T09:00:00.000Z", status: "Pago", forma_pagamento: "Boleto" },
      { id: this._gerarId(), tenant_id: tenantId, descricao: "Publicidade Google Ads", categoria: "Marketing", tipo: "despespa", valor: 280.00, data: "2026-06-14T10:15:00.000Z", status: "Pago", forma_pagamento: "Cartão de Crédito" },
      { id: this._gerarId(), tenant_id: tenantId, descricao: "Troca de bateria - OS #000098", categoria: "Serviços", tipo: "receita", valor: 350.00, data: "2026-06-14T16:00:00.000Z", status: "Recebido", forma_pagamento: "Pix" }
    ];
    // Inserindo dados passados para fins de cálculo de indicadores de variação mensal (Mês anterior)
    for (let i = 1; i <= 15; i++) {
      const dataMesPassado = new Date();
      dataMesPassado.setMonth(dataMesPassado.getMonth() - 1);
      dataMesPassado.setDate(i);
      financeiroDados.push({
        id: this._gerarId(), tenant_id: tenantId, descricao: `Receita Retroativa Exemplo ${i}`, categoria: "Serviços", tipo: "receita", valor: 1500.00, data: dataMesPassado.toISOString(), status: "Recebido", forma_pagamento: "Pix"
      });
      financeiroDados.push({
        id: this._gerarId(), tenant_id: tenantId, descricao: `Despesa Retroativa Exemplo ${i}`, categoria: "Materiais", tipo: "despespa", valor: 350.00, data: dataMesPassado.toISOString(), status: "Pago", forma_pagamento: "Boleto"
      });
    }
    this._salvar(this.CHAVES.FINANCEIRO, financeiroDados);

    // 8. Garantias de Equipamentos e Peças
    const garantiasDados = [
      { id: this._gerarId(), tenant_id: tenantId, os_numero: "000123", cliente_nome: "João Silva", aparelho_modelo: "iPhone 11", servico_peca: "Troca de tela", garantia_dias: 90, data_inicio: "2026-07-24", data_fim: "2026-10-22", status: "Ativa", imei: "356789115678912", cor: "Preto", n_serie: "DX3H7K2N73F7" },
      { id: this._gerarId(), tenant_id: tenantId, os_numero: "000122", cliente_nome: "Maria Oliveira", aparelho_modelo: "Samsung A54", servico_peca: "Troca de bateria", garantia_dias: 90, data_inicio: "2026-07-20", data_fim: "2026-10-18", status: "Ativa", imei: "492840294829104", cor: "Azul", n_serie: "SN-SAMS-A54" },
      { id: this._gerarId(), tenant_id: tenantId, os_numero: "000121", cliente_nome: "Rafael Costa", aparelho_modelo: "Motorola G60", servico_peca: "Conector de carga", garantia_dias: 90, data_inicio: "2026-07-10", data_fim: "2026-07-07", status: "Expirando", imei: "239482034920394", cor: "Cinza", n_serie: "SN-MOT-G60" },
      { id: this._gerarId(), tenant_id: tenantId, os_numero: "000118", cliente_nome: "Juliana Alves", aparelho_modelo: "iPhone 11", servico_peca: "Troca de bateria", garantia_dias: 90, data_inicio: "2026-06-10", data_fim: "2026-07-09", status: "Expirada", imei: "284920492049204", cor: "Branco", n_serie: "SN-IPH11-JUL" }
    ];
    this._salvar(this.CHAVES.GARANTIAS, garantiasDados);

    // 9. Agenda da Assistência Técnica (Visão por Técnico do Dia)
    const agendaDados = [
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAdminId, tecnico_nome: "Carlos Silva", titulo: "Diagnóstico", subtitulo: "João Silva", codigo_os: "OS #000123", horario_inicio: "08:00", horario_fim: "09:00", categoria: "Diagnóstico" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAdminId, tecnico_nome: "Carlos Silva", titulo: "Troca de tela", subtitulo: "iPhone 13", codigo_os: "OS #000124", horario_inicio: "09:30", horario_fim: "10:30", categoria: "Troca de peça" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAdminId, tecnico_nome: "Carlos Silva", titulo: "Reparo de placa", subtitulo: "Samsung S23", codigo_os: "OS #000125", horario_inicio: "11:00", horario_fim: "12:00", categoria: "Reparo / Manutenção" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAdminId, tecnico_nome: "Carlos Silva", titulo: "Intervalo", subtitulo: "", codigo_os: "Intervalo", horario_inicio: "12:00", horario_fim: "13:00", categoria: "Outros" },
      
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAnaId, tecnico_nome: "Ana Beatriz", titulo: "Troca de bateria", subtitulo: "iPhone 11", codigo_os: "OS #000129", horario_inicio: "08:30", horario_fim: "09:30", categoria: "Troca de peça" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAnaId, tecnico_nome: "Ana Beatriz", titulo: "Diagnóstico", subtitulo: "Motorola G60", codigo_os: "OS #000130", horario_inicio: "10:00", horario_fim: "11:00", categoria: "Diagnóstico" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userAnaId, tecnico_nome: "Ana Beatriz", titulo: "Intervalo", subtitulo: "", codigo_os: "Intervalo", horario_inicio: "12:00", horario_fim: "13:00", categoria: "Outros" },

      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userMarianaId, tecnico_nome: "Mariana Costa", titulo: "Atendimento", subtitulo: "Cliente: Ana Lima", codigo_os: "OS #000134", horario_inicio: "08:00", horario_fim: "09:00", categoria: "Atendimento / Cliente" },
      { id: this._gerarId(), tenant_id: tenantId, tecnico_id: userMarianaId, tecnico_nome: "Mariana Costa", titulo: "Confirmação de entrega", subtitulo: "OS #000120", horario_inicio: "09:30", horario_fim: "10:30", categoria: "Entrega / Retirada" }
    ];
    this._salvar(this.CHAVES.AGENDA, agendaDados);

    // 10. Notificações do Cabeçalho
    this._salvar(this.CHAVES.NOTIFICACOES, [
      { id: this._gerarId(), tenant_id: tenantId, titulo: "Nova Ordem de Serviço", descricao: "OS #000123 criada com sucesso.", tipo: "os", lida: false, data: new Date().toISOString() },
      { id: this._gerarId(), tenant_id: tenantId, titulo: "Orçamento aprovado", descricao: "OS #000118 - Samsung A54 - R$ 350,00", tipo: "os", lida: false, data: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      { id: this._gerarId(), tenant_id: tenantId, titulo: "Peça recebida", descricao: "Tela iPhone 11 - NF: 12548", tipo: "estoque", lida: true, data: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
    ]);

    console.log("[DB] Banco de dados de testes inicializado com 100% de cobertura.");
  },

  /** Limpa todos os registros de teste local */
  resetarTudo() {
    Object.values(this.CHAVES).forEach((chave) => localStorage.removeItem(chave));
    this.inicializar();
  },

  // =====================================================================
  // AUTENTICAÇÃO, CONTROLE MULTI-TENANT E USUÁRIOS
  // =====================================================================

  registrarEmpresa({ nomeEmpresa, nomeUsuario, email, senha }) {
    const users = this._ler(this.CHAVES.USERS);
    const jaExiste = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (jaExiste) throw new Error("Este e-mail já está cadastrado.");

    const tenants = this._ler(this.CHAVES.TENANTS);
    const novoTenant = { id: this._gerarId(), nome_empresa: nomeEmpresa, plano: "Profissional", criado_em: new Date().toISOString() };
    tenants.push(novoTenant);
    this._salvar(this.CHAVES.TENANTS, tenants);

    const novoUsuario = { id: this._gerarId(), tenant_id: novoTenant.id, nome: nomeUsuario, email, senha, cargo: "Administrador", avatar: "default.jpg", criado_em: new Date().toISOString() };
    users.push(novoUsuario);
    this._salvar(this.CHAVES.USERS, users);

    this._criarSessao(novoUsuario);
    return novoUsuario;
  },

  login(email, senha) {
    const users = this._ler(this.CHAVES.USERS);
    const usuario = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!usuario || usuario.senha !== senha) throw new Error("E-mail ou senha incorretos.");
    this._criarSessao(usuario);
    return usuario;
  },

  _criarSessao(usuario) {
    localStorage.setItem(this.CHAVES.SESSAO, JSON.stringify({ userId: usuario.id, tenantId: usuario.tenant_id }));
  },

  logout() {
    localStorage.removeItem(this.CHAVES.SESSAO);
  },

  estaAutenticado() {
    return !!localStorage.getItem(this.CHAVES.SESSAO);
  },

  obterUsuarioLogado() {
    const sessao = localStorage.getItem(this.CHAVES.SESSAO);
    if (!sessao) return null;
    const { userId } = JSON.parse(sessao);
    const users = this._ler(this.CHAVES.USERS);
    const usuario = users.find((u) => u.id === userId);
    if (!usuario) return null;

    const tenants = this._ler(this.CHAVES.TENANTS);
    const tenant = tenants.find((t) => t.id === usuario.tenant_id);
    return { ...usuario, nome_empresa: tenant ? tenant.nome_empresa : "" };
  },

  obterTenantIdAtual() {
    const usuario = this.obterUsuarioLogado();
    return usuario ? usuario.tenant_id : null;
  },

  listarUsuarios() {
    const tenantId = this.obterTenantIdAtual();
    return this._ler(this.CHAVES.USERS).filter(u => u.tenant_id === tenantId);
  },

  // =====================================================================
  // MÓDULO CLIENTES & COMUNICAÇÕES (Com paginação, buscas e filtros avançados)
  // =====================================================================

  listarClientes() {
    const tenantId = this.obterTenantIdAtual();
    return this._ler(this.CHAVES.CLIENTES).filter(c => c.tenant_id === tenantId);
  },

  listarClientesFiltrados({ pesquisa = "", grupo = "Todos os grupos", status = "Todos os status", pagina = 1, porPagina = 8 } = {}) {
    const tenantId = this.obterTenantIdAtual();
    let clientes = this._ler(this.CHAVES.CLIENTES).filter(c => c.tenant_id === tenantId);

    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      clientes = clientes.filter(c => 
        c.nome_completo.toLowerCase().includes(p) || 
        c.telefone_principal.includes(p) || 
        c.email.toLowerCase().includes(p) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(p))
      );
    }

    if (grupo && grupo !== "Todos os grupos") {
      clientes = clientes.filter(c => c.grupo === grupo);
    }

    if (status && status !== "Todos os status") {
      clientes = clientes.filter(c => c.status === status);
    }

    // Ordenação decrescente por data de criação
    clientes.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

    // Mapeamento de resumo estatístico individual por cliente para a tela de comunicações/detalhes
    const todasOS = this._ler(this.CHAVES.OS).filter(o => o.tenant_id === tenantId);
    const dadosMapeados = clientes.map(c => {
      const osDoCliente = todasOS.filter(o => o.cliente_id === c.id);
      const totalGasto = osDoCliente.reduce((sum, o) => sum + (o.valor_total || 0), 0);
      const ultimaOS = osDoCliente.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))[0];

      return {
        ...c,
        total_os: osDoCliente.length,
        total_gasto: totalGasto,
        ticket_medio: osDoCliente.length ? (totalGasto / osDoCliente.length) : 0,
        ultima_os_numero: ultimaOS ? `#${ultimaOS.numero}` : "Nenhuma",
        ultima_os_data: ultimaOS ? new Date(ultimaOS.data_entrada).toLocaleDateString("pt-BR") : "-"
      };
    });

    return this._paginar(dadosMapeados, pagina, porPagina);
  },

  obterCliente(id) {
    const tenantId = this.obterTenantIdAtual();
    const cliente = this._ler(this.CHAVES.CLIENTES).find(c => c.id === id && c.tenant_id === tenantId);
    if (!cliente) return null;

    // Resumo de dados de cabeçalho da ficha do cliente
    const todasOS = this._ler(this.CHAVES.OS).filter(o => o.tenant_id === tenantId && o.cliente_id === id);
    const aparelhos = this._ler(this.CHAVES.APARELHOS).filter(a => a.tenant_id === tenantId && a.cliente_id === id);
    const totalGasto = todasOS.reduce((sum, o) => sum + (o.valor_total || 0), 0);
    const ultimaOS = todasOS.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))[0];

    return {
      ...cliente,
      total_aparelhos: aparelhos.length,
      total_servicos_realizados: todasOS.filter(o => o.status === "entregue" || o.status === "pronto").length,
      total_gasto: totalGasto,
      ultimo_atendimento: ultimaOS ? new Date(ultimaOS.data_entrada).toLocaleDateString("pt-BR") : "-"
    };
  },

  criarCliente(dados) {
    const tenantId = this.obterTenantIdAtual();
    const clientes = this._ler(this.CHAVES.CLIENTES);
    const novo = { id: this._gerarId(), tenant_id: tenantId, grupo: "Clientes novos", status: "Ativo", criado_em: new Date().toISOString(), ...dados };
    clientes.push(novo);
    this._salvar(this.CHAVES.CLIENTES, clientes);
    this.registrarAcaoHistorico("Clientes", "Cadastrou cliente " + novo.nome_completo, `E-mail: ${novo.email}`);
    return novo;
  },

  atualizarCliente(id, dadosNovos) {
    const clientes = this._ler(this.CHAVES.CLIENTES);
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Cliente não encontrado.");
    clientes[idx] = { ...clientes[idx], ...dadosNovos };
    this._salvar(this.CHAVES.CLIENTES, clientes);
    return clientes[idx];
  },

  excluirCliente(id) {
    const clientes = this._ler(this.CHAVES.CLIENTES).filter(c => c.id !== id);
    this._salvar(this.CHAVES.CLIENTES, clientes);
  },

  // =====================================================================
  // MÓDULO APARELHOS
  // =====================================================================

  listarAparelhosDoCliente(clienteId) {
    const tenantId = this.obterTenantIdAtual();
    return this._ler(this.CHAVES.APARELHOS).filter(a => a.tenant_id === tenantId && a.cliente_id === clienteId);
  },

  obterAparelhoComEstatisticas(id) {
    const tenantId = this.obterTenantIdAtual();
    const aparelho = this._ler(this.CHAVES.APARELHOS).find(a => a.id === id && a.tenant_id === tenantId);
    if (!aparelho) return null;

    const osDoAparelho = this._ler(this.CHAVES.OS).filter(o => o.tenant_id === tenantId && o.aparelho_id === id);
    const totalGasto = osDoAparelho.reduce((sum, o) => sum + (o.valor_total || 0), 0);
    const ultimaOS = osDoAparelho.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))[0];

    return {
      ...aparelho,
      data_cadastro: new Date(aparelho.criado_em).toLocaleDateString("pt-BR") + " às " + new Date(aparelho.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      ultima_os_info: ultimaOS ? `#${ultimaOS.numero} - ${new Date(ultimaOS.data_entrada).toLocaleDateString("pt-BR")}` : "Nenhuma",
      total_servicos: osDoAparelho.length,
      total_gasto: totalGasto,
      historico_servicos: osDoAparelho.map(o => ({
        os_id: o.id,
        numero: o.numero,
        data: new Date(o.data_entrada).toLocaleDateString("pt-BR"),
        servico: o.servicos?.[0]?.descricao || "Manutenção geral",
        tecnico: o.servicos?.[0]?.tecnico || "Técnico geral",
        status: o.status === "entregue" ? "Concluído" : "Em andamento",
        valor: o.valor_total
      }))
    };
  },

  criarAparelho(dados) {
    const tenantId = this.obterTenantIdAtual();
    const aparelhos = this._ler(this.CHAVES.APARELHOS);
    const novo = { id: this._gerarId(), tenant_id: tenantId, status: "Ativo", criado_em: new Date().toISOString(), ...dados };
    aparelhos.push(novo);
    this._salvar(this.CHAVES.APARELHOS, aparelhos);
    return novo;
  },

  // =====================================================================
  // MÓDULO ORDENS DE SERVIÇO (OS) & IMPRESSÃO
  // =====================================================================

  listarOSFiltradas({ pesquisa = "", status = "Todos", pagina = 1, porPagina = 8 } = {}) {
    const tenantId = this.obterTenantIdAtual();
    let lista = this._ler(this.CHAVES.OS).filter(o => o.tenant_id === tenantId);

    const clientes = this._ler(this.CHAVES.CLIENTES).filter(c => c.tenant_id === tenantId);
    const aparelhos = this._ler(this.CHAVES.APARELHOS).filter(a => a.tenant_id === tenantId);

    let mapeada = lista.map(o => {
      const cli = clientes.find(c => c.id === o.cliente_id);
      const ap = aparelhos.find(a => a.id === o.aparelho_id);
      return {
        ...o,
        cliente_nome: cli ? cli.nome_completo : "Não identificado",
        aparelho_nome: ap ? `${ap.marca} ${ap.modelo}` : "Não identificado"
      };
    });

    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      mapeada = mapeada.filter(o => 
        o.numero.includes(p) || 
        o.cliente_nome.toLowerCase().includes(p) || 
        o.aparelho_nome.toLowerCase().includes(p)
      );
    }

    if (status && status !== "Todos") {
      mapeada = mapeada.filter(o => o.status === status);
    }

    mapeada.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada));
    return this._paginar(mapeada, pagina, porPagina);
  },

  obterOSDetalhadaParaImpressao(numeroOS) {
    const tenantId = this.obterTenantIdAtual();
    const os = this._ler(this.CHAVES.OS).find(o => o.numero === numeroOS && o.tenant_id === tenantId);
    if (!os) return null;

    const cliente = this.obterCliente(os.cliente_id);
    const aparelho = this._ler(this.CHAVES.APARELHOS).find(a => a.id === os.aparelho_id);
    const timeline = this._ler(this.CHAVES.HISTORICO_ACOES).filter(t => t.os_id === os.id);

    return {
      os,
      cliente,
      aparelho,
      timeline
    };
  },

  criarOS(dados) {
    const tenantId = this.obterTenantIdAtual();
    const todas = this._ler(this.CHAVES.OS);
    
    // Geração de número sequencial automático
    const proximoNumero = String(todas.filter(o => o.tenant_id === tenantId).length + 101).padStart(6, "0");

    const novaOS = {
      id: this._gerarId(),
      tenant_id: tenantId,
      numero: proximoNumero,
      status: "em_manutencao",
      valor_servicos: dados.servicos?.reduce((s, x) => s + x.valor, 0) || 0,
      valor_pecas: dados.pecas?.reduce((s, x) => s + x.total, 0) || 0,
      desconto: dados.desconto || 0,
      data_entrada: new Date().toISOString(),
      previsao_entrega: dados.previsao_entrega || null,
      data_entrega: null,
      ...dados
    };

    novaOS.valor_total = (novaOS.valor_servicos + novaOS.valor_pecas) - novaOS.desconto;

    todas.push(novaOS);
    this._salvar(this.CHAVES.OS, todas);

    // Registra ação na linha do tempo do sistema e da OS
    this.registrarAcaoHistorico("Ordem de Serviço", `Nova OS criada #${proximoNumero}`, `Aparelho vinc.: ${dados.aparelho_nome || ''}`, novaOS.id);
    this.criarNotificacao({ titulo: "Nova Ordem de Serviço", descricao: `OS #000${proximoNumero} criada com sucesso.`, tipo: "os" });

    return novaOS;
  },

  atualizarStatusOS(id, novoStatus, diagnosticoAlterado = null) {
    const todas = this._ler(this.CHAVES.OS);
    const idx = todas.findIndex(o => o.id === id);
    if (idx === -1) throw new Error("OS não encontrada");

    const statusAntigo = todas[idx].status;
    todas[idx].status = novoStatus;
    if (diagnosticoAlterado) todas[idx].diagnostico = diagnosticoAlterado;
    
    if (novoStatus === "entregue") {
      todas[idx].data_entrega = new Date().toISOString();
    }

    this._salvar(this.CHAVES.OS, todas);

    this.registrarAcaoHistorico("Ordem de Serviço", `Alterou status da OS #${todas[idx].numero}`, `Alterou status para "${novoStatus}"`, id);
  },

  /**
   * Atualiza uma Ordem de Serviço através de merge parcial dos dados enviados.
   * Localiza a OS pelo id, atualiza somente os campos recebidos em `dados`,
   * preserva todos os demais campos (nunca substitui o objeto inteiro),
   * recalcula os valores financeiros quando servicos/pecas forem alterados
   * (seguindo exatamente a mesma lógica já usada em criarOS()) e atualiza
   * data_atualizacao. Aceita qualquer propriedade da OS (status, comunicacoes,
   * servicos, pecas, tecnico_id, previsao_entrega, fotos, fotos_evolucao,
   * diagnostico, observacoes, desconto, garantia, status_orcamento, etc.).
   */
  atualizarOS(id, dados) {
    const todas = this._ler(this.CHAVES.OS);
    const idx = todas.findIndex(o => o.id === id);
    if (idx === -1) throw new Error("OS não encontrada");

    const osAntiga = todas[idx];

    // Merge parcial: preserva todos os campos existentes, atualizando apenas os enviados
    const osAtualizada = {
      ...osAntiga,
      ...dados
    };

    // Recalcula valores financeiros sempre que servicos e/ou pecas forem alterados,
    // seguindo exatamente a mesma lógica já utilizada em criarOS()
    if (dados.servicos || dados.pecas) {
      osAtualizada.valor_servicos = osAtualizada.servicos?.reduce((s, x) => s + x.valor, 0) || 0;
      osAtualizada.valor_pecas = osAtualizada.pecas?.reduce((s, x) => s + x.total, 0) || 0;
      osAtualizada.valor_total = (osAtualizada.valor_servicos + osAtualizada.valor_pecas) - (osAtualizada.desconto || 0);
    }

    osAtualizada.data_atualizacao = new Date().toISOString();

    todas[idx] = osAtualizada;
    this._salvar(this.CHAVES.OS, todas);

    // Integra com o histórico global de ações já existente no sistema (mesmo usado em criarOS/atualizarStatusOS)
    this.registrarAcaoHistorico("Ordem de Serviço", `Atualizou a OS #${osAtualizada.numero}`, "Dados da Ordem de Serviço foram atualizados.", id);

    return osAtualizada;
  },

  // =====================================================================
  // MÓDULO ESTOQUE Peças & Componentes
  // =====================================================================

  listarEstoqueFiltrado({ pesquisa = "", categoria = "Todas", status = "Todos os itens", pagina = 1, porPagina = 8 } = {}) {
    const tenantId = this.obterTenantIdAtual();
    let lista = this._ler(this.CHAVES.ESTOQUE).filter(e => e.tenant_id === tenantId);

    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      lista = lista.filter(e => e.nome.toLowerCase().includes(p) || e.codigo.toLowerCase().includes(p));
    }

    if (categoria && categoria !== "Todas") {
      lista = lista.filter(e => e.categoria === categoria);
    }

    if (status && status !== "Todos os itens") {
      if (status === "Estoque baixo") lista = lista.filter(e => e.estoque_atual <= e.estoque_minimo && e.estoque_atual > 0);
      if (status === "Sem estoque") lista = lista.filter(e => e.estoque_atual === 0);
      if (status === "Inativos") lista = lista.filter(e => e.status === "Inativo");
    }

    return this._paginar(lista, pagina, porPagina);
  },

  obterCardsEstatisticasEstoque() {
    const tenantId = this.obterTenantIdAtual();
    const estoque = this._ler(this.CHAVES.ESTOQUE).filter(e => e.tenant_id === tenantId);

    const totalItens = estoque.reduce((acc, curr) => acc + curr.estoque_atual, 0);
    const valorEstoque = estoque.reduce((acc, curr) => acc + (curr.estoque_atual * curr.valor_unitario), 0);
    const estoqueBaixo = estoque.filter(e => e.estoque_atual <= e.estoque_minimo && e.estoque_atual > 0).length;
    const semEstoque = estoque.filter(e => e.estoque_atual === 0).length;

    // Distribuição por categoria (para o gráfico rosquinha do estoque)
    const categoriasMapa = {};
    estoque.forEach(e => {
      categoriasMapa[e.categoria] = (categoriasMapa[e.categoria] || 0) + (e.estoque_atual * e.valor_unitario);
    });

    const resumoCategoria = Object.keys(categoriasMapa).map(cat => ({
      nome: cat,
      porcentagem: valorEstoque > 0 ? ((categoriasMapa[cat] / valorEstoque) * 100).toFixed(1) : 0
    }));

    const movsRecentes = this._ler(this.CHAVES.ESTOQUE_MOVIMENTACOES)
      .filter(m => m.tenant_id === tenantId)
      .sort((a,b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);

    return { totalItens, valorEstoque, estoqueBaixo, semEstoque, resumoCategoria, movimentacoes_recentes: movsRecentes };
  },

  registrarMovimentacaoEstoque(pecaId, tipo, quantidade, motivo) {
    const tenantId = this.obterTenantIdAtual();
    const estoque = this._ler(this.CHAVES.ESTOQUE);
    const idx = estoque.findIndex(e => e.id === pecaId && e.tenant_id === tenantId);
    if (idx === -1) throw new Error("Item de estoque não encontrado");

    const user = this.obterUsuarioLogado();

    if (tipo === "entrada") {
      estoque[idx].estoque_atual += quantidade;
    } else if (tipo === "saida") {
      if (estoque[idx].estoque_atual < quantidade) throw new Error("Estoque insuficiente.");
      estoque[idx].estoque_atual -= quantidade;
    }

    estoque[idx].valor_total = estoque[idx].estoque_atual * estoque[idx].valor_unitario;
    
    // Atualiza o status visual da peça
    if (estoque[idx].estoque_atual === 0) estoque[idx].status = "Sem estoque";
    else if (estoque[idx].estoque_atual <= estoque[idx].estoque_minimo) estoque[idx].status = "Estoque baixo";
    else estoque[idx].status = "Em estoque";

    this._salvar(this.CHAVES.ESTOQUE, estoque);

    const movs = this._ler(this.CHAVES.ESTOQUE_MOVIMENTACOES);
    movs.unshift({
      id: this._gerarId(),
      tenant_id: tenantId,
      peca_id: pecaId,
      peca_nome: estoque[idx].nome,
      tipo,
      quantidade,
      motivo,
      usuario_nome: user ? user.nome : "Sistema",
      data: new Date().toISOString()
    });
    this._salvar(this.CHAVES.ESTOQUE_MOVIMENTACOES, movs);

    this.registrarAcaoHistorico("Estoque", tipo === "entrada" ? "Baixou estoque de peça" : "Saída de estoque de peça", `${estoque[idx].nome} - ${quantidade} un.`);
  },

  // =====================================================================
  // MÓDULO FINANCEIRO (Gestão de Fluxo de Caixa, DRE e Extratos)
  // =====================================================================

  obterIndicadoresFinanceiros() {
    const tenantId = this.obterTenantIdAtual();
    const todos = this._ler(this.CHAVES.FINANCEIRO).filter(f => f.tenant_id === tenantId);

    const hoje = new Date();
    const esteMes = hoje.getMonth();
    const esteAno = hoje.getFullYear();

    const filtrarMes = (mes, ano, tipo) => todos.filter(f => {
      const d = new Date(f.data);
      return d.getMonth() === mes && d.getFullYear() === ano && f.tipo === tipo;
    }).reduce((s, f) => s + f.valor, 0);

    const rMesAtual = filtrarMes(esteMes, esteAno, "receita");
    const dMesAtual = filtrarMes(esteMes, esteAno, "despespa");
    const lucroAtual = rMesAtual - dMesAtual;

    // Cálculo do mês passado para os badges comparativos das telas (+12%, +18%)
    const mesPassado = esteMes === 0 ? 11 : esteMes - 1;
    const anoPassado = esteMes === 0 ? esteAno - 1 : esteAno;

    const rMesAnterior = filtrarMes(mesPassado, anoPassado, "receita") || 1; 
    const dMesAnterior = filtrarMes(mesPassado, anoPassado, "despespa") || 1;
    const lucroAnterior = rMesAnterior - dMesAnterior || 1;

    const varReceita = ((rMesAtual - rMesAnterior) / rMesAnterior) * 100;
    const varDespesa = ((dMesAtual - dMesAnterior) / dMesAnterior) * 100;
    const varLucro = ((lucroAtual - lucroAnterior) / Math.abs(lucroAnterior)) * 100;

    // Distribuição por Categoria Financeira (Gráfico Rosquinha)
    const categoriasMapa = {};
    todos.filter(f => f.tipo === "receita").forEach(f => {
      categoriasMapa[f.categoria] = (categoriasMapa[f.categoria] || 0) + f.valor;
    });
    const distCategorias = Object.keys(categoriasMapa).map(c => ({
      nome: c,
      valor: categoriasMapa[c],
      porcentagem: rMesAtual > 0 ? ((categoriasMapa[c] / rMesAtual) * 100).toFixed(1) : 0
    }));

    return {
      receitas_mes: rMesAtual,
      var_receita: varReceita.toFixed(1),
      despesas_mes: dMesAtual,
      var_despesa: varDespesa.toFixed(1),
      lucro_liquido_mes: lucroAtual,
      var_lucro: varLucro.toFixed(1),
      a_receber: todos.filter(f => f.status === "Em aberto" && f.tipo === "receita").reduce((s,f)=>s+f.valor,0),
      a_pagar: todos.filter(f => f.status === "Em aberto" && f.tipo === "despespa").reduce((s,f)=>s+f.valor,0),
      distribuicao_categoria: distCategorias,
      ultimas_movimentacoes: todos.sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0, 5)
    };
  },

  listarMovimentacoesFin() {
    const tenantId = this.obterTenantIdAtual();
    return this._ler(this.CHAVES.FINANCEIRO).filter(f => f.tenant_id === tenantId).sort((a,b)=> new Date(b.data) - new Date(a.data));
  },

  // =====================================================================
  // MÓDULO CONTROLE DE GARANTIAS
  // =====================================================================

  listarGarantias({ pesquisa = "", status = "Todos os status" } = {}) {
    const tenantId = this.obterTenantIdAtual();
    let lista = this._ler(this.CHAVES.GARANTIAS).filter(g => g.tenant_id === tenantId);

    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      lista = lista.filter(g => g.os_numero.includes(p) || g.cliente_nome.toLowerCase().includes(p) || g.aparelho_modelo.toLowerCase().includes(p));
    }

    if (status && status !== "Todos os status") {
      lista = lista.filter(g => g.status === status);
    }

    return lista;
  },

  obterCardsEstatisticasGarantia() {
    const garantias = this.listarGarantias();
    return {
      ativas: garantias.filter(g => g.status === "Ativa").length,
      expirando: garantias.filter(g => g.status === "Expirando").length,
      expiradas: garantias.filter(g => g.status === "Expirada").length,
      total: garantias.length
    };
  },

  // =====================================================================
  // MÓDULO AGENDA E COMPROMISSOS (Visão diária / Calendário por técnico)
  // =====================================================================

  listarAgendaDoDia(dataSelecionadaString) {
    const tenantId = this.obterTenantIdAtual();
    const todosCompromissos = this._ler(this.CHAVES.AGENDA).filter(a => a.tenant_id === tenantId);
    
    // Retorna a lista completa para montagem das colunas dos técnicos na interface da agenda
    return todosCompromissos;
  },

  obterProximosCompromissosAgenda() {
    const tenantId = this.obterTenantIdAtual();
    // Simula listagem ordenada cronologicamente para a sidebar lateral direita da agenda
    return this._ler(this.CHAVES.AGENDA)
      .filter(a => a.tenant_id === tenantId && a.categoria !== "Outros")
      .slice(0, 4);
  },

  criarCompromissoAgenda(dados) {
    const tenantId = this.obterTenantIdAtual();
    const agenda = this._ler(this.CHAVES.AGENDA);
    const novo = { id: this._gerarId(), tenant_id: tenantId, ...dados };
    agenda.push(novo);
    this._salvar(this.CHAVES.AGENDA, agenda);
    return novo;
  },

  // =====================================================================
  // MÓDULO DASHBOARD PRINCIPAL
  // =====================================================================

  calcularDashboard() {
    const tenantId = this.obterTenantIdAtual();
    const usuario = this.obterUsuarioLogado();

    const todasOS = this._ler(this.CHAVES.OS).filter((os) => os.tenant_id === tenantId);
    const todosClientes = this._ler(this.CHAVES.CLIENTES).filter(c => c.tenant_id === tenantId);
    const todosAparelhos = this._ler(this.CHAVES.APARELHOS).filter((a) => a.tenant_id === tenantId);
    const todoFinanceiro = this._ler(this.CHAVES.FINANCEIRO).filter((f) => f.tenant_id === tenantId);

    const contarPorStatus = (status) => todasOS.filter((os) => os.status === status).length;

    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    function somarReceitas(dataInicio, dataFim) {
      return todoFinanceiro
        .filter((f) => f.tipo === "receita" && (f.status === "pago" || f.status === "Recebido"))
        .filter((f) => {
          const dataMov = new Date(f.data);
          return dataMov >= dataInicio && (!dataFim || dataMov < dataFim);
        })
        .reduce((soma, f) => soma + f.valor, 0);
    }

    const amanha = new Date(inicioHoje);
    amanha.setDate(amanha.getDate() + 1);
    const faturamentoHoje = somarReceitas(inicioHoje, amanha);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const faturamentoMes = somarReceitas(inicioMes, null);

    const graficoUltimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(inicioHoje);
      dia.setDate(dia.getDate() - i);
      const proximoDia = new Date(dia);
      proximoDia.setDate(proximoDia.getDate() + 1);

      graficoUltimos7Dias.push({
        label: dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: somarReceitas(dia, proximoDia),
      });
    }

    const ultimasOS = [...todasOS]
      .sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))
      .slice(0, 5)
      .map((os) => {
        const cliente = todosClientes.find((c) => c.id === os.cliente_id);
        const aparelho = todosAparelhos.find((a) => a.id === os.aparelho_id);
        return {
          id: os.id,
          numero: os.numero,
          cliente_nome: cliente ? cliente.nome_completo : "-",
          aparelho_nome: aparelho ? `${aparelho.marca} ${aparelho.modelo}` : "-",
          status: os.status,
          data_entrada: new Date(os.data_entrada).toLocaleDateString("pt-BR"),
          previsao: os.previsao_entrega ? new Date(os.previsao_entrega).toLocaleDateString("pt-BR") : "-"
        };
      });

    // Atividades Recentes unificadas do sistema (Auditoria da tela inicial do Dashboard)
    const atividades = this._ler(this.CHAVES.HISTORICO_ACOES)
      .filter(h => h.tenant_id === tenantId)
      .sort((a,b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5)
      .map(act => ({
        titulo: act.acao,
        subtitulo: act.descricao,
        hora: new Date(act.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }));

    return {
      saudacao_nome: usuario ? usuario.nome.split(" ")[0] : "",
      os_em_andamento: contarPorStatus("em_manutencao"),
      os_aguardando_orcamento: contarPorStatus("aguardando_orcamento"),
      os_aguardando_peca: contarPorStatus("aguardando_peca"),
      os_prontas_retirada: contarPorStatus("pronto"),
      os_entregues_hoje: todasOS.filter((os) => os.status === "entregue" && os.data_entrega && new Date(os.data_entrega) >= inicioHoje).length,
      aparelhos_na_bancada: todasOS.filter((os) => !["entregue", "cancelado"].includes(os.status)).length,
      faturamento_dia: faturamentoHoje,
      faturamento_mes: faturamentoMes,
      ticket_medio: todasOS.length ? Math.round(faturamentoMes / Math.max(todasOS.filter(o=>o.status==="entregue").length,1)) : 0,
      grafico_faturamento_dia: graficoUltimos7Dias,
      ultimas_ordens_servico: ultimasOS,
      atividades_recentes: atividades.length ? atividades : [
        { titulo: "Nova OS criada", subtitulo: "OS #000123 - iPhone 13 - João Silva", hora: "09:15" },
        { titulo: "Orçamento aprovado", subtitulo: "OS #000118 - Samsung A54 - R$ 350,00", hora: "10:42" },
        { titulo: "Peça recebida", subtitulo: "Tela iPhone 11 - NF: 12548", hora: "11:30" }
      ]
    };
  },

  // =====================================================================
  // MÓDULO RELATÓRIOS & HISTÓRICO DE AUDITORIA DO SISTEMA
  // =====================================================================

  listarHistoricoAcoesGlobal({ pesquisa = "", modulo = "Todos", pagina = 1, porPagina = 10 } = {}) {
    const tenantId = this.obterTenantIdAtual();
    let lista = this._ler(this.CHAVES.HISTORICO_ACOES).filter(h => h.tenant_id === tenantId);

    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      lista = lista.filter(h => h.usuario.toLowerCase().includes(p) || h.acao.toLowerCase().includes(p) || h.descricao.toLowerCase().includes(p));
    }

    if (modulo && modulo !== "Todos") {
      lista = lista.filter(h => h.modulo === modulo);
    }

    lista.sort((a,b) => new Date(b.data) - new Date(a.data));

    const totalEventos = lista.length;
    const hoje = new Date().toDateString();
    const eventosHoje = lista.filter(h => new Date(h.data).toDateString() === hoje).length;

    const paginado = this._paginar(lista, pagina, porPagina);

    return {
      ...paginado,
      card_total: totalEventos,
      card_hoje: eventosHoje,
      card_semana: Math.ceil(totalEventos * 0.25), // Proporção simulada baseada nas telas
      card_mes: totalEventos
    };
  },

  registrarAcaoHistorico(modulo, acao, descricao, osId = null) {
    const tenantId = this.obterTenantIdAtual();
    const user = this.obterUsuarioLogado();
    const logs = this._ler(this.CHAVES.HISTORICO_ACOES);

    logs.unshift({
      id: this._gerarId(),
      tenant_id: tenantId,
      os_id: osId,
      data: new Date().toISOString(),
      usuario: user ? user.nome : "Sistema",
      cargo: user ? user.cargo : "Administrador",
      acao,
      modulo,
      descricao,
      ip: "192.168.0." + Math.floor(Math.random() * 50 + 10)
    });

    this._salvar(this.CHAVES.HISTORICO_ACOES, logs);
  },

  gerarDadosRelatorioGeral(tipoRelatorio) {
    const tenantId = this.obterTenantIdAtual();
    // Retorna agrupados estratégicos com base nas coleções para montagem de gráficos de impressão/exportação
    if (tipoRelatorio === "clientes") return this._ler(this.CHAVES.CLIENTES).filter(c=>c.tenant_id===tenantId);
    if (tipoRelatorio === "faturamento") return this._ler(this.CHAVES.FINANCEIRO).filter(f=>f.tenant_id===tenantId);
    return this._ler(this.CHAVES.OS).filter(o=>o.tenant_id===tenantId);
  },

  // =====================================================================
  // NOTIFICAÇÕES (Módulo Nativo Mantido)
  // =====================================================================

  listarNotificacoes() {
    const tenantId = this.obterTenantIdAtual();
    return this._ler(this.CHAVES.NOTIFICACOES)
      .filter((n) => n.tenant_id === tenantId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  },

  contarNotificacoesNaoLidas() {
    return this.listarNotificacoes().filter((n) => !n.lida).length;
  },

  criarNotificacao({ titulo, descricao, tipo = "info" }) {
    const tenantId = this.obterTenantIdAtual();
    if (!tenantId) return;

    const notificacoes = this._ler(this.CHAVES.NOTIFICACOES);
    const novaNotificacao = { id: this._gerarId(), tenant_id: tenantId, titulo, descricao, tipo, lida: false, data: new Date().toISOString() };
    notificacoes.unshift(novaNotificacao);
    this._salvar(this.CHAVES.NOTIFICACOES, notificacoes);
    return novaNotificacao;
  },

  marcarNotificacaoComoLida(id) {
    const notificacoes = this._ler(this.CHAVES.NOTIFICACOES);
    const indice = notificacoes.findIndex((n) => n.id === id);
    if (indice !== -1) {
      notificacoes[indice].lida = true;
      this._salvar(this.CHAVES.NOTIFICACOES, notificacoes);
    }
  },

  marcarTodasNotificacoesComoLidas() {
    const tenantId = this.obterTenantIdAtual();
    const notificacoes = this._ler(this.CHAVES.NOTIFICACOES);
    notificacoes.forEach((n) => {
      if (n.tenant_id === tenantId) n.lida = true;
    });
    this._salvar(this.CHAVES.NOTIFICACOES, notificacoes);
  },

  // =====================================================================
  // GERENCIAMENTO AVANÇADO DE ORDENS DE SERVIÇO (OS)
  // =====================================================================

  /**
   * Obtém uma única OS pelo ID ou Número, populando dados de cliente e aparelho
   */
  obterOSDetalhada(idOuNumero) {
    const tenantId = this.obterTenantIdAtual();
    if (!tenantId) return null;

    const lista = this._ler(this.CHAVES.OS);
    const os = lista.find(o => o.tenant_id === tenantId && (o.id === idOuNumero || o.numero === String(idOuNumero)));
    
    if (!os) return null;

    // Acopla referências para facilidade de uso na UI
    const clientes = this._ler(this.CHAVES.CLIENTES);
    os.clienteObj = clientes.find(c => c.tenant_id === tenantId && c.id === os.cliente_id) || null;

    return os;
  },

  /**
   * Cria uma Ordem de Serviço com numeração sequencial automática e histórico inicial
   */
  criarNovaOS(dadosOS) {
    const tenantId = this.obterTenantIdAtual();
    if (!tenantId) return null;

    const lista = this._ler(this.CHAVES.OS);
    
    // Gerar número sequencial único para o Tenant
    const osDoTenant = lista.filter(o => o.tenant_id === tenantId);
    const proximoNumero = osDoTenant.length > 0 
      ? String(Math.max(...osDoTenant.map(o => parseInt(o.numero) || 0)) + 1).padStart(4, '0')
      : "1001";

    const novaOS = {
      id: this._gerarId(),
      tenant_id: tenantId,
      numero: proximoNumero,
      cliente_id: dadosOS.cliente_id || "",
      aparelho: dadosOS.aparelho || "",
      marca: dadosOS.marca || "",
      modelo: dadosOS.modelo || "",
      cor: dadosOS.cor || "",
      numero_serie: dadosOS.numero_serie || "",
      imei: dadosOS.imei || "",
      senha: dadosOS.senha || "",
      defeito_informado: dadosOS.defeito_informado || "",
      defeito_encontrado: dadosOS.defeito_encontrado || "",
      observacoes: dadosOS.observacoes || "",
      checklist: dadosOS.checklist || [], // Array de { item: string, checado: bool }
      acessorios: dadosOS.acessorios || [], // Array de strings
      status: dadosOS.status || "recebido",
      prioridade: dadosOS.prioridade || "normal",
      tecnico_responsavel: dadosOS.tecnico_responsavel || "",
      garantia: dadosOS.garantia || "",
      previsao_entrega: dadosOS.previsao_entrega || "",
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
      
      // Financeiro e Itens
      servicos: dadosOS.servicos || [], // { id, descricao, preco, custo }
      pecas: dadosOS.pecas || [], // { id, descricao, preco, custo, quantidade }
      valor_desconto: dadosOS.valor_desconto || 0,
      status_pagamento: dadosOS.status_pagamento || "pendente", // pendente, pago, parcial
      forma_pagamento: dadosOS.forma_pagamento || "",
      
      // Arquivos e Assinatura
      fotos: dadosOS.fotos || [], // Array de { id, base64, data }
      assinatura: dadosOS.assinatura || null, // base64
      
      // Histórico interno
      historico: [
        {
          id: this._gerarId(),
          data: new Date().toISOString(),
          titulo: "OS Criada",
          descricao: `Ordem de Serviço número #${proximoNumero} iniciada no sistema.`,
          usuario: dadosOS.usuario_nome || "Sistema"
        }
      ]
    };

    lista.push(novaOS);
    this._salvar(this.CHAVES.OS, lista);

    // Registra a ação na auditoria global do SaaS
    this.registrarAcaoHistorico("Criação de OS", `Criou a OS #${proximoNumero}`);
    this.criarNotificacao({
      titulo: `Nova OS #${proximoNumero}`,
      descricao: `Aparelho: ${novaOS.marca} ${novaOS.modelo} cadastrado com sucesso.`,
      tipo: "info"
    });

    return novaOS;
  },

  /**
   * Atualiza qualquer campo da OS e insere entradas automáticas no histórico estruturado
   */
  atualizarOSDetalhada(idOS, novosDados, usuarioNome = "Técnico") {
    const lista = this._ler(this.CHAVES.OS);
    const indice = lista.findIndex(o => o.id === idOS);
    if (indice === -1) return false;

    const osAntiga = lista[indice];
    const entradasHistorico = [];

    // Detecta mudanças de estado críticos para alimentar o histórico e gatilhos
    if (novosDados.status && novosDados.status !== osAntiga.status) {
      entradasHistorico.push({
        id: this._gerarId(),
        data: new Date().toISOString(),
        titulo: "Status Alterado",
        descricao: `Alterado de '${osAntiga.status}' para '${novosDados.status}'.`,
        usuario: usuarioNome
      });
      
      // Notificação global do SaaS
      this.criarNotificacao({
        titulo: `OS #${osAntiga.numero} atualizada`,
        descricao: `Status mudou para: ${novosDados.status.toUpperCase()}`,
        tipo: novosDados.status === "pronto" ? "sucesso" : "info"
      });
    }

    if (novosDados.pecas && JSON.stringify(novosDados.pecas) !== JSON.stringify(osAntiga.pecas)) {
      entradasHistorico.push({
        id: this._gerarId(),
        data: new Date().toISOString(),
        titulo: "Peças Atualizadas",
        descricao: "A lista de componentes aplicados ao dispositivo foi modificada.",
        usuario: usuarioNome
      });
    }

    if (novosDados.servicos && JSON.stringify(novosDados.servicos) !== JSON.stringify(osAntiga.servicos)) {
      entradasHistorico.push({
        id: this._gerarId(),
        data: new Date().toISOString(),
        titulo: "Mão de Obra Alterada",
        descricao: "Os serviços associados à manutenção foram alterados.",
        usuario: usuarioNome
      });
    }

    if (novosDados.status_pagamento && novosDados.status_pagamento !== osAntiga.status_pagamento) {
      entradasHistorico.push({
        id: this._gerarId(),
        data: new Date().toISOString(),
        titulo: "Fluxo Financeiro",
        descricao: `Status do pagamento modificado para '${novosDados.status_pagamento}'.`,
        usuario: usuarioNome
      });
    }

    // Mescla dados antigos e novos preservando histórico estruturado anterior
    const osAtualizada = {
      ...osAntiga,
      ...novosDados,
      historico: [...(osAntiga.historico || []), ...entradasHistorico],
      data_atualizacao: new Date().toISOString()
    };

    lista[indice] = osAtualizada;
    this._salvar(this.CHAVES.OS, lista);
    return true;
  },

  /**
   * Adiciona um evento customizado direto no histórico da OS
   */
  adicionarEntradaHistoricoOS(idOS, titulo, descricao, usuarioNome) {
    const lista = this._ler(this.CHAVES.OS);
    const indice = lista.findIndex(o => o.id === idOS);
    if (indice === -1) return false;

    lista[indice].historico.push({
      id: this._gerarId(),
      data: new Date().toISOString(),
      titulo,
      descricao,
      usuario: usuarioNome
    });

    this._salvar(this.CHAVES.OS, lista);
    return true;
  },

  /**
   * Retorna os clientes cadastrados para preenchimento de combobox/selects na UI
   */
  listarClientesDropdown() {
    const tenantId = this.obterTenantIdAtual();
    if (!tenantId) return [];
    return this._ler(this.CHAVES.CLIENTES)
      .filter(c => c.tenant_id === tenantId)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  },
};

// Carrega os dados Mockados estruturais do TecAssist na primeira execução
DB.inicializar();