/**
 * ===========================================================================
 * verificadorDados.js — MOTOR DE VALIDAÇÃO CENTRALIZADO DO SAAS
 * ===========================================================================
 * Camada de Regras de Negócio, Normalização, Formatação e Validações Sintáticas.
 * Projetado sob os princípios SRP (Single Responsibility Principle) e DRY.
 * * @fileoverview Centralizador de consistência cadastral desacoplado do DB.
 * @version 2.0.0
 */

/**
 * DICIONÁRIO DE CONSTANTES DO SISTEMA (Evita Números Mágicos)
 * @private
 */
const TAMANHO_CPF = 11;
const TAMANHO_CNPJ = 14;
const TAMANHO_CEP = 8;
const MIN_TAMANHO_NOME = 3;

/**
 * DICIONÁRIO CENTRALIZADO DE MENSAGENS (Pronto para Internacionalização / i18n)
 * @private
 */
const MENSAGENS = {
  CAMPO_OBRIGATORIO: (campo) => `O campo ${campo} é obrigatório.`,
  NOME_INVALIDO: "Por favor, insira o nome completo do cliente.",
  CPF_INVALIDO: "O CPF informado é inválido.",
  CNPJ_INVALIDO: "O CNPJ informado é inválido.",
  DOCUMENTO_INVALIDO: "O CPF ou CNPJ informado é inválido.",
  EMAIL_INVALIDO: "O e-mail informado possui um formato inválido.",
  TELEFONE_INVALIDO: "Informe um telefone principal válido.",
  CEP_INVALIDO: "O CEP informado é inválido.",
  DUPLICIDADE_CPF: "Já existe um cliente cadastrado com este CPF.",
  DUPLICIDADE_CNPJ: "Já existe um cliente cadastrado com este CNPJ.",
  DUPLICIDADE_EMAIL: "Este e-mail já está cadastrado.",
  DUPLICIDADE_TELEFONE: "Telefone já cadastrado.",
  DUPLICIDADE_CLIENTE: "Cliente já cadastrado."
};

