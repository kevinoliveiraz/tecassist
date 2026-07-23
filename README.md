# TecAssist — Versão de Testes (frontend puro, com localStorage)

Essa é uma versão **só de frontend**, feita pra você entender o sistema todo
sem precisar rodar nenhum servidor Python nem terminal. Os dados ficam salvos
no seu próprio navegador, usando `localStorage`.

## Como abrir

1. Abra a pasta `tecassist-local` no VS Code
2. Clique com o botão direito em `login.html`
3. Escolha **"Open with Live Server"**

Pronto — não precisa de terminal, backend, nem instalar nada em Python.

**Login de teste (já vem criado automaticamente):**
- E-mail: `carlos@tecassist.com`
- Senha: `123456`

Ou clique em "Criar conta" para testar o cadastro de uma empresa nova do zero.

## O que já funciona de verdade nessa versão

- ✅ Login e cadastro (com múltiplas empresas isoladas — "multi-tenant")
- ✅ Dashboard com números calculados de verdade a partir dos dados salvos
- ✅ Módulo de **Clientes** completo: criar, listar, editar, excluir
- 🚧 Os outros itens do menu (Aparelhos, OS, Financeiro, etc.) são só telas
  de espaço reservado — o próximo passo é construir cada um seguindo o
  mesmo padrão do módulo de Clientes.

## Como o código está organizado (ordem de leitura sugerida)

```
tecassist-local/
├── js/
│   ├── db.js          ← LEIA ESTE PRIMEIRO. É o "banco de dados fake".
│   │                     Toda vez que uma tela precisa ler ou salvar algo,
│   │                     ela chama uma função daqui (ex: DB.listarClientes()).
│   │
│   ├── sidebar.js     ← Monta o menu lateral e a barra de topo.
│   │                     Toda página interna chama TecAssistLayout.montar(...)
│   │
│   ├── auth.js        ← Lógica da tela de login/cadastro (login.html)
│   │
│   ├── dashboard.js   ← Lógica da tela inicial (dashboard.html)
│   │
│   └── clientes.js    ← Lógica da tela de Clientes — USE COMO MODELO
│                         para construir os próximos módulos (Aparelhos,
│                         Ordens de Serviço, etc). O padrão é sempre:
│                           1. montarEstruturaPagina() — desenha o HTML fixo
│                           2. recarregarTabela() — busca dados e preenche a tabela
│                           3. funções de abrir formulário, salvar e excluir
│
├── login.html, dashboard.html, clientes.html, (...outras páginas)
└── css/style.css, css/auth.css   ← visual do sistema (não precisa mexer)
```

## Botão "Resetar dados de teste"

No menu lateral (embaixo, perto de "Sair da conta") tem um botão pra apagar
tudo e recriar os dados de exemplo do zero. Útil se você bagunçar os dados
enquanto está testando.

## Sobre as limitações do localStorage (importante!)

- Os dados existem **só nesse navegador, nesse computador**. Se abrir em outro
  navegador ou computador, não vai ver os mesmos dados.
- Se limpar o cache/histórico do navegador, os dados são apagados.
- As senhas ficam salvas sem nenhuma criptografia — isso é aceitável **só**
  porque é um ambiente de teste local, nunca faria isso em um sistema real.
- Isso é só uma etapa de aprendizado. Não é pra colocar no ar assim.

## Próximo passo: migrar para Supabase

Quando você estiver confortável com as telas e quiser colocar isso no ar de
verdade, a ideia é trocar o **conteúdo de dentro** das funções do `db.js`
(ex: `DB.listarClientes`) para fazer chamadas ao Supabase em vez de ler do
localStorage. As telas (`clientes.js`, `dashboard.js`, etc.) praticamente não
vão precisar mudar, porque elas só conhecem os "nomes das funções" do DB.js,
não como elas funcionam por dentro. Foi por isso que organizamos assim.

Me chama quando quiser seguir para essa etapa, ou para construir o próximo
módulo (Aparelhos ou Ordem de Serviço) nessa versão local primeiro.


## anotações 

a pagina comunicações faz mais sentido como uma aba dentro de clientes assim como os fica dentro de ordem de serviço
