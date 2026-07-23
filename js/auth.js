/**
 * ===========================================================================
 * auth.js — LÓGICA DA TELA DE LOGIN E CADASTRO (login.html)
 * ===========================================================================
 * Esse arquivo só faz duas coisas:
 *   1. Alterna a exibição entre o formulário de "Entrar" e o de "Criar conta"
 *   2. Escuta o envio (submit) de cada formulário e chama o DB.js
 *      (nosso banco de dados fake) para validar/criar o usuário.
 * ===========================================================================
 */

// Se a pessoa já estiver logada, não faz sentido mostrar a tela de login de novo.
if (DB.estaAutenticado()) {
  window.location.href = "dashboard.html";
}

// ---------- Referências aos elementos da tela ----------
const abas = document.querySelectorAll(".auth-tab");
const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");

// ---------- Alternar entre as abas "Entrar" / "Criar conta" ----------
abas.forEach((aba) => {
  aba.addEventListener("click", () => {
    abas.forEach((a) => a.classList.remove("active"));
    aba.classList.add("active");

    if (aba.dataset.tab === "login") {
      formLogin.classList.remove("hidden");
      formRegistro.classList.add("hidden");
    } else {
      formRegistro.classList.remove("hidden");
      formLogin.classList.add("hidden");
    }
  });
});

// ---------- Envio do formulário de LOGIN ----------
formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault(); // impede o navegador de recarregar a página

  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value;
  const alertaErro = document.getElementById("login-erro");

  alertaErro.classList.add("hidden");

  try {
    DB.login(email, senha);          // tenta logar usando o banco fake
    window.location.href = "dashboard.html"; // deu certo → vai pro dashboard
  } catch (erro) {
    // deu errado (e-mail não existe ou senha errada) → mostra o erro na tela
    alertaErro.textContent = erro.message;
    alertaErro.classList.remove("hidden");
  }
});

// ---------- Envio do formulário de CADASTRO ----------
formRegistro.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nomeEmpresa = document.getElementById("reg-empresa").value.trim();
  const nomeUsuario = document.getElementById("reg-nome").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const senha = document.getElementById("reg-senha").value;
  const alertaErro = document.getElementById("registro-erro");

  alertaErro.classList.add("hidden");

  try {
    DB.registrarEmpresa({ nomeEmpresa, nomeUsuario, email, senha });
    window.location.href = "dashboard.html";
  } catch (erro) {
    alertaErro.textContent = erro.message;
    alertaErro.classList.remove("hidden");
  }
});
