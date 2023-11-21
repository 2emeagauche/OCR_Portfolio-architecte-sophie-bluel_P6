import {authentication} from "./api-requests.js";

// manage login to admin mode

const loginForm = document.querySelector("#login-form");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");

// Removing errors when focusing in fields
emailField.addEventListener("focus", removeError);
passwordField.addEventListener("focus", removeError);

// On submitting the form we call the API
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
  // If API response status is 2** then 
  // - we store the token in session storage
  // - we set adminMode to true
  // - we redirect to home page
  if(/^2\d{2}$/.test(responseStatus)) {
    enableAdminMode(response);
  // If not we display error message according to other response status code
  } else {
    displayError(responseStatus);
  }
});

function enableAdminMode(response) {
  const date = new Date();
  const now = date.getTime();
  // We store the adminMode value
  sessionStorage.setItem("adminMode", "true");
  // We store the token
  sessionStorage.setItem("auth", response.token);
  // We store the token creation date to further check if it is not expired
  sessionStorage.setItem("tokenCreationDate", now);
  // We redirect to home page
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