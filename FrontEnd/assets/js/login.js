import {authentication} from "./api-requests.js";

// manage login to admin mode

const loginForm = document.querySelector("#login-form");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");

emailField.addEventListener("focus", removeError);
passwordField.addEventListener("focus", removeError);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let emailVal = emailField.value.trim();
  let passwordVal = passwordField.value.trim();
  const loginResponse = await authentication(emailVal, passwordVal)
  .then((response) => {
    if(/^2\d{2}$/.test(response.status)) {
      enableAdminMode(response.json());
    } else {
      displayError(response.status);
    }
  })
  .catch(() => displayError(NaN));
});

function enableAdminMode(loginResponse) {
  sessionStorage.setItem("adminMode", "true");
  sessionStorage.setItem("auth", loginResponse.token);
  window.location = "./index.html";
}

function displayError(errorcode) {
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error");
  if(errorcode === 401) {
    loginForm.classList.add("error");
    errorMessage.innerText = "Erreur dans l’identifiant ou le mot de passe";
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