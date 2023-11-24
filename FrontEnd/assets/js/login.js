import {authentication} from "./api-requests.js";

// CONNEXION AU MODE ADMIN

const loginForm = document.querySelector("#login-form");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");

// ON SUPPRIME L'AFFICHAGE DES ERREURS AU FOCUS
emailField.addEventListener("focus", removeError);
passwordField.addEventListener("focus", removeError);

// ON REQUETE L'API AU SUBMIT
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let emailVal = emailField.value.trim();
  let passwordVal = passwordField.value.trim();
  let responseStatus = NaN;
  const response = await authentication(emailVal, passwordVal)
  .then((response) => {
    responseStatus = response.status;
    return response.json();
  })
  .catch((e) => {
    responseStatus = NaN;
  });
  // SI LE STATUT EST 2** (VALIDE)
  // - ON ENREGISTRE LE TOKEN EN SESSION
  // - ON MET LA VARIABME adminMode A VRAI
  // - ON ENREGISTRE LA DATE DE CREATION DU TOKEN
  // - ON REDIRIGE VERS LA PAGE D'ACCUEIL
  if(/^2\d{2}$/.test(responseStatus)) {
    enableAdminMode(response);
  // SINON ON AFFICHE L'EREUR
  } else {
    displayError(responseStatus);
  }
});

function enableAdminMode(response) {
  const date = new Date();
  const now = date.getTime();
  sessionStorage.setItem("adminMode", "true");
  sessionStorage.setItem("auth", response.token);
  sessionStorage.setItem("tokenCreationDate", now);
  window.location = "./index.html";
}

function displayError(errorcode) {
  removeError();
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error");
  if(errorcode === 401) {
    loginForm.classList.add("error");
    errorMessage.innerText = "Erreur dans le mot de passe";
  } else if(errorcode === 404) {
    loginForm.classList.add("error");
    errorMessage.innerText = "Utilisateur introuvable";
  } else {
    errorMessage.innerText = "Echec de la connexion. Veuillez réessayer plus tard.";
  }
  passwordField.after(errorMessage);
}

function removeError() {
  loginForm.classList.remove("error");
  const errorMessage = loginForm.querySelector("p");
  if(errorMessage) errorMessage.remove();
}