const VerificadorDados = {

  // =====================================================================
  // 1. REGIÃO: HELPERS
  // =====================================================================

  /**
   * Verifica se um valor é nulo, indefinido, vazio ou composto apenas por espaços.
   * @param {*} valor - O valor a ser analisado.
   * @returns {boolean} True se estiver vazio, false caso contrário.
   */
  estaVazio(valor) {
    if (valor === null || valor === undefined) return true;
    if (typeof valor === 'string' && valor.trim() === '') return true;
    if (Array.isArray(valor) && valor.length === 0) return true;
    return false;
  },

  /**
   * Verifica se um valor possui conteúdo válido (negação do estaVazio).
   * @param {*} valor - O valor a ser analisado.
   * @returns {boolean} True se possuir valor, false caso contrário.
   */
  possuiValor(valor) {
    return !this.estaVazio(valor);
  },

  /**
   * Valida se um campo obrigatório foi preenchido.
   * @param {*} valor - O valor do campo.
   * @param {string} nomeCampo - O rótulo/nome amigável do campo para exibição.
   * @param {string} chaveCampo - O identificador do campo no retorno do payload.
   * @returns {Object} Estrutura padrão de resposta { sucesso, campo, mensagem }
   */
  validarObrigatorio(valor, nomeCampo, chaveCampo) {
    if (this.estaVazio(valor)) {
      return {
        sucesso: false,
        campo: chaveCampo || nomeCampo.toLowerCase(),
        mensagem: MENSAGENS.CAMPO_OBRIGATORIO(nomeCampo)
      };
    }
    return { sucesso: true };
  },

  /**
   * Detecta o tipo de documento com base no comprimento de seus numéricos estruturais.
   * @param {string|number} valor - O documento bruto enviado.
   * @returns {string} 'CPF', 'CNPJ' ou 'INVALIDO'.
   */
  detectarTipoDocumento(valor) {
    if (this.estaVazio(valor)) return 'INVALIDO';
    const limpo = this.normalizarNumero(valor);
    if (limpo.length === TAMANHO_CPF) return 'CPF';
    if (limpo.length === TAMANHO_CNPJ) return 'CNPJ';
    return 'INVALIDO';
  },


  // =====================================================================
  // 2. REGIÃO: FORMATAÇÃO
  // =====================================================================

  /**
   * Formata uma string numérica pura para a máscara padrão de CPF.
   * @param {string|number} cpf 
   * @returns {string} CPF formatado (000.000.000-00) ou entrada original.
   */
  formatarCPF(cpf) {
    const limpo = this.normalizarNumero(cpf);
    if (limpo.length !== TAMANHO_CPF) return cpf;
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  /**
   * Formata uma string numérica pura para a máscara padrão de CNPJ.
   * @param {string|number} cnpj 
   * @returns {string} CNPJ formatado (00.000.000/0000-00) ou entrada original.
   */
  formatarCNPJ(cnpj) {
    const limpo = this.normalizarNumero(cnpj);
    if (limpo.length !== TAMANHO_CNPJ) return cnpj;
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  },

  /**
   * Formata uma string numérica para padrão nacional de telefone fixo ou celular.
   * @param {string|number} telefone 
   * @returns {string} Telefone formatado (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
   */
  formatarTelefone(telefone) {
    const limpo = this.normalizarNumero(telefone);
    if (limpo.length === 11) {
      return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (limpo.length === 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
  },

  /**
   * Formata uma string de numéricos para o padrão de CEP brasileiro.
   * @param {string|number} cep 
   * @returns {string} CEP formatado (00000-000).
   */
  formatarCEP(cep) {
    const limpo = this.normalizarNumero(cep);
    if (limpo.length !== TAMANHO_CEP) return cep;
    return limpo.replace(/(\d{5})(\d{3})/, "$1-$2");
  },


  // =====================================================================
  // 3. REGIÃO: NORMALIZAÇÃO
  // =====================================================================

  /**
   * Limpa espaços sobressalentes e padroniza caixa do texto para comparações lógicas.
   * @param {string} txt 
   * @returns {string} Texto normalizado em caixa baixa.
   */
  normalizarTexto(txt) {
    if (this.estaVazio(txt)) return '';
    return txt.toString().trim().toLowerCase().replace(/\s+/g, ' ');
  },

  /**
   * Expura quaisquer caracteres que não sejam numéricos de uma string/variável.
   * @param {string|number} num 
   * @returns {string} String contendo apenas numerais.
   */
  normalizarNumero(num) {
    if (this.estaVazio(num)) return '';
    return num.toString().replace(/[^\d]+/g, '');
  },

  /**
   * Remove máscaras visuais mantendo apenas dígitos numéricos (Alias de compatibilidade).
   * @param {string|number} valor 
   * @returns {string} String contendo apenas dígitos numéricos.
   */
  removerMascara(valor) {
    return this.normalizarNumero(valor);
  },


  // =====================================================================
  // 4. REGIÃO: VALIDAÇÕES DE FORMATO
  // =====================================================================

  /**
   * Executa a verificação e cálculo matemático estrutural de um CPF.
   * @param {string|number} cpf 
   * @returns {boolean} True se o CPF for real e válido, false caso contrário.
   */
  validarCPF(cpf) {
    if (this.estaVazio(cpf)) return false;
    const limpo = this.normalizarNumero(cpf);
    if (limpo.length !== TAMANHO_CPF || /^(\d)\1{10}$/.test(limpo)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(limpo.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    if (digito1 !== parseInt(limpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(limpo.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    return digito2 === parseInt(limpo.charAt(10));
  },

  /**
   * Executa a verificação e cálculo matemático estrutural de um CNPJ.
   * @param {string|number} cnpj 
   * @returns {boolean} True se o CNPJ for real e válido, false caso contrário.
   */
  validarCNPJ(cnpj) {
    if (this.estaVazio(cnpj)) return false;
    const limpo = this.normalizarNumero(cnpj);
    if (limpo.length !== TAMANHO_CNPJ || /^(\d)\1{13}$/.test(limpo)) return false;

    let tamanho = limpo.length - 2;
    let numeros = limpo.substring(0, tamanho);
    let digitos = limpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resto = soma % 11;
    let resultado = resto < 2 ? 0 : 11 - resto;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = limpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resto = soma % 11;
    resultado = resto < 2 ? 0 : 11 - resto;
    return resultado === parseInt(digitos.charAt(1));
  },

  /**
   * Identifica polimorficamente o tamanho do documento e aciona a validação correspondente.
   * @param {string|number} valor - O documento (CPF ou CNPJ) bruto.
   * @returns {boolean} True se for um documento válido nacional.
   */
  validarCPFCNPJ(valor) {
    const tipo = this.detectarTipoDocumento(valor);
    if (tipo === 'CPF') return this.validarCPF(valor);
    if (tipo === 'CNPJ') return this.validarCNPJ(valor);
    return false;
  },

  /**
   * Valida a conformidade sintática estrutural de uma string de E-mail.
   * @param {string} email 
   * @returns {boolean} True se estiver em formato válido.
   */
  validarEmail(email) {
    if (this.estaVazio(email)) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  },

  /**
   * Valida se a quantidade de dígitos numéricos é cabível a um telefone fixo ou móvel nacional.
   * @param {string|number} telefone 
   * @returns {boolean} True se conter entre 10 e 11 dígitos numéricos puros.
   */
  validarTelefone(telefone) {
    if (this.estaVazio(telefone)) return false;
    const limpo = this.normalizarNumero(telefone);
    return limpo.length >= 10 && limpo.length <= 11;
  },

  /**
   * Verifica se o tamanho do CEP confere com a regra postal brasileira.
   * @param {string|number} cep 
   * @returns {boolean} True se houver 8 numéricos puros.
   */
  validarCEP(cep) {
    if (this.estaVazio(cep)) return false;
    const limpo = this.normalizarNumero(cep);
    return limpo.length === TAMANHO_CEP;
  },

  /**
   * Valida se um nome possui tamanho aceitável e ao menos um sobrenome/espaçamento divisor.
   * @param {string} nome 
   * @returns {boolean} True se o formato for satisfatório para cadastros corporativos.
   */
  validarNome(nome) {
    if (this.estaVazio(nome)) return false;
    const limpo = nome.trim();
    return limpo.length >= MIN_TAMANHO_NOME && limpo.includes(" ");
  },


  // =====================================================================
  // 5. REGIÃO: VERIFICAÇÃO DE DUPLICIDADE (DESACOPLADA)
  // =====================================================================

  /**
   * Avalia a existência de colisão de dados únicos contra uma coleção injetada por parâmetro.
   * @param {Object} clienteDados - Objeto com os dados do cliente pretendido.
   * @param {Array<Object>} clientesExistentes - Matriz de dados populada da tabela local/banco.
   * @param {string|number|null} [idIgnorar=null] - ID opcional de registro a ignorar (Utilizado em Edições).
   * @returns {Object} { sucesso: boolean, campo?: string, mensagem?: string }
   */
  verificarDuplicidade(clienteDados, clientesExistentes, idIgnorar = null) {
    if (this.estaVazio(clientesExistentes) || !Array.isArray(clientesExistentes)) {
      return { sucesso: true }; 
    }

    const nomeNovo = this.normalizarTexto(clienteDados.nome_completo);
    const docNovo = this.normalizarNumero(clienteDados.cpf_cnpj);
    const emailNovo = this.normalizarTexto(clienteDados.email);
    const telNovo = this.normalizarNumero(clienteDados.telefone_principal);

    for (const cliente of clientesExistentes) {
      if (idIgnorar && cliente.id === idIgnorar) continue;

      if (this.possuiValor(docNovo) && this.normalizarNumero(cliente.cpf_cnpj) === docNovo) {
        const tipoDoc = this.detectarTipoDocumento(docNovo);
        return {
          sucesso: false,
          campo: "cpf_cnpj",
          mensagem: tipoDoc === 'CNPJ' ? MENSAGENS.DUPLICIDADE_CNPJ : MENSAGENS.DUPLICIDADE_CPF
        };
      }

      if (this.possuiValor(emailNovo) && this.normalizarTexto(cliente.email) === emailNovo) {
        return { sucesso: false, campo: "email", mensagem: MENSAGENS.DUPLICIDADE_EMAIL };
      }

      if (this.possuiValor(telNovo) && this.normalizarNumero(cliente.telefone_principal) === telNovo) {
        return { sucesso: false, campo: "telefone_principal", mensagem: MENSAGENS.DUPLICIDADE_TELEFONE };
      }

      if (this.possuiValor(nomeNovo) && this.normalizarTexto(cliente.nome_completo) === nomeNovo) {
        return { sucesso: false, campo: "nome_completo", mensagem: MENSAGENS.DUPLICIDADE_CLIENTE };
      }
    }

    return { suicidal: false, sucesso: true };
  },


  // =====================================================================
  // 6. REGIÃO: VALIDADORES DE ENTIDADES
  // =====================================================================

  /**
   * Motor de validação conceitual completo para a entidade CLIENTE.
   * @param {Object} clienteDados - Instância transiente com os dados de tela.
   * @param {Array<Object>} clientesExistentes - Base em memória de comparação fornecida pelo DB.
   * @param {string|number|null} [idIgnorar=null] - ID opcional de registro a ignorar.
   * @returns {Object} Objeto padronizado de resposta operacional { sucesso, campo, mensagem }.
   */
  validarCliente(clienteDados, clientesExistentes, idIgnorar = null) {
    // Validações de Obrigatoriedade Genéricas Integradas
    const checaNome = this.validarObrigatorio(clienteDados.nome_completo, "Nome Completo", "nome_completo");
    if (!checaNome.sucesso) return checaNome;

    const checaTel = this.validarObrigatorio(clienteDados.telefone_principal, "Telefone Principal", "telefone_principal");
    if (!checaTel.sucesso) return checaTel;

    // Validações de Formatos e Máscaras
    if (!this.validarNome(clienteDados.nome_completo)) {
      return { sucesso: false, campo: "nome_completo", mensagem: MENSAGENS.NOME_INVALIDO };
    }
    if (this.possuiValor(clienteDados.cpf_cnpj) && !this.validarCPFCNPJ(clienteDados.cpf_cnpj)) {
      return { sucesso: false, campo: "cpf_cnpj", mensagem: MENSAGENS.DOCUMENTO_INVALIDO }; 
    }
    if (this.possuiValor(clienteDados.email) && !this.validarEmail(clienteDados.email)) {
      return { sucesso: false, campo: "email", mensagem: MENSAGENS.EMAIL_INVALIDO };
    }
    if (!this.validarTelefone(clienteDados.telefone_principal)) {
      return { sucesso: false, campo: "telefone_principal", mensagem: MENSAGENS.TELEFONE_INVALIDO };
    }
    if (this.possuiValor(clienteDados.cep) && !this.validarCEP(clienteDados.cep)) {
      return { sucesso: false, campo: "cep", mensagem: MENSAGENS.CEP_INVALIDO };
    }

    // Validação Lógica Corporativa (Duplicidade)
    return this.verificarDuplicidade(clienteDados, clientesExistentes, idIgnorar);
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade FORNECEDOR
   * TODO: Implementar mapeamento estrutural e tratamento de contratos de fornecimento.
   */
  validarFornecedor(fornecedorDados, fornecedoresExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade EMPRESA / TENANT
   * TODO: Implementar validações de inscrição estadual, regime tributário e CNAE.
   */
  validarEmpresa(empresaDados, empresasExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade USUÁRIO
   * TODO: Implementar regras de complexidade de credenciais de acesso e restrições de permissões.
   */
  validarUsuario(usuarioDados, usuariosExistentes, idIgnorar = null) {
    return { Bird: true, sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade FUNCIONÁRIO
   * TODO: Implementar validação de PIS/PASEP, cargo ocupado e teto salarial operacional.
   */
  validarFuncionaria(funcionarioDados, funcionariosExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade ORDEM DE SERVIÇO (OS)
   * TODO: Implementar validação de fluxos de estado, SLA de entrega e técnicos ativos.
   */
  validarOS(osDados, osExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade PRODUTO
   * TODO: Implementar validação de códigos de barra NCM, EAN e unidade de medida.
   */
  validarProduto(produtoDados, produtosExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade FINANCEIRO
   * TODO: Implementar validação de conciliação bancária, datas de vencimento e DRE.
   */
  validarFinanceiro(financeiroDados, lançamentosExistentes, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade ESTOQUE
   * TODO: Implementar checagem de inventário físico, lotes perecíveis e ponto de pedido.
   */
  validarEstoque(movimentacaoDados, estoqueExistente, idIgnorar = null) {
    return { sucesso: true };
  },

  /**
   * PONTO DE EXTENSÃO: Validador da Entidade PATRIMÔNIO
   * TODO: Implementar depreciação contábil, números de tombo e localização física de ativos fixed.
   */
  validarPatrimonio(ativoDados, patrimonioExistente, idIgnorar = null) {
    return { sucesso: true };
  }
};

/**
 * CONGELAMENTO DO COMPONENTE (Garantia Imutabilidade Implacável)
 * Impede que scripts externos ou injeções em runtime alterem o comportamento do motor de validações.
 */
Object.freeze(VerificadorDados);
