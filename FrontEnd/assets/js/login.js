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
  let loginstatus = NaN;
  const loginResponse = await authentication(emailVal, passwordVal)
  // .then((response) => response.json());
  // enableAdminMode(loginResponse);
  .then((response) => {
    loginstatus = response.status;
    return response.json();
  })
  .catch((e) => {
    loginstatus = NaN;
  });
  if(/^2\d{2}$/.test(loginstatus)) {
    enableAdminMode(loginResponse);
  } else {
    displayError(loginstatus);
  }
});

function enableAdminMode(loginResponse) {
  console.log(loginResponse);
  sessionStorage.setItem("adminMode", "true");
  sessionStorage.setItem("auth", loginResponse.token);
  sessionStorage.setItem("dob", loginResponse.dob);
  window.location = "./index.html";
}

function displayError(errorcode) {
  removeError();
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error");
  console.log(errorcode);
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